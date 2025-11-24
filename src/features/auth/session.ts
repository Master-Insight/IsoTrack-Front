import { useAuthStore } from './store'
import type { UserProfile } from './api'
import { getStoredAccessToken } from '@/services/httpClient'

export const PROFILE_STORAGE_KEY = 'profile'

const isBrowser = typeof window !== 'undefined'

export function hydrateProfileFromStorage() {
  if (!isBrowser) return false

  const storedProfile = sessionStorage.getItem(PROFILE_STORAGE_KEY)
  if (!storedProfile) return false

  try {
    const parsedProfile = JSON.parse(storedProfile) as UserProfile
    const { setStatus, setProfile } = useAuthStore.getState()

    setStatus('ready')
    setProfile({
      id: parsedProfile.id,
      email: parsedProfile.email,
      role: parsedProfile.role,
      fullName: parsedProfile.full_name,
      companyId: parsedProfile.company_id,
      createdAt: parsedProfile.created_at,
    })

    return true
  } catch (error) {
    console.error('No se pudo hidratar el perfil almacenado', error)
    return false
  }
}

function hydrateTokens() {
  if (!isBrowser) return false

  const storedAccessToken = getStoredAccessToken()
  if (!storedAccessToken) return false

  const { setStatus } = useAuthStore.getState()
  setStatus('ready')

  return true
}

export function restoreSessionFromStorage() {
  return hydrateProfileFromStorage() || hydrateTokens()
}

export function hasAvailableSession() {
  if (!isBrowser) return false

  const { status } = useAuthStore.getState()
  const hasActiveSession = status === 'ready'

  return hasActiveSession || restoreSessionFromStorage()
}
