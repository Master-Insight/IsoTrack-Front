export type SessionStatus = 'locked' | 'loading' | 'ready'

export type UserProfile = {
  id: string
  email: string
  role?: string | null
  fullName?: string | null
  companyId?: string | null
  createdAt?: string | null
}
