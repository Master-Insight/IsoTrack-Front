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
import dagre from 'dagre'
import '@xyflow/react/dist/style.css'
import { Link } from '@tanstack/react-router'
import {
  AlertCircle,
  ArrowLeftRight,
  CheckCircle2,
  ClipboardList,
  Compass,
  FileText,
  Gauge,
  LucideIcon,
  Network,
  StickyNote,
  TimerReset,
  Users,
  Workflow,
  XCircle,
} from 'lucide-react'

import type {
  FlowDetailRecord,
  FlowEdgeMetadata,
  FlowNodeMetadata,
  FlowNodeRecord,
  FlowTask,
} from './types'
import { useFlowDetailQuery } from './queries'

const badgeClass = 'badge px-3 py-1 rounded-full text-xs font-semibold'
const DEFAULT_NODE_WIDTH = 240
const DEFAULT_NODE_HEIGHT = 80

type FlowDetailProps = {
  flowId: string
}

type FlowNodeData = {
  id: string
  label: string
  type: FlowNodeRecord['type']
  system: string
  metadata?: FlowNodeMetadata | null
  code?: string
  width?: number | null
  height?: number | null
}

type FlowViewPanelProps = {
  flow?: FlowDetailRecord
  selectedNode?: FlowNodeRecord
}

const nodeTypeStyles: Record<
  FlowNodeRecord['type'],
  { color: string; icon: LucideIcon }
> = {
  step: { color: '#2563eb', icon: ClipboardList },
  decision: { color: '#f59e0b', icon: Gauge },
  event: { color: '#ec4899', icon: AlertCircle },
  process: { color: '#0ea5e9', icon: Workflow },
  integration: { color: '#22c55e', icon: Network },
}

const edgeVariants: Record<
  NonNullable<FlowEdgeMetadata['style']>,
  { stroke: string; dash?: string; animated?: boolean }
> = {
  default: { stroke: '#4f46e5' },
  decision: { stroke: '#f59e0b', dash: '6 4', animated: true },
}

