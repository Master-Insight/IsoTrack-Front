import type { DocumentRecord, DocumentVersion } from '../types/documents';

const makeVersion = (version: string, updatedAt: string, updatedBy: string, notes: string, fileUrl: string): DocumentVersion => ({
  id: `${version}-${updatedAt}`,
  version,
  updatedAt,
  updatedBy,
  notes,
  fileUrl,
});

export const mockDocuments: DocumentRecord[] = [
  {
    id: 'DOC-ISO-001',
    title: 'Manual de Calidad ISO 9001',
    code: 'MC-ISO9001',
    category: 'Gestión de Calidad',
    owner: 'María González',
    status: 'vigente',
    tags: ['ISO 9001', 'Manual', 'Calidad'],
    summary:
      'Manual maestro con la política de calidad, responsabilidades y mapa de procesos de la organización conforme a la norma ISO 9001:2015.',
    format: 'pdf',
    currentVersion: makeVersion(
      '3.2',
      '2024-02-12T09:00:00Z',
      'María González',
      'Actualización de organigrama y responsabilidades del proceso comercial.',
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    ),
    versions: [
      makeVersion(
        '1.0',
        '2023-01-10T13:30:00Z',
        'María González',
        'Liberación inicial del manual de calidad.',
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      ),
      makeVersion(
        '2.5',
        '2023-08-22T11:15:00Z',
        'Laura Suárez',
        'Se incorpora procedimiento de tratamiento de riesgos.',
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      ),
      makeVersion(
        '3.2',
        '2024-02-12T09:00:00Z',
        'María González',
        'Actualización de organigrama y responsabilidades del proceso comercial.',
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      ),
    ],
    reads: [
      {
        id: 'read-1',
        user: 'Ana Gómez',
        role: 'Responsable Calidad',
        readAt: '2024-02-15T14:20:00Z',
      },
      {
        id: 'read-2',
        user: 'Carlos López',
        role: 'Gerente Planta',
        readAt: '2024-02-17T09:45:00Z',
      },
    ],
    complianceArea: 'Sistema de Gestión',
    createdAt: '2023-01-10T13:30:00Z',
    updatedAt: '2024-02-12T09:00:00Z',
    nextReviewAt: '2024-08-01T00:00:00Z',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'DOC-SST-014',
    title: 'Procedimiento de Inducción SST',
    code: 'PR-SST-014',
    category: 'Seguridad y Salud',
    owner: 'Jorge Salvatierra',
    status: 'en_revision',
    tags: ['SST', 'Capacitaciones'],
    summary:
      'Procedimiento obligatorio para la inducción de personal nuevo y contratistas en materia de seguridad y salud ocupacional.',
    format: 'video',
    currentVersion: makeVersion(
      '2.1',
      '2024-03-05T16:30:00Z',
      'Jorge Salvatierra',
      'Se incorporan módulos interactivos y evaluación final.',
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    ),
    versions: [
      makeVersion(
        '1.0',
        '2022-11-02T10:00:00Z',
        'Jorge Salvatierra',
        'Liberación inicial del procedimiento de inducción.',
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
      ),
      makeVersion(
        '2.1',
        '2024-03-05T16:30:00Z',
        'Jorge Salvatierra',
        'Se incorporan módulos interactivos y evaluación final.',
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
      ),
    ],
    reads: [
      {
        id: 'read-3',
        user: 'Lucía Méndez',
        role: 'Jefa SST',
        readAt: '2024-03-06T08:10:00Z',
      },
    ],
    complianceArea: 'Seguridad y Salud Ocupacional',
    createdAt: '2022-11-02T10:00:00Z',
    updatedAt: '2024-03-05T16:30:00Z',
    nextReviewAt: '2024-06-30T00:00:00Z',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 'DOC-AMB-022',
    title: 'Instructivo de Manejo de Residuos Peligrosos',
    code: 'IN-AMB-022',
    category: 'Ambiental',
    owner: 'Verónica Paredes',
    status: 'borrador',
    tags: ['Residuos', 'Ambiental'],
    summary:
      'Instructivo detallado para la segregación, almacenamiento y disposición de residuos peligrosos según ISO 14001.',
    format: 'pdf',
    currentVersion: makeVersion(
      '0.8',
      '2024-01-22T09:40:00Z',
      'Verónica Paredes',
      'Pendiente de validación por parte de Seguridad Industrial.',
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    ),
    versions: [
      makeVersion(
        '0.5',
        '2023-12-14T08:25:00Z',
        'Verónica Paredes',
        'Primera versión interna para revisión.',
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      ),
      makeVersion(
        '0.8',
        '2024-01-22T09:40:00Z',
        'Verónica Paredes',
        'Pendiente de validación por parte de Seguridad Industrial.',
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      ),
    ],
    reads: [],
    complianceArea: 'Gestión Ambiental',
    createdAt: '2023-12-14T08:25:00Z',
    updatedAt: '2024-01-22T09:40:00Z',
    nextReviewAt: '2024-04-15T00:00:00Z',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
];

export const getDocumentById = (id: string): DocumentRecord | undefined =>
  mockDocuments.find((document) => document.id === id);

export const getDocumentCategories = () =>
  Array.from(new Set(mockDocuments.map((document) => document.category))).sort();

export const getDocumentStatuses = () => ['vigente', 'en_revision', 'borrador'] as const;
