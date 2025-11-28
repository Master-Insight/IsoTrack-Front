/**
 * Hook para construir nodos base de ReactFlow
 *
 * Responsabilidades:
 * - Transformar FlowNodeRecord del backend a formato ReactFlow
 * - Aplicar estilos base según tipo de nodo
 * - Calcular posiciones por defecto si no existen
 *
 * ✅ Refactorizado: Usa configuraciones centralizadas
 */

import { useMemo } from 'react'
import type { Node } from '@xyflow/react'
import type { FlowDetailRecord, FlowNodeRecord } from '../types'
import { getNodeTypeConfig } from '../config/flow-node-types'
import { NODE_DIMENSIONS } from '../config/flow-constants'

// ==========================================
// 📝 TIPOS
// ==========================================

/**
 * Datos que lleva cada nodo en ReactFlow
 */
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

// ==========================================
// 🏗️ CONSTRUCCIÓN DE NODOS
// ==========================================

/**
 * Construye un nodo base de ReactFlow desde un FlowNodeRecord
 *
 * @param node - Registro de nodo del backend
 * @param index - Índice en el array (para posición por defecto)
 * @returns Nodo formateado para ReactFlow
 */
function buildBaseNode(
  node: FlowNodeRecord,
  index: number,
): Node<FlowNodeData> {
  // Obtener configuración del tipo de nodo
  const typeConfig = getNodeTypeConfig(node.type)

  // Dimensiones con fallback a valores por defecto
  const width = node.width ?? NODE_DIMENSIONS.DEFAULT_WIDTH
  const height = node.height ?? NODE_DIMENSIONS.DEFAULT_HEIGHT

  // Calcular posición por defecto si no existe
  // Distribución en grilla: 3 columnas, espaciado de 260x180
  const position = node.position || {
    x: (index % 3) * 260,
    y: Math.floor(index / 3) * 180,
  }

  return {
    id: node.id,
    type: 'flowNode', // Tipo de componente ReactFlow personalizado
    position,
    width,
    height,
    selectable: true,
    draggable: false, // En modo detalle no se puede arrastrar
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
      // Borde con color semitransparente del tipo
      border: `1px solid ${typeConfig.color}22`,
      boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
      opacity: 1,
      transition: 'box-shadow 200ms ease, opacity 200ms ease',
      background: '#fff',
      borderRadius: 16,
    },
  }
}

// ==========================================
// 🪝 HOOK PRINCIPAL
// ==========================================

/**
 * Hook que construye los nodos base de ReactFlow
 *
 * Los nodos se construyen sin estado de interacción (hover/select)
 * que se aplica después en FlowDetail.tsx
 *
 * @param flow - Objeto completo del flujo con nodos y edges
 * @returns Array de nodos formateados para ReactFlow
 *
 * @example
 * const baseNodes = useFlowNodes(flow)
 * // Luego aplicar layout y estilos de interacción
 */
export function useFlowNodes(flow: FlowDetailRecord | undefined) {
  // Memoizar nodos base sin dependencias de interacción
  const baseNodes = useMemo(() => {
    if (!flow?.nodes) return []

    return flow.nodes.map(buildBaseNode)
  }, [flow?.nodes])

  return baseNodes
}
