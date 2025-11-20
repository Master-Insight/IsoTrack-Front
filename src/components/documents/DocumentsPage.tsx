import React, { useCallback, useEffect, useState } from "react";
import {
  fetchDocumentDetail,
  fetchDocuments,
  type DocumentRecord,
} from "../../services/documents";
import { showAlert } from "../../scripts/alerts";

const ACCESS_TOKEN_KEY = "accessToken";
const PROFILE_STORAGE_KEY = "profile";

type DocumentsPageProps = {
  documentsEndpoint: string;
};

type CachedProfile = {
  full_name?: string;
};

const redirectToLogin = () => {
  window.location.href = "/login";
};

const hydrateProfile = (): CachedProfile | null => {
  const cachedProfile = sessionStorage.getItem(PROFILE_STORAGE_KEY);
  if (!cachedProfile) return null;
  try {
    return JSON.parse(cachedProfile) as CachedProfile;
  } catch (error) {
    console.error("No se pudo parsear el perfil en caché", error);
    return null;
  }
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

export default function DocumentsPage({ documentsEndpoint }: DocumentsPageProps) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentRecord | null>(null);
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
        const message = error instanceof Error ? error.message : "No se pudo obtener el documento";
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
      const message = error instanceof Error ? error.message : "No se pudo obtener los documentos";
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

      const profile = hydrateProfile();
      if (profile?.full_name) {
        await showAlert({
          title: "Bienvenido nuevamente",
          text: `${profile.full_name}, cargaremos tus documentos disponibles.`,
          icon: "success",
        });
      }

      await loadDocuments();
    };

    checkSession();
  }, [loadDocuments]);

  const currentStatusClass = selectedDocument?.active
    ? "badge bg-emerald-100 text-emerald-700"
    : "badge bg-slate-200 text-slate-700";

  const selectedVersion = selectedDocument?.currentVersion;
  const externalUrl = selectedVersion?.external_url || selectedVersion?.file_url;

  return (
    <section className="card-surface p-8 space-y-6 relative overflow-hidden">
      <header className="space-y-3">
        <p className="badge bg-primary/10 text-primary">Zona protegida</p>
        <h1 className="text-3xl font-bold text-ink">Repositorio documental</h1>
        <p className="text-slate-600">
          Esta vista requiere que hayas iniciado sesión en <span className="font-semibold">/login</span>. Si la sesión
          existe, listaremos los documentos y abriremos el primero automáticamente.
        </p>
        <div className="flex gap-3 flex-wrap">
          <a className="button-secondary" href="/">
            Volver al panel principal
          </a>
          <a className="button-primary" href="/login">
            Ir al login
          </a>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Listado (GET /documents)</p>
              <h2 className="text-xl font-semibold text-ink">Documentos disponibles</h2>
            </div>
            <span className="badge bg-slate-100 text-slate-700">{documents.length} docs</span>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-white">
            {isLoadingList && (
              <p className="text-sm text-slate-500 px-3 py-2">Cargando documentos...</p>
            )}
            {!isLoadingList && !documents.length && (
              <p className="text-sm text-slate-500 px-3 py-2">Sin documentos disponibles.</p>
            )}
            {!isLoadingList &&
              documents.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  className={`w-full text-left px-3 py-3 rounded-lg border transition-colors ${
                    doc.id === selectedId
                      ? "border-primary/60 bg-primary/5"
                      : "border-slate-200 hover:border-primary/60 hover:bg-primary/5"
                  }`}
                  onClick={() => setSelectedId(doc.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-ink">{doc.title}</p>
                      <p className="text-xs text-slate-500">{doc.code}</p>
                    </div>
                    <span className="badge bg-slate-100 text-slate-700">
                      {doc.currentVersion?.version || "Sin versión"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {doc.description || "Documento sin descripción"}
                  </p>
                </button>
              ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Detalle (GET /documents/:id)</p>
              <p className="font-semibold text-ink">{selectedDocument?.title || "Sin documento cargado"}</p>
            </div>
            <span className={currentStatusClass}>{selectedDocument ? (selectedDocument.active ? "Activo" : "Inactivo") : "—"}</span>
          </div>
          <div className="card-surface border border-slate-200 space-y-2">
            {isLoadingDetail && (
              <p className="text-sm text-slate-600">Cargando detalle del documento...</p>
            )}
            {!isLoadingDetail && (
              <>
                <p className="text-sm text-slate-600">
                  {selectedDocument?.description || "Esperando sesión para cargar el documento."}
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                  <div>
                    <p className="text-xs uppercase text-slate-500">Código</p>
                    <p>{selectedDocument?.code || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-500">Tipo</p>
                    <p>{selectedDocument?.type || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-500">Categoría</p>
                    <p>{selectedDocument?.category || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-500">Propietario</p>
                    <p>{selectedDocument?.owner || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-500">Versión</p>
                    <p>{selectedVersion?.version || "Sin versión"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-500">Estado versión</p>
                    <p>{selectedVersion?.status || "—"}</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-slate-600">
                  <p className="text-xs uppercase text-slate-500">Etiquetas</p>
                  <DocumentTags tags={selectedDocument?.tags || []} />
                </div>
                <a
                  className={`button-secondary inline-flex justify-center items-center gap-2 w-full ${
                    externalUrl ? "" : "opacity-60 pointer-events-none"
                  }`}
                  href={externalUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir recurso externo
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
