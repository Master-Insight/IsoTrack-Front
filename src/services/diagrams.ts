import axios, { type AxiosError } from 'axios'

import httpClient from './httpClient'
import type { ArtifactLink } from './processes'

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

export async function fetchDiagrams(endpoint: string): Promise<DiagramListResponse> {
  try {
    const { data } = await httpClient.get<DiagramListResponse>(endpoint)
    return data
  } catch (error) {
    const message = getErrorMessage(error, 'No se pudo obtener los diagramas')
    throw new Error(message)
  }
}

export async function fetchDiagramDetail(endpoint: string): Promise<DiagramDetailResponse> {
  try {
    const { data } = await httpClient.get<DiagramDetailResponse>(endpoint)
    return data
  } catch (error) {
    const message = getErrorMessage(error, 'No se pudo cargar el diagrama')
    throw new Error(message)
  }
}

export async function fetchDiagramLinks(endpoint: string) {
  try {
    const { data } = await httpClient.get<{ success: boolean; data: ArtifactLink[] }>(endpoint)
    return data.data || []
  } catch (error) {
    console.error(error)
    return [] as ArtifactLink[]
  }
}

export async function saveDiagramData(endpoint: string, payload: DiagramUpdatePayload) {
  try {
    const { data } = await httpClient.put<DiagramDetailResponse>(endpoint, payload)
    return data
  } catch (error) {
    const message = getErrorMessage(error, 'No se pudo guardar el diagrama')
    throw new Error(message)
  }
}
