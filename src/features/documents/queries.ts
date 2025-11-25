import { useQuery } from '@tanstack/react-query'

import { API_URL } from '../../config/constants'
import { fetchDocumentDetail, fetchDocuments } from './api'
import { seedDocuments } from './data/seed'
import type { DocumentRecord } from './types'

const DOCUMENTS_QUERY_KEY = 'documents'

// Consulta principal del listado de documentos, con semilla para entornos sin API.
export function useDocumentsQuery(endpoint?: string) {
  const targetEndpoint = endpoint || `${API_URL}/documents`

  return useQuery({
    queryKey: [DOCUMENTS_QUERY_KEY, targetEndpoint],
    queryFn: () => fetchDocuments(targetEndpoint),
    select: (response) => response.data,
    staleTime: 1000 * 60,
    initialData: { success: true, message: 'seed', data: seedDocuments },
  })
}

// Consulta individual de detalle; deshabilitada hasta tener un id definido.
export function useDocumentDetailQuery(documentId?: string, baseEndpoint?: string) {
  const targetEndpoint = documentId
    ? `${baseEndpoint || `${API_URL}/documents`}/${documentId}`
    : undefined

  return useQuery({
    queryKey: [DOCUMENTS_QUERY_KEY, 'detail', targetEndpoint],
    queryFn: () => fetchDocumentDetail(targetEndpoint as string),
    select: (response) => response.data as DocumentRecord,
    enabled: Boolean(targetEndpoint),
    staleTime: 1000 * 60,
  })
}
