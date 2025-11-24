import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { API_URL, DEFAULT_COMPANY, DEFAULT_USER } from '@/config/constants'
import { showAlert } from '@/lib/alerts'
import { useAuthStore } from './store'
import type { LoginPayload, UserProfile } from './api'
import { fetchProfile, login, persistTokens } from './api'
import { PROFILE_STORAGE_KEY } from './session'

const loginEndpoint = `${API_URL}/users/login`
const profileEndpoint = `${API_URL}/users/me`

const initialPayload: LoginPayload = {
  email: DEFAULT_USER.email,
  password: '',
}

type LoginResult = {
  profile: UserProfile
  accessToken: string
}

export function LoginForm() {
  const [payload, setPayload] = useState<LoginPayload>(initialPayload)
  const [status, setStatus] = useState<string>('')
  const [statusVariant, setStatusVariant] = useState<
    'neutral' | 'success' | 'error'
  >('neutral')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setProfile = useAuthStore((state) => state.setProfile)
  const setStatusStore = useAuthStore((state) => state.setStatus)
  const navigate = useNavigate()

  const isDisabled = useMemo(() => {
    return isSubmitting || !payload.email || !payload.password
  }, [isSubmitting, payload.email, payload.password])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setPayload((current) => ({ ...current, [name]: value }))
  }

  const emitLogin = (detail: LoginResult) => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new CustomEvent('session:login', { detail }))
  }

  const persistProfile = async (accessToken: string) => {
    if (!accessToken?.startsWith('eyJ')) return
    try {
      const profileResponse = await fetchProfile(profileEndpoint)
      sessionStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(profileResponse.data),
      )
      emitLogin({ profile: profileResponse.data, accessToken })
      setStatusStore('ready')
      setProfile({
        id: profileResponse.data.id,
        email: profileResponse.data.email,
        role: profileResponse.data.role,
        fullName: profileResponse.data.full_name,
        companyId: profileResponse.data.company_id,
        createdAt: profileResponse.data.created_at,
      })
    } catch (error) {
      console.error('No se pudo obtener el perfil', error)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('Verificando credenciales...')
    setStatusVariant('neutral')
    setIsSubmitting(true)

    try {
      const response = await login(loginEndpoint, payload)
      setStatus(response.message || 'Ingreso exitoso')
      setStatusVariant('success')

      if (response.success && response.data) {
        const { accessToken, refresh_token, profile } = response.data
        persistTokens(accessToken, refresh_token)
        sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))

        emitLogin({ profile, accessToken })
        await persistProfile(accessToken)
        await showAlert({
          title: 'Sesión validada',
          text: 'Estamos preparando tu panel principal...',
          icon: 'success',
        })

        void navigate({ to: '/_private/dashboard' })
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo iniciar sesión'
      setStatus(message)
      setStatusVariant('error')
      await showAlert({
        title: 'Error de autenticación',
        text: message,
        icon: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="card-surface space-y-6 border border-slate-100 p-8 shadow-lg shadow-primary/5">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary text-sm font-semibold">
          Portal seguro
          <span className="badge bg-accent/10 text-accent">
            Clientes IsoTrack
          </span>
        </div>
        <h2 className="text-2xl font-bold text-ink">Ingresá a tu cuenta</h2>
        <p className="text-slate-600 text-sm">
          Autenticá tu acceso para la organización {DEFAULT_COMPANY.name} y
          continuá con tus documentos y procesos.
        </p>
      </header>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="form-label" htmlFor="email">
            Correo electrónico
          </label>
          <input
            className="form-input"
            id="email"
            name="email"
            type="email"
            value={payload.email}
            autoComplete="username"
            onChange={handleChange}
            required
            placeholder="usuario@empresa.com"
          />
        </div>
        <div className="space-y-1">
          <label className="form-label" htmlFor="password">
            Contraseña
          </label>
          <input
            className="form-input"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={payload.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />
          <p className="text-xs text-slate-500">
            Tu sesión se encripta y se asocia a tu empresa de forma automática.
          </p>
        </div>
        <button
          className="button-primary w-full"
          type="submit"
          disabled={isDisabled}
        >
          {isSubmitting ? 'Validando...' : 'Iniciar sesión'}
        </button>
        {status && (
          <p
            id="login-status"
            className={`text-sm ${
              statusVariant === 'error'
                ? 'text-red-600 font-semibold'
                : statusVariant === 'success'
                  ? 'text-emerald-600 font-semibold'
                  : 'text-slate-600'
            }`}
          >
            {status}
          </p>
        )}
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-xs text-slate-600">
          ¿Necesitás ayuda? Contactá al administrador de tu empresa o escribinos
          a soporte para restablecer tu acceso.
        </div>
      </form>
    </section>
  )
}
