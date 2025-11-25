import { useEffect, useMemo, useState } from 'react'
import { FileIcon, Link2Icon } from '@radix-ui/react-icons'
import { clsx } from 'clsx'

import { DEFAULT_COMPANY } from '../../../config/constants'
import { useDocumentDetailQuery, useDocumentsQuery } from '../queries'
import type { DocumentRecord } from '../types'

const badgeClass = 'badge px-3 py-1 rounded-full text-xs font-semibold'

type DocumentRowProps = {
  id: string
  title: string
  code: string
  status: string | null
  active: boolean
  isSelected: boolean
  onSelect: (id: string) => void
}

// Fila clickeable para listar documentos en el panel izquierdo.
function DocumentRow({ id, title, code, status, active, isSelected, onSelect }: DocumentRowProps) {
  return (
    <button
      className={clsx(
        'w-full rounded-xl border px-3 py-2 text-left transition hover:border-cyan-400',
        isSelected
          ? 'border-cyan-500 bg-cyan-500/10 text-slate-900'
          : 'border-slate-200 bg-white text-slate-900',
      )}
      onClick={() => onSelect(id)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileIcon className="text-cyan-500" />
          <div>
            <p className="font-semibold">{title}</p>
            <p className="text-xs text-slate-500">{code}</p>
          </div>
        </div>
        <span
          className={clsx(
            badgeClass,
            active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700',
          )}
        >
          {status || 'sin estado'}
        </span>
      </div>
    </button>
  )
}

// Detalle resumido del documento seleccionado; funciona con datos de red o semilla.
function DocumentDetail({ selectedDocument }: { selectedDocument: DocumentRecord | null }) {
  if (!selectedDocument) {
    return (
      <div className="space-y-2 text-sm text-slate-600">
        <p className="font-semibold">Sin documento seleccionado</p>
        <p className="text-slate-500">
          Cuando haya sesión, cargaremos el primer documento disponible en la API.
        </p>
      </div>
    )
  }

  const { title, description, code, type, category, owner, currentVersion, tags, status } =
    selectedDocument

  const externalUrl = currentVersion?.externalUrl || currentVersion?.fileUrl

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-slate-500">Detalle (GET /documents/:id)</p>
          <p className="text-xl font-semibold text-slate-900">{title}</p>
        </div>
        <span className={`${badgeClass} bg-slate-100 text-slate-700`}>
          {currentVersion?.status || 'sin versión'}
        </span>
      </div>

      <p className="text-sm text-slate-600">{description}</p>

      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
        <div>
          <p className="text-xs uppercase text-slate-500">Código</p>
          <p>{code}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-500">Tipo</p>
          <p>{type}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-500">Categoría</p>
          <p>{category}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-500">Propietario</p>
          <p>{owner}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-500">Versión</p>
          <p>{currentVersion?.version || '—'}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-500">Estado</p>
          <p>{status || '—'}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <p className="text-xs uppercase text-slate-500">Etiquetas</p>
        <div className="flex flex-wrap gap-2">
          {tags.length ? (
            tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500">Sin etiquetas</span>
          )}
        </div>
      </div>

      <a
        href={externalUrl || '#'}
        className={clsx(
          'button-secondary inline-flex w-full items-center justify-center gap-2',
          !externalUrl && 'pointer-events-none opacity-60',
        )}
        target="_blank"
        rel="noreferrer"
      >
        <Link2Icon /> Abrir recurso externo
      </a>
    </div>
  )
}

// Panel maestro-detalle que combina listado y consulta de detalle de documento.
export function DocumentsPanel({ endpoint }: { endpoint?: string }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const documentsQuery = useDocumentsQuery(endpoint)
  const detailQuery = useDocumentDetailQuery(selectedId || undefined, endpoint)

  const documents = documentsQuery.data || []

  useEffect(() => {
    if (!selectedId && documents.length) {
      setSelectedId(documents[0]?.id)
    }
  }, [documents, selectedId])

  const selectedDocument = useMemo<DocumentRecord | null>(() => {
    if (detailQuery.data) return detailQuery.data
    if (!documents.length) return null

    const fallbackId = selectedId || documents[0]?.id
    return documents.find((doc) => doc.id === fallbackId) || null
  }, [detailQuery.data, documents, selectedId])

  const isLoadingList = documentsQuery.isLoading
  const isSyncing = documentsQuery.isFetching || detailQuery.isFetching

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Repositorio documental</p>
          <h3 className="text-xl font-semibold text-slate-900">Documentos disponibles</h3>
          <p className="text-xs text-slate-500">Lista protegida + detalle del primer recurso disponible.</p>
        </div>
        <span className={`${badgeClass} bg-slate-100 text-slate-700`}>
          {DEFAULT_COMPANY.name}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Listado (GET /documents)</p>
            {isSyncing && <span className="text-xs text-slate-500">Sincronizando...</span>}
          </div>
          {isLoadingList ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
              Cargando documentos...
            </div>
          ) : (
            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-1">
              {documentsQuery.data?.map((document) => (
                <DocumentRow
                  key={document.id}
                  {...document}
                  status={document.status}
                  isSelected={selectedId === document.id}
                  onSelect={setSelectedId}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <DocumentDetail selectedDocument={selectedDocument || null} />
        </div>
      </div>
    </section>
  )
}
