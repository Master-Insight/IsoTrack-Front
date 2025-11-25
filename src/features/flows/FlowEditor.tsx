import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Handle,
  Position,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  ArrowLeftRight,
  Check,
  FileDown,
  FileSpreadsheet,
  Gauge,
  Loader2,
  Network,
  Plus,
  Save,
  Wand2,
} from 'lucide-react'

import { showAlert } from '@/lib/alerts'

import { useFlowDetailQuery } from './queries'
import type { FlowEdgeRecord, FlowNodeMetadata, FlowNodeRecord } from './types'

const badgeClass = 'badge px-3 py-1 rounded-full text-xs font-semibold'
const DEFAULT_NODE_WIDTH = 240
const DEFAULT_NODE_HEIGHT = 92
const TYPE_OPTIONS: FlowNodeRecord['type'][] = [
  'step',
  'decision',
  'event',
  'process',
  'integration',
]

const nodeTypeStyles: Record<
  FlowNodeRecord['type'],
  { color: string; label: string }
> = {
  step: { color: '#2563eb', label: 'Paso' },
  decision: { color: '#f59e0b', label: 'Decisión' },
  event: { color: '#ec4899', label: 'Evento' },
  process: { color: '#0ea5e9', label: 'Proceso' },
  integration: { color: '#22c55e', label: 'Integración' },
}

type FlowEditorProps = {
  flowId: string
}

type EditorNodeData = {
  label: string
  type: FlowNodeRecord['type']
  system: string
  code?: string
  metadata?: FlowNodeMetadata | null
}

type EditorEdgeData = {
  label?: string | null
}

const defaultNodesCsv = `id,label,type,system,x,y,code
node-plan,Planificación,step,IsoTrack,80,120,PL-01
node-ejecucion,Ejecución,process,IsoTrack,420,210,EX-02
node-cierre,Cierre,decision,SAP,740,320,CR-03`

const defaultEdgesCsv = `id,source,target,label
edge-plan-ejecucion,node-plan,node-ejecucion,Checklist
edge-ejecucion-cierre,node-ejecucion,node-cierre,Validación`

const buildId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(16).slice(2)

function buildNodeFromRecord(record: FlowNodeRecord, index: number): Node<EditorNodeData> {
  const position =
    record.position ||
    ({
      x: (index % 3) * 260,
      y: Math.floor(index / 3) * 180,
    } as const)

  return {
    id: record.id,
    type: 'editableNode',
    position,
    width: record.width ?? DEFAULT_NODE_WIDTH,
    height: record.height ?? DEFAULT_NODE_HEIGHT,
    data: {
      label: record.label,
      type: record.type as FlowNodeRecord['type'],
      system: record.system,
      code: record.code,
      metadata: record.metadata,
    },
  }
}

function buildEdgeFromRecord(record: FlowEdgeRecord): Edge<EditorEdgeData> {
  return {
    id: record.id,
    source: record.source_node || '',
    target: record.target_node || '',
    type: record.type ?? 'smoothstep',
    data: { label: record.label },
    label: record.label || undefined,
    animated: record.metadata?.style === 'decision',
    style: record.metadata?.style === 'decision'
      ? { strokeDasharray: '6 4', stroke: '#f59e0b' }
      : { stroke: '#2563eb' },
  }
}

