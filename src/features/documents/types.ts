export type DocumentVersion = {
  id: string
  documentId: string
  version: string
  status: string | null
  fileUrl: string | null
  externalUrl: string | null
  notes: string | null
  approvedBy: string | null
  approvedByName: string | null
  approvedAt: string | null
  format: string | null
  createdAt: string
}

export type DocumentRecord = {
  id: string
  title: string
  code: string
  type: string
  processId: string | null
  ownerId: string
  owner: string
  description: string
  active: boolean
  category: string
  tags: string[]
  companyId: string
  createdAt: string
  updatedAt: string
  status: string | null
  currentVersion: DocumentVersion | null
  versions: DocumentVersion[]
}
