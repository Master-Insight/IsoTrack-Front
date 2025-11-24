import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { API_URL } from '../../config/constants'
import {
  createArtifactLink,
  deleteArtifactLink,
  fetchProcessDetail,
  fetchProcessLinks,
  fetchProcesses,
  updateTaskStatus,
} from './api'
import type { ArtifactLink, ProcessRecord } from './api'

const PROCESSES_QUERY_KEY = 'processes'

export function useProcessesQuery(endpoint?: string) {
  const targetEndpoint = endpoint || `${API_URL}/processes`

  return useQuery({
    queryKey: [PROCESSES_QUERY_KEY, targetEndpoint],
    queryFn: () => fetchProcesses(targetEndpoint),
    select: (response) => response.data,
    staleTime: 1000 * 60,
  })
}

export function useProcessDetailQuery(processId?: string, baseEndpoint?: string) {
  const targetEndpoint = processId
    ? `${baseEndpoint || `${API_URL}/processes`}/${processId}`
    : undefined

  return useQuery({
    queryKey: [PROCESSES_QUERY_KEY, 'detail', targetEndpoint],
    queryFn: () => fetchProcessDetail(targetEndpoint as string),
    select: (response) => response.data as ProcessRecord,
    enabled: Boolean(targetEndpoint),
    staleTime: 1000 * 60,
  })
}

export function useProcessLinksQuery(processId?: string, baseEndpoint?: string) {
  const targetEndpoint = processId
    ? `${baseEndpoint || `${API_URL}/processes`}/${processId}/links`
    : undefined

  return useQuery({
    queryKey: [PROCESSES_QUERY_KEY, 'links', targetEndpoint],
    queryFn: () => fetchProcessLinks(targetEndpoint as string),
    select: (response) => response.data as ArtifactLink[],
    enabled: Boolean(targetEndpoint),
  })
}

export function useUpdateTaskStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ endpoint, status }: { endpoint: string; status: string }) =>
      updateTaskStatus(endpoint, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROCESSES_QUERY_KEY] })
    },
  })
}

export function useCreateLinkMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ endpoint, payload }: { endpoint: string; payload: Parameters<typeof createArtifactLink>[1] }) =>
      createArtifactLink(endpoint, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROCESSES_QUERY_KEY, 'links'] })
    },
  })
}

export function useDeleteLinkMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (endpoint: string) => deleteArtifactLink(endpoint),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROCESSES_QUERY_KEY, 'links'] })
    },
  })
}
