import { useMemo } from 'react'
import dagre from 'dagre'
import type { Node } from '@xyflow/react'
import type { FlowNodeData } from './useFlowNodes'

const DEFAULT_NODE_WIDTH = 240
const DEFAULT_NODE_HEIGHT = 80

function computeDagreLayout(
  nodes: Node<FlowNodeData>[],
  edges: Array<{ source: string; target: string }>,
) {
  const graph = new dagre.graphlib.Graph()
  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({
    rankdir: 'TB',
    nodesep: 120,
    ranksep: 160,
    marginx: 40,
    marginy: 40,
  })

  nodes.forEach((node) => {
    graph.setNode(node.id, {
      width: node.width ?? DEFAULT_NODE_WIDTH,
      height: node.height ?? DEFAULT_NODE_HEIGHT,
    })
  })

  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target)
  })

  dagre.layout(graph)
  return graph
}

function applyLayoutToNodes(
  nodes: Node<FlowNodeData>[],
  dagreGraph: dagre.graphlib.Graph | null,
): Node<FlowNodeData>[] {
  if (!dagreGraph) return nodes

  return nodes.map((node) => {
    const dagreNode = dagreGraph.node(node.id)
    const width = node.width ?? DEFAULT_NODE_WIDTH
    const height = node.height ?? DEFAULT_NODE_HEIGHT

    return {
      ...node,
      position: {
        x: (dagreNode?.x ?? node.position.x) - width / 2,
        y: (dagreNode?.y ?? node.position.y) - height / 2,
      },
    }
  })
}

export function useFlowLayout(
  nodes: Node<FlowNodeData>[],
  edges: Array<{ source_node: string | null; target_node: string | null }>,
  layoutMode: 'auto' | 'manual' = 'manual',
) {
  // Solo computar layout cuando sea necesario
  const dagreGraph = useMemo(() => {
    if (layoutMode !== 'auto' || !nodes.length) return null

    const validEdges = edges
      .filter((edge) => edge.source_node && edge.target_node)
      .map((edge) => ({
        source: edge.source_node!,
        target: edge.target_node!,
      }))

    return computeDagreLayout(nodes, validEdges)
  }, [nodes, edges, layoutMode])

  // Aplicar layout a los nodos
  const layoutedNodes = useMemo(
    () => applyLayoutToNodes(nodes, dagreGraph),
    [nodes, dagreGraph],
  )

  return layoutedNodes
}
