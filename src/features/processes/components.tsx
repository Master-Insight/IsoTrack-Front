import { BadgeCheck, Link2, Workflow } from 'lucide-react'
import { clsx } from 'clsx'

import { flowClassification, processCards } from './data'

const badgeClass = 'badge px-3 py-1 rounded-full text-xs font-semibold'

function StatusPill({ status }: { status: string }) {
  const variants: Record<string, string> = {
    vigente: 'bg-emerald-100 text-emerald-700',
    'en progreso': 'bg-blue-100 text-blue-700',
    pendiente: 'bg-amber-100 text-amber-700',
  }

  return <span className={clsx(badgeClass, variants[status] || 'bg-slate-100 text-slate-700')}>{status}</span>
}

export function ProcessesShowcase() {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Procesos + vínculos</p>
          <h3 className="text-xl font-semibold text-slate-900">Flujos listos para ReactFlow</h3>
          <p className="text-xs text-slate-500">
            Cruce de documentos, tareas y nodos para acelerar el Checkpoint 2 y la vista “Mis flujos”.
          </p>
        </div>
        <span className={`${badgeClass} bg-cyan-100 text-cyan-700`}>Checkpoint 2.1</span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {processCards.map((process) => (
          <article
            key={process.id}
            className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-xs uppercase text-slate-500">Flujo</p>
                <h4 className="text-lg font-semibold text-slate-900">{process.title}</h4>
              </div>
              <StatusPill status={process.status} />
            </div>
            <p className="text-sm text-slate-600">{process.description}</p>
            <div className="flex flex-wrap gap-2">
              {process.links.map((link) => (
                <span key={link} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                  {link}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-cyan-600" />
            <p className="font-semibold text-slate-900">Clasificación</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
            {flowClassification.map((group) => (
              <div key={group.label} className="space-y-1 rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs uppercase text-slate-500">{group.label}</p>
                <p className="font-medium text-slate-900">{group.items.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-cyan-600" />
            <p className="font-semibold text-slate-900">Evidencia cruzada</p>
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <BadgeCheck className="h-4 w-4 text-emerald-600" />
              <span>Nodos con documentos vinculados para auditar en contexto.</span>
            </li>
            <li className="flex items-start gap-2">
              <BadgeCheck className="h-4 w-4 text-emerald-600" />
              <span>Tareas con estados editables para “Mis flujos”.</span>
            </li>
            <li className="flex items-start gap-2">
              <BadgeCheck className="h-4 w-4 text-emerald-600" />
              <span>Imports rápidos (CSV) listos para ReactFlow.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
