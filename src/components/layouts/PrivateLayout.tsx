import { useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Lock, ShieldCheck } from 'lucide-react'

import Header from '../Header'
import { useAuthStore } from '@/features/auth/store'
import { restoreSessionFromStorage } from '@/features/auth/session'

interface PrivateLayoutProps {
  title: string
  subtitle: string
  children: React.ReactNode
}

export function PrivateLayout({
  title,
  subtitle,
  children,
}: PrivateLayoutProps) {
  const { status, hydrateFromDemo } = useAuthStore()
  const isReady = status === 'ready'

  useEffect(() => {
    restoreSessionFromStorage()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white">
      <Header />

      <main className="space-y-6 px-6 pb-10 pt-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="badge bg-cyan-100 text-cyan-700">Área privada</p>
            <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
            <p className="text-slate-600 max-w-3xl">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`badge ${isReady ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
              aria-live="polite"
            >
              {isReady ? 'Sesión activa' : 'Acceso restringido'}
            </span>
            {!isReady && (
              <button
                className="button-secondary"
                type="button"
                onClick={hydrateFromDemo}
              >
                Usar sesión demo
              </button>
            )}
            <Link to="/login" className="button-primary">
              Ir al login
            </Link>
          </div>
        </header>

        {isReady ? (
          children
        ) : (
          <section className="card-surface space-y-4 border border-dashed border-amber-200 bg-white/80 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              Contenido protegido
            </h2>
            <p className="text-sm text-slate-600">
              Necesitás iniciar sesión para acceder a estas vistas. Usá el login
              o activá la sesión demo para continuar.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/login" className="button-primary">
                Ir al login
              </Link>
              <button
                className="button-secondary"
                type="button"
                onClick={hydrateFromDemo}
              >
                Activar sesión demo
              </button>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <div className="flex items-center justify-center gap-2 font-semibold text-slate-700">
                <ShieldCheck className="h-4 w-4" />
                Autenticación requerida
              </div>
              <p className="mt-1">
                El contenido se oculta hasta que el estado de sesión cambie a
                activo.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
