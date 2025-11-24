export type FlowRecord = {
  id: string
  title: string
  description: string
  type: string | null
  tags: string[] | null
  area: string | null
  visibility: string
  visibility_roles: string[] | null
  company_id: string
  created_at: string
  updated_at: string
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
  metadata: Record<string, unknown> | null
  position: { x: number; y: number } | null
  flow_id: string
  company_id: string
  created_at: string
  updated_at: string
}

export type FlowEdgeRecord = {
  id: string
  source_node: string | null
  target_node: string | null
  label: string | null
  metadata: Record<string, unknown> | null
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
