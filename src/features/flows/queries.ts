import { useQuery } from '@tanstack/react-query'

import { API_URL } from '@/config/constants'

import { fetchFlows } from './api'
import { seedFlows } from './seed'

const FLOWS_QUERY_KEY = 'flows'

export function useFlowsQuery(endpoint?: string) {
  const targetEndpoint = endpoint || `${API_URL}/flows`

  return useQuery({
    queryKey: [FLOWS_QUERY_KEY, targetEndpoint],
    queryFn: () => fetchFlows(targetEndpoint),
    select: (response) => response.data,
    staleTime: 1000 * 60,
    initialData: { success: true, message: 'seed', data: seedFlows },
  })
}
