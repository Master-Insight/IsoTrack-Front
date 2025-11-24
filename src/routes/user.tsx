import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

import { DEFAULT_USER } from '../config/constants'
import { useAuthStore } from '../features/auth/store'
import type { UserProfile } from '../features/auth/types'

export const Route = createFileRoute('/user')({
  component: UserPage,
})

function UserPage() {
  const { profile, status, hydrateFromDemo, clear } = useAuthStore()

  useEffect(() => {
    if (status === 'locked') {
      hydrateFromDemo()
    }
  }, [hydrateFromDemo, status])

  const activeProfile =
    profile ||
    ({
      id: DEFAULT_USER.id,
      email: DEFAULT_USER.email,
      role: DEFAULT_USER.role,
      fullName: DEFAULT_USER.fullName,
      companyId: 'demo-company',
      createdAt: 'Sesión de demostración',
    } satisfies UserProfile)

  return (
    <main className="space-y-6 bg-gradient-to-b from-slate-100 to-white px-6 pb-10 pt-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="badge bg-indigo-100 text-indigo-700">Usuario activo</p>
          <h1 className="text-3xl font-bold text-slate-900">Panel personal</h1>
          <p className="text-slate-600 max-w-2xl">
            La sesión se hidrata automáticamente y muestra los datos básicos del usuario raíz. Desde aquí podés ir directo a
            tus vistas clave.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`badge ${
              status === 'ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {status === 'ready' ? 'Sesión activa' : 'Sesión bloqueada'}
          </span>
          <button className="button-secondary" type="button" onClick={hydrateFromDemo}>
            Activar demo
          </button>
          <button className="button-secondary" type="button" onClick={clear}>
            Limpiar sesión
          </button>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="card-surface space-y-5 border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-xl font-bold text-white">
              {activeProfile?.fullName?.slice(0, 1).toUpperCase()}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-semibold text-ink">{activeProfile?.fullName}</p>
              <p className="text-sm text-slate-600">{activeProfile?.email}</p>
            </div>
            <span className="badge bg-cyan-100 text-cyan-700">{activeProfile?.role || 'root'}</span>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <dt className="text-xs uppercase text-slate-500">Usuario ID</dt>
              <dd className="font-semibold text-slate-900">{activeProfile?.id}</dd>
            </div>
            <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <dt className="text-xs uppercase text-slate-500">Empresa</dt>
              <dd className="font-semibold text-slate-900">{activeProfile?.companyId || 'root'}</dd>
            </div>
            <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <dt className="text-xs uppercase text-slate-500">Creado</dt>
              <dd className="font-semibold text-slate-900">{activeProfile?.createdAt || '—'}</dd>
            </div>
            <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <dt className="text-xs uppercase text-slate-500">Rol</dt>
              <dd className="font-semibold text-slate-900">{activeProfile?.role}</dd>
            </div>
          </dl>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
            La sesión se inicializa con datos de demo para que puedas navegar sin fricción. Desde aquí podés saltar a los
            documentos o diagramas directamente.
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="documents" from="/" className="button-primary">
              Ir a documentos
            </Link>
            <Link to="diagrams" from="/" className="button-secondary">
              Ir a diagramas
            </Link>
            <Link to="processes" from="/" className="button-secondary">
              Ir a procesos
            </Link>
          </div>
        </article>

        <aside className="card-surface space-y-4 border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-ink">Accesos rápidos</h2>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
              <div>
                <p className="font-semibold">Perfil sincronizado</p>
                <p className="text-xs text-slate-500">Los datos provienen de Zustand y FastAPI.</p>
              </div>
              <span className="badge bg-emerald-100 text-emerald-700">OK</span>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
              <div>
                <p className="font-semibold">Token almacenado</p>
                <p className="text-xs text-slate-500">Se reutiliza la sesión demo si está disponible.</p>
              </div>
              <span className="badge bg-slate-100 text-slate-700">Demo</span>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
              <div>
                <p className="font-semibold">Navegación</p>
                <p className="text-xs text-slate-500">Rutas relativas para seguir el flujo más fácil.</p>
              </div>
              <span className="badge bg-indigo-100 text-indigo-700">TanStack</span>
            </li>
          </ul>
          <Link to="login" from="/" className="button-secondary w-full text-center">
            Ir al login
          </Link>
        </aside>
      </section>
    </main>
  )
}

