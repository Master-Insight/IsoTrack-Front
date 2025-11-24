import { ExternalLink, Info, List, Users } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { useFlowsQuery } from './queries'
import type { FlowRecord } from './types'

const badgeClass = 'badge px-3 py-1 rounded-full text-xs font-semibold'

export function FlowsOverview() {
  const flowsQuery = useFlowsQuery()
  const { data: flows, isLoading, isFetching, error } = flowsQuery

  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null)

  useEffect(() => {
    if (flows?.length && !selectedFlowId) {
      setSelectedFlowId(flows[0].id)
    }
  }, [flows, selectedFlowId])

  useEffect(() => {
    // Debug: conocer la data que llega desde el backend
    console.log('flujos', flows)
  }, [flows])

  const selectedFlow: FlowRecord | undefined = useMemo(
    () => flows?.find((flow) => flow.id === selectedFlowId),
    [flows, selectedFlowId],
  )

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold text-slate-900">Flujos</h2>
            <p className="text-sm text-slate-600">
              Listado de flujos disponibles.
            </p>
          </div>
          <span className={`${badgeClass} bg-indigo-100 text-indigo-700`}>
            {isFetching ? 'Actualizando...' : `${flows?.length ?? 0} flujos`}
          </span>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {(error as Error).message}
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-[340px_1fr]">
          <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2 text-slate-900">
                <List className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm font-semibold">Flujos</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {flows?.map((flow) => {
                const isActive = flow.id === selectedFlowId
                return (
                  <div
                    key={flow.id}
                    className={isActive ? 'bg-indigo-50/40' : ''}
                  >
                    <button
                      type="button"
                      className={`w-full px-5 py-4 text-left transition-colors ${
                        isActive ? 'text-indigo-900' : 'hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedFlowId(flow.id)}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {flow.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {flow.area || 'Área no asignada'}
                          </p>
                        </div>
                        {flow.type ? (
                          <span
                            className={`${badgeClass} bg-slate-900 text-white`}
                          >
                            {flow.type}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                        {flow.description}
                      </p>
                      {flow.visibility_roles?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
                          {flow.visibility_roles.map((role) => (
                            <span
                              key={role}
                              className="rounded-full bg-slate-100 px-3 py-1 font-medium"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </button>
                    <div className="flex items-center justify-end gap-2 px-5 pb-4">
                      <a
                        href={`/diagrams?flowId=${flow.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="button-secondary inline-flex items-center gap-2 text-sm"
                      >
                        Abrir
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {selectedFlow ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase text-slate-500">Detalle</p>
                    <h3 className="text-2xl font-semibold text-slate-900">
                      {selectedFlow.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {selectedFlow.description}
                    </p>
                  </div>
                  <span
                    className={`${badgeClass} bg-purple-100 text-purple-700`}
                  >
                    ReactFlow
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailCard
                    icon={<Users className="h-4 w-4 text-indigo-600" />}
                    label="Visibilidad"
                    value={
                      selectedFlow.visibility_roles?.join(' · ') ||
                      'Sin roles asignados'
                    }
                  />
                  <DetailCard
                    icon={<Info className="h-4 w-4 text-indigo-600" />}
                    label="Clasificación"
                    value={selectedFlow.type || 'Sin clasificación'}
                  />
                  <DetailCard
                    label="Área"
                    value={selectedFlow.area || 'Área no asignada'}
                  />
                  <DetailCard
                    label="Actualización"
                    value={new Date(
                      selectedFlow.updated_at,
                    ).toLocaleDateString()}
                  />
                </div>

                <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 px-4 py-5 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">
                    Visualización en ReactFlow
                  </p>
                  <p className="mt-1 text-slate-600">
                    Usa el botón “Abrir” para cargar este flujo en una hoja
                    nueva con ReactFlow. Aquí mantenemos el resumen básico
                    mientras conectamos el canvas visual.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[240px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                Selecciona un flujo para ver su detalle.
              </div>
            )}
          </article>
        </section>
      )}
    </div>
  )
}

type DetailCardProps = {
  icon?: ReactNode
  label: string
  value: string
}

function DetailCard({ icon, label, value }: DetailCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      {icon ? <div className="mt-[2px]">{icon}</div> : null}
      <div>
        <p className="text-xs uppercase text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  )
}
