import { create } from 'zustand'

import { API_URL } from '../../config/constants'
import { seedDocuments } from './data/seed'
import type { DocumentRecord } from './types'

type DocumentsState = {
  documents: DocumentRecord[]
  selectedId: string | null
  isLoading: boolean
  error: string | null
  loadDocuments: (endpoint?: string) => Promise<void>
  selectDocument: (id: string) => void
  reset: () => void
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: seedDocuments,
  selectedId: seedDocuments[0]?.id ?? null,
  isLoading: false,
  error: null,
  loadDocuments: async (endpoint?: string) => {
    const target = endpoint || `${API_URL}/documents`
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(target)
      if (!response.ok) {
        throw new Error('No se pudo obtener los documentos desde la API')
      }
      const payload = await response.json()
      const payloadDocuments =
        (payload?.data as DocumentRecord[] | undefined) || seedDocuments
      set({
        documents: payloadDocuments,
        selectedId: payloadDocuments[0]?.id ?? null,
        isLoading: false,
      })
    } catch (error) {
      console.warn('Fallo la sincronización con la API, usamos seed local.', error)
      set({ documents: seedDocuments, selectedId: seedDocuments[0]?.id ?? null, isLoading: false })
    }
  },
  selectDocument: (id) => set({ selectedId: id }),
  reset: () =>
    set({
      documents: seedDocuments,
      selectedId: seedDocuments[0]?.id ?? null,
      isLoading: false,
      error: null,
    }),
}))

export const getSelectedDocument = (state: DocumentsState) =>
  state.documents.find((doc) => doc.id === state.selectedId) || null
