import axios, { type AxiosError } from 'axios'

import httpClient, { clearSessionTokens, refreshToken, setAccessToken, setRefreshToken } from './httpClient'

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  success: boolean
  message: string
  data?: {
    accessToken: string
    refresh_token: string
    profile: UserProfile
  }
}

export type UserProfile = {
  email: string
  company_id: string
  full_name: string
  position: string | null
  id: string
  role: string
  created_at: string
}

export type ProfileResponse = {
  success: boolean
  message: string
  data: UserProfile
}

export type LogoutResponse = {
  success: boolean
  message: string
  data?: {
    status: string
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>
    return axiosError.response?.data?.message || axiosError.message || fallback
  }
  return error instanceof Error ? error.message : fallback
}

export function persistTokens(accessToken?: string, refresh_token?: string) {
  if (accessToken?.startsWith('eyJ')) {
    setAccessToken(accessToken)
  }
  if (refresh_token?.startsWith('eyJ')) {
    setRefreshToken(refresh_token)
  }
}

export async function login(endpoint: string, payload: LoginPayload): Promise<LoginResponse> {
  try {
    const { data } = await httpClient.post<LoginResponse>(endpoint, payload, {
      withCredentials: true,
    })

    if (data?.data) {
      const { accessToken, refresh_token } = data.data
      persistTokens(accessToken, refresh_token)
    }

    return data
  } catch (error) {
    const message = getErrorMessage(error, 'No se pudo iniciar sesión')
    throw new Error(message)
  }
}

export async function fetchProfile(endpoint: string): Promise<ProfileResponse> {
  try {
    const { data } = await httpClient.get<ProfileResponse>(endpoint)
    return data
  } catch (error) {
    const message = getErrorMessage(error, 'No se pudo obtener el perfil')
    throw new Error(message)
  }
}

export async function logout(endpoint: string): Promise<LogoutResponse> {
  try {
    const { data } = await httpClient.post<LogoutResponse>(endpoint)
    clearSessionTokens()
    return data
  } catch (error) {
    const message = getErrorMessage(error, 'No se pudo cerrar sesión')
    throw new Error(message)
  }
}

export async function ensureToken() {
  try {
    return await refreshToken()
  } catch (error) {
    clearSessionTokens()
    throw error
  }
}
