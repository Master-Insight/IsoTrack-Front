import axios, { type AxiosError } from 'axios'

import httpClient from '../../services/httpClient'
import type { ArtifactLink } from '../processes/api'

export type DiagramType = 'organigrama' | 'flujo'

export type DiagramNode = {
  id: string
  label: string
  type: 'role' | 'area'
  x: number
  y: number
  meta?: string | null
}

export type DiagramEdge = {
  id: string
  source: string
  target: string
  label?: string | null
}

export type DiagramData = {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
}

export type DiagramRecord = {
  id: string
  name: string
  code: string
  type: DiagramType
  description?: string | null
  company_id?: string
  data?: DiagramData | null
  svg_export?: string | null
  updatedAt?: string
  createdAt?: string
}

export type DiagramListResponse = {
  success: boolean
  message: string
  data: DiagramRecord[]
}

export type DiagramDetailResponse = {
  success: boolean
  message: string
  data: DiagramRecord & { artifactLinks?: ArtifactLink[] }
}

export type DiagramUpdatePayload = {
  data: DiagramData
  svg_export?: string
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>
    return axiosError.response?.data?.message || axiosError.message || fallback
  }
  return error instanceof Error ? error.message : fallback
}

/**
 * GET /diagrams
 * - Envía: sin body; headers y baseURL configurados en httpClient.
 * - Espera recibir: listado de diagramas con metadatos y, opcionalmente, datos incrustados.
 */
export async function fetchDiagrams(endpoint: string): Promise<DiagramListResponse> {
  try {
    const { data } = await httpClient.get<DiagramListResponse>(endpoint)
    return data
  } catch (error) {
    const message = getErrorMessage(error, 'No se pudo obtener los diagramas')
    throw new Error(message)
  }
}

/**
 * GET /diagrams/:id
 * - Envía: sin body; el ID del diagrama via path param.
 * - Espera recibir: detalle del diagrama con data serializada (nodes/edges) y vínculos opcionales.
 */
export async function fetchDiagramDetail(endpoint: string): Promise<DiagramDetailResponse> {
  try {
    const { data } = await httpClient.get<DiagramDetailResponse>(endpoint)
    return data
  } catch (error) {
    const message = getErrorMessage(error, 'No se pudo cargar el diagrama')
    throw new Error(message)
  }
}

/**
 * GET /diagrams/:id/links
 * - Envía: sin body.
 * - Espera recibir: lista de vínculos artefact_links asociados al diagrama.
 * - Ejemplo de respuesta: { success: true, data: [{ id, to_id, to_type, to_name }] }
 */
export async function fetchDiagramLinks(endpoint: string) {
  try {
    const { data } = await httpClient.get<{ success: boolean; data: ArtifactLink[] }>(endpoint)
    return data.data || []
  } catch (error) {
    console.error(error)
    return [] as ArtifactLink[]
  }
}

/**
 * PUT /diagrams/:id
 * - Envía: payload con data (nodes, edges) y opcionalmente svg_export generado en el cliente.
 * - Espera recibir: detalle actualizado del diagrama con los campos normalizados por la API.
 */
export async function saveDiagramData(endpoint: string, payload: DiagramUpdatePayload) {
  try {
    const { data } = await httpClient.put<DiagramDetailResponse>(endpoint, payload)
    return data
  } catch (error) {
    const message = getErrorMessage(error, 'No se pudo guardar el diagrama')
    throw new Error(message)
  }
}
