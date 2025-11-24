import { useQuery } from '@tanstack/react-query'

import { API_URL } from '@/config/constants'

import { fetchFlowById, fetchFlows } from './api'
import type { FlowDetailRecord } from './types'

const FLOWS_QUERY_KEY = 'flows'
const FLOW_DETAIL_QUERY_KEY = 'flow-detail'

export function useFlowsQuery(endpoint?: string) {
  const targetEndpoint = endpoint || `${API_URL}/flows`

  return useQuery({
    queryKey: [FLOWS_QUERY_KEY, targetEndpoint],
    queryFn: () => fetchFlows(targetEndpoint),
    select: (response) => response.data,
    staleTime: 1000 * 60,
  })
}

export function useFlowDetailQuery(flowId: string) {
  const endpoint = `${API_URL}/flows/${flowId}`

  return useQuery({
    queryKey: [FLOW_DETAIL_QUERY_KEY, flowId],
    queryFn: () => fetchFlowById(endpoint),
    select: (response) => response.data as FlowDetailRecord,
    enabled: Boolean(flowId),
    staleTime: 1000 * 60,
  })
}
