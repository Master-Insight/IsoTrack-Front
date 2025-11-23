import { useEffect } from 'react'
import { FileIcon, Link2Icon } from '@radix-ui/react-icons'
import { clsx } from 'clsx'

import { DEFAULT_COMPANY } from '../../../config/constants'
import { getSelectedDocument, useDocumentsStore } from '../store'

const badgeClass = 'badge px-3 py-1 rounded-full text-xs font-semibold'

function DocumentRow({
  id,
  title,
  code,
  status,
  active,
}: {
  id: string
  title: string
  code: string
  status: string | null
  active: boolean
}) {
  const selectDocument = useDocumentsStore((state) => state.selectDocument)
  const selectedId = useDocumentsStore((state) => state.selectedId)

  const isSelected = selectedId === id
  return (
    <button
      className={clsx(
        'w-full rounded-xl border px-3 py-2 text-left transition hover:border-cyan-400',
        isSelected
          ? 'border-cyan-500 bg-cyan-500/10 text-slate-900'
          : 'border-slate-200 bg-white text-slate-900',
      )}
      onClick={() => selectDocument(id)}
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
            active
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-200 text-slate-700',
          )}
        >
          {status || 'sin estado'}
        </span>
      </div>
    </button>
  )
}

function DocumentDetail() {
  const selectedDocument = useDocumentsStore(getSelectedDocument)

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

  const { title, description, code, type, category, owner, currentVersion, tags } =
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
          <p>{selectedDocument.status || '—'}</p>
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

export function DocumentsPanel({ endpoint }: { endpoint?: string }) {
  const { documents, isLoading, loadDocuments } = useDocumentsStore()

  useEffect(() => {
    loadDocuments(endpoint)
  }, [endpoint, loadDocuments])

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
            {isLoading && <span className="text-xs text-slate-500">Sincronizando...</span>}
          </div>
          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-1">
            {documents.map((document) => (
              <DocumentRow key={document.id} {...document} status={document.status} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <DocumentDetail />
        </div>
      </div>
    </section>
  )
}
