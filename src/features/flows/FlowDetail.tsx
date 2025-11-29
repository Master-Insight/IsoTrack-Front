/**
 * Componente de Detalle de Flujo - Vista de Solo Lectura
 *
 * Muestra un flujo completo con:
 * - Canvas visual con ReactFlow
 * - Panel lateral con detalles del nodo seleccionado
 * - Interacción hover/select para explorar el flujo
 *
 * ✅ Refactorizado: Usa configuraciones centralizadas
 */

import { useEffect, useMemo, useState } from 'react'
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  type ReactFlowInstance,
  type Viewport,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Link } from '@tanstack/react-router'
import {
  ArrowLeftRight,
  CheckCircle2,
  Compass,
  FileText,
  Gauge,
  StickyNote,
  TimerReset,
  Users,
  Workflow,
  XCircle,
  type LucideIcon,
} from 'lucide-react'

import type {
  FlowDetailRecord,
  FlowEdgeMetadata,
  FlowNodeRecord,
  FlowTask,
} from './types'
import { useFlowDetailQuery } from './queries'
import { useFlowNodes, type FlowNodeData } from './hooks/useFlowNodes'
import { useFlowLayout } from './hooks/useFlowLayout'
import { useFlowInteraction } from './stores/flowInteractionStore'

// ✅ Importar configuraciones centralizadas
import {
  getNodeTypeConfig,
  getNodeTypeIcon,
  NodeTypeChip,
} from './config/flow-node-types'
import {
  BADGE_CLASS,
  getBadgeClass,
  EDGE_STYLES,
  HANDLE_CONFIG,
  VIEWPORT_CONFIG,
  UI_MESSAGES,
} from './config/flow-constants'

// ==========================================
// 📝 TIPOS
// ==========================================

type FlowDetailProps = {
  flowId: string
}

type FlowViewPanelProps = {
  flow?: FlowDetailRecord
  selectedNode?: FlowNodeRecord
}

// ==========================================
// 🎨 CONFIGURACIÓN DE EDGES
// ==========================================

/**
 * Genera configuración de edge según su metadata
 */
function getEdgeConfig(metadata?: FlowEdgeMetadata | null) {
  const variant = metadata?.style ?? 'default'
  return EDGE_STYLES[variant] || EDGE_STYLES.default
}

// ==========================================
// 🧩 COMPONENTE PRINCIPAL
// ==========================================

