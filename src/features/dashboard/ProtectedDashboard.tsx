import { useEffect } from 'react'
import { Lock } from 'lucide-react'

import { API_URL, DEFAULT_COMPANY, SUPABASE_URL } from '../../config/constants'
import { DocumentsPanel } from '../documents/components/DocumentsPanel'
import { useAuthStore } from '../auth/store'

export function ProtectedDashboard() {
  const { status, profile, hydrateFromDemo, clear } = useAuthStore()

  useEffect(() => {
    if (status === 'locked') {
      hydrateFromDemo()
    }
  }, [hydrateFromDemo, status])

  const isLocked = status !== 'ready'

  return (
    <section className="relative space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      {isLocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/85">
          <Lock className="h-5 w-5 text-slate-600" />
          <p className="text-sm text-slate-600">Contenido protegido. Activando sesión de demo...</p>
        </div>
      )}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="badge bg-cyan-100 text-cyan-700">Sesión requerida</p>
          <h2 className="text-2xl font-bold text-slate-900">Bienvenida y contexto de empresa</h2>
          <p className="text-slate-600 max-w-2xl">
            Validamos el token, guardamos el perfil y mostramos el listado inicial de documentos protegido por la API.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`badge ${isLocked ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}
          >
            {isLocked ? 'Bloqueado' : 'Desbloqueado'}
          </span>
          <button
            className="button-secondary"
            type="button"
            onClick={isLocked ? hydrateFromDemo : clear}
          >
            {isLocked ? 'Activar sesión demo' : 'Cerrar sesión demo'}
          </button>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-4" aria-label="estado de integración">
        <div className="card-surface space-y-2 border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Empresa activa</p>
          <p className="text-lg font-semibold">{DEFAULT_COMPANY.name}</p>
          <p className="text-xs text-slate-500">{DEFAULT_COMPANY.id}</p>
        </div>
        <div className="card-surface space-y-2 border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Supabase URL</p>
          <p className="font-semibold break-all text-cyan-700">{SUPABASE_URL}</p>
          <p className="text-xs text-slate-500">Configuración expuesta por entorno público.</p>
        </div>
        <div className="card-surface space-y-2 border border-slate-200 bg-cyan-50 p-5">
          <p className="text-sm font-semibold text-cyan-800">Estado de la integración</p>
          <p className="text-sm text-cyan-700">
            Healthcheck con token, perfil /me, persistencia en Zustand y feedback visual inmediato.
          </p>
        </div>
      </div>

      <div className="card-surface space-y-4 border border-slate-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Usuario autenticado</p>
            <p className="text-lg font-semibold" id="profile-name">
              {profile?.fullName || 'Pendiente de autenticación'}
            </p>
            <p className="text-xs text-slate-500" id="profile-email">
              {profile?.email || '---'}
            </p>
          </div>
          <span className="badge bg-emerald-100 text-emerald-700" id="profile-role">
            {profile?.role || 'auth'}
          </span>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 text-sm text-slate-600">
          <div>
            <p className="text-xs uppercase text-slate-500">Company ID</p>
            <p id="profile-company">{profile?.companyId || '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Usuario ID</p>
            <p id="profile-id">{profile?.id || '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Creado</p>
            <p id="profile-created">{profile?.createdAt || '—'}</p>
          </div>
        </div>
        <div className="rounded-lg border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-800" id="welcome-message">
          {profile
            ? `Bienvenido ${profile.fullName || 'usuario'}. El panel ya está desbloqueado.`
            : 'Te daremos la bienvenida apenas se valide tu sesión.'}
        </div>
      </div>

      <div className="card-surface flex items-center justify-between border border-slate-200 p-5">
        <div className="space-y-1">
          <p className="text-sm text-slate-500">Metodología</p>
          <p className="font-semibold">Sincronización guiada</p>
          <p className="text-xs text-slate-500">
            Validamos autenticación, desbloqueamos panel y traemos el primer documento disponible.
          </p>
        </div>
        <span className={`${badgeClass(isLocked)} px-3 py-1 text-xs font-semibold`}>
          {isLocked ? 'Protegido' : 'Habilitado'}
        </span>
      </div>

      <DocumentsPanel endpoint={`${API_URL}/documents`} />
    </section>
  )
}

function badgeClass(isLocked: boolean) {
  return isLocked ? 'badge bg-amber-100 text-amber-700' : 'badge bg-emerald-100 text-emerald-700'
}
