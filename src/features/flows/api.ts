import axios, { type AxiosError } from 'axios'

import httpClient from '@/services/httpClient'

import type { FlowListResponse, FlowRecord } from './types'

export type FlowApiRecord = {
  title: string
  description: string
  classification: string | null
  area: string | null
  visibility_roles: string[] | null
  id: string
  company_id: string
  created_at: string
  updated_at: string
}

function normalizeFlowRecord(apiRecord: FlowApiRecord): FlowRecord {
  return {
    id: apiRecord.id,
    title: apiRecord.title,
    description: apiRecord.description,
    classification: apiRecord.classification,
    area: apiRecord.area,
    visibilityRoles: apiRecord.visibility_roles,
    companyId: apiRecord.company_id,
    createdAt: apiRecord.created_at,
    updatedAt: apiRecord.updated_at,
  }
}

function normalizeListResponse(data: { success: boolean; message: string; data: FlowApiRecord[] }): FlowListResponse {
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
    const { data } = await httpClient.get<{ success: boolean; message: string; data: FlowApiRecord[] }>(endpoint)
    return normalizeListResponse(data)
  } catch (error) {
    const message = getErrorMessage(error, 'No se pudo obtener los flujos disponibles')
    throw new Error(message)
  }
}