export function FlowEditor({ flowId }: FlowEditorProps) {
  const { data: flow, isLoading, error } = useFlowDetailQuery(flowId)

  const [nodes, setNodes] = useState<Node<EditorNodeData>[]>([])
  const [edges, setEdges] = useState<Edge<EditorEdgeData>[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [csvNodes, setCsvNodes] = useState(defaultNodesCsv)
  const [csvEdges, setCsvEdges] = useState(defaultEdgesCsv)
  const [newNodeDraft, setNewNodeDraft] = useState({
    label: 'Nuevo nodo',
    type: 'step' as FlowNodeRecord['type'],
    system: 'IsoTrack',
  })
  const [edgeDraft, setEdgeDraft] = useState({
    source: '',
    target: '',
    label: 'Nueva conexión',
  })

  useEffect(() => {
    if (!flow) return
    const baseNodes = (flow.nodes || []).map(buildNodeFromRecord)
    const baseEdges = (flow.edges || [])
      .filter((edge) => edge.source_node && edge.target_node)
      .map(buildEdgeFromRecord)
    setNodes(baseNodes)
    setEdges(baseEdges)
    setSelectedNodeId((current) => current || baseNodes[0]?.id || null)
  }, [flow])

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId),
    [nodes, selectedNodeId],
  )

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((current) => applyNodeChanges(changes, current))

    const selectedChange = changes.find(
      (change) => change.type === 'select' && change.selected,
    )
    if (selectedChange?.id) {
      setSelectedNodeId(selectedChange.id)
    }
  }, [])

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((current) => applyEdgeChanges(changes, current)),
    [],
  )

  const handleConnect = useCallback((connection: Connection) => {
    setEdges((current) =>
      addEdge(
        {
          ...connection,
          id: `edge-${buildId()}`,
          type: 'smoothstep',
          label: edgeDraft.label || undefined,
        },
        current,
      ),
    )
  }, [edgeDraft.label])

  const handleNodeFieldChange = <K extends keyof EditorNodeData>(field: K, value: EditorNodeData[K]) => {
    if (!selectedNodeId) return
    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNodeId
          ? { ...node, data: { ...node.data, [field]: value } }
          : node,
      ),
    )
  }

  const handleAddNode = () => {
    const newId = `node-${buildId().slice(0, 6)}`
    const position = {
      x: 80 + nodes.length * 24,
      y: 120 + nodes.length * 18,
    }
    const node: Node<EditorNodeData> = {
      id: newId,
      type: 'editableNode',
      position,
      width: DEFAULT_NODE_WIDTH,
      height: DEFAULT_NODE_HEIGHT,
      data: {
        label: newNodeDraft.label || 'Nuevo nodo',
        type: newNodeDraft.type,
        system: newNodeDraft.system || 'IsoTrack',
      },
    }
    setNodes((current) => [...current, node])
    setSelectedNodeId(newId)
    showAlert({
      title: 'Nodo creado',
      text: 'Se agregó un nodo editable en el canvas.',
      icon: 'success',
    })
  }

  const handleAddEdge = () => {
    if (!edgeDraft.source || !edgeDraft.target) return
    const edge: Edge<EditorEdgeData> = {
      id: `edge-${buildId().slice(0, 6)}`,
      source: edgeDraft.source,
      target: edgeDraft.target,
      label: edgeDraft.label || undefined,
      type: 'smoothstep',
      data: { label: edgeDraft.label },
    }
    setEdges((current) => [...current, edge])
    showAlert({
      title: 'Conexión creada',
      text: 'Edge agregado entre los nodos seleccionados.',
      icon: 'success',
    })
  }

  const handleSaveLayout = async () => {
    const layoutPayload = {
      nodes: nodes.map((node) => ({
        id: node.id,
        position: node.position,
        label: node.data.label,
        type: node.data.type,
        system: node.data.system,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.data?.label ?? edge.label,
      })),
    }

    console.log('Guardar layout', layoutPayload)
    await showAlert({
      title: 'Layout guardado',
      text: `${layoutPayload.nodes.length} nodos y ${layoutPayload.edges.length} conexiones listos para persistir`,
      icon: 'success',
    })
  }

  const parseCsvRows = (text: string, required: string[]) => {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
    if (!lines.length) return []

    const headers = lines[0].split(',').map((header) => header.trim())
    const missing = required.filter((header) => !headers.includes(header))
    if (missing.length) {
      throw new Error(`Faltan columnas: ${missing.join(', ')}`)
    }

    return lines.slice(1).map((line) => {
      const values = line.split(',').map((value) => value.trim())
      const row: Record<string, string> = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      return row
    })
  }

  const handleImportNodes = async () => {
    try {
      const rows = parseCsvRows(csvNodes, ['id', 'label', 'type', 'system'])
      const importedNodes = rows.map((row, index) => {
        const x = Number(row.x) || 80 + index * 30
        const y = Number(row.y) || 120 + index * 30
        return {
          id: row.id,
          type: 'editableNode',
          position: { x, y },
          width: DEFAULT_NODE_WIDTH,
          height: DEFAULT_NODE_HEIGHT,
          data: {
            label: row.label || 'Nodo',
            type: (row.type as FlowNodeRecord['type']) || 'step',
            system: row.system || 'IsoTrack',
            code: row.code || undefined,
          },
        } satisfies Node<EditorNodeData>
      })

      setNodes(importedNodes)
      setSelectedNodeId(importedNodes[0]?.id ?? null)
      await showAlert({
        title: 'Nodos importados',
        text: `${importedNodes.length} nodos listos en el canvas`,
        icon: 'success',
      })
    } catch (parseError) {
      await showAlert({
        title: 'Error al importar CSV',
        text: parseError instanceof Error ? parseError.message : 'Formato inválido',
        icon: 'error',
      })
    }
  }

  const handleImportEdges = async () => {
    try {
      const rows = parseCsvRows(csvEdges, ['id', 'source', 'target'])
      const importedEdges = rows.map((row) => ({
        id: row.id,
        source: row.source,
        target: row.target,
        label: row.label || undefined,
        type: 'smoothstep',
        data: { label: row.label },
      })) satisfies Edge<EditorEdgeData>[]

      setEdges(importedEdges)
      await showAlert({
        title: 'Conexiones importadas',
        text: `${importedEdges.length} edges agregados desde el CSV`,
        icon: 'success',
      })
    } catch (parseError) {
      await showAlert({
        title: 'Error al importar edges',
        text: parseError instanceof Error ? parseError.message : 'Formato inválido',
        icon: 'error',
      })
    }
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {(error as Error).message}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
        Cargando editor de flujo...
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
    <section className="grid gap-5 xl:grid-cols-[1.15fr_380px]">
      <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase text-slate-500">Editor en vivo</p>
            <h1 className="text-3xl font-semibold text-slate-900">{flow.title}</h1>
            <p className="text-sm text-slate-600">{flow.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-slate-600">
              <span className={`${badgeClass} bg-indigo-100 text-indigo-700`}>
                <Wand2 className="mr-1 h-3 w-3" />
                Arrastra nodos y conecta handles
              </span>
              <span className={`${badgeClass} bg-emerald-100 text-emerald-700`}>
                <Gauge className="mr-1 h-3 w-3" />
                {nodes.length} nodos
              </span>
              <span className={`${badgeClass} bg-slate-100 text-slate-700`}>
                <ArrowLeftRight className="mr-1 h-3 w-3" />
                {edges.length} edges
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleSaveLayout}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Save className="h-4 w-4" />
              Guardar layout
            </button>
          </div>
        </header>

        <div className="grid gap-3 lg:grid-cols-[240px_1fr]">
          <section className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <div className="flex items-center gap-2 text-slate-900">
              <Plus className="h-4 w-4 text-indigo-600" />
              Nuevo nodo rápido
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Label</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={newNodeDraft.label}
                onChange={(event) =>
                  setNewNodeDraft((draft) => ({ ...draft, label: event.target.value }))
                }
              />
              <label className="text-xs font-semibold text-slate-600">Tipo</label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={newNodeDraft.type}
                onChange={(event) =>
                  setNewNodeDraft((draft) => ({
                    ...draft,
                    type: event.target.value as FlowNodeRecord['type'],
                  }))
                }
              >
                {TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {nodeTypeStyles[option].label}
                  </option>
                ))}
              </select>
              <label className="text-xs font-semibold text-slate-600">Sistema</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={newNodeDraft.system}
                onChange={(event) =>
                  setNewNodeDraft((draft) => ({ ...draft, system: event.target.value }))
                }
              />
              <button
                type="button"
                onClick={handleAddNode}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Agregar nodo
              </button>
            </div>

            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-600">
              Usa los handles laterales para crear edges o completa el formulario de abajo.
            </div>

            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <ArrowLeftRight className="h-4 w-4 text-indigo-600" />
                Conectar nodos
              </div>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={edgeDraft.source}
                onChange={(event) =>
                  setEdgeDraft((draft) => ({ ...draft, source: event.target.value }))
                }
              >
                <option value="">Origen</option>
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.data.label}
                  </option>
                ))}
              </select>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={edgeDraft.target}
                onChange={(event) =>
                  setEdgeDraft((draft) => ({ ...draft, target: event.target.value }))
                }
              >
                <option value="">Destino</option>
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.data.label}
                  </option>
                ))}
              </select>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Label"
                value={edgeDraft.label}
                onChange={(event) =>
                  setEdgeDraft((draft) => ({ ...draft, label: event.target.value }))
                }
              />
              <button
                type="button"
                onClick={handleAddEdge}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                <Check className="h-4 w-4 text-emerald-600" />
                Crear conexión
              </button>
            </div>
          </section>

          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/80">
            <div className="h-[620px]">
              <ReactFlowProvider>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={handleNodesChange}
                  onEdgesChange={handleEdgesChange}
                  onConnect={handleConnect}
                  nodeTypes={{ editableNode: EditableNode }}
                  onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                  fitView
                  nodesConnectable
                  nodesDraggable
                  panOnScroll
                  panOnDrag
                  selectionOnDrag
                  elevateNodesOnSelect
                  proOptions={{ hideAttribution: true }}
                >
                  <MiniMap pannable zoomable className="!bg-white" />
                  <Controls position="bottom-right" />
                  <Background gap={18} size={2} color="#e2e8f0" />
                </ReactFlow>
              </ReactFlowProvider>
            </div>
          </div>
        </div>
      </article>

      <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <header className="space-y-1">
          <p className="text-xs uppercase text-slate-500">Panel de edición</p>
          <h2 className="text-xl font-semibold text-slate-900">
            {selectedNode?.data.label ?? 'Selecciona un nodo'}
          </h2>
          <p className="text-sm text-slate-600">
            Edita metadata, aplica drag & drop y sube CSV para regenerar el canvas.
          </p>
        </header>

        <section className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-sm text-slate-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`${badgeClass} bg-slate-900 text-white`}>
              {flow.area || 'Área no asignada'}
            </span>
            <span className={`${badgeClass} bg-amber-100 text-amber-700`}>
              {flow.type || 'sin clasificación'}
            </span>
            <span className={`${badgeClass} bg-emerald-100 text-emerald-700`}>
              {flow.visibility}
            </span>
          </div>
        </section>

        <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Wand2 className="h-4 w-4 text-indigo-600" />
            Metadatos del nodo
          </div>
          <label className="text-xs font-semibold text-slate-600">Label</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={selectedNode?.data.label || ''}
            onChange={(event) => handleNodeFieldChange('label', event.target.value)}
            placeholder="Nombre del nodo"
          />
          <label className="text-xs font-semibold text-slate-600">Tipo</label>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={selectedNode?.data.type || ''}
            onChange={(event) =>
              handleNodeFieldChange('type', event.target.value as FlowNodeRecord['type'])
            }
          >
            <option value="">Selecciona tipo</option>
            {TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {nodeTypeStyles[option].label}
              </option>
            ))}
          </select>
          <label className="text-xs font-semibold text-slate-600">Sistema</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={selectedNode?.data.system || ''}
            onChange={(event) => handleNodeFieldChange('system', event.target.value)}
          />
          <label className="text-xs font-semibold text-slate-600">Código</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={selectedNode?.data.code || ''}
            onChange={(event) => handleNodeFieldChange('code', event.target.value)}
          />
          <label className="text-xs font-semibold text-slate-600">Notas</label>
          <textarea
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={3}
            value={selectedNode?.data.metadata?.notes || ''}
            onChange={(event) =>
              handleNodeFieldChange('metadata', {
                ...selectedNode?.data.metadata,
                notes: event.target.value,
              })
            }
            placeholder="Notas, documentos o reglas de visibilidad"
          />
        </section>

        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
            Importar nodos CSV
          </div>
          <textarea
            className="h-28 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs"
            value={csvNodes}
            onChange={(event) => setCsvNodes(event.target.value)}
          />
          <p className="text-xs text-slate-500">
            Columnas requeridas: id, label, type, system. Opcionales: x, y, code.
          </p>
          <button
            type="button"
            onClick={handleImportNodes}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <FileDown className="h-4 w-4" />
            Cargar nodos
          </button>
        </section>

        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Network className="h-4 w-4 text-indigo-600" />
            Importar edges CSV
          </div>
          <textarea
            className="h-24 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs"
            value={csvEdges}
            onChange={(event) => setCsvEdges(event.target.value)}
          />
          <p className="text-xs text-slate-500">
            Columnas requeridas: id, source, target. Opcional: label.
          </p>
          <button
            type="button"
            onClick={handleImportEdges}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            <FileDown className="h-4 w-4" />
            Cargar edges
          </button>
        </section>
      </aside>
    </section>
  )
}

function EditableNode({ data }: { data: EditorNodeData }) {
  const config = nodeTypeStyles[data.type] || nodeTypeStyles.step
  return (
    <div
      className="relative h-full w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm"
      style={{ boxShadow: '0 12px 40px rgba(15,23,42,0.06)' }}
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
          border: `2px solid ${config.color}55`,
          background: '#fff',
        }}
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold text-slate-900"
            style={{ backgroundColor: `${config.color}18`, color: config.color }}
          >
            {config.label[0]}
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
      <p className="mt-2 text-xs text-slate-600">
        {data.metadata?.notes || 'Drag & drop habilitado · Conecta con los handles laterales'}
      </p>
    </div>
  )
}
