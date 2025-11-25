import { useEffect, useMemo, useRef, useState } from 'react'

import { DEFAULT_COMPANY } from '../../config/constants'
import { showAlert } from '../../lib/alerts'
import type { ArtifactLink } from '../processes/api'
import { type DiagramData, type DiagramEdge, type DiagramNode, type DiagramRecord } from './api'
import {
  useDiagramDetailQuery,
  useDiagramLinksQuery,
  useDiagramsQuery,
  useSaveDiagramMutation,
} from './queries'

const ACCESS_TOKEN_KEY = 'accessToken'

const DEFAULT_NODES: DiagramNode[] = [
  { id: 'n1', label: 'Dirección', type: 'area', x: 140, y: 60 },
  { id: 'n2', label: 'Calidad', type: 'area', x: 380, y: 60 },
  { id: 'n3', label: 'Operaciones', type: 'area', x: 620, y: 60 },
  { id: 'n4', label: 'Líder ISO', type: 'role', x: 140, y: 190, meta: 'Owner' },
  { id: 'n5', label: 'Analista QA', type: 'role', x: 380, y: 190, meta: 'Calidad' },
  { id: 'n6', label: 'Supervisor', type: 'role', x: 620, y: 190, meta: 'Operaciones' },
]

const DEFAULT_EDGES: DiagramEdge[] = [
  { id: 'e1', source: 'n1', target: 'n4', label: 'Reporte' },
  { id: 'e2', source: 'n2', target: 'n5', label: 'Auditoría' },
  { id: 'e3', source: 'n3', target: 'n6', label: 'Ejecución' },
  { id: 'e4', source: 'n4', target: 'n5', label: 'Mejora' },
]

const COLORS = {
  role: 'bg-indigo-600 text-white border-indigo-500 shadow-[0_10px_40px_-15px_rgba(79,70,229,0.5)]',
  area: 'bg-amber-500 text-amber-50 border-amber-400 shadow-[0_10px_40px_-15px_rgba(245,158,11,0.55)]',
}

type DiagramsPageProps = {
  diagramsEndpoint: string
  linksEndpoint: string
  onRequireLogin?: () => void
}

type DragState = {
  id: string
  offsetX: number
  offsetY: number
}

