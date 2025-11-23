export const processCards = [
  {
    id: 'prc-onboarding',
    title: 'Onboarding y capacitación',
    description:
      'Une documentos, tareas y nodos ReactFlow para guiar a los equipos en sus primeras semanas.',
    links: ['PR-ONB-02', 'CK-AUD-05'],
    status: 'en progreso',
  },
  {
    id: 'prc-auditoria',
    title: 'Auditorías como flujos visuales',
    description: 'Planificación, hallazgos y cierre viven en nodos conectados con evidencias.',
    links: ['MQ-01'],
    status: 'pendiente',
  },
  {
    id: 'prc-documentos',
    title: 'Repositorio documental',
    description:
      'Documentos, procesos y tareas convergen en un panel protegido con control de sesión.',
    links: ['MQ-01', 'PR-ONB-02'],
    status: 'vigente',
  },
]

export const flowClassification = [
  { label: 'Principales', items: ['Calidad', 'Auditoría', 'Onboarding'] },
  { label: 'Auxiliares', items: ['Integraciones', 'Entrenamientos', 'Plantillas'] },
  { label: 'Por área', items: ['Operaciones', 'People', 'QA'] },
  { label: 'Visibilidad', items: ['Root', 'QA', 'Colaborador'] },
]
