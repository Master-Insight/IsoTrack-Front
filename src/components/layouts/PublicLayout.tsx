import { LayersIcon, Lock } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { APP_NAME } from '@/config/constants'

interface PublicLayoutProps {
  title: string
  subtitle: string
  description?: string
  children: React.ReactNode
}

export function PublicLayout({
  title,
  subtitle,
  description,
  children,
}: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-2 text-slate-900">
          <LayersIcon className="h-6 w-6" />
          <div>
            <p className="text-sm font-semibold leading-tight">{APP_NAME}</p>
            <p className="text-[11px] text-slate-500 leading-tight">
              Acceso público
            </p>
          </div>
        </div>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <Lock className="h-4 w-4" />
          Ir al login
        </Link>
      </header>

      <main className="px-6 pb-10 pt-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="card-surface space-y-4 border border-slate-200 p-6">
            <p className="badge bg-indigo-100 text-indigo-700">Área pública</p>
            <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
            <p className="text-slate-600">{subtitle}</p>
            {description && (
              <p className="text-sm text-slate-500">{description}</p>
            )}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              Ingresá con tu usuario raíz o utilizá la sesión demo para explorar
              el panel privado. Desde aquí siempre tendrás a mano el formulario
              de login.
            </div>
          </section>

          {children}
        </div>
      </main>
    </div>
  )
}
