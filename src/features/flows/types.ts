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
