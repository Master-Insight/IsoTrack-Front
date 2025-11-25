import { create } from 'zustand'

import { DEFAULT_USER } from '../../config/constants'
import type { SessionStatus, UserProfile } from './types'

type AuthState = {
  status: SessionStatus
  profile: UserProfile | null
  accessToken: string | null
  refreshToken: string | null
  setStatus: (status: SessionStatus) => void
  setProfile: (profile: UserProfile | null) => void
  hydrateFromDemo: () => void
  clear: () => void
}

// Fuente única de verdad para el estado de autenticación dentro de la app.
export const useAuthStore = create<AuthState>((set) => ({
  status: 'locked',
  profile: null,
  accessToken: null,
  refreshToken: null,
  setStatus: (status) => set({ status }),
  setProfile: (profile) => set({ profile }),
  hydrateFromDemo: () =>
    set({
      status: 'ready',
      profile: {
        id: DEFAULT_USER.id,
        email: DEFAULT_USER.email,
        role: DEFAULT_USER.role,
        fullName: DEFAULT_USER.fullName,
        companyId: 'demo-company',
        createdAt: new Date().toISOString(),
      },
      accessToken: 'demo-access-token',
      refreshToken: 'demo-refresh-token',
    }),
  clear: () =>
    set({
      status: 'locked',
      profile: null,
      accessToken: null,
      refreshToken: null,
    }),
}))
