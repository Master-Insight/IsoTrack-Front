/**
 * Constantes centralizadas para el módulo de Flows
 *
 * Este archivo concentra todos los valores de configuración
 * para evitar duplicación y facilitar cambios globales
 */

// ==========================================
// 📐 DIMENSIONES Y ESPACIADO
// ==========================================

/**
 * Dimensiones por defecto de los nodos en el canvas
 */
export const NODE_DIMENSIONS = {
  DEFAULT_WIDTH: 240,
  DEFAULT_HEIGHT: 80,
  EDITOR_HEIGHT: 92, // Altura mayor para nodos en modo editor
} as const

/**
 * Configuración de espaciado para el layout automático (Dagre)
 */
export const LAYOUT_CONFIG = {
  RANK_DIR: 'TB', // Top to Bottom
  NODE_SEP: 120, // Separación horizontal entre nodos
  RANK_SEP: 160, // Separación vertical entre niveles
  MARGIN_X: 40, // Margen horizontal del canvas
  MARGIN_Y: 40, // Margen vertical del canvas
} as const

/**
 * Configuración del viewport de ReactFlow
 */
export const VIEWPORT_CONFIG = {
  FIT_VIEW_PADDING: 0.2, // 20% de padding al hacer fitView
  CANVAS_HEIGHT: 560, // Altura del canvas en modo detalle
  EDITOR_CANVAS_HEIGHT: 620, // Altura del canvas en modo editor
} as const

// ==========================================
// 🎨 ESTILOS Y CLASES CSS
// ==========================================

/**
 * Clase base para badges reutilizables
 */
export const BADGE_CLASS =
  'badge px-3 py-1 rounded-full text-xs font-semibold' as const

/**
 * Configuración de colores para badges según contexto
 */
export const BADGE_COLORS = {
  primary: 'bg-indigo-100 text-indigo-700',
  secondary: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
  dark: 'bg-slate-900 text-white',
  purple: 'bg-purple-100 text-purple-700',
} as const

/**
 * Estilos de transición reutilizables
 */
export const TRANSITIONS = {
  DEFAULT: 'transition-colors',
  SMOOTH: 'transition-all duration-200 ease-in-out',
  OPACITY: 'transition-opacity duration-200 ease',
  SHADOW: 'transition-shadow duration-200 ease',
} as const

// ==========================================
// 🔷 CONFIGURACIÓN DE TIPOS DE NODOS
// ==========================================

/**
 * Tipos de nodos disponibles en el sistema
 */
export const NODE_TYPES = [
  'step',
  'decision',
  'event',
  'process',
  'integration',
] as const

export type NodeType = (typeof NODE_TYPES)[number]

/**
 * Configuración visual y semántica de cada tipo de nodo
 */
export const NODE_TYPE_CONFIG: Record<
  NodeType,
  { color: string; label: string; icon: string }
> = {
  step: {
    color: '#2563eb', // Blue
    label: 'Paso',
    icon: 'ClipboardList',
  },
  decision: {
    color: '#f59e0b', // Amber
    label: 'Decisión',
    icon: 'Gauge',
  },
  event: {
    color: '#ec4899', // Pink
    label: 'Evento',
    icon: 'AlertCircle',
  },
  process: {
    color: '#0ea5e9', // Sky
    label: 'Proceso',
    icon: 'Workflow',
  },
  integration: {
    color: '#22c55e', // Green
    label: 'Integración',
    icon: 'Network',
  },
} as const

// ==========================================
// 🔗 CONFIGURACIÓN DE EDGES
// ==========================================

/**
 * Estilos visuales para los diferentes tipos de edges
 */
export const EDGE_STYLES = {
  default: {
    stroke: '#4f46e5',
    strokeWidth: 1.6,
    animated: false,
  },
  decision: {
    stroke: '#f59e0b',
    strokeWidth: 1.6,
    strokeDasharray: '6 4',
    animated: true,
  },
  active: {
    strokeWidth: 2.8,
  },
} as const

/**
 * Configuración de handles (puntos de conexión)
 */
export const HANDLE_CONFIG = {
  SIZE: 14,
  BORDER_WIDTH: 2,
  BORDER_COLOR: '#cbd5e1',
  BACKGROUND: '#fff',
} as const

// ==========================================
// 📊 CONFIGURACIÓN DE TASKS Y ESTADOS
// ==========================================

/**
 * Estados posibles de una tarea
 */
export const TASK_STATUSES = ['pendiente', 'en curso', 'completada'] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

/**
 * Configuración visual de estados de tareas
 */
