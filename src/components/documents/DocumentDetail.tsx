import { useEffect, useMemo, useState } from 'react';
import { getDocumentById } from '../../lib/mock-documents';
import type { DocumentRecord } from '../../types/documents';
import { Button } from '../ui/Button';

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
  }).format(new Date(value));

interface DocumentDetailProps {
  documentId: string;
}

const DocumentPreviewFallback = ({
  message,
  previewUrl,
}: {
  message: string;
  previewUrl: string;
}) => (
  <div className="flex h-[480px] w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-6 text-center shadow-sm">
    <img
      src="/document-preview-fallback.svg"
      alt="Vista previa no disponible"
      className="h-32 w-32"
    />
    <p className="text-sm text-slate-600">{message}</p>
    <Button asChild variant="secondary">
      <a href={previewUrl} target="_blank" rel="noopener noreferrer">
        Abrir documento en una nueva pestaña
      </a>
    </Button>
  </div>
);

const DocumentPreview = ({ document }: { document: DocumentRecord }) => {
  const currentVersion = document.currentVersion;
  const previewUrl =
    currentVersion?.external_url ?? currentVersion?.file_url ?? null;
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [previewUrl]);

  if (!currentVersion) {
    return (
      <div className="flex h-[240px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
        Aún no hay una versión publicada para previsualizar.
      </div>
    );
  }

  if (!previewUrl) {
    return (
      <div className="flex h-[240px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
        La versión actual no tiene un archivo asociado.
      </div>
    );
  }

  const isVideo =
    currentVersion.format === 'video' ||
    /youtube\.com|youtu\.be/.test(previewUrl);

  const isExternalUrl = useMemo(() => {
    if (!previewUrl) return false;

    try {
      const base =
        typeof window !== 'undefined'
          ? window.location.origin
          : 'http://localhost';
      const url = new URL(previewUrl, base);
      return typeof window !== 'undefined'
        ? url.origin !== window.location.origin
        : false;
    } catch (error) {
      console.warn('No se pudo analizar la URL de vista previa.', error);
      return false;
    }
  }, [previewUrl]);

  if (hasError && previewUrl) {
    return (
      <DocumentPreviewFallback
        previewUrl={previewUrl}
        message="No pudimos mostrar la vista previa del documento. Puedes abrir el archivo en una nueva pestaña."
      />
    );
  }

  if (!isVideo && isExternalUrl && previewUrl) {
    return (
      <DocumentPreviewFallback
        previewUrl={previewUrl}
        message="El origen del documento no permite mostrar la vista previa embebida por políticas de seguridad. Ábrelo en una nueva pestaña para revisarlo."
      />
    );
  }

  if (isVideo) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg border border-slate-200 shadow-sm">
        <iframe
          src={previewUrl}
          title={document.title}
          className="h-full w-full"
          onError={() => setHasError(true)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="h-[480px] w-full overflow-hidden rounded-lg border border-slate-200 shadow-sm">
      <iframe
        src={previewUrl}
        title={document.title}
        className="h-full w-full"
        onError={() => setHasError(true)}
      />
    </div>
  );
};

