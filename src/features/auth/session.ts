import { useAuthStore } from './store'
import type { UserProfile } from './api'
import { getStoredAccessToken } from '@/services/httpClient'

export const PROFILE_STORAGE_KEY = 'profile'

const isBrowser = typeof window !== 'undefined'

function mapStoredProfile(profile: UserProfile) {
  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    fullName: profile.full_name,
    companyId: profile.company_id,
    createdAt: profile.created_at,
  }
}

/**
 * Intenta hidratar el store global usando el perfil guardado en sessionStorage.
 * Devuelve true cuando logra cargar el perfil y marcar la sesión como lista.
 */
export function hydrateProfileFromStorage() {
  if (!isBrowser) return false

  const storedProfile = sessionStorage.getItem(PROFILE_STORAGE_KEY)
  if (!storedProfile) return false

  try {
    const parsedProfile = JSON.parse(storedProfile) as UserProfile
    const { setStatus, setProfile } = useAuthStore.getState()

    setStatus('ready')
    setProfile(mapStoredProfile(parsedProfile))

    return true
  } catch (error) {
    console.error('No se pudo hidratar el perfil almacenado', error)
    return false
  }
}

/**
 * Marca la sesión como disponible cuando existe un access token guardado.
 * Útil para SSR o recarga de página sin duplicar llamadas al backend.
 */
function hydrateTokens() {
  if (!isBrowser) return false

  const storedAccessToken = getStoredAccessToken()
  if (!storedAccessToken) return false

  const { setStatus } = useAuthStore.getState()
  setStatus('ready')

  return true
}

/**
 * Restaura sesión ya sea desde perfil serializado o tokens previos.
 */
export function restoreSessionFromStorage() {
  return hydrateProfileFromStorage() || hydrateTokens()
}

/**
 * Verifica si hay sesión disponible, intentando hidratar en caliente si es necesario.
 */
export function hasAvailableSession() {
  if (!isBrowser) return false

  const { status } = useAuthStore.getState()
  const hasActiveSession = status === 'ready'

  return hasActiveSession || restoreSessionFromStorage()
}
