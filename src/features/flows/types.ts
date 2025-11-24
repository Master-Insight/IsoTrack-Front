export type FlowRecord = {
  id: string
  title: string
  description: string
  classification: string | null
  area: string | null
  visibilityRoles: string[] | null
  companyId: string
  createdAt: string
  updatedAt: string
}

export type FlowListResponse = {
  success: boolean
  message: string
  data: FlowRecord[]
}
