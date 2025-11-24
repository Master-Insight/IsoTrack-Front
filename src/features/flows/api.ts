import axios, { type AxiosError } from 'axios'

import httpClient from '@/services/httpClient'

import type {
  FlowDetailResponse,
  FlowDetailRecord,
  FlowEdgeRecord,
  FlowListResponse,
  FlowNodeRecord,
  FlowRecord,
} from './types'

export type FlowApiRecord = {
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

type FlowNodeApiRecord = {
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

type FlowEdgeApiRecord = {
  id: string
  source: string | null
  target: string | null
  label: string | null
  metadata: Record<string, unknown> | null
  flow_id: string
  company_id: string
  created_at: string
  updated_at: string
}

function normalizeFlowRecord(apiRecord: FlowApiRecord): FlowRecord {
  return {
    id: apiRecord.id,
    title: apiRecord.title,
    description: apiRecord.description,
    type: apiRecord.type,
    tags: apiRecord.tags,
    area: apiRecord.area,
    visibility: apiRecord.visibility,
    visibility_roles: apiRecord.visibility_roles,
    company_id: apiRecord.company_id,
    created_at: apiRecord.created_at,
    updated_at: apiRecord.updated_at,
  }
}

function normalizeNodeRecord(apiRecord: FlowNodeApiRecord): FlowNodeRecord {
  return {
    ...apiRecord,
    position: apiRecord.position,
  }
}

function normalizeEdgeRecord(apiRecord: FlowEdgeApiRecord): FlowEdgeRecord {
  return {
    ...apiRecord,
    metadata: apiRecord.metadata ?? {},
  }
}

function normalizeDetailResponse(data: {
  success: boolean
  message: string
  data: FlowApiRecord & { nodes: FlowNodeApiRecord[]; edges: FlowEdgeApiRecord[] }
}): FlowDetailResponse {
  const { nodes, edges, ...flowData } = data.data

  const flowRecord: FlowDetailRecord = {
    ...normalizeFlowRecord(flowData),
    nodes: nodes.map(normalizeNodeRecord),
    edges: edges.map(normalizeEdgeRecord),
  }

  return {
    ...data,
    data: flowRecord,
  }
}

function normalizeListResponse(data: {
  success: boolean
  message: string
  data: FlowApiRecord[]
}): FlowListResponse {
  return {
    ...data,
    data: data.data.map(normalizeFlowRecord),
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>
    return axiosError.response?.data?.message || axiosError.message || fallback
  }
  return error instanceof Error ? error.message : fallback
}

export async function fetchFlows(endpoint: string): Promise<FlowListResponse> {
  try {
    const { data } = await httpClient.get<{
      success: boolean
      message: string
      data: FlowApiRecord[]
    }>(endpoint)
    return normalizeListResponse(data)
  } catch (error) {
    const message = getErrorMessage(
      error,
      'No se pudo obtener los flujos disponibles',
    )
    throw new Error(message)
  }
}

export async function fetchFlowById(endpoint: string): Promise<FlowDetailResponse> {
  try {
    const { data } = await httpClient.get<{
      success: boolean
      message: string
      data: FlowApiRecord & { nodes: FlowNodeApiRecord[]; edges: FlowEdgeApiRecord[] }
    }>(endpoint)
    return normalizeDetailResponse(data)
  } catch (error) {
    const message = getErrorMessage(error, 'No se pudo obtener el flujo solicitado')
    throw new Error(message)
  }
}
