import { ArrowRight, GitBranch, Layers, Sheet } from 'lucide-react'

const modules = [
  {
    id: 'flows',
    title: 'Flujos',
    badge: 'Fase 2.2',
    description: 'Backend listo con tablas flows / flow_nodes / flow_edges y endpoints de importación.',
    bullets: ['Clasificación por rol y área', 'Metadata lista para panel lateral', 'Layout guardado desde ReactFlow'],
  },
  {
    id: 'documents',
    title: 'Documentos',
    badge: 'Base protegida',
    description: 'Listado protegido que servirá de insumo para nodos con artifacts vinculados.',
    bullets: ['GET /documents disponible', 'Primer recurso listo para detalle', 'Estado listo para “Mis flujos”'],
  },
  {
    id: 'processes',
    title: 'Procesos',
    badge: 'Checkpoint 2.1',
    description: 'Tarjetas de procesos referencian flujos visuales y evidencias cruzadas.',
    bullets: ['Clasificación por principales/auxiliares', 'Import CSV pensado para nodos', 'Roles ya definidos'],
  },
]

export function DashboardPrimer() {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Introducción</p>
          <h3 className="text-xl font-semibold text-slate-900">Mapa de elementos (sin conexión directa)</h3>
          <p className="text-xs text-slate-500">
            Solo mostramos el inventario de piezas. Las conexiones se harán luego en el canvas de flujos.
          </p>
        </div>
        <span className="badge bg-slate-100 text-slate-700">Vista guía</span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {modules.map((module) => (
          <article key={module.id} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-xs uppercase text-slate-500">{module.title}</p>
                <p className="text-sm font-semibold text-slate-900">{module.description}</p>
              </div>
              <span className="badge bg-slate-900 text-white">{module.badge}</span>
            </div>
            <ul className="space-y-1 text-sm text-slate-700">
              {module.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2">
                  <ArrowRight className="mt-1 h-4 w-4 text-cyan-600" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3 text-sm text-slate-700">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center gap-2 text-slate-900">
            <GitBranch className="h-5 w-5 text-indigo-600" />
            <p className="font-semibold">Flujos</p>
          </div>
          <p className="mt-1 text-xs text-slate-500">Nodos y edges viven en backend. ReactFlow solo consumirá.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center gap-2 text-slate-900">
            <Sheet className="h-5 w-5 text-emerald-600" />
            <p className="font-semibold">Documentos</p>
          </div>
          <p className="mt-1 text-xs text-slate-500">Solo referencia: se conectarán a nodos vía artifacts.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center gap-2 text-slate-900">
            <Layers className="h-5 w-5 text-amber-600" />
            <p className="font-semibold">Procesos</p>
          </div>
          <p className="mt-1 text-xs text-slate-500">Describimos la malla de procesos sin traer datos en vivo.</p>
        </div>
      </div>
    </section>
  )
}