export function FlowDetail({ flowId }: FlowDetailProps) {
  // Estado de viewport y ReactFlow instance
  const [viewport, setViewport] = useState<Viewport | null>(null)
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null)

  // Query del flujo
  const { data: flow, isLoading, error } = useFlowDetailQuery(flowId)

  // LOG Para depuracion
  useEffect(() => {
    if (!flow) return
    console.log('detalle flujo', flow)
  }, [flow])

  // ✅ Store de interacción (hover/select)
  const hoveredNodeId = useFlowInteraction((state) => state.hoveredNodeId)
  const selectedNodeId = useFlowInteraction((state) => state.selectedNodeId)
  const setHoveredNode = useFlowInteraction((state) => state.setHoveredNode)
  const setSelectedNode = useFlowInteraction((state) => state.setSelectedNode)

  // ✅ Construcción de nodos base
  const baseNodes = useFlowNodes(flow)

  // ✅ Aplicar layout automático si está configurado
  const shouldAutoLayout = useMemo(
    () => (flow?.layout_mode ?? 'manual') === 'auto',
    [flow?.layout_mode],
  )

  const layoutedNodes = useFlowLayout(
    baseNodes,
    flow?.edges ?? [],
    shouldAutoLayout ? 'auto' : 'manual',
  )

  // ✅ Aplicar estilos de interacción (hover/dim)
  const reactFlowNodes = useMemo(() => {
    return layoutedNodes.map((node) => {
      const isDimmed = hoveredNodeId && hoveredNodeId !== node.id
      return {
        ...node,
        style: {
          ...node.style,
          opacity: isDimmed ? 0.6 : 1,
          boxShadow: isDimmed
            ? '0 6px 20px rgba(0,0,0,0.04)'
            : '0 12px 40px rgba(0,0,0,0.1)',
        },
      }
    })
  }, [layoutedNodes, hoveredNodeId])

  // ✅ Construcción de edges con estilos
  const reactFlowEdges: Edge[] = useMemo(() => {
    if (!flow?.edges) return []

    return flow.edges
      .filter((edge) => edge.source_node && edge.target_node)
      .map((edge) => {
        const isActive =
          hoveredNodeId &&
          (edge.source_node === hoveredNodeId ||
            edge.target_node === hoveredNodeId)
        const isSelected =
          selectedNodeId &&
          (edge.source_node === selectedNodeId ||
            edge.target_node === selectedNodeId)

        const edgeConfig = getEdgeConfig(edge.metadata)

        return {
          id: edge.id,
          source: edge.source_node as string,
          target: edge.target_node as string,
          type: edge.type ?? 'smoothstep',
          label: edge.label ?? undefined,
          animated: Boolean(edgeConfig.animated),
          style: {
            stroke: edgeConfig.stroke,
            strokeWidth:
              isActive || isSelected
                ? EDGE_STYLES.active.strokeWidth
                : edgeConfig.strokeWidth,
            strokeDasharray: edgeConfig.strokeDasharray,
            opacity: hoveredNodeId && !(isActive || isSelected) ? 0.5 : 1,
          },
          labelStyle: {
            fill: '#0f172a',
            fontWeight: 600,
            fontSize: 12,
          },
        }
      })
  }, [flow?.edges, hoveredNodeId, selectedNodeId])

  // Nodo seleccionado actual
  const selectedNode = useMemo(
    () => flow?.nodes.find((node) => node.id === selectedNodeId),
    [flow?.nodes, selectedNodeId],
  )

  // Seleccionar primer nodo al cargar
  useEffect(() => {
    if (!flow?.nodes?.length) return
    setSelectedNode(flow.nodes[0]?.id || null)
  }, [flow?.nodes, setSelectedNode])

  // Aplicar viewport inicial
  useEffect(() => {
    if (!reactFlowInstance) return
    if (viewport) {
      reactFlowInstance.setViewport(viewport)
      return
    }
    reactFlowInstance.fitView({ padding: VIEWPORT_CONFIG.FIT_VIEW_PADDING })
  }, [reactFlowInstance, viewport])

  // Reset view handler
  const handleResetView = () => {
    if (!reactFlowInstance) return
    reactFlowInstance.fitView({ padding: VIEWPORT_CONFIG.FIT_VIEW_PADDING })
  }

  // ==========================================
  // 🎨 RENDERIZADO
  // ==========================================

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {(error as Error).message}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-8 w-1/2 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
        <div className="h-[520px] w-full animate-pulse rounded-2xl bg-slate-100" />
      </div>
    )
  }

  if (!flow) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        {UI_MESSAGES.FLOW_NOT_FOUND}
      </div>
    )
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
      {/* CANVAS PRINCIPAL */}
      <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase text-slate-500">Canvas visual</p>
            <h1 className="text-3xl font-semibold text-slate-900">
              {flow.title}
            </h1>
            <p className="text-sm text-slate-600">{flow.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-slate-600">
              <span className={getBadgeClass('primary')}>
                <Users className="mr-1 h-3 w-3" />
                {flow.visibility === 'public' ? 'Público' : flow.visibility}
              </span>
              {flow.type && (
                <span className={getBadgeClass('dark')}>
                  <Gauge className="mr-1 h-3 w-3" />
                  {flow.type}
                </span>
              )}
              {flow.area && (
                <span className={getBadgeClass('warning')}>
                  <Compass className="mr-1 h-3 w-3" />
                  {flow.area}
                </span>
              )}
              <span className={getBadgeClass('secondary')}>
                <ArrowLeftRight className="mr-1 h-3 w-3" />
                {flow.edges?.length ?? 0} conexiones
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Tags</p>
            <p>
              {flow.tags?.length ? flow.tags.join(' · ') : UI_MESSAGES.NO_TAGS}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Visualización en modo lectura. Usa el panel para explorar nodos
              sin salir del zoom actual.
            </p>
          </div>
        </header>

        {/* BARRA DE AYUDA */}
        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <span className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-indigo-600" />
            Hover resalta conexiones · Selección abre panel lateral · Controles
            y minimapa activos.
          </span>
          <button
            type="button"
            onClick={handleResetView}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <TimerReset className="h-4 w-4" />
            Reset zoom
          </button>
        </div>

        {/* CANVAS REACTFLOW */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/80">
          {reactFlowNodes.length ? (
            <div style={{ height: VIEWPORT_CONFIG.CANVAS_HEIGHT }}>
              <ReactFlowProvider>
                <ReactFlow
                  nodeTypes={{ flowNode: FlowNodeCard }}
                  nodes={reactFlowNodes}
                  edges={reactFlowEdges}
                  onNodeClick={(_, node) => setSelectedNode(node.id)}
                  onNodeMouseEnter={(_, node) => setHoveredNode(node.id)}
                  onNodeMouseLeave={() => setHoveredNode(null)}
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elevateNodesOnSelect
                  fitView
                  proOptions={{ hideAttribution: true }}
                  defaultViewport={viewport || { x: 0, y: 0, zoom: 1 }}
                  onMoveEnd={(_, nextViewport) => setViewport(nextViewport)}
                  onInit={(instance) => setReactFlowInstance(instance)}
                >
                  <MiniMap pannable zoomable className="bg-white!" />
                  <Controls position="bottom-right" />
                  <Background gap={18} size={2} color="#e2e8f0" />
                </ReactFlow>
              </ReactFlowProvider>
            </div>
          ) : (
            <div className="flex h-80 items-center justify-center text-sm text-slate-500">
              {UI_MESSAGES.NO_NODES}
            </div>
          )}
        </div>
      </article>

      {/* PANEL LATERAL */}
      <FlowViewPanel flow={flow} selectedNode={selectedNode} />
    </section>
  )
}

