import { Database, GitBranch, Network, ShieldCheck, Table } from 'lucide-react'

import { flowEndpoints, flowNotes, flowTables, sampleEdges, sampleFlows, sampleNodes } from './data'

const badgeClass = 'badge px-3 py-1 rounded-full text-xs font-semibold'

export function FlowsOverview() {
  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-slate-500">Checkpoint 2.2</p>
            <h2 className="text-2xl font-bold text-slate-900">Módulo Backend de Flujos</h2>
            <p className="text-sm text-slate-600">
              Tablas, endpoints y nodos listos para que ReactFlow consuma la data sin depender del dashboard.
            </p>
          </div>
          <span className={`${badgeClass} bg-indigo-100 text-indigo-700`}>Flujos / Nodes / Edges</span>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {flowTables.map((table) => (
            <article key={table.id} className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center gap-2 text-slate-900">
                <Table className="h-4 w-4 text-indigo-600" />
                <p className="text-sm font-semibold">{table.title}</p>
              </div>
              <p className="text-xs text-slate-600">{table.purpose}</p>
              <div className="flex flex-wrap gap-2">
                {table.fields.map((field) => (
                  <span key={field} className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-700">
                    {field}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <article className="md:col-span-3 space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-cyan-600" />
            <div>
              <p className="text-xs uppercase text-slate-500">Endpoints</p>
              <h3 className="text-lg font-semibold text-slate-900">API lista para importar y conectar</h3>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-slate-700">
            {flowEndpoints.map((endpoint) => (
              <li
                key={endpoint.path}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span className={`${badgeClass} bg-slate-900 text-white`}>{endpoint.method}</span>
                  <p className="font-semibold text-slate-900">{endpoint.path}</p>
                </div>
                <p className="text-xs text-slate-500">{endpoint.detail}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-xs uppercase text-slate-500">Visibilidad</p>
              <h3 className="text-lg font-semibold text-slate-900">Roles listos para “Mis flujos”</h3>
            </div>
          </div>
          <ul className="space-y-1 text-sm text-slate-700">
            <li>Roles por nodo guardados en metadata.visibleFor.</li>
            <li>El dashboard solo describe; la conexión se hará en el canvas.</li>
            <li>Compatibles con nodes step, decision, event, process, integration.</li>
          </ul>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase text-slate-500">Flujos preparados</p>
              <h3 className="text-lg font-semibold text-slate-900">Cabeceras listas para ReactFlow</h3>
            </div>
            <span className={`${badgeClass} bg-blue-100 text-blue-700`}>sin llamadas activas</span>
          </div>
          <div className="space-y-3">
            {sampleFlows.map((flow) => (
              <div
                key={flow.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{flow.name}</p>
                  <span className={`${badgeClass} bg-slate-900 text-white`}>{flow.classification}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-white px-3 py-1 font-semibold text-slate-700">{flow.status}</span>
                  {flow.visibility.map((role) => (
                    <span key={role} className="rounded-full bg-white px-3 py-1 font-medium text-slate-700">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-xs uppercase text-slate-500">Edges</p>
              <h3 className="text-lg font-semibold text-slate-900">Conexiones sincrónicas</h3>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-slate-700">
            {sampleEdges.map((edge) => (
              <li key={edge.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2">
                <p className="font-semibold text-slate-900">
                  {edge.source} → {edge.target}
                </p>
                <p className="text-xs text-slate-500">{edge.label}</p>
                <p className="text-[11px] text-slate-500">Regla: {edge.rule}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-slate-500">Nodos</p>
            <h3 className="text-lg font-semibold text-slate-900">Metadata lista para el panel lateral</h3>
          </div>
          <span className={`${badgeClass} bg-purple-100 text-purple-700`}>Solo lectura</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3 text-sm text-slate-700">
          {sampleNodes.map((node) => (
            <article key={node.id} className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{node.label}</p>
                <span className={`${badgeClass} bg-slate-900 text-white`}>{node.type}</span>
              </div>
              <p className="text-xs text-slate-500">Sistema: {node.system}</p>
              <div className="space-y-1 text-xs text-slate-600">
                <p className="font-semibold text-slate-900">Metadata</p>
                <p>Notas: {node.metadata.notes}</p>
                <p>Artefactos: {node.metadata.artifacts.join(', ')}</p>
                <p>Roles: {node.metadata.roles?.join(', ')}</p>
                <p>Asignado: {node.metadata.userAssigned || '—'}</p>
                <p>Visible para: {node.metadata.visibleFor?.join(', ')}</p>
                <p>
                  Posición: x{node.position.x} / y{node.position.y} (se guardará al mover nodos)
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-slate-900">
          <Database className="h-5 w-5 text-cyan-600" />
          <div>
            <p className="text-xs uppercase text-slate-500">Notas clave</p>
            <h3 className="text-lg font-semibold">Sincronización futura</h3>
          </div>
        </div>
        <ul className="grid gap-2 md:grid-cols-2 text-sm text-slate-700">
          {flowNotes.map((note) => (
            <li key={note} className="rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2">
              {note}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
