import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  createArtifactLink,
  deleteArtifactLink,
  fetchProcessDetail,
  fetchProcessLinks,
  fetchProcesses,
  type ArtifactLink,
  type ArtifactEntityType,
  type ProcessRecord,
  type TaskRecord,
  updateTaskStatus,
} from "../../services/processes";
import { fetchDocuments, type DocumentRecord } from "../../services/documents";
import { showAlert } from "../../scripts/alerts";

const ACCESS_TOKEN_KEY = "accessToken";

type ProcessesPageProps = {
  processesEndpoint: string;
  linksEndpoint: string;
  documentsEndpoint: string;
  tasksEndpoint: string;
};

type LinkFormState = {
  artifactType: ArtifactEntityType;
  artifactId: string;
};

const defaultLinkForm: LinkFormState = {
  artifactType: "document",
  artifactId: "",
};

const EMPTY_LINKS: ArtifactLink[] = [];

function redirectToLogin() {
  window.location.href = "/login";
}

function StatusBadge({ status }: { status: string | null | undefined }) {
  const base = "badge ";
  if (!status) return <span className={`${base}bg-slate-100 text-slate-700`}>Sin estado</span>;

  const normalized = status.toLowerCase();
  const variants: Record<string, string> = {
    pendiente: `${base}bg-amber-100 text-amber-700`,
    "en progreso": `${base}bg-blue-100 text-blue-700`,
    "en revisión": `${base}bg-indigo-100 text-indigo-700`,
    completada: `${base}bg-emerald-100 text-emerald-700`,
  };

  return <span className={variants[normalized] || `${base}bg-slate-100 text-slate-700`}>{status}</span>;
}

function TaskItem({
  task,
  onStatusChange,
}: {
  task: TaskRecord;
  onStatusChange: (taskId: string, status: string) => Promise<void>;
}) {
  const [status, setStatus] = useState(task.status || "pendiente");
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value;
    setStatus(newStatus);
    setIsSaving(true);
    try {
      await onStatusChange(task.id, newStatus);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">{task.title}</p>
          <p className="text-xs text-slate-500">{task.description || "Tarea sin descripción"}</p>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="grid sm:grid-cols-3 gap-3 text-sm text-slate-600">
        <div>
          <p className="text-xs uppercase text-slate-500">Frecuencia</p>
          <p>{task.frequency || "—"}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs uppercase text-slate-500">Roles responsables</p>
          <p>{task.responsible_roles?.join(", ") || "—"}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <label className="text-slate-600" htmlFor={`status-${task.id}`}>
          Estado
        </label>
        <select
          id={`status-${task.id}`}
          className="rounded-lg border border-slate-200 px-3 py-1 text-sm"
          value={status}
          onChange={handleChange}
          disabled={isSaving}
        >
          <option value="pendiente">Pendiente</option>
          <option value="en progreso">En progreso</option>
          <option value="en revisión">En revisión</option>
          <option value="completada">Completada</option>
        </select>
        {isSaving && <span className="text-xs text-slate-500">Guardando...</span>}
      </div>
    </div>
  );
}

function ArtifactLinkList({ links, onRemove }: { links: ArtifactLink[]; onRemove: (linkId: string) => Promise<void> }) {
  if (!links.length) {
    return <p className="text-sm text-slate-500">Sin vínculos registrados.</p>;
  }

  return (
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
          <div>
            <p className="font-medium text-ink">
              {link.to_name || link.to_id}
              <span className="text-xs text-slate-500 ml-2">({link.to_type})</span>
            </p>
            <p className="text-xs text-slate-500">{link.to_code || link.id}</p>
          </div>
          <button
            type="button"
            className="text-sm text-red-600 hover:text-red-700"
            onClick={() => onRemove(link.id)}
          >
            Quitar
          </button>
        </li>
      ))}
    </ul>
  );
}