export function FlowDetail({ flowId }: FlowDetailProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [viewport, setViewport] = useState<Viewport | null>(null)
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null)

  const { data: flow, isLoading, error } = useFlowDetailQuery(flowId)

  const shouldAutoLayout = useMemo(
    () => (flow?.layout_mode ?? 'manual') === 'auto',
    [flow?.layout_mode],
  )

  const dagreGraph = useMemo(() => {
    if (!shouldAutoLayout || !flow?.nodes?.length) return null

    const graph = new dagre.graphlib.Graph()
    graph.setDefaultEdgeLabel(() => ({}))
    graph.setGraph({
      rankdir: 'TB',
      nodesep: 120,
      ranksep: 160,
      marginx: 40,
      marginy: 40,
    })

    flow.nodes.forEach((node) => {
      graph.setNode(node.id, {
        width: node.width ?? DEFAULT_NODE_WIDTH,
        height: node.height ?? DEFAULT_NODE_HEIGHT,
      })
    })

    flow.edges
      ?.filter((edge) => edge.source_node && edge.target_node)
      .forEach((edge) => {
        graph.setEdge(edge.source_node as string, edge.target_node as string)
      })

    dagre.layout(graph)
    return graph
  }, [flow?.edges, flow?.nodes, shouldAutoLayout])

  useEffect(() => {
    if (!flow) return
    console.log('detalle flujo', flow)
  }, [flow])

  useEffect(() => {
    if (!flow?.nodes?.length) return
    setSelectedNodeId((current) => current || flow.nodes[0]?.id || null)
  }, [flow?.nodes])

  useEffect(() => {
    if (!reactFlowInstance) return
    if (viewport) {
      reactFlowInstance.setViewport(viewport)
      return
    }
    reactFlowInstance.fitView({ padding: 0.2 })
  }, [reactFlowInstance, viewport])

  const handleResetView = () => {
    if (!reactFlowInstance) return
    reactFlowInstance.fitView({ padding: 0.2 })
  }

  const reactFlowNodes: Node<FlowNodeData>[] = useMemo(() => {
    if (!flow?.nodes) return []

    return flow.nodes.map((node, index) => {
      const typeConfig = nodeTypeStyles[node.type] || nodeTypeStyles.step
      const width = node.width ?? DEFAULT_NODE_WIDTH
      const height = node.height ?? DEFAULT_NODE_HEIGHT
      let position = node.position || null

      if (shouldAutoLayout && dagreGraph) {
        const dagreNode = dagreGraph.node(node.id)
        position = {
          x: (dagreNode?.x ?? 0) - width / 2,
          y: (dagreNode?.y ?? 0) - height / 2,
        }
      }

      if (!position) {
        position = {
          x: (index % 3) * 260,
          y: Math.floor(index / 3) * 180,
        }
      }

      const isDimmed = hoveredNodeId && hoveredNodeId !== node.id

      return {
        id: node.id,
        type: 'flowNode',
        position,
        width,
        height,
        selectable: true,
        draggable: false,
        data: {
          id: node.id,
          label: node.label,
          type: node.type,
          system: node.system,
          metadata: node.metadata,
          code: node.code,
          width,
          height,
        },
        style: {
          border: `1px solid ${typeConfig.color}22`,
          boxShadow: isDimmed
            ? '0 6px 20px rgba(0,0,0,0.04)'
            : '0 12px 40px rgba(0,0,0,0.1)',
          opacity: isDimmed ? 0.6 : 1,
          transition: 'box-shadow 200ms ease, opacity 200ms ease',
          background: '#fff',
          borderRadius: 16,
        },
      }
    })
  }, [flow?.nodes, hoveredNodeId, dagreGraph, shouldAutoLayout])

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

        const variant = (edge.metadata?.style ?? 'default') as NonNullable<
          FlowEdgeMetadata['style']
        >
        const variantConfig = edgeVariants[variant]

        return {
          id: edge.id,
          source: edge.source_node as string,
          target: edge.target_node as string,
          type: edge.type ?? 'smoothstep',
          label: edge.label ?? undefined,
          animated: Boolean(variantConfig.animated),
          style: {
            stroke: variantConfig.stroke,
            strokeWidth: isActive || isSelected ? 2.8 : 1.6,
            strokeDasharray: variantConfig.dash,
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

  const selectedNode = useMemo(
    () => flow?.nodes.find((node) => node.id === selectedNodeId),
    [flow?.nodes, selectedNodeId],
  )

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
        No se encontró información para este flujo.
      </div>
    )
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase text-slate-500">Canvas visual</p>
            <h1 className="text-3xl font-semibold text-slate-900">
              {flow.title}
            </h1>
            <p className="text-sm text-slate-600">{flow.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-slate-600">
              <span className={`${badgeClass} bg-indigo-100 text-indigo-700`}>
                <Users className="mr-1 h-3 w-3" />
                {flow.visibility === 'public' ? 'Público' : flow.visibility}
              </span>
              {flow.type ? (
                <span className={`${badgeClass} bg-slate-900 text-white`}>
                  <Gauge className="mr-1 h-3 w-3" />
                  {flow.type}
                </span>
              ) : null}
              {flow.area ? (
                <span className={`${badgeClass} bg-amber-100 text-amber-700`}>
                  <Compass className="mr-1 h-3 w-3" />
                  {flow.area}
                </span>
              ) : null}
              <span className={`${badgeClass} bg-slate-100 text-slate-700`}>
                <ArrowLeftRight className="mr-1 h-3 w-3" />
                {flow.edges?.length ?? 0} conexiones
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Tags</p>
            <p>
              {flow.tags?.length ? flow.tags.join(' · ') : 'Sin tags asignados'}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Visualización en modo lectura. Usa el panel para explorar nodos
              sin salir del zoom actual.
            </p>
          </div>
        </header>

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

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/80">
          {reactFlowNodes.length ? (
            <div className="h-[560px]">
              <ReactFlowProvider>
                <ReactFlow
                  nodeTypes={{ flowNode: FlowNodeCard }}
                  nodes={reactFlowNodes}
                  edges={reactFlowEdges}
                  onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                  onNodeMouseEnter={(_, node) => setHoveredNodeId(node.id)}
                  onNodeMouseLeave={() => setHoveredNodeId(null)}
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elevateNodesOnSelect
                  fitView
                  proOptions={{ hideAttribution: true }}
                  defaultViewport={viewport || { x: 0, y: 0, zoom: 1 }}
                  onMoveEnd={(_, nextViewport) => setViewport(nextViewport)}
                  onInit={(instance) => setReactFlowInstance(instance)}
                >
                  <MiniMap pannable zoomable className="!bg-white" />
                  <Controls position="bottom-right" />
                  <Background gap={18} size={2} color="#e2e8f0" />
                </ReactFlow>
              </ReactFlowProvider>
            </div>
          ) : (
            <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">
              El flujo no tiene nodos.
            </div>
          )}
        </div>
      </article>

      <FlowViewPanel flow={flow} selectedNode={selectedNode} />
    </section>
  )
}

