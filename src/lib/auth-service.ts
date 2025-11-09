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
  Company,
  LoginResponse,
  RefreshResponse,
  User,
} from '../types/auth';

interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthSession {
  user: User;
  companies: Company[];
}

function extractTokens(response: LoginResponse | RefreshResponse) {
  const accessToken = response.access_token ?? response.accessToken;
  const refreshToken = response.refresh_token ?? response.refreshToken;

  if (!accessToken) {
    throw new Error('Missing access token');
  }

  return { accessToken, refreshToken };
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  const response = await apiFetch<LoginResponse>('/users/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: false,
  });
  console.log('response: ', response);
  const tokens = extractTokens(response);

  setTokens(tokens);
  if (response.companies?.length) {
    setCompanyId(response.companies[0].id);
  }

  return { user: response.user, companies: response.companies ?? [] };
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
  const user = await apiFetch<User>('/users/me');
  const companies = await apiFetch<Company[]>('/companies');

  if (companies?.length) {
    const storedCompany = getCompanyId();
    const fallbackCompany = companies[0].id;
    const activeCompany = companies.some(
      (company) => company.id === storedCompany,
    )
      ? storedCompany
      : fallbackCompany;
    if (activeCompany) {
      setCompanyId(activeCompany);
    }
  } else {
    clearCompanyId();
  }

  return { user, companies: companies ?? [] };
}
