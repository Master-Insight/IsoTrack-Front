import axios, { type AxiosError } from 'axios'

import httpClient from '../../services/httpClient'
import type { DocumentRead, DocumentRecord, DocumentVersion } from './types'

export type DocumentApiVersion = {
  id: string
  document_id: string
  version: string
  status: string | null
  file_url: string | null
  external_url: string | null
  notes: string | null
  approved_by: string | null
  approved_by_name: string | null
  approved_at: string | null
  format: string | null
  created_at: string
}

export type DocumentApiRead = {
  id: string
  document_id: string
  user_id: string
  user: string
  position: string | null
  read_at: string
  due_date: string | null
}

export type DocumentApiRecord = {
  title: string
  code: string
  type: string
  process_id: string | null
  owner_id: string
  owner: string
  description: string
  active: boolean
  category: string
  tags: string[]
  id: string
  company_id: string
  created_at: string
  updated_at: string
  status: string | null
  current_version: DocumentApiVersion | null
  versions: DocumentApiVersion[]
  reads?: DocumentApiRead[]
  next_review_at?: string | null
}

export type DocumentListResponse = {
  success: boolean
  message: string
  data: DocumentRecord[]
}

export type DocumentDetailResponse = {
  success: boolean
  message: string
  data: DocumentRecord
}

function normalizeDocumentVersion(apiVersion: DocumentApiVersion): DocumentVersion {
  return {
    id: apiVersion.id,
    documentId: apiVersion.document_id,
    version: apiVersion.version,
    status: apiVersion.status,
    fileUrl: apiVersion.file_url,
    externalUrl: apiVersion.external_url,
    notes: apiVersion.notes,
    approvedBy: apiVersion.approved_by,
    approvedByName: apiVersion.approved_by_name,
    approvedAt: apiVersion.approved_at,
    format: apiVersion.format,
    createdAt: apiVersion.created_at,
  }
}

function normalizeDocumentRead(apiRead: DocumentApiRead): DocumentRead {
  return {
    id: apiRead.id,
    documentId: apiRead.document_id,
    userId: apiRead.user_id,
    user: apiRead.user,
    position: apiRead.position,
    readAt: apiRead.read_at,
    dueDate: apiRead.due_date,
  }
}

export function normalizeDocumentRecord(apiRecord: DocumentApiRecord): DocumentRecord {
  return {
    id: apiRecord.id,
    title: apiRecord.title,
    code: apiRecord.code,
    type: apiRecord.type,
    processId: apiRecord.process_id,
    ownerId: apiRecord.owner_id,
    owner: apiRecord.owner,
    description: apiRecord.description,
    active: apiRecord.active ?? false,
    category: apiRecord.category,
    tags: apiRecord.tags || [],
    companyId: apiRecord.company_id,
    createdAt: apiRecord.created_at,
    updatedAt: apiRecord.updated_at,
    status: apiRecord.status,
    currentVersion: apiRecord.current_version
      ? normalizeDocumentVersion(apiRecord.current_version)
      : null,
    versions: apiRecord.versions?.map(normalizeDocumentVersion) || [],
    reads: apiRecord.reads?.map(normalizeDocumentRead),
    nextReviewAt: apiRecord.next_review_at,
  }
}

function normalizeListResponse(data: {
  success: boolean
  message: string
  data: DocumentApiRecord[]
}): DocumentListResponse {
  return {
    ...data,
    data: data.data.map(normalizeDocumentRecord),
  }
}

function normalizeDetailResponse(data: {
  success: boolean
  message: string
  data: DocumentApiRecord
}): DocumentDetailResponse {
  return {
    ...data,
    data: normalizeDocumentRecord(data.data),
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>
    return axiosError.response?.data?.message || axiosError.message || fallback
  }
  return error instanceof Error ? error.message : fallback
}

/**
 * GET /documents
 * - Envía: sin body, solo headers configurados en httpClient (incluye credenciales si están disponibles).
 * - Espera recibir: { success: boolean, message: string, data: Document[] }
 * - Ejemplo: success con arreglo de documentos normalizados.
 */
export async function fetchDocuments(endpoint: string): Promise<DocumentListResponse> {
  try {
    const { data } = await httpClient.get<{ success: boolean; message: string; data: DocumentApiRecord[] }>(
      endpoint,
    )
    return normalizeListResponse(data)
  } catch (error) {
    const message = getErrorMessage(error, 'No se pudo obtener los documentos')
    throw new Error(message)
  }
}

/**
 * GET /documents/:id
 * - Envía: sin body, ruta con ID del documento.
 * - Espera recibir: { success: boolean, message: string, data: Document }
 * - Ejemplo: detalle con versiones, lecturas y metadata normalizada.
 */
export async function fetchDocumentDetail(endpoint: string): Promise<DocumentDetailResponse> {
  try {
    const { data } = await httpClient.get<{ success: boolean; message: string; data: DocumentApiRecord }>(
      endpoint,
    )
    return normalizeDetailResponse(data)
  } catch (error) {
    const message = getErrorMessage(error, 'No se pudo obtener el documento')
    throw new Error(message)
  }
}
