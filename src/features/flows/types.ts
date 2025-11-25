export type FlowRecord = {
  id: string
  title: string
  description: string
  type: string | null
  tags: string[] | null
  area: string | null
  visibility: string
  visibility_roles: string[] | null
  layout_mode?: 'auto' | 'manual'
  default_lane_mode?: 'system' | 'area' | null
  metadata?: Record<string, unknown> | null
  company_id: string
  created_at: string
  updated_at: string
}

export type FlowTask = {
  label: string
  status: 'pendiente' | 'en curso' | 'completada'
}

export type FlowNodeMetadata = {
  notes?: string
  artifacts?: string[]
  roles?: string[]
  userAssigned?: string
  visibleFor?: string[]
  documents?: string[]
  processes?: string[]
  tasks?: FlowTask[]
}

export type FlowListResponse = {
  success: boolean
  message: string
  data: FlowRecord[]
}

export type FlowNodeRecord = {
  id: string
  label: string
  type: string
  system: string
  code: string
  metadata: FlowNodeMetadata | null
  position: { x: number; y: number } | null
  lane: string | null
  icon: string | null
  color: string | null
  width: number | null
  height: number | null
  order_index: number | null
  flow_id: string
  company_id: string
  created_at: string
  updated_at: string
}

export type FlowEdgeMetadata = {
  style?: 'default' | 'decision'
}

export type FlowEdgeRecord = {
  id: string
  source_node: string | null
  target_node: string | null
  label: string | null
  metadata: FlowEdgeMetadata | null
  type: string | null
  style: Record<string, unknown> | null
  flow_id: string
  company_id: string
  created_at: string
  updated_at: string
}

export type FlowDetailRecord = FlowRecord & {
  nodes: FlowNodeRecord[]
  edges: FlowEdgeRecord[]
}

export type FlowDetailResponse = {
  success: boolean
  message: string
  data: FlowDetailRecord
}
