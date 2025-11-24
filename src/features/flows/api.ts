import axios, { type AxiosError } from 'axios'

import httpClient from '@/services/httpClient'

import type { FlowListResponse, FlowRecord } from './types'

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
