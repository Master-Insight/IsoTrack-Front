import type { ReactNode } from 'react'

import { Link } from '@tanstack/react-router'
import { LayersIcon, Lock, ShieldCheck, Sparkles } from 'lucide-react'

import { APP_NAME } from '@/config/constants'

interface PublicLayoutProps {
  title: string
  subtitle: string
  description?: string
  children: ReactNode
}

const highlights = [
  {
    icon: Sparkles,
    title: 'Experiencia guiada',
    description:
      'Onboarding claro y mensajes pensados para equipos que necesitan entrar y trabajar sin distracciones.',
  },
  {
    icon: ShieldCheck,
    title: 'Seguridad visible',
    description: 'Accesos encriptados, sesiones protegidas y trazabilidad en cada documento y flujo.',
  },
  {
    icon: LayersIcon,
    title: 'Documentos, procesos y diagramas',
    description: 'Todo el ecosistema IsoTrack en un mismo portal para tus equipos y auditores.',
  },
]

export function PublicLayout({
  title,
  subtitle,
  description,
  children,
}: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-white to-accent/5 text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <img
            src="/assets/isotrack-logo-horizontal.svg"
            alt={APP_NAME}
            className="h-10 isotrack"
          />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-tight text-ink">{APP_NAME}</p>
            <p className="text-xs text-slate-500 leading-tight">
              Gestión ISO, trazabilidad y colaboración sin ruido técnico.
            </p>
          </div>
        </div>
        <Link to="/login" className="button-primary">
          <Lock className="h-4 w-4" /> Ingresar al portal
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-14">
        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="card-surface space-y-5 border border-slate-100 p-8 shadow-lg shadow-primary/5">
            <span className="badge bg-primary/10 text-primary">Portal de acceso</span>
            <h1 className="text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
            <p className="text-lg text-slate-600">{subtitle}</p>
            {description && (
              <p className="text-sm text-slate-500">{description}</p>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-sm text-slate-700 shadow-sm"
                >
                  <div className="flex items-center gap-2 text-primary">
                    <item.icon className="h-5 w-5" />
                    <p className="font-semibold text-ink">{item.title}</p>
                  </div>
                  <p className="mt-2 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-slate-700">
              <p className="font-semibold text-ink">¿Listo para comenzar?</p>
              <p>
                Ingresá con tu usuario corporativo y continuá exactamente donde
                dejaste tus procesos, documentos o diagramas.
              </p>
            </div>
          </section>

          <div className="w-full">{children}</div>
        </div>
      </main>
    </div>
  )
}