function ArtifactModal({
  isOpen,
  onClose,
  onSave,
  formState,
  setFormState,
  documents,
  tasks,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  formState: LinkFormState;
  setFormState: React.Dispatch<React.SetStateAction<LinkFormState>>;
  documents: DocumentRecord[];
  tasks: TaskRecord[];
}) {
  const artifactOptions = useMemo(() => {
    const options: Array<{ label: string; id: string; type: ArtifactEntityType }> = [];
    documents.forEach((doc) => options.push({ label: `Documento · ${doc.title}`, id: doc.id, type: "document" }));
    tasks.forEach((task) => options.push({ label: `Tarea · ${task.title}`, id: task.id, type: "task" }));
    return options.filter((option) => option.type === formState.artifactType);
  }, [documents, tasks, formState.artifactType]);

  useEffect(() => {
    if (!artifactOptions.length) {
      setFormState((prev) => ({ ...prev, artifactId: "" }));
    } else if (!artifactOptions.find((option) => option.id === formState.artifactId)) {
      setFormState((prev) => ({ ...prev, artifactId: artifactOptions[0]?.id || "" }));
    }
  }, [artifactOptions, formState.artifactId, setFormState]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="badge bg-primary/10 text-primary">Vínculos cruzados</p>
            <h3 className="text-xl font-semibold text-ink">Conectar artefactos</h3>
            <p className="text-sm text-slate-600">Selecciona documentos o tareas para relacionarlos con el proceso.</p>
          </div>
          <button type="button" className="text-slate-500" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-600" htmlFor="artifact-type">
              Tipo de artefacto
            </label>
            <select
              id="artifact-type"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.artifactType}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, artifactType: event.target.value as ArtifactEntityType }))
              }
            >
              <option value="document">Documento</option>
              <option value="task">Tarea</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-600" htmlFor="artifact-id">
              Artefacto disponible
            </label>
            <select
              id="artifact-id"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.artifactId}
              onChange={(event) => setFormState((prev) => ({ ...prev, artifactId: event.target.value }))}
            >
              {!artifactOptions.length && <option value="">Sin opciones disponibles</option>}
              {artifactOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button type="button" className="button-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="button-primary"
            onClick={onSave}
            disabled={!formState.artifactId}
          >
            Guardar vínculo
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProcessesPage({
  processesEndpoint,
  linksEndpoint,
  documentsEndpoint,
  tasksEndpoint,
}: ProcessesPageProps) {
  const [processes, setProcesses] = useState<ProcessRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<ProcessRecord | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [links, setLinks] = useState<ArtifactLink[]>(EMPTY_LINKS);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [linkForm, setLinkForm] = useState<LinkFormState>(defaultLinkForm);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tasks = selectedProcess?.tasks || [];
  const linkedDocuments = selectedProcess?.documents || [];
  const totalTasks = processes.reduce((acc, process) => acc + (process.tasks?.length || 0), 0);
  const totalLinkedDocs = processes.reduce((acc, process) => acc + (process.documents?.length || 0), 0);

  const loadDocuments = useCallback(async () => {
    try {
      const { data } = await fetchDocuments(documentsEndpoint);
      setDocuments(data);
    } catch (error) {
      console.error(error);
    }
  }, [documentsEndpoint]);

  const loadProcesses = useCallback(async () => {
    if (!processesEndpoint) return;
    setIsLoadingList(true);
    try {
      const { data } = await fetchProcesses(processesEndpoint);
      setProcesses(data);
      if (data?.length) {
        setSelectedId(data[0].id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo obtener los procesos";
      await showAlert({ title: "Procesos no disponibles", text: message, icon: "error" });
      setProcesses([]);
      setSelectedProcess(null);
      setLinks(EMPTY_LINKS);
    } finally {
      setIsLoadingList(false);
    }
  }, [processesEndpoint]);

  const loadLinks = useCallback(
    async (processId: string) => {
      if (!linksEndpoint || !processId) return;
      try {
        const detailEndpoint = `${linksEndpoint}/${processId}/links`;
        const { data } = await fetchProcessLinks(detailEndpoint);
        setLinks(data);
      } catch (error) {
        console.error(error);
        setLinks(EMPTY_LINKS);
      }
    },
    [linksEndpoint],
  );

  const loadProcessDetail = useCallback(
    async (processId: string) => {
      if (!processId || !processesEndpoint) return;
      setIsLoadingDetail(true);
      try {
        const detailEndpoint = `${processesEndpoint}/${processId}`;
        const { data } = await fetchProcessDetail(detailEndpoint);
        setSelectedProcess(data);
        setLinks(data.artifactLinks || EMPTY_LINKS);
        await loadLinks(processId);
      } catch (error) {
        const message = error instanceof Error ? error.message : "No se pudo obtener el proceso";
        await showAlert({ title: "Error al cargar el proceso", text: message, icon: "error" });
        setSelectedProcess(null);
        setLinks(EMPTY_LINKS);
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [processesEndpoint, loadLinks],
  );

  useEffect(() => {
    if (!selectedId) return;
    loadProcessDetail(selectedId);
  }, [selectedId, loadProcessDetail]);

  useEffect(() => {
    const checkSession = async () => {
      const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) {
        await showAlert({
          title: "Sesión requerida",
          text: "Inicia sesión en /login para consultar procesos y tareas.",
          icon: "warning",
        });
        redirectToLogin();
        return;
      }

      await Promise.all([loadProcesses(), loadDocuments()]);
    };

    checkSession();
  }, [loadProcesses, loadDocuments]);

  const handleTaskStatusChange = async (taskId: string, status: string) => {
    try {
      const endpoint = `${tasksEndpoint}/${taskId}`;
      const { data } = await updateTaskStatus(endpoint, status);
      setSelectedProcess((prev) => {
        if (!prev?.tasks) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map((task) => (task.id === taskId ? { ...task, status: data.status } : task)),
        };
      });
      await showAlert({ title: "Tarea actualizada", text: "Estado guardado correctamente.", icon: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar la tarea";
      await showAlert({ title: "Error", text: message, icon: "error" });
    }
  };

  const handleRemoveLink = async (linkId: string) => {
    if (!selectedProcess) return;
    try {
      const endpoint = `${linksEndpoint}/${selectedProcess.id}/links/${linkId}`;
      const { data } = await deleteArtifactLink(endpoint);
      setLinks(data);
      await showAlert({ title: "Vínculo eliminado", text: "El vínculo se eliminó correctamente.", icon: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar el vínculo";
      await showAlert({ title: "Error", text: message, icon: "error" });
    }
  };

  const handleSaveLink = async () => {
    if (!selectedProcess || !linkForm.artifactId) return;
    try {
      const endpoint = `${linksEndpoint}/${selectedProcess.id}/links`;
      const { data } = await createArtifactLink(endpoint, {
        from_id: selectedProcess.id,
        from_type: "process",
        to_id: linkForm.artifactId,
        to_type: linkForm.artifactType,
      });
      setLinks(data);
      setIsModalOpen(false);
      setLinkForm(defaultLinkForm);
      await showAlert({ title: "Vínculo creado", text: "Relacionaste un artefacto con el proceso.", icon: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo crear el vínculo";
      await showAlert({ title: "Error", text: message, icon: "error" });
    }
  };

  const documentBadges = linkedDocuments.length ? (
    <div className="flex flex-wrap gap-2">
      {linkedDocuments.map((doc) => (
        <span key={doc.id} className="badge bg-slate-100 text-slate-700">
          {doc.title}
        </span>
      ))}
    </div>
  ) : (
    <p className="text-sm text-slate-500">Sin documentos vinculados</p>
  );

  return (
    <section className="space-y-6 relative">
      <ArtifactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLink}
        formState={linkForm}
        setFormState={setLinkForm}
        documents={documents}
        tasks={tasks}
      />

      <div className="card-surface relative overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-indigo-700 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-white/10 blur-3xl" aria-hidden="true"></div>
        <div className="absolute right-6 top-6 h-20 w-20 rounded-full border border-white/30 bg-white/5" aria-hidden="true"></div>
        <div className="relative flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <p className="text-[11px] tracking-[0.35em] uppercase text-white/70">Fase 1.4 · Procesos y tareas</p>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">Procesos operativos y vínculos cruzados</h1>
              <p className="text-white/80 text-sm md:text-base">
                Consulta el catálogo de procesos, edita tareas en línea y conecta documentos o diagramas mediante artifact_links.
              </p>
            </div>
            <div className="text-right space-y-2">
              <p className="text-xs uppercase text-white/70">Contexto</p>
              <p className="text-2xl font-semibold flex items-center gap-2 justify-end">
                {processes.length} procesos
                <span className="badge bg-white/20 text-white border border-white/30">{totalTasks} tareas</span>
              </p>
              <p className="text-white/70 text-xs max-w-xs">Documentos vinculados: {totalLinkedDocs}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 shadow-sm">
              <p className="text-xs uppercase text-white/70">Matriz de vínculos</p>
              <p className="text-2xl font-semibold flex items-center gap-2">
                {links.length}
                <span className="badge bg-emerald-500/20 text-emerald-50 border border-emerald-100/30">activos</span>
              </p>
              <p className="text-white/70 text-xs">process ↔ task ↔ document</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 shadow-sm">
              <p className="text-xs uppercase text-white/70">Tareas</p>
              <p className="text-2xl font-semibold">{tasks.length}</p>
              <p className="text-white/70 text-xs">del proceso seleccionado</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 shadow-sm">
              <p className="text-xs uppercase text-white/70">Documentos</p>
              <p className="text-2xl font-semibold">{linkedDocuments.length}</p>
              <p className="text-white/70 text-xs">vinculados al detalle</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="card-surface border border-slate-200 shadow-lg overflow-hidden">
          <div className="flex items-center justify-between gap-3 bg-slate-50 px-5 py-4 border-b border-slate-200">
            <div>
              <p className="text-xs uppercase text-slate-500">Listado (GET /processes)</p>
              <h2 className="text-lg font-semibold text-ink">Procesos disponibles</h2>
            </div>
            <span className="badge bg-slate-100 text-slate-700">{processes.length} proc</span>
          </div>
          <div className="space-y-2 max-h-[540px] overflow-y-auto p-1">
            {isLoadingList && <p className="text-sm text-slate-500 px-3 py-2">Cargando procesos...</p>}
            {!isLoadingList && !processes.length && (
              <p className="text-sm text-slate-500 px-3 py-2">Sin procesos disponibles.</p>
            )}
            {!isLoadingList &&
              processes.map((process) => (
                <button
                  key={process.id}
                  type="button"
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    process.id === selectedId
                      ? "border-primary/60 bg-primary/5"
                      : "border-slate-200 hover:border-primary/60 hover:bg-primary/5"
                  }`}
                  onClick={() => setSelectedId(process.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-ink">{process.name}</p>
                      <p className="text-xs text-slate-500">{process.code}</p>
                    </div>
                    <span className="badge bg-slate-100 text-slate-700">{process.maturity || "Sin madurez"}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{process.description || "Proceso sin descripción"}</p>
                </button>
              ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card-surface border border-slate-200 shadow-lg">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs uppercase text-slate-500">Detalle (GET /processes/:id)</p>
                <p className="font-semibold text-ink">{selectedProcess?.name || "Sin proceso cargado"}</p>
              </div>
              <StatusBadge status={selectedProcess?.maturity || "Pendiente"} />
            </div>
            <div className="p-5 space-y-3">
              {isLoadingDetail && <p className="text-sm text-slate-600">Cargando detalle del proceso...</p>}
              {!isLoadingDetail && (
                <>
                  <p className="text-sm text-slate-600">{selectedProcess?.description || "Selecciona un proceso para ver detalle."}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <div>
                      <p className="text-xs uppercase text-slate-500">Código</p>
                      <p>{selectedProcess?.code || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-slate-500">Responsable</p>
                      <p>{selectedProcess?.owner || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-slate-500">Entradas</p>
                      <p>{selectedProcess?.inputs?.join(", ") || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-slate-500">Salidas</p>
                      <p>{selectedProcess?.outputs?.join(", ") || "—"}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p className="text-xs uppercase text-slate-500">Documentos vinculados</p>
                    {documentBadges}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="card-surface border border-slate-200 shadow-lg">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs uppercase text-slate-500">Tareas del proceso</p>
                <h3 className="text-lg font-semibold text-ink">Subvista editable</h3>
              </div>
              <span className="badge bg-slate-100 text-slate-700">{tasks.length} tareas</span>
            </div>
            <div className="p-5 space-y-3">
              {isLoadingDetail && <p className="text-sm text-slate-500">Cargando tareas...</p>}
              {!isLoadingDetail && !tasks.length && <p className="text-sm text-slate-500">Sin tareas asociadas.</p>}
              {!isLoadingDetail &&
                tasks.map((task) => <TaskItem key={task.id} task={task} onStatusChange={handleTaskStatusChange} />)}
            </div>
          </div>

          <div className="card-surface border border-slate-200 shadow-lg">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs uppercase text-slate-500">Matriz de vínculos</p>
                <h3 className="text-lg font-semibold text-ink">artifact_links</h3>
              </div>
              <button className="button-secondary" type="button" onClick={() => setIsModalOpen(true)}>
                Gestionar vínculos
              </button>
            </div>
            <div className="p-5">
              <ArtifactLinkList links={links} onRemove={handleRemoveLink} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
