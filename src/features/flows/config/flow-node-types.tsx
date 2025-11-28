/**
 * Sistema de Configuración de Tipos de Nodos
 *
 * Este módulo centraliza toda la configuración visual y semántica
 * de los tipos de nodos disponibles en el sistema de flujos.
 *
 * Beneficios:
 * - ✅ Única fuente de verdad para tipos de nodos
 * - ✅ Type-safety con TypeScript
 * - ✅ Iconos dinámicos desde lucide-react
 * - ✅ Fácil extensión para nuevos tipos
 */

import {
  AlertCircle,
  ClipboardList,
  Gauge,
  Network,
  Workflow,
  type LucideIcon,
} from 'lucide-react'

// ==========================================
// 📝 DEFINICIÓN DE TIPOS
// ==========================================

/**
 * Tipos de nodos soportados por el sistema
 * Usar este tipo para garantizar consistencia en toda la app
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
 * Configuración completa de un tipo de nodo
 */
export interface NodeTypeConfig {
  /** Código del tipo (usado en enums y backend) */
  type: NodeType
  /** Nombre legible para el usuario */
  label: string
  /** Color principal (formato hex) */
  color: string
  /** Nombre del ícono de lucide-react */
  iconName: string
  /** Componente de ícono de lucide-react */
  Icon: LucideIcon
  /** Descripción corta del propósito del nodo */
  description: string
}

// ==========================================
// 🎨 CONFIGURACIÓN DE TIPOS
// ==========================================

/**
 * Mapa de iconos disponibles
 * Agregar aquí cualquier ícono nuevo que se necesite
 */
const ICON_MAP: Record<string, LucideIcon> = {
  ClipboardList,
  Gauge,
  AlertCircle,
  Workflow,
  Network,
}

/**
 * Configuración centralizada de todos los tipos de nodos
 *
 * Para agregar un nuevo tipo:
 * 1. Agregar el tipo en NODE_TYPES
 * 2. Importar el ícono de lucide-react
 * 3. Agregarlo a ICON_MAP
 * 4. Definir la configuración aquí
 */
export const NODE_TYPE_CONFIGS: Record<NodeType, NodeTypeConfig> = {
  step: {
    type: 'step',
    label: 'Paso',
    color: '#2563eb', // blue-600
    iconName: 'ClipboardList',
    Icon: ClipboardList,
    description: 'Paso secuencial en el proceso',
  },
  decision: {
    type: 'decision',
    label: 'Decisión',
    color: '#f59e0b', // amber-500
    iconName: 'Gauge',
    Icon: Gauge,
    description: 'Punto de decisión con múltiples caminos',
  },
  event: {
    type: 'event',
    label: 'Evento',
    color: '#ec4899', // pink-500
    iconName: 'AlertCircle',
    Icon: AlertCircle,
    description: 'Evento o alerta en el flujo',
  },
  process: {
    type: 'process',
    label: 'Proceso',
    color: '#0ea5e9', // sky-500
    iconName: 'Workflow',
    Icon: Workflow,
    description: 'Sub-proceso complejo',
  },
  integration: {
    type: 'integration',
    label: 'Integración',
    color: '#22c55e', // green-500
    iconName: 'Network',
    Icon: Network,
    description: 'Integración con sistema externo',
  },
}

// ==========================================
// 🛠️ HELPERS Y UTILIDADES
// ==========================================

/**
 * Obtiene la configuración completa de un tipo de nodo
 * Si el tipo no existe, retorna la configuración de 'step'
 *
 * @param type - Tipo de nodo a buscar
 * @returns Configuración del tipo de nodo
 *
 * @example
 * const config = getNodeTypeConfig('decision')
 * console.log(config.color) // '#f59e0b'
 */
export function getNodeTypeConfig(type: NodeType | string): NodeTypeConfig {
  return NODE_TYPE_CONFIGS[type as NodeType] || NODE_TYPE_CONFIGS.step
}

/**
 * Obtiene solo el color de un tipo de nodo
 * Útil para estilos inline rápidos
 *
 * @example
 * <div style={{ backgroundColor: getNodeTypeColor('event') }} />
 */
export function getNodeTypeColor(type: NodeType | string): string {
  return getNodeTypeConfig(type).color
}

/**
 * Obtiene solo el label de un tipo de nodo
 *
 * @example
 * <option>{getNodeTypeLabel('step')}</option> // "Paso"
 */
export function getNodeTypeLabel(type: NodeType | string): string {
  return getNodeTypeConfig(type).label
}

/**
 * Obtiene el componente de ícono de un tipo de nodo
 *
 * @example
 * const Icon = getNodeTypeIcon('process')
 * return <Icon className="h-4 w-4" />
 */
export function getNodeTypeIcon(type: NodeType | string): LucideIcon {
  return getNodeTypeConfig(type).Icon
}

/**
 * Valida si un string es un tipo de nodo válido
 *
 * @example
 * isValidNodeType('step') // true
 * isValidNodeType('invalid') // false
 */
export function isValidNodeType(type: string): type is NodeType {
  return NODE_TYPES.includes(type as NodeType)
}

