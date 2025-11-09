export interface SessionTokens {
  accessToken: string;
  refreshToken?: string;
}

const ACCESS_TOKEN_KEY = 'isotrack.session.accessToken';
const REFRESH_TOKEN_KEY = 'isotrack.session.refreshToken';
const COMPANY_ID_KEY = 'isotrack.session.companyId';

const isBrowser = typeof window !== 'undefined';

function safeGetItem(key: string): string | null {
  if (!isBrowser) return null;
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn('localStorage.getItem failed', error);
    return null;
  }
}

function safeSetItem(key: string, value: string) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn('localStorage.setItem failed', error);
  }
}

function safeRemoveItem(key: string) {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn('localStorage.removeItem failed', error);
  }
}

export function getTokens(): SessionTokens | null {
  const accessToken = safeGetItem(ACCESS_TOKEN_KEY);
  if (!accessToken) return null;
  const refreshToken = safeGetItem(REFRESH_TOKEN_KEY) ?? undefined;
  return { accessToken, refreshToken };
}

export function setTokens(tokens: SessionTokens) {
  safeSetItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  if (tokens.refreshToken) {
    safeSetItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  } else {
    safeRemoveItem(REFRESH_TOKEN_KEY);
  }
}

export function clearTokens() {
  safeRemoveItem(ACCESS_TOKEN_KEY);
  safeRemoveItem(REFRESH_TOKEN_KEY);
}

export function getCompanyId(): string | null {
  return safeGetItem(COMPANY_ID_KEY);
}

export function setCompanyId(companyId: string) {
  safeSetItem(COMPANY_ID_KEY, companyId);
}

export function clearCompanyId() {
  safeRemoveItem(COMPANY_ID_KEY);
}