// ==========================================
// 🎴 COMPONENTE DE NODO
// ==========================================

/**
 * Componente visual de nodo en ReactFlow
 * Muestra label, tipo, sistema y código
 */
function FlowNodeCard({
  data,
  selected,
}: {
  data: FlowNodeData
  selected?: boolean
}) {
  const hoveredNodeId = useFlowInteraction((state) => state.hoveredNodeId)
  const isDimmed = hoveredNodeId && hoveredNodeId !== data.id

  const typeConfig = getNodeTypeConfig(data.type)
  const Icon = typeConfig.Icon

  return (
    <div
      className={`relative w-full rounded-2xl border border-slate-100 px-4 py-3 shadow-sm transition ${
        selected ? 'ring-2 ring-indigo-500' : 'ring-0'
      }`}
      style={{
        opacity: isDimmed ? 0.6 : 1,
        transition: 'opacity 200ms ease',
      }}
    >
      {/* Handles de conexión */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: HANDLE_CONFIG.SIZE,
          height: HANDLE_CONFIG.SIZE,
          border: `${HANDLE_CONFIG.BORDER_WIDTH}px solid ${HANDLE_CONFIG.BORDER_COLOR}`,
          background: HANDLE_CONFIG.BACKGROUND,
          top: -7, // Centrado en el borde superior
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: HANDLE_CONFIG.SIZE,
          height: HANDLE_CONFIG.SIZE,
          border: `${HANDLE_CONFIG.BORDER_WIDTH}px solid ${typeConfig.color}55`,
          background: HANDLE_CONFIG.BACKGROUND,
          bottom: -7, // Centrado en el borde inferior
        }}
      />

      {/* Contenido del nodo */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${typeConfig.color}15` }}
          >
            <Icon className="h-4 w-4" style={{ color: typeConfig.color }} />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">{data.label}</p>
            <p className="text-[11px] text-slate-500">{data.system}</p>
          </div>
        </div>
        {data.code && (
          <span className="rounded-full bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white">
            {data.code}
          </span>
        )}
      </div>

      {/* Artifacts */}
      {data.metadata?.artifacts?.length ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
          {data.metadata.artifacts.map((artifact) => (
            <span
              key={artifact}
              className={`${BADGE_CLASS} bg-indigo-50 text-indigo-700`}
            >
              {artifact}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

// ==========================================
// 📋 PANEL DE DETALLES
// ==========================================

function FlowViewPanel({ flow, selectedNode }: FlowViewPanelProps) {
  const metadata = selectedNode?.metadata

  return (
    <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="space-y-1">
        <p className="text-xs uppercase text-slate-500">Panel de detalle</p>
        <h2 className="text-xl font-semibold text-slate-900">
          {selectedNode?.label ?? UI_MESSAGES.SELECT_NODE}
        </h2>
        <p className="text-sm text-slate-600">Información en solo lectura.</p>
      </header>

      {/* Información básica del nodo */}
      <section className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-sm text-slate-700">
        <div className="flex items-center gap-2 text-slate-900">
          <NodeTypeChip type={selectedNode?.type} />
          {selectedNode?.system && (
            <span className="text-xs text-slate-600">
              {selectedNode.system}
            </span>
          )}
          {selectedNode?.code && (
            <span className="rounded-full bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white">
              {selectedNode.code}
            </span>
          )}
        </div>
        <p>{metadata?.notes || UI_MESSAGES.NO_NOTES}</p>
      </section>

      {/* Listas de información */}
      <InfoList
        title="Documentos"
        items={metadata?.documents}
        icon={FileText}
        empty={UI_MESSAGES.NO_DOCUMENTS}
      />
      <InfoList
        title="Procesos"
        items={metadata?.processes}
        icon={Workflow}
        empty={UI_MESSAGES.NO_PROCESSES}
      />

      {/* Roles */}
      <section className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Users className="h-4 w-4 text-indigo-600" />
          Roles y responsables
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-700">
          {metadata?.roles?.length ? (
            metadata.roles.map((role) => (
              <span
                key={role}
                className={`${BADGE_CLASS} bg-slate-100 text-slate-800`}
              >
                {role}
              </span>
            ))
          ) : (
            <span className="text-slate-500">{UI_MESSAGES.NO_ROLES}</span>
          )}
        </div>
        {metadata?.userAssigned && (
          <p className="text-xs text-slate-500">
            Asignado a: {metadata.userAssigned}
          </p>
        )}
      </section>

      {/* Tareas */}
      <TaskList tasks={metadata?.tasks} />

      {/* Footer con botón de edición */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <div>
          <p className="font-semibold text-slate-900">Visibilidad</p>
          <p className="text-xs text-slate-500">
            {metadata?.visibleFor?.length
              ? metadata.visibleFor.join(' · ')
              : 'Visible para todos en este flujo'}
          </p>
        </div>
        <Link
          to="/flows/$id/editor"
          params={{ id: flow?.id ?? '' }}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Ver en editor
          <ArrowLeftRight className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  )
}

// ==========================================
// 🧩 COMPONENTES AUXILIARES
// ==========================================

function InfoList({
  title,
  items,
  icon: Icon,
  empty,
}: {
  title: string
  items?: string[]
  icon: LucideIcon
  empty: string
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Icon className="h-4 w-4 text-indigo-600" />
        {title}
      </div>
      {items?.length ? (
        <div className="flex flex-wrap gap-2 text-xs text-slate-700">
          {items.map((item) => (
            <span
              key={item}
              className={`${BADGE_CLASS} bg-slate-100 text-slate-800`}
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500">{empty}</p>
      )}
    </section>
  )
}

function TaskList({ tasks }: { tasks?: FlowTask[] }) {
  if (!tasks?.length) {
    return (
      <section className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3 text-xs text-slate-600">
        {UI_MESSAGES.NO_TASKS}
      </section>
    )
  }

  return (
    <section className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <CheckCircle2 className="h-4 w-4 text-indigo-600" />
        Tareas y chips de estado
      </div>
      <ul className="space-y-2 text-xs">
        {tasks.map((task) => (
          <li
            key={task.label}
            className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm"
          >
            <span className="text-slate-700">{task.label}</span>
            <TaskChip status={task.status} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function TaskChip({ status }: { status: FlowTask['status'] }) {
  const statusConfig: Record<
    FlowTask['status'],
    { label: string; color: string; icon: LucideIcon }
  > = {
    pendiente: { label: 'Pendiente', color: '#f97316', icon: XCircle },
    'en curso': { label: 'En curso', color: '#2563eb', icon: TimerReset },
    completada: { label: 'Completada', color: '#16a34a', icon: CheckCircle2 },
  }
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold"
      style={{ backgroundColor: `${config.color}15`, color: config.color }}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  )
}
