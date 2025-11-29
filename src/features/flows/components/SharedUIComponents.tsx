/**
 * Componentes UI Compartidos del Módulo Flows
 *
 * Este archivo contiene componentes reutilizables que se usan
 * en múltiples vistas del módulo de flujos.
 *
 * ✅ Beneficios:
 * - DRY: No repetir código de UI
 * - Consistencia: Mismo look & feel en toda la app
 * - Mantenibilidad: Cambiar en un solo lugar
 * - Testeable: Componentes independientes fáciles de testear
 */

import { type ReactNode } from 'react'
import {
  CheckCircle2,
  TimerReset,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { BADGE_CLASS } from '../config/flow-constants'
import type { FlowTask } from '../types'

// ==========================================
// 🏷️ COMPONENTE: InfoList
// ==========================================

/**
 * Lista informativa con ícono y items
 *
 * Usado en: FlowDetail.tsx (panel lateral)
 *
 * @example
 * <InfoList
 *   title="Documentos"
 *   items={['DOC-001', 'DOC-002']}
 *   icon={FileText}
 *   empty="Sin documentos"
 * />
 */

interface InfoListProps {
  title: string
  items?: string[]
  icon: LucideIcon
  empty: string
  className?: string
}

export function InfoList({
  title,
  items,
  icon: Icon,
  empty,
  className = '',
}: InfoListProps) {
  return (
    <section className={`space-y-2 ${className}`}>
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

// ==========================================
// ✅ COMPONENTE: TaskList
// ==========================================

/**
 * Lista de tareas con chips de estado
 *
 * Usado en: FlowDetail.tsx (panel lateral)
 *
 * @example
 * <TaskList tasks={[
 *   { label: 'Revisar documento', status: 'completada' },
 *   { label: 'Aprobar cambios', status: 'en curso' }
 * ]} />
 */

interface TaskListProps {
  tasks?: FlowTask[]
  emptyMessage?: string
  className?: string
}

export function TaskList({
  tasks,
  emptyMessage = 'Sin tareas asignadas a este nodo.',
  className = '',
}: TaskListProps) {
  if (!tasks?.length) {
    return (
      <section
        className={`rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3 text-xs text-slate-600 ${className}`}
      >
        {emptyMessage}
      </section>
    )
  }

  return (
    <section
      className={`space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 ${className}`}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <CheckCircle2 className="h-4 w-4 text-indigo-600" />
        Tareas y chips de estado
      </div>
      <ul className="space-y-2 text-xs">
        {tasks.map((task, index) => (
          <li
            key={task.label + index}
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

// ==========================================
// 🎯 COMPONENTE: TaskChip
// ==========================================

/**
 * Chip de estado de tarea
 *
 * Usado por: TaskList component
 *
 * Estados soportados:
 * - pendiente (naranja)
 * - en curso (azul)
 * - completada (verde)
 */

interface TaskChipProps {
  status: FlowTask['status']
  className?: string
}

export function TaskChip({ status, className = '' }: TaskChipProps) {
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
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${className}`}
      style={{ backgroundColor: `${config.color}15`, color: config.color }}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  )
}

// ==========================================
// 📋 COMPONENTE: DetailCard
// ==========================================

/**
 * Card informativa con ícono, label y valor
 *
 * Usado en: FlowsOverview.tsx (panel de detalle)
 *
 * @example
 * <DetailCard
 *   icon={<Users className="h-4 w-4" />}
 *   label="Visibilidad"
 *   value="Público"
 * />
 */

interface DetailCardProps {
  icon?: ReactNode
  label: string
  value: string
  className?: string
}

export function DetailCard({
  icon,
  label,
  value,
  className = '',
}: DetailCardProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 ${className}`}
    >
      {icon && <div className="mt-0.5">{icon}</div>}
      <div>
        <p className="text-xs uppercase text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

// ==========================================
// 🔍 COMPONENTE: FilterSelect
// ==========================================

/**
 * Select de filtro con label
 *
 * Usado en: FlowsOverview.tsx (filtros superiores)
 *
 * @example
 * <FilterSelect
 *   label="Área"
 *   value={areaFilter}
 *   onChange={setAreaFilter}
 *   placeholder="Todas"
 *   options={['Operaciones', 'Calidad', 'Finanzas']}
 * />
 */

interface FilterSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  options: string[]
  className?: string
}

export function FilterSelect({
  label,
  value,
  onChange,
  placeholder,
  options,
  className = '',
}: FilterSelectProps) {
  return (
    <label
      className={`flex flex-col gap-1 text-sm text-slate-700 ${className}`}
    >
      <span className="font-semibold">{label}</span>
      <select
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

// ==========================================
// 🎨 COMPONENTE: SectionHeader
// ==========================================

/**
 * Header de sección con ícono y título
 *
 * Componente genérico para títulos de secciones
 *
 * @example
 * <SectionHeader
 *   icon={<Users className="h-4 w-4" />}
 *   title="Roles y responsables"
 * />
 */

interface SectionHeaderProps {
  icon?: ReactNode
  title: string
  className?: string
}

export function SectionHeader({
  icon,
  title,
  className = '',
}: SectionHeaderProps) {
  return (
    <div
      className={`flex items-center gap-2 text-sm font-semibold text-slate-900 ${className}`}
    >
      {icon && <span className="text-indigo-600">{icon}</span>}
      {title}
    </div>
  )
}

// ==========================================
// 📦 COMPONENTE: InfoBox
// ==========================================

/**
 * Caja informativa con título y descripción
 *
 * Usado para mensajes, ayuda y notas contextuales
 *
 * @example
 * <InfoBox
 *   variant="info"
 *   title="Visualización en ReactFlow"
 *   description="Usa el botón 'Abrir Flujo' para..."
 * />
 */

interface InfoBoxProps {
  variant?: 'info' | 'warning' | 'success' | 'error'
  title: string
  description: string
  className?: string
}

export function InfoBox({
  variant = 'info',
  title,
  description,
  className = '',
}: InfoBoxProps) {
  const variants = {
    info: 'border-indigo-200 bg-indigo-50/50 text-slate-700',
    warning: 'border-amber-200 bg-amber-50/50 text-slate-700',
    success: 'border-emerald-200 bg-emerald-50/50 text-slate-700',
    error: 'border-red-200 bg-red-50/50 text-slate-700',
  }

  return (
    <div
      className={`rounded-xl border border-dashed px-4 py-5 text-sm ${variants[variant]} ${className}`}
    >
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-slate-600">{description}</p>
    </div>
  )
}

// ==========================================
// 🎴 COMPONENTE: Badge
// ==========================================

/**
 * Badge genérico con variantes de color
 *
 * Componente básico para mostrar etiquetas
 *
 * @example
 * <Badge variant="primary">
 *   <Users className="h-3 w-3" />
 *   Público
 * </Badge>
 */

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'dark'
  children: ReactNode
  className?: string
}

export function Badge({
  variant = 'primary',
  children,
  className = '',
}: BadgeProps) {
  const variants = {
    primary: 'bg-indigo-100 text-indigo-700',
    secondary: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
    dark: 'bg-slate-900 text-white',
  }

  return (
    <span
      className={`${BADGE_CLASS} inline-flex items-center gap-1 ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

// ==========================================
// 🔘 COMPONENTE: EmptyState
// ==========================================

/**
 * Estado vacío con mensaje y opcional acción
 *
 * Usado cuando no hay datos para mostrar
 *
 * @example
 * <EmptyState
 *   icon={<Inbox className="h-8 w-8" />}
 *   message="No hay flujos disponibles"
 *   action={<button>Crear flujo</button>}
 * />
 */

interface EmptyStateProps {
  icon?: ReactNode
  message: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  message,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex min-h-60 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center ${className}`}
    >
      {icon && <div className="text-slate-400">{icon}</div>}
      <p className="text-sm text-slate-500">{message}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
