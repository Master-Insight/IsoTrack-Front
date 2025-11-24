import { Link } from '@tanstack/react-router'
import { LayersIcon, MenuIcon } from 'lucide-react'
import { useState } from 'react'

import { APP_NAME, NAV_ITEMS } from '../config/constants'
import { useAuthStore } from '../features/auth/store'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { profile, status, hydrateFromDemo } = useAuthStore()

  const displayName = profile?.fullName || 'Sesión demo'
  const displayEmail = profile?.email || 'Activa usuario raíz'
  const isReady = status === 'ready'
  const badgeVariant = isReady
    ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/40'
    : 'bg-amber-500/20 text-amber-100 border border-amber-500/40'

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 px-4 py-3 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="rounded-lg p-2 transition hover:bg-slate-800"
            aria-label="Abrir menú"
          >
            <MenuIcon size={22} />
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <LayersIcon />
            <span>{APP_NAME}</span>
          </Link>
          <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-100">
            Migración React + TanStack
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-slate-800 px-3 py-2 shadow-inner">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold uppercase">
            {displayName.slice(0, 1)}
          </div>
          <div className="hidden sm:flex flex-col">
            <p className="text-sm font-semibold leading-tight">{displayName}</p>
            <p className="text-xs text-slate-300 leading-tight">{displayEmail}</p>
          </div>
          <span className={`${badgeVariant} rounded-full px-3 py-1 text-[11px] font-semibold`}>
            {isReady ? 'Activo' : 'Bloqueado'}
          </span>
          {!isReady && (
            <button
              className="button-secondary !px-3 !py-1 text-xs"
              type="button"
              onClick={hydrateFromDemo}
            >
              Activar usuario
            </button>
          )}
          <Link
            to="user"
            from="/"
            className="button-primary !px-3 !py-1 text-xs"
          >
            Ver perfil
          </Link>
        </div>
      </header>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 transform border-r border-slate-800 bg-slate-900 text-white transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <p className="text-lg font-semibold">Navegación</p>
          <button
            className="rounded-lg p-2 transition hover:bg-slate-800"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              from="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              activeProps={{
                className:
                  'rounded-lg px-3 py-2 text-sm font-semibold bg-cyan-600 text-white',
              }}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}
