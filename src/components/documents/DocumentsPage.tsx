import { useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  mockDocuments,
  getDocumentCategories,
  getDocumentStatuses,
} from '../../lib/mock-documents';
import type { DocumentRecord, DocumentStatus } from '../../types/documents';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

const statusLabels: Record<DocumentStatus, string> = {
  vigente: 'Vigente',
  en_revision: 'En revisión',
  borrador: 'Borrador',
};

const statusBadgeStyles: Record<DocumentStatus, string> = {
  vigente: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  en_revision: 'bg-amber-100 text-amber-700 border border-amber-200',
  borrador: 'bg-slate-100 text-slate-600 border border-slate-200',
};

interface FormState {
  title: string;
  code: string;
  category: string;
  owner: string;
  status: DocumentStatus;
  tags: string;
  format: 'pdf' | 'video';
  url: string;
  summary: string;
}

const defaultFormState: FormState = {
  title: '',
  code: '',
  category: '',
  owner: '',
  status: 'borrador',
  tags: '',
  format: 'pdf',
  url: '',
  summary: '',
};

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<DocumentRecord[]>(mockDocuments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'todos'>(
    'todos',
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('todas');
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState<FormState>(defaultFormState);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const categories = useMemo(() => ['todas', ...getDocumentCategories()], []);
  const statuses = useMemo(() => ['todos', ...getDocumentStatuses()], []);

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
        statusFilter === 'todos' || document.status === statusFilter;
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
      status: event.target.value as DocumentStatus,
    }));
  };

  const handleFormatChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFormState((prev) => ({
      ...prev,
      format: event.target.value as 'pdf' | 'video',
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
      !formState.url
    ) {
      setFeedbackMessage({
        type: 'error',
        text: 'Completa los campos obligatorios antes de guardar.',
      });
      return;
    }

    const now = new Date().toISOString();
    const tags = formState.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const newDocument: DocumentRecord = {
      id: `DOC-${Date.now()}`,
      title: formState.title,
      code: formState.code,
      category: formState.category,
      owner: formState.owner || 'Sin asignar',
      status: formState.status,
      tags,
      summary: formState.summary || 'Documento en preparación.',
      format: formState.format,
      currentVersion: {
        id: `v1-${Date.now()}`,
        version: '1.0',
        updatedAt: now,
        updatedBy: formState.owner || 'Equipo ISO',
        notes: 'Documento cargado desde el formulario rápido.',
        fileUrl: formState.url,
      },
      versions: [
        {
          id: `v1-${Date.now()}`,
          version: '1.0',
          updatedAt: now,
          updatedBy: formState.owner || 'Equipo ISO',
          notes: 'Documento cargado desde el formulario rápido.',
          fileUrl: formState.url,
        },
      ],
      reads: [],
      complianceArea: 'Sin asignar',
      createdAt: now,
      updatedAt: now,
      url: formState.url,
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
                setStatusFilter(event.target.value as DocumentStatus | 'todos')
              }
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'todos'
                    ? 'Todos los estados'
                    : statusLabels[status as DocumentStatus]}
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
                {getDocumentStatuses().map((status) => (
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
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="url">URL del archivo *</Label>
              <Input
                id="url"
                name="url"
                type="url"
                value={formState.url}
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
              <Label htmlFor="summary">Descripción</Label>
              <Textarea
                id="summary"
                name="summary"
                value={formState.summary}
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
            {filteredDocuments.map((document) => (
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
                      {document.currentVersion.version}
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
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeStyles[document.status]}`}
                  >
                    {statusLabels[document.status]}
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
                    <a
                      className="text-slate-500 hover:text-slate-700"
                      href={document.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir archivo
                    </a>
                  </div>
                </td>
              </tr>
            ))}
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
