import { API_BASE_URL } from './config';
import { getCompanyId, getTokens } from './session';

export interface ApiRequestOptions extends RequestInit {
  auth?: boolean;
}

export interface ApiErrorShape {
  status: number;
  message: string;
  details?: unknown;
}

export class ApiError extends Error implements ApiErrorShape {
  status: number;
  details?: unknown;

  constructor({ status, message, details }: ApiErrorShape) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch<TResponse>(path: string, options: ApiRequestOptions = {}): Promise<TResponse> {
  const { auth = true, headers, body, ...rest } = options;
  const url = `${API_BASE_URL}${path}`;
  const requestHeaders = new Headers(headers);

  if (auth) {
    const tokens = getTokens();
    if (tokens?.accessToken) {
      requestHeaders.set('Authorization', `Bearer ${tokens.accessToken}`);
    }
  }

  const companyId = getCompanyId();
  if (companyId) {
    requestHeaders.set('X-Company-Id', companyId);
  }

  if (body && !(body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
    body,
  });

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch (error) {
      details = undefined;
    }

    throw new ApiError({
      status: response.status,
      message: (details as { detail?: string })?.detail ?? response.statusText,
      details,
    });
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const data = (await response.json()) as TResponse;
  return data;
}