function FlowViewPanel({ flow, selectedNode }: FlowViewPanelProps) {
  const metadata = selectedNode?.metadata

  return (
    <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="space-y-1">
        <p className="text-xs uppercase text-slate-500">Panel de detalle</p>
        <h2 className="text-xl font-semibold text-slate-900">
          {selectedNode?.label ?? 'Selecciona un nodo'}
        </h2>
        <p className="text-sm text-slate-600">Información en solo lectura.</p>
      </header>

      <section className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-sm text-slate-700">
        <div className="flex items-center gap-2 text-slate-900">
          <NodeTypeChip type={selectedNode?.type} />
          {selectedNode?.system ? (
            <span className="text-xs text-slate-600">
              {selectedNode.system}
            </span>
          ) : null}
          {selectedNode?.code ? (
            <span className="rounded-full bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white">
              {selectedNode.code}
            </span>
          ) : null}
        </div>
        <p>{metadata?.notes || 'Sin notas registradas.'}</p>
      </section>

      <InfoList
        title="Documentos"
        items={metadata?.documents}
        icon={FileText}
        empty="Sin documentos."
      />
      <InfoList
        title="Procesos"
        items={metadata?.processes}
        icon={Workflow}
        empty="Sin procesos enlazados."
      />

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
                className={`${badgeClass} bg-slate-100 text-slate-800`}
              >
                {role}
              </span>
            ))
          ) : (
            <span className="text-slate-500">Sin roles asignados.</span>
          )}
        </div>
        {metadata?.userAssigned ? (
          <p className="text-xs text-slate-500">
            Asignado a: {metadata.userAssigned}
          </p>
        ) : null}
      </section>

      <TaskList tasks={metadata?.tasks} />

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

function FlowNodeCard({
  data,
  selected,
}: {
  data: FlowNodeData
  selected?: boolean
}) {
  const typeConfig = nodeTypeStyles[data.type] || nodeTypeStyles.step
  const Icon = typeConfig.icon

  return (
    <div
      className={`relative w-full rounded-2xl border border-slate-100 px-4 py-3 shadow-sm transition ${
        selected ? 'ring-2 ring-indigo-500' : 'ring-0'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 14,
          height: 14,
          border: '2px solid #cbd5e1',
          background: '#fff',
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 14,
          height: 14,
          border: `2px solid ${typeConfig.color}55`,
          background: '#fff',
        }}
      />
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
        {data.code ? (
          <span className="rounded-full bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white">
            {data.code}
          </span>
        ) : null}
      </div>
      {data.metadata?.artifacts?.length ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
          {data.metadata.artifacts.map((artifact) => (
            <span
              key={artifact}
              className={`${badgeClass} bg-indigo-50 text-indigo-700`}
            >
              {artifact}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function NodeTypeChip({ type }: { type?: FlowNodeRecord['type'] }) {
  if (!type) return null
  const config = nodeTypeStyles[type] || nodeTypeStyles.step
  const Icon = config.icon
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-slate-900"
      style={{ backgroundColor: `${config.color}12`, color: config.color }}
    >
      <Icon className="h-4 w-4" />
      {type}
    </span>
  )
}

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
              className={`${badgeClass} bg-slate-100 text-slate-800`}
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
        Sin tareas asignadas a este nodo.
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
