import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios'

import { API_URL } from '../config/constants'

export const ACCESS_TOKEN_KEY = 'accessToken'
export const REFRESH_TOKEN_KEY = 'refreshToken'

const isBrowser = typeof window !== 'undefined'

function isValidJwt(token: string | null): token is string {
  return Boolean(token && token.startsWith('eyJ'))
}

export function getStoredAccessToken() {
  if (!isBrowser) return null
  return sessionStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string | null) {
  if (!isBrowser || !isValidJwt(token)) return
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function getStoredRefreshToken() {
  if (!isBrowser) return null
  return sessionStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token: string | null) {
  if (!isBrowser || !isValidJwt(token)) return
  sessionStorage.setItem(REFRESH_TOKEN_KEY, token)
  document.cookie = `refreshToken=${token}; Path=/; SameSite=Strict; Secure`
}

export function clearSessionTokens() {
  if (!isBrowser) return
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  document.cookie = 'refreshToken=; Max-Age=0; Path=/; SameSite=Strict; Secure'
}

export async function refreshToken() {
  const refresh = getStoredRefreshToken()
  if (!refresh) {
    if (isBrowser) alert('No se encontró refresh token para renovar la sesión')
    throw new Error('Refresh token no disponible')
  }

  try {
    const { data } = await axios.post<{ accessToken: string }>(`${API_URL}/users/refresh`, { refresh }, {
      withCredentials: true,
    })
    setAccessToken(data.accessToken)
    return data.accessToken
  } catch (error) {
    if (isBrowser) {
      alert('No se pudo refrescar la sesión. Por favor, inicia sesión nuevamente.')
    }
    const message = error instanceof Error ? error.message : 'No se pudo refrescar el token'
    throw new Error(message)
  }
}

function attachAuthHeader(config: AxiosRequestConfig) {
  const token = getStoredAccessToken()
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }
  return config
}

function createHttpClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  })

  instance.interceptors.request.use((config) => attachAuthHeader(config))

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const axiosError = error as AxiosError
      const originalRequest = axiosError.config

      if (axiosError.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
        ;(originalRequest as any)._retry = true
        try {
          const newToken = await refreshToken()
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          return instance(originalRequest)
        } catch (refreshError) {
          return Promise.reject(refreshError)
        }
      }

      return Promise.reject(error)
    },
  )

  return instance
}

const httpClient = createHttpClient()

export default httpClient