export const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; icon: string }
> = {
  pendiente: {
    label: 'Pendiente',
    color: '#f97316', // Orange
    icon: 'XCircle',
  },
  'en curso': {
    label: 'En curso',
    color: '#2563eb', // Blue
    icon: 'TimerReset',
  },
  completada: {
    label: 'Completada',
    color: '#16a34a', // Green
    icon: 'CheckCircle2',
  },
} as const

// ==========================================
// 📁 CONFIGURACIÓN DE CSV
// ==========================================

/**
 * Plantillas CSV por defecto para importación
 */
export const CSV_TEMPLATES = {
  nodes: `id,label,type,system,x,y,code
node-plan,Planificación,step,IsoTrack,80,120,PL-01
node-ejecucion,Ejecución,process,IsoTrack,420,210,EX-02
node-cierre,Cierre,decision,SAP,740,320,CR-03`,

  edges: `id,source,target,label
edge-plan-ejecucion,node-plan,node-ejecucion,Checklist
edge-ejecucion-cierre,node-ejecucion,node-cierre,Validación`,
} as const

/**
 * Columnas requeridas para validación de CSV
 */
export const CSV_REQUIRED_COLUMNS = {
  nodes: ['id', 'label', 'type', 'system'],
  edges: ['id', 'source', 'target'],
} as const

// ==========================================
// 🔍 CONFIGURACIÓN DE QUERIES
// ==========================================

/**
 * Claves de caché para React Query
 */
export const QUERY_KEYS = {
  FLOWS_LIST: 'flows',
  FLOW_DETAIL: 'flow-detail',
} as const

/**
 * Configuración de caché
 */
export const CACHE_CONFIG = {
  STALE_TIME: 1000 * 60, // 1 minuto
  RETRY: 3,
  RETRY_DELAY: 1000,
} as const

// ==========================================
// 📝 MENSAJES Y TEXTOS
// ==========================================

/**
 * Mensajes de UI reutilizables
 */
export const UI_MESSAGES = {
  NO_NODES: 'El flujo no tiene nodos.',
  NO_FLOWS: 'No se encontraron flujos.',
  SELECT_NODE: 'Selecciona un nodo',
  LOADING_EDITOR: 'Cargando editor de flujo...',
  FLOW_NOT_FOUND: 'No se encontró información para este flujo.',
  NO_TAGS: 'Sin tags asignados',
  NO_NOTES: 'Sin notas registradas.',
  NO_DOCUMENTS: 'Sin documentos.',
  NO_PROCESSES: 'Sin procesos enlazados.',
  NO_ROLES: 'Sin roles asignados.',
  NO_TASKS: 'Sin tareas asignadas a este nodo.',
} as const

/**
 * Mensajes de éxito/error para acciones
 */
export const ACTION_MESSAGES = {
  NODE_CREATED: {
    title: 'Nodo creado',
    text: 'Se agregó un nodo editable en el canvas.',
  },
  EDGE_CREATED: {
    title: 'Conexión creada',
    text: 'Edge agregado entre los nodos seleccionados.',
  },
  LAYOUT_SAVED: {
    title: 'Layout guardado',
    text: (nodes: number, edges: number) =>
      `${nodes} nodos y ${edges} conexiones listos para persistir`,
  },
  NODES_IMPORTED: {
    title: 'Nodos importados',
    text: (count: number) => `${count} nodos listos en el canvas`,
  },
  EDGES_IMPORTED: {
    title: 'Conexiones importadas',
    text: (count: number) => `${count} edges agregados desde el CSV`,
  },
  CSV_ERROR: {
    title: 'Error al importar CSV',
    text: 'Formato inválido',
  },
} as const

// ==========================================
// 🛠️ UTILIDADES
// ==========================================

/**
 * Helper para generar IDs únicos
 */
export function generateId(prefix = ''): string {
  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(16).slice(2)

  return prefix ? `${prefix}-${uuid.slice(0, 6)}` : uuid
}

/**
 * Helper para combinar clases de badge
 */
export function getBadgeClass(variant: keyof typeof BADGE_COLORS): string {
  return `${BADGE_CLASS} ${BADGE_COLORS[variant]}`
}

/**
 * Helper para obtener configuración de nodo por tipo
 */
export function getNodeConfig(type: NodeType) {
  return NODE_TYPE_CONFIG[type] || NODE_TYPE_CONFIG.step
}

/**
 * Helper para obtener configuración de tarea por estado
 */
export function getTaskConfig(status: TaskStatus) {
  return TASK_STATUS_CONFIG[status]
}