function DiagramNodeCard({ node }: { node: DiagramNode }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-xs font-semibold ${COLORS[node.type]} pointer-events-none select-none`}
      style={{ minWidth: 140 }}
    >
      <p className="leading-tight">{node.label}</p>
      {node.meta && <p className="text-[10px] opacity-80 font-normal">{node.meta}</p>}
    </div>
  )
}

function DiagramCanvas({
  nodes,
  edges,
  onNodePositionChange,
}: {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  onNodePositionChange: (id: string, x: number, y: number) => void
}) {
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const [drag, setDrag] = useState<DragState | null>(null)

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (!drag) return
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left - drag.offsetX
      const y = event.clientY - rect.top - drag.offsetY
      onNodePositionChange(drag.id, Math.max(12, x), Math.max(12, y))
    }

    const handleUp = () => setDrag(null)

    if (drag) {
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [drag, onNodePositionChange])

  const startDrag = (event: React.MouseEvent<HTMLDivElement>, node: DiagramNode) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setDrag({
      id: node.id,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    })
  }

  return (
    <div
      ref={canvasRef}
      className="relative h-[520px] rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 overflow-hidden"
    >
      <svg className="absolute inset-0" aria-hidden="true">
        {edges.map((edge) => {
          const source = nodes.find((node) => node.id === edge.source)
          const target = nodes.find((node) => node.id === edge.target)
          if (!source || !target) return null
          const x1 = source.x + 70
          const y1 = source.y + 22
          const x2 = target.x + 70
          const y2 = target.y + 22
          return (
            <g key={edge.id}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-slate-400" strokeWidth={2} markerEnd="url(#arrow)" />
              {edge.label && (
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} className="fill-slate-600 text-[11px]" textAnchor="middle">
                  {edge.label}
                </text>
              )}
            </g>
          )
        })}
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto" viewBox="0 0 10 8">
            <path d="M0,0 L10,4 L0,8 z" className="fill-slate-400" />
          </marker>
        </defs>
      </svg>

      {nodes.map((node) => (
        <div
          key={node.id}
          className="absolute cursor-move"
          style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
          onMouseDown={(event) => startDrag(event, node)}
        >
          <DiagramNodeCard node={node} />
        </div>
      ))}
    </div>
  )
}

function ArtifactLinkList({ links }: { links: ArtifactLink[] }) {
  if (!links.length) {
    return <p className="text-sm text-slate-500">Sin vínculos registrados para este diagrama.</p>
  }

  return (
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.id} className="rounded-lg border border-slate-200 px-3 py-2 bg-white">
          <p className="text-sm font-semibold text-ink">
            {link.to_name || link.to_id}
            <span className="ml-2 text-xs text-slate-500">{link.to_type}</span>
          </p>
          {link.to_code && <p className="text-xs text-slate-500">{link.to_code}</p>}
        </li>
      ))}
    </ul>
  )
}

export function DiagramsPage({ diagramsEndpoint, linksEndpoint, onRequireLogin }: DiagramsPageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramRecord | null>(null)
  const [links, setLinks] = useState<ArtifactLink[]>([])
  const [nodes, setNodes] = useState<DiagramNode[]>(DEFAULT_NODES)
  const [edges, setEdges] = useState<DiagramEdge[]>(DEFAULT_EDGES)
  const [newEdge, setNewEdge] = useState({ source: '', target: '', label: '' })
  const [isSessionReady, setIsSessionReady] = useState(false)

  const diagramsQuery = useDiagramsQuery(diagramsEndpoint, { enabled: isSessionReady })
  const diagrams = diagramsQuery.data?.data || []

  const detailQuery = useDiagramDetailQuery(selectedId || undefined, diagramsEndpoint, { enabled: isSessionReady })
  const linksQuery = useDiagramLinksQuery(selectedId || undefined, linksEndpoint, { enabled: isSessionReady })
  const saveMutation = useSaveDiagramMutation()

  const activeData: DiagramData = useMemo(() => ({ nodes, edges }), [nodes, edges])
  const isSaving = saveMutation.isPending
  const isLoading = diagramsQuery.isLoading || detailQuery.isFetching

  useEffect(() => {
    const checkSession = async () => {
      const token = sessionStorage.getItem(ACCESS_TOKEN_KEY)
      if (!token) {
        await showAlert({
          title: 'Sesión requerida',
          text: 'Inicia sesión en /login para editar organigramas y flujos.',
          icon: 'warning',
        })
        onRequireLogin?.()
        return
      }

      setIsSessionReady(true)
    }

    checkSession()
  }, [])

  useEffect(() => {
    if (!selectedId && diagrams?.length) {
      setSelectedId(diagrams[0].id)
    }
  }, [diagrams, selectedId])

  useEffect(() => {
    if (diagramsQuery.error instanceof Error) {
      showAlert({ title: 'Listado no disponible', text: diagramsQuery.error.message, icon: 'error' })
    }
  }, [diagramsQuery.error])

  useEffect(() => {
    if (detailQuery.error instanceof Error) {
      showAlert({ title: 'Error al cargar', text: detailQuery.error.message, icon: 'error' })
    }
  }, [detailQuery.error])

  useEffect(() => {
    const detail = detailQuery.data?.data
    if (!detail) return

    setSelectedDiagram(detail)
    const diagramData = detail.data || { nodes: DEFAULT_NODES, edges: DEFAULT_EDGES }
    setNodes(diagramData.nodes?.length ? diagramData.nodes : DEFAULT_NODES)
    setEdges(diagramData.edges?.length ? diagramData.edges : DEFAULT_EDGES)
  }, [detailQuery.data])

  useEffect(() => {
    setLinks(linksQuery.data || [])
  }, [linksQuery.data])

  const handleNodePositionChange = (id: string, x: number, y: number) => {
    setNodes((prev) => prev.map((node) => (node.id === id ? { ...node, x, y } : node)))
  }

  const handleAddNode = (type: 'role' | 'area') => {
    const newId = `n${Date.now()}`
    const baseX = type === 'role' ? 120 : 360
    const baseY = type === 'role' ? 300 : 120
    setNodes((prev) => [
      ...prev,
      {
        id: newId,
        label: type === 'role' ? 'Nuevo rol' : 'Nueva área',
        type,
        x: baseX + (prev.length % 4) * 140,
        y: baseY + (prev.length % 2) * 80,
        meta: type === 'role' ? 'asigna responsable' : 'asigna sección',
      },
    ])
  }

  const handleAddEdge = () => {
    if (!newEdge.source || !newEdge.target) return
    const edgeId = `e-${Date.now()}`
    setEdges((prev) => [
      ...prev,
      { id: edgeId, source: newEdge.source, target: newEdge.target, label: newEdge.label || undefined },
    ])
    setNewEdge({ source: '', target: '', label: '' })
  }

  const handleSave = async () => {
    if (!selectedDiagram) return
    const endpoint = `${diagramsEndpoint}/${selectedDiagram.id}`
    try {
      await saveMutation.mutateAsync({ endpoint, payload: { data: activeData } })
      await showAlert({ title: 'Diagrama guardado', text: 'Los nodos y vínculos se guardaron como JSON.', icon: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar'
      await showAlert({ title: 'Error al guardar', text: message, icon: 'error' })
    }
  }

  const buildSvgExport = () => {
    const svgNodes = nodes
      .map(
        (node) =>
          `<g transform="translate(${node.x},${node.y})"><rect rx="12" width="160" height="64" fill="${
            node.type === 'role' ? '#4f46e5' : '#f59e0b'
          }" opacity="0.95"/><text x="12" y="26" font-size="13" fill="white" font-weight="600">${node.label}</text>${
            node.meta ? `<text x=\"12\" y=\"44\" font-size=\"11\" fill=\"white\" opacity=\"0.85\">${node.meta}</text>` : ''
          }</g>`,
      )
      .join('')

    const svgEdges = edges
      .map((edge) => {
        const source = nodes.find((node) => node.id === edge.source)
        const target = nodes.find((node) => node.id === edge.target)
        if (!source || !target) return ''
        const x1 = source.x + 70
        const y1 = source.y + 22
        const x2 = target.x + 70
        const y2 = target.y + 22
        const label = edge.label
          ? `<text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 8}" font-size="11" fill="#475569" text-anchor="middle">${edge.label}</text>`
          : ''
        return `<g><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#94a3b8" stroke-width="2"/>${label}</g>`
      })
      .join('')

    return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 620" font-family="Inter, sans-serif"><defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#0f172a" offset="0"/><stop stop-color="#1d4ed8" offset="1"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#bg)" opacity="0.08"/><text x="24" y="36" font-size="14" fill="#0f172a" font-weight="600">${
      selectedDiagram?.name || 'Diagrama'
    } · ${selectedDiagram?.code || 'F1.5'}</text><text x="24" y="56" font-size="12" fill="#475569">${DEFAULT_COMPANY.name}</text><g>${svgEdges}${svgNodes}</g><text x="24" y="596" font-size="11" fill="#475569">Exportado con branding ${DEFAULT_COMPANY.name}</text></svg>`
  }

  const handleExportSvg = async () => {
    if (!selectedDiagram) return
    const svg = buildSvgExport()
    const endpoint = `${diagramsEndpoint}/${selectedDiagram.id}`
    try {
      await saveMutation.mutateAsync({ endpoint, payload: { data: activeData, svg_export: svg } })
      await showAlert({ title: 'SVG listo', text: 'Exportamos una versión con branding para auditar.', icon: 'success' })
      setSelectedDiagram((prev) => (prev ? { ...prev, svg_export: svg } : prev))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo exportar'
      await showAlert({ title: 'Exportación fallida', text: message, icon: 'error' })
    }
  }

  const selectedType = selectedDiagram?.type || 'organigrama'
  const totalOrgCharts = diagrams.filter((diagram) => diagram.type === 'organigrama').length
  const totalFlows = diagrams.filter((diagram) => diagram.type === 'flujo').length

  return (
    <section className="space-y-6">
      <div className="card-surface relative overflow-hidden bg-gradient-to-br from-indigo-600 via-primary to-blue-700 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-white/10 blur-3xl" aria-hidden="true"></div>
        <div className="relative flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <p className="text-[11px] tracking-[0.35em] uppercase text-white/80">Editor visual · Fase 1.5</p>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">Diagramas y organigramas conectados</h1>
              <p className="text-white/80 text-sm md:text-base">
                Usa el canvas interactivo para mapear roles, áreas y relaciones. Guarda la estructura como JSON y exporta una versión SVG con el branding de {DEFAULT_COMPANY.name}.
              </p>
            </div>
            <div className="text-right space-y-2">
              <p className="text-xs uppercase text-white/70">Estado actual</p>
              <p className="text-2xl font-semibold flex items-center gap-2 justify-end">
                {selectedType === 'organigrama' ? 'Organigrama' : 'Flujo'}
                <span className="badge bg-white/20 text-white border border-white/30">{selectedDiagram?.code || 'F1.5'}</span>
              </p>
              <p className="text-white/70 text-xs max-w-xs">Vínculos disponibles con procesos, documentos y tareas.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            <div className="rounded-xl border border-white/30 bg-white/10 px-4 py-3 shadow-sm">
              <p className="text-xs uppercase text-white/70">Organigramas</p>
              <p className="text-2xl font-semibold">{totalOrgCharts}</p>
              <p className="text-white/70 text-xs">Vigentes en la empresa</p>
            </div>
            <div className="rounded-xl border border-white/30 bg-white/10 px-4 py-3 shadow-sm">
              <p className="text-xs uppercase text-white/70">Flujos</p>
              <p className="text-2xl font-semibold">{totalFlows}</p>
              <p className="text-white/70 text-xs">Diagramas operativos</p>
            </div>
            <div className="rounded-xl border border-white/30 bg-white/10 px-4 py-3 shadow-sm">
              <p className="text-xs uppercase text-white/70">Artefactos</p>
              <p className="text-2xl font-semibold flex items-center gap-2">
                {links.length}
                <span className="badge bg-emerald-500/20 text-emerald-50 border border-emerald-100/30">conectados</span>
              </p>
              <p className="text-white/70 text-xs">Matriz artifact_links</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="card-surface border border-slate-200 shadow-lg overflow-hidden">
          <div className="flex items-center justify-between gap-3 bg-slate-50 px-5 py-4 border-b border-slate-200">
            <div>
              <p className="text-xs uppercase text-slate-500">Vistas disponibles</p>
              <h2 className="text-lg font-semibold text-ink">Diagramas (GET /diagrams)</h2>
            </div>
            <span className="badge bg-slate-100 text-slate-700">{diagrams.length} diag</span>
          </div>
          <div className="divide-y divide-slate-100">
            {isLoading && <p className="text-sm text-slate-500 px-5 py-4">Cargando diagramas...</p>}
            {!isLoading && !diagrams.length && <p className="text-sm text-slate-500 px-5 py-4">Sin diagramas disponibles.</p>}
            {!isLoading &&
              diagrams.map((diagram) => (
                <button
                  key={diagram.id}
                  type="button"
                  className={`w-full text-left px-5 py-4 transition-colors ${
                    diagram.id === selectedId ? 'bg-primary/5 border-l-4 border-primary font-semibold text-primary' : 'hover:bg-primary/5'
                  }`}
                  onClick={() => setSelectedId(diagram.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-ink">{diagram.name}</p>
                      <p className="text-xs text-slate-500">{diagram.code}</p>
                    </div>
                    <span className="badge bg-slate-100 text-slate-700">{diagram.type}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{diagram.description || 'Diagrama sin descripción'}</p>
                </button>
              ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="card-surface border border-slate-200 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs uppercase text-slate-500">Canvas interactivo</p>
                <h3 className="text-lg font-semibold text-ink">{selectedDiagram?.name || 'Selecciona un diagrama'}</h3>
              </div>
              <div className="flex gap-2">
                <button className="button-secondary" type="button" onClick={() => handleAddNode('area')}>
                  Añadir área
                </button>
                <button className="button-secondary" type="button" onClick={() => handleAddNode('role')}>
                  Añadir rol
                </button>
                <button className="button-primary" type="button" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Guardando...' : 'Guardar JSON'}
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <DiagramCanvas nodes={nodes} edges={edges} onNodePositionChange={handleNodePositionChange} />
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs uppercase text-slate-500">Conexiones</p>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={newEdge.source}
                      onChange={(event) => setNewEdge((prev) => ({ ...prev, source: event.target.value }))}
                    >
                      <option value="">Origen</option>
                      {nodes.map((node) => (
                        <option key={node.id} value={node.id}>
                          {node.label}
                        </option>
                      ))}
                    </select>
                    <select
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={newEdge.target}
                      onChange={(event) => setNewEdge((prev) => ({ ...prev, target: event.target.value }))}
                    >
                      <option value="">Destino</option>
                      {nodes.map((node) => (
                        <option key={node.id} value={node.id}>
                          {node.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Etiqueta (opcional)"
                      value={newEdge.label}
                      onChange={(event) => setNewEdge((prev) => ({ ...prev, label: event.target.value }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">{edges.length} vínculos trazados</p>
                    <button className="button-secondary" type="button" onClick={handleAddEdge}>
                      Añadir relación
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase text-slate-500">Acciones de exportación</p>
                  <div className="flex gap-2">
                    <button className="button-secondary" type="button" onClick={() => setNodes(DEFAULT_NODES)}>
                      Reset nodos demo
                    </button>
                    <button className="button-secondary" type="button" onClick={() => setEdges(DEFAULT_EDGES)}>
                      Reset vínculos demo
                    </button>
                    <button className="button-primary" type="button" onClick={handleExportSvg} disabled={isSaving}>
                      Exportar SVG
                    </button>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    <p className="font-semibold text-ink">Última exportación</p>
                    <p className="break-all text-[11px]">
                      {selectedDiagram?.svg_export ? selectedDiagram.svg_export.slice(0, 120) + '...' : 'Sin exportar'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
            <div className="card-surface border border-slate-200 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-slate-500">Detalle</p>
                  <h3 className="text-lg font-semibold text-ink">Meta y descripción</h3>
                </div>
                <span className="badge bg-slate-100 text-slate-700">{selectedDiagram?.type || 'sin tipo'}</span>
              </div>
              <p className="text-sm text-slate-600">{selectedDiagram?.description || 'Selecciona un diagrama para ver detalles.'}</p>
              <div className="grid sm:grid-cols-3 gap-3 text-sm text-slate-600">
                <div>
                  <p className="text-xs uppercase text-slate-500">Código</p>
                  <p>{selectedDiagram?.code || '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Empresa</p>
                  <p>{selectedDiagram?.company_id || DEFAULT_COMPANY.id}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Actualizado</p>
                  <p>{selectedDiagram?.updatedAt || 'sin fecha'}</p>
                </div>
              </div>
            </div>

            <div className="card-surface border border-slate-200 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-slate-500">Vínculos artifact_links</p>
                  <h3 className="text-lg font-semibold text-ink">Procesos, documentos y tareas</h3>
                </div>
                <span className="badge bg-primary/10 text-primary">{links.length} vínculos</span>
              </div>
              <ArtifactLinkList links={links} />
            </div>
          </div>

          <div className="card-surface border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs uppercase text-slate-500">Payload JSON</p>
                <h3 className="text-lg font-semibold text-ink">diagrams.data</h3>
              </div>
              <span className="badge bg-slate-100 text-slate-700">{nodes.length} nodos · {edges.length} edges</span>
            </div>
            <pre className="rounded-lg bg-slate-900 text-slate-50 text-xs p-4 overflow-x-auto">{JSON.stringify(activeData, null, 2)}</pre>
          </div>
        </div>
      </div>
    </section>
  )
}
