import axios, { type AxiosError } from 'axios'

import httpClient from '../../services/httpClient'
import { normalizeDocumentRecord, type DocumentApiRecord } from '../documents/api'
import type { DocumentRecord } from '../documents/types'

export type ArtifactEntityType = 'process' | 'task' | 'document' | 'diagram'

export type ArtifactLink = {
  id: string
  fromId: string
  fromType: ArtifactEntityType
  toId: string
  toType: ArtifactEntityType
  toName?: string
  toCode?: string
  createdAt?: string
}

type ArtifactLinkApi = {
  id: string
  from_id: string
  from_type: ArtifactEntityType
  to_id: string
  to_type: ArtifactEntityType
  to_name?: string
  to_code?: string
  created_at?: string
}

export type TaskRecord = {
  id: string
  title: string
  description?: string | null
  status?: string | null
  frequency?: string | null
  responsibleRoles?: string[] | null
}

type TaskApiRecord = {
  id: string
  title: string
  description?: string | null
  status?: string | null
  frequency?: string | null
  responsible_roles?: string[] | null
}

export type ProcessRecord = {
  id: string
  name: string
  code: string
  description?: string | null
  maturity?: string | null
  owner?: string | null
  ownerId?: string | null
  inputs?: string[] | null
  outputs?: string[] | null
  tasks?: TaskRecord[]
  documents?: DocumentRecord[]
  artifactLinks?: ArtifactLink[]
}

type ProcessApiRecord = {
  id: string
  name: string
  code: string
  description?: string | null
  maturity?: string | null
  owner?: string | null
  owner_id?: string | null
  inputs?: string[] | null
  outputs?: string[] | null
  tasks?: TaskApiRecord[]
  documents?: DocumentApiRecord[]
  artifact_links?: ArtifactLinkApi[]
}

type ProcessListResponse = {
  success: boolean
  message: string
  data: ProcessRecord[]
}

type ProcessDetailResponse = {
  success: boolean
  message: string
  data: ProcessRecord
}

type ProcessLinksResponse = {
  success: boolean
  message: string
  data: ArtifactLink[]
}

type UpdateTaskResponse = {
  success: boolean
  message: string
  data: TaskRecord
}

type ArtifactLinkPayload = {
  from_id: string
  from_type: ArtifactEntityType
  to_id: string
  to_type: ArtifactEntityType
}

function normalizeTask(task: TaskApiRecord): TaskRecord {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    frequency: task.frequency,
    responsibleRoles: task.responsible_roles,
  }
}

function normalizeArtifactLink(link: ArtifactLinkApi): ArtifactLink {
  return {
    id: link.id,
    fromId: link.from_id,
    fromType: link.from_type,
    toId: link.to_id,
    toType: link.to_type,
    toName: link.to_name,
    toCode: link.to_code,
    createdAt: link.created_at,
  }
}

function normalizeProcessRecord(apiRecord: ProcessApiRecord): ProcessRecord {
  return {
    id: apiRecord.id,
    name: apiRecord.name,
    code: apiRecord.code,
    description: apiRecord.description,
    maturity: apiRecord.maturity,
    owner: apiRecord.owner,
    ownerId: apiRecord.owner_id,
    inputs: apiRecord.inputs,
    outputs: apiRecord.outputs,
    tasks: apiRecord.tasks?.map(normalizeTask),
    documents: apiRecord.documents?.map(normalizeDocumentRecord),
    artifactLinks: apiRecord.artifact_links?.map(normalizeArtifactLink),
  }
}

function normalizeListResponse(data: { success: boolean; message: string; data: ProcessApiRecord[] }): ProcessListResponse {
  return {
    ...data,
    data: data.data.map(normalizeProcessRecord),
  }
}

function normalizeDetailResponse(data: { success: boolean; message: string; data: ProcessApiRecord }): ProcessDetailResponse {
  return {
    ...data,
    data: normalizeProcessRecord(data.data),
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
 * GET /processes
 * - Envía: sin body; headers configurados en httpClient.
 * - Espera recibir: lista de procesos con tareas, documentos y vínculos normalizados.
 * - Ejemplo: { success: true, data: [{ id, name, code, tasks: [], documents: [] }] }
 */
export async function fetchProcesses(endpoint: string): Promise<ProcessListResponse> {
  try {
    const { data } = await httpClient.get<{ success: boolean; message: string; data: ProcessApiRecord[] }>(endpoint)
    return normalizeListResponse(data)
  } catch (error) {
    const message = getErrorMessage(error, 'No se pudo obtener los procesos')
    throw new Error(message)
  }
}

/**
 * GET /processes/:id
 * - Envía: sin body, solo el ID en la ruta.
 * - Espera recibir: { success, data: Process } con tareas y documentos vinculados.
 */
export async function fetchProcessDetail(endpoint: string): Promise<ProcessDetailResponse> {
  try {
    const { data } = await httpClient.get<{ success: boolean; message: string; data: ProcessApiRecord }>(endpoint)
    return normalizeDetailResponse(data)
  } catch (error) {
    const message = getErrorMessage(error, 'No se pudo obtener el proceso')
    throw new Error(message)
  }
}

/**
 * GET /processes/:id/links
 * - Envía: sin body.
 * - Espera recibir: vínculos de artefactos que relacionan procesos, tareas o documentos.
 */
export async function fetchProcessLinks(endpoint: string): Promise<ProcessLinksResponse> {
  try {
    const { data } = await httpClient.get<{ success: boolean; message: string; data: ArtifactLinkApi[] }>(endpoint)
    return { ...data, data: data.data.map(normalizeArtifactLink) }
  } catch (error) {
    const message = getErrorMessage(error, 'No se pudieron obtener los vínculos')
    throw new Error(message)
  }
}

/**
 * PATCH /tasks/:id
 * - Envía: { status }
 * - Espera recibir: tarea actualizada con su nuevo estado.
 */
export async function updateTaskStatus(endpoint: string, status: string): Promise<UpdateTaskResponse> {
  try {
    const { data } = await httpClient.patch<{ success: boolean; message: string; data: TaskApiRecord }>(endpoint, {
      status,
    })
    return { ...data, data: normalizeTask(data.data) }
  } catch (error) {
    const message = getErrorMessage(error, 'No se pudo actualizar el estado de la tarea')
    throw new Error(message)
  }
}

/**
 * POST /processes/:id/links
 * - Envía: payload con IDs y tipos de los artefactos a relacionar.
 * - Espera recibir: vínculos de artefactos actualizados.
 */
export async function createArtifactLink(endpoint: string, payload: ArtifactLinkPayload): Promise<ProcessLinksResponse> {
  try {
    const { data } = await httpClient.post<{ success: boolean; message: string; data: ArtifactLinkApi[] }>(
      endpoint,
      payload,
    )
    return { ...data, data: data.data.map(normalizeArtifactLink) }
  } catch (error) {
    const message = getErrorMessage(error, 'No se pudo crear el vínculo')
    throw new Error(message)
  }
}

/**
 * DELETE /processes/:id/links/:linkId
 * - Envía: sin body; el ID del vínculo en la ruta.
 * - Espera recibir: lista de vínculos restante tras la eliminación.
 */
export async function deleteArtifactLink(endpoint: string): Promise<ProcessLinksResponse> {
  try {
    const { data } = await httpClient.delete<{ success: boolean; message: string; data: ArtifactLinkApi[] }>(endpoint)
    return { ...data, data: data.data.map(normalizeArtifactLink) }
  } catch (error) {
    const message = getErrorMessage(error, 'No se pudo eliminar el vínculo')
    throw new Error(message)
  }
}
