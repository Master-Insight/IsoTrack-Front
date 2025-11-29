/**
 * Vista General de Flujos - Listado y Filtros
 *
 * Muestra:
 * - Lista de flujos con filtros por tipo, tag y área
 * - Panel de detalle del flujo seleccionado
 * - Botón para abrir flujo en ReactFlow
 *
 * ✅ Refactorizado: Usa configuraciones centralizadas
 */

import { Link } from '@tanstack/react-router'
import { ExternalLink, Info, List, Tag, Users } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { useFlowsQuery } from './queries'
import type { FlowRecord } from './types'

// ✅ Importar configuraciones centralizadas
import { getBadgeClass, UI_MESSAGES } from './config/flow-constants'

// ==========================================
// 🔧 UTILIDADES
// ==========================================

/**
 * Obtiene el label legible para la visibilidad
 */
function getVisibilityLabel(visibility: string): string {
  const labels: Record<string, string> = {
    public: 'Público',
    area: 'Visible por área',
    private: 'Privado',
  }
  return labels[visibility] || visibility
}

// ==========================================
// 🧩 COMPONENTE PRINCIPAL
// ==========================================

export function FlowsOverview() {
  const flowsQuery = useFlowsQuery()
  const { data: flows, isLoading, isFetching, error } = flowsQuery

  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null)

  // Estados de filtros
  const [typeFilter, setTypeFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [areaFilter, setAreaFilter] = useState('')

  // ==========================================
  // 💾 COMPUTED VALUES - OPCIONES DE FILTROS
  // ==========================================

  const typeOptions = useMemo(
    () =>
      Array.from(
        new Set((flows || []).map((flow) => flow.type).filter(Boolean)),
      ) as string[],
    [flows],
  )

  const tagOptions = useMemo(
    () =>
      Array.from(
        new Set(
          (flows || []).flatMap((flow) => flow.tags || []).filter(Boolean),
        ),
      ),
    [flows],
  )

  const areaOptions = useMemo(
    () =>
      Array.from(
        new Set((flows || []).map((flow) => flow.area).filter(Boolean)),
      ) as string[],
    [flows],
  )

  // ==========================================
  // 💾 COMPUTED VALUES - FLUJOS FILTRADOS
  // ==========================================

  const filteredFlows = useMemo(() => {
    if (!flows) return []

    return flows.filter((flow) => {
      const matchesType = !typeFilter || flow.type === typeFilter
      const matchesTag = !tagFilter || flow.tags?.includes(tagFilter)
      const matchesArea = !areaFilter || flow.area === areaFilter

      return matchesType && matchesTag && matchesArea
    })
  }, [areaFilter, flows, tagFilter, typeFilter])

  const selectedFlow: FlowRecord | undefined = useMemo(
    () => filteredFlows.find((flow) => flow.id === selectedFlowId),
    [filteredFlows, selectedFlowId],
  )

  // ==========================================
  // 🔄 EFECTOS
  // ==========================================

  // Auto-seleccionar primer flujo cuando cambian los filtros
  useEffect(() => {
    if (!filteredFlows.length) {
      setSelectedFlowId(null)
      return
    }
    if (
      !selectedFlowId ||
      !filteredFlows.some((flow) => flow.id === selectedFlowId)
    ) {
      setSelectedFlowId(filteredFlows[0].id)
    }
  }, [filteredFlows, selectedFlowId])

  // ==========================================
  // 🎨 RENDERIZADO
  // ==========================================

  return (
    <div className="space-y-4">
      {/* HEADER CON FILTROS */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-3xl font-semibold text-slate-900">Flujos</h2>
              <p className="text-sm text-slate-600">
                Listado de flujos disponibles.
              </p>
            </div>
            <span className={getBadgeClass('primary')}>
              {isFetching
                ? 'Actualizando...'
                : `${filteredFlows.length} de ${flows?.length ?? 0} flujos`}
            </span>
          </div>

          {/* FILTROS */}
          <div className="grid gap-3 md:grid-cols-3">
            <FilterSelect
              label="Clasificación"
              value={typeFilter}
              onChange={setTypeFilter}
              placeholder="Todas"
              options={typeOptions}
            />
            <FilterSelect
              label="Tag"
              value={tagFilter}
              onChange={setTagFilter}
              placeholder="Todos"
              options={tagOptions}
            />
            <FilterSelect
              label="Área"
              value={areaFilter}
              onChange={setAreaFilter}
              placeholder="Todas"
              options={areaOptions}
            />
          </div>
        </div>
      </section>

      {/* ERROR STATE */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {(error as Error).message}
        </div>
      )}

      {/* LOADING STATE */}
      {isLoading && (
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      {!isLoading && (
        <section className="grid gap-4 md:grid-cols-[340px_1fr]">
          {/* LISTA LATERAL */}
          <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* HEADER DE LISTA */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2 text-slate-900">
                <List className="h-5 w-5 text-indigo-600" />
                <p className="text-sm font-semibold">Flujos</p>
              </div>
            </div>

            {/* ITEMS DE LISTA */}
            <div className="divide-y divide-slate-100">
              {filteredFlows.length ? (
                filteredFlows.map((flow) => {
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
                          {flow.type && (
                            <span className={getBadgeClass('dark')}>
                              {flow.type}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={getBadgeClass('primary')}>
                            {getVisibilityLabel(flow.visibility)}
                          </span>
                        </div>
                        {flow.tags && flow.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                              <Tag className="h-3 w-3" />
                              {flow.tags.join(', ')}
                            </span>
                          </div>
                        )}
                      </button>
                    </div>
                  )
                })
              ) : (
                <p className="p-5 text-sm text-slate-500">
                  {UI_MESSAGES.NO_FLOWS}
                </p>
              )}
            </div>
          </article>

          {/* PANEL DE DETALLE */}
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
                  <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                    <span className={getBadgeClass('purple')}>ReactFlow</span>
                    <Link
                      to="/flows/$id"
                      params={{ id: selectedFlow.id }}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Abrir Flujo
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                {/* DETALLES EN CARDS */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailCard
                    icon={<Users className="h-4 w-4 text-indigo-600" />}
                    label="Visibilidad"
                    value={getVisibilityLabel(selectedFlow.visibility)}
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
                  <DetailCard
                    icon={<Tag className="h-4 w-4 text-indigo-600" />}
                    label="Tags"
                    value={
                      selectedFlow.tags?.length
                        ? selectedFlow.tags.join(' · ')
                        : UI_MESSAGES.NO_TAGS
                    }
                  />
                </div>

                {/* INFO BOX */}
                <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 px-4 py-5 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">
                    Visualización en ReactFlow
                  </p>
                  <p className="mt-1 text-slate-600">
                    Usa el botón "Abrir Flujo" para cargar este flujo en una
                    hoja nueva con ReactFlow. Aquí mantenemos el resumen básico
                    mientras conectamos el canvas visual.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-60 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                Selecciona un flujo para ver su detalle.
              </div>
            )}
          </article>
        </section>
      )}
    </div>
  )
}

// ==========================================
// 🧩 COMPONENTES AUXILIARES
// ==========================================

type DetailCardProps = {
  icon?: ReactNode
  label: string
  value: string
}

function DetailCard({ icon, label, value }: DetailCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      {icon && <div className="mt-0.5">{icon}</div>}
      <div>
        <p className="text-xs uppercase text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

type FilterSelectProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  options: string[]
}

function FilterSelect({
  label,
  value,
  onChange,
  placeholder,
  options,
}: FilterSelectProps) {
  return (
    <label className="flex flex-col gap-1 text-sm text-slate-700">
      <span className="font-semibold">{label}</span>
      <select
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}
