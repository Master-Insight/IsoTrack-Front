import { useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { ExternalLink, Info, Layers, Users } from 'lucide-react'

import { useFlowDetailQuery } from './queries'

const badgeClass = 'badge px-3 py-1 rounded-full text-xs font-semibold'

type FlowDetailCanvasProps = {
  flowId: string
}

export function FlowDetailCanvas({ flowId }: FlowDetailCanvasProps) {
  const { data, isLoading, error } = useFlowDetailQuery(flowId)

  useEffect(() => {
    if (!data) return
    console.log('detalle flujo', data)
  }, [data])

  const nodes: Node[] = useMemo(() => {
    if (!data?.nodes) return []

    return data.nodes.map((node, index) => ({
      id: node.id,
      type: 'default',
      position: node.position || {
        x: (index % 3) * 240,
        y: Math.floor(index / 3) * 140,
      },
      data: {
        label: node.code ? `${node.code} · ${node.label}` : node.label,
        system: node.system,
      },
      style: {
        borderRadius: 12,
        padding: '12px 16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
        background: '#fff',
      },
    }))
  }, [data?.nodes])

  const edges: Edge[] = useMemo(() => {
    if (!data?.edges) return []

    return data.edges
      .filter((edge) => edge.source_node && edge.target_node)
      .map((edge) => ({
        id: edge.id,
        source: edge.source_node as string,
        target: edge.target_node as string,
        label: edge.label ?? undefined,
        animated: true,
        style: { stroke: '#4f46e5' },
      }))
  }, [data?.edges])

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {(error as Error).message}
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-8 w-1/2 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
        <div className="h-[520px] w-full animate-pulse rounded-2xl bg-slate-100" />
      </div>
    )
  }

  const tagText = data.tags?.length
    ? data.tags.join(' · ')
    : 'Sin tags asignados'

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase text-slate-500">Detalle del flujo</p>
          <h1 className="text-3xl font-semibold text-slate-900">
            {data.title}
          </h1>
          <p className="text-sm text-slate-600">{data.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-slate-600">
            <span className={`${badgeClass} bg-indigo-100 text-indigo-700`}>
              <Users className="mr-1 h-3 w-3" />
              {data.visibility === 'public' ? 'Público' : data.visibility}
            </span>
            {data.type ? (
              <span className={`${badgeClass} bg-slate-900 text-white`}>
                <Info className="mr-1 h-3 w-3" />
                {data.type}
              </span>
            ) : null}
            {data.area ? (
              <span className={`${badgeClass} bg-amber-100 text-amber-700`}>
                <Layers className="mr-1 h-3 w-3" />
                {data.area}
              </span>
            ) : null}
            <span className={`${badgeClass} bg-slate-100 text-slate-700`}>
              <ExternalLink className="mr-1 h-3 w-3" />
              Actualizado {new Date(data.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="max-w-xs text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Tags</p>
          <p>{tagText}</p>
          <p className="mt-2 text-xs text-slate-500">
            ReactFlow renderiza los nodos y edges como llegan del backend. Si
            los nodos no traen posición, el layout se acomodará en columnas.
          </p>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/80">
        {nodes.length ? (
          <div className="h-[520px]">
            <ReactFlow nodes={nodes} edges={edges} fitView>
              <MiniMap pannable zoomable className="!bg-white" />
              <Controls position="bottom-right" />
              <Background gap={18} size={2} color="#e2e8f0" />
            </ReactFlow>
          </div>
        ) : (
          <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">
            No hay nodos disponibles para este flujo.
          </div>
        )}
      </div>
    </section>
  )
}
