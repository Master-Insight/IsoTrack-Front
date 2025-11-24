import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { API_URL } from '../../config/constants'
import {
  fetchDiagramDetail,
  fetchDiagramLinks,
  fetchDiagrams,
  saveDiagramData,
  type DiagramDetailResponse,
  type DiagramListResponse,
  type DiagramUpdatePayload,
} from './api'

const DIAGRAMS_QUERY_KEY = 'diagrams'

type QueryOptions = {
  enabled?: boolean
}

export function useDiagramsQuery(endpoint?: string, options?: QueryOptions) {
  const targetEndpoint = endpoint || `${API_URL}/diagrams`

  return useQuery<DiagramListResponse>({
    queryKey: [DIAGRAMS_QUERY_KEY, targetEndpoint],
    queryFn: () => fetchDiagrams(targetEndpoint),
    select: (response) => response,
    staleTime: 1000 * 60,
    enabled: options?.enabled ?? true,
  })
}

export function useDiagramDetailQuery(diagramId?: string, baseEndpoint?: string, options?: QueryOptions) {
  const targetEndpoint = diagramId
    ? `${baseEndpoint || `${API_URL}/diagrams`}/${diagramId}`
    : undefined

  return useQuery<DiagramDetailResponse>({
    queryKey: [DIAGRAMS_QUERY_KEY, 'detail', targetEndpoint],
    queryFn: () => fetchDiagramDetail(targetEndpoint as string),
    select: (response) => response,
    enabled: (options?.enabled ?? true) && Boolean(targetEndpoint),
    staleTime: 1000 * 60,
  })
}

export function useDiagramLinksQuery(diagramId?: string, baseEndpoint?: string, options?: QueryOptions) {
  const targetEndpoint = diagramId
    ? `${baseEndpoint || `${API_URL}/diagrams`}/${diagramId}/links`
    : undefined

  return useQuery({
    queryKey: [DIAGRAMS_QUERY_KEY, 'links', targetEndpoint],
    queryFn: () => fetchDiagramLinks(targetEndpoint as string),
    select: (response) => response,
    enabled: (options?.enabled ?? true) && Boolean(targetEndpoint),
  })
}

export function useSaveDiagramMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ endpoint, payload }: { endpoint: string; payload: DiagramUpdatePayload }) =>
      saveDiagramData(endpoint, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DIAGRAMS_QUERY_KEY] })
    },
  })
}
