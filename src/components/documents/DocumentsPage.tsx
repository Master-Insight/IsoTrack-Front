import { useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { mockDocuments } from '../../lib/mock-documents';
import type { DocumentRecord, DocumentStatus, DocumentVersion } from '../../types/documents';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

type FormStatusValue = Exclude<DocumentStatus, null> | 'sin_estado';
type FormFormatValue = 'pdf' | 'video' | 'docx' | 'xlsx';

const statusLabels: Record<FormStatusValue, string> = {
  publicado: 'Publicado',
  vigente: 'Vigente',
  en_revision: 'En revisión',
  borrador: 'Borrador',
  sin_estado: 'Sin estado',
};

const statusBadgeStyles: Record<FormStatusValue, string> = {
  publicado: 'bg-sky-100 text-sky-700 border border-sky-200',
  vigente: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  en_revision: 'bg-amber-100 text-amber-700 border border-amber-200',
  borrador: 'bg-slate-100 text-slate-600 border border-slate-200',
  sin_estado: 'bg-slate-100 text-slate-500 border border-slate-200',
};

const resolveStatusLabel = (status: DocumentStatus) =>
  status ? statusLabels[status as FormStatusValue] ?? status : statusLabels.sin_estado;

const resolveStatusStyle = (status: DocumentStatus) =>
  status ? statusBadgeStyles[status as FormStatusValue] ?? statusBadgeStyles.sin_estado : statusBadgeStyles.sin_estado;

const getFilterStatusLabel = (value: FormStatusValue | 'todos') => {
  if (value === 'todos') return 'Todos los estados';
  if (value === 'sin_estado') return statusLabels.sin_estado;
  return statusLabels[value] ?? value;
};

interface FormState {
  title: string;
  code: string;
  type: string;
  category: string;
  owner: string;
  status: FormStatusValue;
  tags: string;
  format: FormFormatValue;
  link: string;
  description: string;
}

const defaultFormState: FormState = {
  title: '',
  code: '',
  type: 'POE',
  category: '',
  owner: '',
  status: 'borrador',
  tags: '',
  format: 'pdf',
  link: '',
  description: '',
};

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<DocumentRecord[]>(mockDocuments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FormStatusValue | 'todos'>(
    'todos',
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('todas');
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState<FormState>(defaultFormState);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    documents.forEach((document) => {
      uniqueCategories.add(document.category);
    });
    return ['todas', ...Array.from(uniqueCategories).sort()];
  }, [documents]);
  const statuses = useMemo(() => {
    const uniqueStatuses = new Set<FormStatusValue>();
    documents.forEach((document) => {
      if (document.status === null) {
        uniqueStatuses.add('sin_estado');
      } else {
        uniqueStatuses.add(document.status as FormStatusValue);
      }
    });
    return ['todos', ...Array.from(uniqueStatuses)] as Array<'todos' | FormStatusValue>;
  }, [documents]);
  const formStatusOptions = useMemo(
    () => Object.keys(statusLabels) as FormStatusValue[],
    [],
  );

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const matchesSearch = [
        document.title,
        document.code,
        document.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'sin_estado'
          ? document.status === null
          : document.status === statusFilter);
      const matchesCategory =
        categoryFilter === 'todas' || document.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [documents, search, statusFilter, categoryFilter]);

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFormState((prev) => ({
      ...prev,
      status: event.target.value as FormStatusValue,
    }));
  };

  const handleFormatChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFormState((prev) => ({
      ...prev,
      format: event.target.value as FormFormatValue,
    }));
  };

  const resetForm = () => {
    setFormState(defaultFormState);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !formState.title ||
      !formState.code ||
      !formState.category ||
      !formState.link
    ) {
      setFeedbackMessage({
        type: 'error',
        text: 'Completa los campos obligatorios antes de guardar.',
      });
      return;
    }

    const now = new Date().toISOString();
    const documentId = `local-doc-${Date.now()}`;
    const versionId = `local-version-${Date.now()}`;
    const tags = formState.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    const ownerName = formState.owner || 'Sin asignar';
    const statusValue: DocumentStatus =
      formState.status === 'sin_estado' ? null : formState.status;

    const newVersion: DocumentVersion = {
      id: versionId,
      document_id: documentId,
      version: '1.0',
      status: formState.status === 'sin_estado' ? 'borrador' : formState.status,
      file_url: null,
      external_url: formState.link,
      notes: 'Documento cargado desde el formulario rápido.',
      approved_by: 'local-user',
      approved_by_name: ownerName,
      approved_at: now,
      format: formState.format,
      created_at: now,
    };

    const newDocument: DocumentRecord = {
      title: formState.title,
      code: formState.code,
      type: formState.type || 'POE',
      process_id: null,
      owner_id: 'local-owner',
      owner: ownerName,
      description: formState.description || 'Documento en preparación.',
      active: true,
      category: formState.category,
      tags,
      id: documentId,
      company_id: 'local-company',
      createdAt: now,
      updatedAt: now,
      status: statusValue,
      currentVersion: newVersion,
      versions: [newVersion],
      reads: [],
      nextReviewAt: null,
    };

    setDocuments((prev) => [newDocument, ...prev]);
    setShowForm(false);
    resetForm();
    setFeedbackMessage({
      type: 'success',
      text: 'Documento guardado en borrador. Cuando conectemos el backend se sincronizará automáticamente.',
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Documentos
            </h1>
            <p className="text-sm text-slate-600">
              Gestiona manuales, procedimientos y registros críticos para tus
              normas ISO. Usa los filtros para localizar documentos vigentes o
              en revisión.
            </p>
          </div>
          <Button onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? 'Cerrar formulario' : 'Nuevo documento'}
          </Button>
        </div>
        <div className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="search">Búsqueda rápida</Label>
            <Input
              id="search"
              name="search"
              type="search"
              placeholder="Buscar por título, código o etiqueta"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="status">Estado</Label>
            <select
              id="status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as FormStatusValue | 'todos')
              }
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {getFilterStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="category">Categoría</Label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'todas' ? 'Todas las categorías' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {feedbackMessage && (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            feedbackMessage.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {feedbackMessage.text}
        </div>
      )}

      {showForm && (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Registrar nuevo documento
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Completa los datos esenciales del documento. Esta información
            servirá como base para la versión inicial cuando el backend esté
            integrado.
          </p>
          <form
            className="mt-4 grid gap-4 sm:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <div className="sm:col-span-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                name="title"
                value={formState.title}
                onChange={handleInputChange}
                placeholder="Ej. Procedimiento de Control de Documentos"
                required
              />
            </div>
            <div>
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                name="code"
                value={formState.code}
                onChange={handleInputChange}
                placeholder="PR-ISO-001"
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Tipo *</Label>
              <Input
                id="type"
                name="type"
                value={formState.type}
                onChange={handleInputChange}
                placeholder="Ej. POE, Manual, Instructivo"
                required
              />
            </div>
            <div>
              <Label htmlFor="categoryInput">Categoría *</Label>
              <Input
                id="categoryInput"
                name="category"
                value={formState.category}
                onChange={handleInputChange}
                placeholder="Ej. Gestión de Calidad"
                required
              />
            </div>
            <div>
              <Label htmlFor="owner">Responsable</Label>
              <Input
                id="owner"
                name="owner"
                value={formState.owner}
                onChange={handleInputChange}
                placeholder="Nombre del propietario del documento"
              />
            </div>
            <div>
              <Label htmlFor="statusSelect">Estado</Label>
              <select
                id="statusSelect"
                value={formState.status}
                onChange={handleStatusChange}
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              >
                {formStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="format">Formato</Label>
              <select
                id="format"
                value={formState.format}
                onChange={handleFormatChange}
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              >
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
                <option value="docx">Word (DOCX)</option>
                <option value="xlsx">Excel (XLSX)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="link">URL del archivo *</Label>
              <Input
                id="link"
                name="link"
                type="url"
                value={formState.link}
                onChange={handleInputChange}
                placeholder="https://..."
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="tags">Etiquetas</Label>
              <Input
                id="tags"
                name="tags"
                value={formState.tags}
                onChange={handleInputChange}
                placeholder="ISO 9001, Procedimientos, Auditoría"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={formState.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Breve descripción del alcance del documento."
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Guardar en borrador</Button>
            </div>
          </form>
        </section>
      )}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Documento
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Categoría
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Estado
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Actualización
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredDocuments.map((document) => {
              const currentVersion = document.currentVersion;
              const versionLabel = currentVersion?.version ?? '—';
              const accessUrl = currentVersion?.external_url ?? currentVersion?.file_url ?? null;

              return (
                <tr key={document.id} className="transition hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <a
                        href={`/documents/${document.id}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        {document.title}
                      </a>
                      <div className="text-xs text-slate-500">
                        <span className="font-medium">Código:</span>{' '}
                        {document.code}
                      </div>
                      <div className="text-xs text-slate-500">
                        <span className="font-medium">Versión:</span>{' '}
                        {versionLabel}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {document.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {document.category}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${resolveStatusStyle(document.status)}`}
                    >
                      {resolveStatusLabel(document.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    <p className="font-medium text-slate-700">
                      {formatDate(document.updatedAt)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Responsable: {document.owner}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 text-sm">
                      <a
                        className="text-brand-600 hover:underline"
                        href={`/documents/${document.id}`}
                      >
                        Ver detalle
                      </a>
                      {accessUrl ? (
                        <a
                          className="text-slate-500 hover:text-slate-700"
                          href={accessUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Abrir archivo
                        </a>
                      ) : (
                        <span className="text-slate-400">Sin archivo</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredDocuments.length === 0 && (
          <div className="p-6 text-sm text-slate-600">
            No encontramos documentos con los filtros seleccionados. Ajusta la
            búsqueda o limpia los filtros para ver todo el repositorio.
          </div>
        )}
      </section>
    </div>
  );
};

export default DocumentsPage;
