import { useMemo } from 'react'
import type { Node } from '@xyflow/react'
import type { FlowDetailRecord, FlowNodeRecord } from '../types'

export type FlowNodeData = {
  id: string
  label: string
  type: FlowNodeRecord['type']
  system: string
  metadata?: FlowNodeRecord['metadata']
  code?: string
  width?: number | null
  height?: number | null
}

const DEFAULT_NODE_WIDTH = 240
const DEFAULT_NODE_HEIGHT = 80

const nodeTypeStyles: Record<
  FlowNodeRecord['type'],
  { color: string; icon: string }
> = {
  step: { color: '#2563eb', icon: 'ClipboardList' },
  decision: { color: '#f59e0b', icon: 'Gauge' },
  event: { color: '#ec4899', icon: 'AlertCircle' },
  process: { color: '#0ea5e9', icon: 'Workflow' },
  integration: { color: '#22c55e', icon: 'Network' },
}

function buildBaseNode(
  node: FlowNodeRecord,
  index: number,
): Node<FlowNodeData> {
  const typeConfig = nodeTypeStyles[node.type] || nodeTypeStyles.step
  const width = node.width ?? DEFAULT_NODE_WIDTH
  const height = node.height ?? DEFAULT_NODE_HEIGHT

  // Posición por defecto si no existe
  const position = node.position || {
    x: (index % 3) * 260,
    y: Math.floor(index / 3) * 180,
  }

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
      boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
      opacity: 1,
      transition: 'box-shadow 200ms ease, opacity 200ms ease',
      background: '#fff',
      borderRadius: 16,
    },
  }
}

export function useFlowNodes(flow: FlowDetailRecord | undefined) {
  // Memoizar nodos base sin dependencias de interacción
  const baseNodes = useMemo(() => {
    if (!flow?.nodes) return []
    return flow.nodes.map(buildBaseNode)
  }, [flow?.nodes])

  return baseNodes
}
