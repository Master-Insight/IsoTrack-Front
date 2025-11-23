import { Link } from '@tanstack/react-router'
import { LayersIcon, MenuIcon } from 'lucide-react'
import { useState } from 'react'

import { APP_NAME, NAV_ITEMS } from '../config/constants'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="rounded-lg p-2 transition hover:bg-slate-800"
            aria-label="Abrir menú"
          >
            <MenuIcon size={22} />
          </button>
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <LayersIcon />
            <span>{APP_NAME}</span>
          </Link>
        </div>
        <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-100">
          Migración React + TanStack
        </span>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
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
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              activeProps={{ className: 'rounded-lg px-3 py-2 text-sm font-semibold bg-cyan-600 text-white' }}
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