/**
 * Obtiene un array de todas las configuraciones disponibles
 * Útil para renderizar listas de opciones
 *
 * @example
 * getAllNodeTypeConfigs().map(config => (
 *   <option key={config.type} value={config.type}>
 *     {config.label}
 *   </option>
 * ))
 */
export function getAllNodeTypeConfigs(): NodeTypeConfig[] {
  return NODE_TYPES.map((type) => NODE_TYPE_CONFIGS[type])
}

/**
 * Genera estilos CSS inline para un tipo de nodo
 * Útil para componentes de nodo personalizados
 *
 * @param type - Tipo de nodo
 * @param opacity - Opacidad adicional (0-1)
 * @returns Objeto de estilos CSS
 *
 * @example
 * <div style={getNodeTypeStyles('decision', 0.15)}>
 *   Contenido del nodo
 * </div>
 */
export function getNodeTypeStyles(
  type: NodeType | string,
  opacity = 0.15,
): React.CSSProperties {
  const color = getNodeTypeColor(type)
  return {
    backgroundColor: `${color}${Math.round(opacity * 255)
      .toString(16)
      .padStart(2, '0')}`,
    color: color,
  }
}

/**
 * Genera una clase CSS para badge de tipo de nodo
 *
 * @param type - Tipo de nodo
 * @returns String con clases CSS de Tailwind
 *
 * @example
 * <span className={getNodeTypeBadgeClass('step')}>
 *   Paso
 * </span>
 */
export function getNodeTypeBadgeClass(type: NodeType | string): string {
  const baseClass =
    'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold'
  const config = getNodeTypeConfig(type)

  // Genera clases dinámicas con opacity
  return `${baseClass} text-slate-900`
}

// ==========================================
// 🎨 COMPONENTES REUTILIZABLES
// ==========================================

/**
 * Componente de badge de tipo de nodo con ícono
 * Componente visual listo para usar que incluye ícono y label
 *
 * @example
 * <NodeTypeChip type="decision" />
 */
interface NodeTypeChipProps {
  type: NodeType | string | null | undefined
  className?: string
}

export function NodeTypeChip({ type, className = '' }: NodeTypeChipProps) {
  if (!type) return null

  const config = getNodeTypeConfig(type)
  const Icon = config.Icon

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-slate-900 ${className}`}
      style={{
        backgroundColor: `${config.color}12`,
        color: config.color,
      }}
    >
      <Icon className="h-4 w-4" />
      {config.label}
    </span>
  )
}

/**
 * Componente de ícono de tipo de nodo standalone
 * Ícono independiente con color del tipo
 *
 * @example
 * <NodeTypeIconBadge type="event" size="lg" />
 */
interface NodeTypeIconBadgeProps {
  type: NodeType | string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function NodeTypeIconBadge({
  type,
  size = 'md',
  className = '',
}: NodeTypeIconBadgeProps) {
  const config = getNodeTypeConfig(type)
  const Icon = config.Icon

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-9 w-9',
    lg: 'h-12 w-12',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-6 w-6',
  }

  return (
    <span
      className={`flex ${sizeClasses[size]} items-center justify-center rounded-xl ${className}`}
      style={{ backgroundColor: `${config.color}15` }}
    >
      <Icon className={iconSizes[size]} style={{ color: config.color }} />
    </span>
  )
}

/**
 * Selector de tipo de nodo como dropdown
 * Select completo con todas las opciones de tipos
 *
 * @example
 * <NodeTypeSelect
 *   value={nodeType}
 *   onChange={(type) => setNodeType(type)}
 * />
 */
interface NodeTypeSelectProps {
  value: NodeType | string
  onChange: (type: NodeType) => void
  className?: string
  placeholder?: string
}

export function NodeTypeSelect({
  value,
  onChange,
  className = '',
  placeholder = 'Selecciona tipo',
}: NodeTypeSelectProps) {
  return (
    <select
      className={`rounded-lg border border-slate-200 px-3 py-2 text-sm ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value as NodeType)}
    >
      <option value="">{placeholder}</option>
      {getAllNodeTypeConfigs().map((config) => (
        <option key={config.type} value={config.type}>
          {config.label}
        </option>
      ))}
    </select>
  )
}

// ==========================================
// 📤 EXPORTS LEGACY (Compatibilidad)
// ==========================================

/**
 * Export con el formato legacy para compatibilidad con código existente
 * @deprecated Usar getNodeTypeConfig() en su lugar
 */
export const nodeTypeStyles = Object.entries(NODE_TYPE_CONFIGS).reduce(
  (acc, [key, config]) => {
    acc[key as NodeType] = {
      color: config.color,
      label: config.label,
      icon: config.Icon,
    }
    return acc
  },
  {} as Record<NodeType, { color: string; label: string; icon: LucideIcon }>,
)

/**
 * Export alternativo con iconName como string
 * @deprecated Usar getNodeTypeConfig() en su lugar
 */
export const nodeTypeStylesWithIconName = Object.entries(
  NODE_TYPE_CONFIGS,
).reduce(
  (acc, [key, config]) => {
    acc[key as NodeType] = {
      color: config.color,
      icon: config.iconName,
    }
    return acc
  },
  {} as Record<NodeType, { color: string; icon: string }>,
)
