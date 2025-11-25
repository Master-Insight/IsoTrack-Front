import { API_URL } from '../../config/constants'

const actions = [
  {
    title: 'ReactFlow listo',
    description: 'Canvas, nodos custom y panel lateral esperan la data de flows.',
  },
  {
    title: 'TanStack Router',
    description: 'Rutas por feature (inicio, documentos, procesos) y shell común.',
  },
  {
    title: 'Zustand global',
    description: 'Estado de sesión y documentos compartido entre vistas.',
  },
]

export function IntegrationPanel() {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Integración</p>
          <h3 className="text-xl font-semibold text-slate-900">API base: {API_URL}</h3>
          <p className="text-xs text-slate-500">Endpoints configurados para flows, documentos y tareas.</p>
        </div>
        <span className="badge bg-purple-100 text-purple-700">Migración React</span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {actions.map((action) => (
          <div key={action.title} className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-xs uppercase text-slate-500">{action.title}</p>
            <p className="text-sm text-slate-600">{action.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
