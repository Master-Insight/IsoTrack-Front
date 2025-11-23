import React, { useCallback, useEffect, useState } from "react";
import {
  fetchDocumentDetail,
  fetchDocuments,
  type DocumentRecord,
} from "../../services/documents";
import { showAlert } from "../../scripts/alerts";

const ACCESS_TOKEN_KEY = "accessToken";

type DocumentsPageProps = {
  documentsEndpoint: string;
};

const redirectToLogin = () => {
  window.location.href = "/login";
};

const DocumentTags = ({ tags }: { tags: string[] }) => {
  if (!tags?.length) {
    return <span className="text-xs text-slate-500">Sin etiquetas</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span key={tag} className="badge bg-slate-100 text-slate-700">
          {tag}
        </span>
      ))}
    </div>
  );
};

export default function DocumentsPage({
  documentsEndpoint,
}: DocumentsPageProps) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentRecord | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const loadDocumentDetail = useCallback(
    async (documentId: string) => {
      if (!documentId || !documentsEndpoint) return;
      setIsLoadingDetail(true);
      try {
        const detailEndpoint = `${documentsEndpoint}/${documentId}`;
        const { data } = await fetchDocumentDetail(detailEndpoint);
        setSelectedDocument(data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo obtener el documento";
        await showAlert({
          title: "Error al cargar el documento",
          text: message,
          icon: "error",
        });
        setSelectedDocument(null);
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [documentsEndpoint],
  );

  const loadDocuments = useCallback(async () => {
    if (!documentsEndpoint) return;
    setIsLoadingList(true);
    try {
      const { data } = await fetchDocuments(documentsEndpoint);
      setDocuments(data);
      if (data?.length) {
        setSelectedId(data[0].id);
      } else {
        setSelectedDocument(null);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo obtener los documentos";
      await showAlert({
        title: "Listado no disponible",
        text: message,
        icon: "error",
      });
      setSelectedDocument(null);
    } finally {
      setIsLoadingList(false);
    }
  }, [documentsEndpoint]);

  useEffect(() => {
    if (!selectedId) return;
    loadDocumentDetail(selectedId);
  }, [loadDocumentDetail, selectedId]);

  useEffect(() => {
    const checkSession = async () => {
      const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) {
        await showAlert({
          title: "Sesión requerida",
          text: "Te redirigimos a /login para que ingreses antes de consultar documentos.",
          icon: "warning",
        });
        redirectToLogin();
        return;
      }

      await loadDocuments();
    };

    checkSession();
  }, [loadDocuments]);

  const currentStatusClass = selectedDocument?.active
    ? "badge bg-emerald-100 text-emerald-700"
    : "badge bg-slate-200 text-slate-700";

  const selectedVersion = selectedDocument?.currentVersion;
  const externalUrl =
    selectedVersion?.external_url || selectedVersion?.file_url;
  const totalActive = documents.filter((doc) => doc.active).length;
  const totalLinked = documents.filter(
    (doc) => doc.currentVersion?.external_url || doc.currentVersion?.file_url,
  ).length;

  return (
    <section className="space-y-6">
      <div className="card-surface relative overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-indigo-700 p-6 md:p-8 text-white">
        <div
          className="absolute inset-0 bg-white/10 blur-3xl"
          aria-hidden="true"></div>
        <div
          className="absolute right-6 top-6 h-20 w-20 rounded-full border border-white/30 bg-white/5"
          aria-hidden="true"></div>
        <div className="relative flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <p className="text-[11px] tracking-[0.35em] uppercase text-white/70">
                Gestor documental ISO 9001
              </p>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                Repositorio de calidad certificada
              </h1>
              <p className="text-white/80 text-sm md:text-base">
                Controla versiones, propietarios y enlaces oficiales de tus
                procedimientos. Mantén trazabilidad completa y acceso inmediato
                para las auditorías de calidad.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 shadow-sm">
              <p className="text-xs uppercase text-white/70">
                Documentos activos
              </p>
              <p className="text-2xl font-semibold">{totalActive}</p>
              <p className="text-white/70 text-xs">
                de {documents.length || 0} controlados
              </p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 shadow-sm">
              <p className="text-xs uppercase text-white/70">
                Recursos con enlace
              </p>
              <p className="text-2xl font-semibold">{totalLinked}</p>
              <p className="text-white/70 text-xs">
                URL o archivos adjuntos disponibles
              </p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 shadow-sm">
              <p className="text-xs uppercase text-white/70">Estado</p>
              <p className="text-2xl font-semibold flex items-center gap-2">
                ISO 9001
                <span className="badge bg-emerald-500/20 text-emerald-50 border border-emerald-100/30">
                  Auditable
                </span>
              </p>
              <p className="text-white/70 text-xs">
                Información lista para revisión
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="card-surface border border-slate-200 shadow-lg overflow-hidden">
          <div className="flex items-center justify-between gap-3 bg-slate-50 px-5 py-4 border-b border-slate-200">
            <div>
              <p className="text-xs uppercase text-slate-500">Catálogo ISO</p>
              <h2 className="text-lg font-semibold text-ink">
                Documentos controlados
              </h2>
            </div>
            <span className="badge bg-primary/10 text-primary">
              {documents.length} en lista
            </span>
          </div>
          <div className="p-4 space-y-3 max-h-[480px] overflow-y-auto">
            {isLoadingList && (
              <p className="text-sm text-slate-500">
                Sincronizando documentos...
              </p>
            )}
            {!isLoadingList && !documents.length && (
              <p className="text-sm text-slate-500">
                No hay documentos cargados para esta unidad de calidad.
              </p>
            )}
            {!isLoadingList &&
              documents.map((doc) => {
                const isSelected = doc.id === selectedId;
                const versionLabel =
                  doc.currentVersion?.version || "Sin versión";
                return (
                  <button
                    key={doc.id}
                    type="button"
                    className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-slate-200 hover:border-primary/50 hover:bg-primary/5"
                    }`}
                    onClick={() => setSelectedId(doc.id)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-semibold text-ink">{doc.title}</p>
                        <p className="text-xs text-slate-500">
                          Código {doc.code}
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {doc.description || "Documento sin descripción"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 min-w-[110px]">
                        <span className="badge bg-slate-100 text-slate-700">
                          {versionLabel}
                        </span>
                        <span
                          className={`badge ${
                            doc.active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}>
                          {doc.active ? "Activo" : "Revisión"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="card-surface border border-slate-200 shadow-lg p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase text-slate-500">
                  Detalle (GET /documents/:id)
                </p>
                <p className="font-semibold text-lg text-ink">
                  {selectedDocument?.title || "Sin documento cargado"}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {selectedDocument?.description ||
                    "Inicia sesión para cargar el documento seleccionado."}
                </p>
              </div>
              <span className={currentStatusClass}>
                {selectedDocument
                  ? selectedDocument.active
                    ? "Activo"
                    : "Inactivo"
                  : "—"}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm text-slate-700">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] uppercase text-slate-500">Código</p>
                <p className="font-semibold text-ink">
                  {selectedDocument?.code || "—"}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] uppercase text-slate-500">Tipo</p>
                <p className="font-semibold text-ink">
                  {selectedDocument?.type || "—"}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] uppercase text-slate-500">
                  Categoría
                </p>
                <p className="font-semibold text-ink">
                  {selectedDocument?.category || "—"}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] uppercase text-slate-500">
                  Propietario
                </p>
                <p className="font-semibold text-ink">
                  {selectedDocument?.owner || "—"}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] uppercase text-slate-500">Versión</p>
                <p className="font-semibold text-ink">
                  {selectedVersion?.version || "Sin versión"}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] uppercase text-slate-500">
                  Estado versión
                </p>
                <p className="font-semibold text-ink">
                  {selectedVersion?.status || "—"}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p className="text-xs uppercase text-slate-500">Etiquetas</p>
              <DocumentTags tags={selectedDocument?.tags || []} />
            </div>

            <a
              className={`button-secondary mt-4 inline-flex justify-center items-center gap-2 w-full ${
                externalUrl ? "" : "opacity-60 pointer-events-none"
              }`}
              href={externalUrl || "#"}
              target="_blank"
              rel="noreferrer">
              Abrir recurso externo
            </a>

            {isLoadingDetail && (
              <p className="text-sm text-slate-600 mt-3">
                Cargando detalle del documento...
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