const DocumentDetail = ({ documentId }: DocumentDetailProps) => {
  const document = useMemo(() => getDocumentById(documentId), [documentId]);
  const initialAcknowledgement = useMemo(() => {
    if (!document)
      return { acknowledged: false, timestamp: null as string | null };

    const latestOwnRead = document.reads
      .filter((read) => read.user === 'Ana Gómez')
      .sort(
        (a, b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime(),
      )[0];

    return {
      acknowledged: Boolean(latestOwnRead),
      timestamp: latestOwnRead?.readAt ?? null,
    };
  }, [document]);

  const [acknowledgedAt, setAcknowledgedAt] = useState<string | null>(
    initialAcknowledgement.timestamp,
  );
  const [readHistory, setReadHistory] = useState<DocumentRecord['reads']>(
    document?.reads ?? [],
  );
  const [isAcknowledged, setIsAcknowledged] = useState(
    initialAcknowledgement.acknowledged,
  );

  if (!document) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          Documento no encontrado
        </h1>
        <p className="text-sm text-slate-600">
          No encontramos un documento con el identificador solicitado. Vuelve al
          listado para seleccionar otro registro.
        </p>
        <a href="/documents" className="text-brand-600 hover:underline">
          ← Volver a Documentos
        </a>
      </div>
    );
  }

  const handleAcknowledge = () => {
    const now = new Date().toISOString();
    setIsAcknowledged(true);
    setAcknowledgedAt(now);
    setReadHistory((prev) => [
      ...prev,
      {
        id: `local-read-${Date.now()}`,
        document_id: document.id,
        user_id: 'local-user',
        user: 'Ana Gómez',
        position: 'Responsable Calidad',
        readAt: now,
        dueDate: null,
      },
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{document.code}</p>
          <h1 className="text-3xl font-semibold text-slate-900">
            {document.title}
          </h1>
          <p className="text-sm text-slate-600">
            Categoría: {document.category}
          </p>
        </div>
        <a href="/documents" className="text-sm text-brand-600 hover:underline">
          ← Volver al listado
        </a>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <DocumentPreview document={document} />
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Descripción y alcance
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {document.description}
            </p>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Responsable
                </dt>
                <dd className="text-sm font-medium text-slate-700">
                  {document.owner}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Última actualización
                </dt>
                <dd className="text-sm font-medium text-slate-700">
                  {formatDateTime(document.updatedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Estado
                </dt>
                <dd className="text-sm font-medium capitalize text-slate-700">
                  {document.status
                    ? document.status.replace(/_/g, ' ')
                    : 'Sin estado'}
                </dd>
              </div>
              {document.nextReviewAt && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">
                    Próxima revisión
                  </dt>
                  <dd className="text-sm font-medium text-slate-700">
                    {formatDate(document.nextReviewAt)}
                  </dd>
                </div>
              )}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {document.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Acciones del documento
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Revisa el contenido y deja constancia de lectura para cumplir con
              los requisitos de la norma ISO.
            </p>
            <Button
              className="mt-4 w-full"
              onClick={handleAcknowledge}
              disabled={isAcknowledged}
            >
              {isAcknowledged ? 'Lectura registrada' : 'Marcar como leído'}
            </Button>
            {acknowledgedAt && (
              <p className="mt-2 text-xs text-slate-500">
                Última confirmación registrada el{' '}
                {formatDateTime(acknowledgedAt)}. Esta marca se sincronizará con
                el backend.
              </p>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Historial de versiones
            </h2>
            <ul className="mt-3 space-y-3">
              {document.versions
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime(),
                )
                .map((version) => {
                  const downloadUrl = version.file_url ?? version.external_url;
                  return (
                    <li
                      key={version.id}
                      className="rounded-md border border-slate-200 p-3"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-700">
                          Versión {version.version}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDateTime(version.created_at)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Aprobado por {version.approved_by_name}
                      </p>
                      {version.notes && (
                        <p className="mt-1 text-xs text-slate-500">
                          {version.notes}
                        </p>
                      )}
                      {downloadUrl ? (
                        <a
                          href={downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block text-xs font-medium text-brand-600 hover:underline"
                        >
                          Abrir versión
                        </a>
                      ) : (
                        <span className="mt-2 inline-block text-xs text-slate-400">
                          Sin archivo disponible
                        </span>
                      )}
                    </li>
                  );
                })}
            </ul>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Lecturas registradas
            </h2>
            <ul className="mt-3 space-y-3">
              {readHistory.length === 0 && (
                <li className="text-sm text-slate-600">
                  Aún no hay lecturas registradas.
                </li>
              )}
              {readHistory.map((read) => (
                <li
                  key={read.id}
                  className="rounded-md border border-slate-200 p-3 text-sm text-slate-700"
                >
                  <p className="font-medium">{read.user}</p>
                  <p className="text-xs text-slate-500">
                    {read.position ?? 'Sin rol definido'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDateTime(read.readAt)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </section>
    </div>
  );
};

export default DocumentDetail;
