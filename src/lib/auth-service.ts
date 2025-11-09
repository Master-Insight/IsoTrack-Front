import { apiFetch } from './api-client';
import {
  clearCompanyId,
  clearTokens,
  getCompanyId,
  getTokens,
  setCompanyId,
  setTokens,
} from './session';
import type {
  AuthSession,
  Company,
  CompanyResponse,
  LoginResponse,
  RefreshResponse,
  User,
  UserProfileResponse,
} from '../types/auth';

interface LoginPayload {
  email: string;
  password: string;
}

function extractTokens(response: LoginResponse | RefreshResponse) {
  const accessToken = response.access_token ?? response.accessToken;
  const refreshToken = response.refresh_token ?? response.refreshToken;

  if (!accessToken) {
    throw new Error('Missing access token');
  }

  return { accessToken, refreshToken };
}

function normalizeUser(profile: UserProfileResponse): User {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name ?? profile.fullName ?? profile.email,
    role: profile.role ?? 'Usuario',
    companyId: profile.company_id ?? profile.companyId ?? null,
    position: profile.position ?? null,
    createdAt: profile.created_at ?? profile.createdAt,
  };
}

function normalizeCompanies(rawCompanies?: CompanyResponse[] | null): Company[] {
  if (!rawCompanies?.length) {
    return [];
  }

  return rawCompanies
    .filter((company): company is CompanyResponse & { id: string } => Boolean(company?.id))
    .map((company, index) => ({
      id: company.id,
      name:
        company.name ??
        company.business_name ??
        company.businessName ??
        `Empresa ${index + 1}`,
    }));
}

async function fetchCompanies(): Promise<Company[]> {
  try {
    const companiesResponse = await apiFetch<CompanyResponse[] | { items?: CompanyResponse[] }>(
      '/companies',
    );

    if (Array.isArray(companiesResponse)) {
      return normalizeCompanies(companiesResponse);
    }

    if (companiesResponse?.items) {
      return normalizeCompanies(companiesResponse.items);
    }

    return [];
  } catch (error) {
    console.warn('No fue posible cargar la lista de empresas', error);
    return [];
  }
}

function resolveActiveCompanyId(
  companies: Company[],
  storedCompanyId: string | null,
  profileCompanyId: string | null | undefined,
): string | null {
  const availableCompanyIds = new Set(companies.map((company) => company.id));

  let activeCompanyId = storedCompanyId ?? profileCompanyId ?? null;

  if (availableCompanyIds.size > 0) {
    if (!activeCompanyId || !availableCompanyIds.has(activeCompanyId)) {
      activeCompanyId = companies[0].id;
    }
  }

  return activeCompanyId ?? null;
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  const response = await apiFetch<LoginResponse>('/users/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: false,
  });

  const tokens = extractTokens(response);

  setTokens(tokens);

  const profileCompanyId = response.profile?.company_id ?? response.profile?.companyId ?? null;
  if (profileCompanyId) {
    setCompanyId(profileCompanyId);
  } else if (response.companies?.length) {
    setCompanyId(response.companies[0].id);
  }

  return loadProfile();
}

export async function refresh(): Promise<void> {
  const tokens = getTokens();
  if (!tokens?.refreshToken) {
    throw new Error('Missing refresh token');
  }

  const response = await apiFetch<RefreshResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: tokens.refreshToken }),
    auth: false,
  });

  setTokens(extractTokens(response));
}

export async function logout(): Promise<void> {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } finally {
    clearTokens();
    clearCompanyId();
  }
}

export async function loadProfile(): Promise<AuthSession> {
  const profile = await apiFetch<UserProfileResponse>('/users/me');
  const user = normalizeUser(profile);
  const companies = await fetchCompanies();

  const storedCompany = getCompanyId();
  const activeCompanyId = resolveActiveCompanyId(companies, storedCompany, user.companyId);

  if (activeCompanyId) {
    setCompanyId(activeCompanyId);
  } else {
    clearCompanyId();
  }

  return { user, companies, activeCompanyId };
}
