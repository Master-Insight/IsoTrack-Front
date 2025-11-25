import type { FlowRecord } from './types'

export const seedFlows: FlowRecord[] = [
  {
    id: 'flow-onboarding',
    title: 'Onboarding de Planta',
    description: 'Flujo base para inductores y checklists de ingreso a planta.',
    classification: 'principal',
    area: 'Operaciones',
    visibilityRoles: ['Root', 'QA', 'Operaciones'],
    companyId: '7d9cf77c-bc42-405c-b211-b905d576624b',
    createdAt: '2024-11-01T12:00:00Z',
    updatedAt: '2024-11-01T12:00:00Z',
  },
  {
    id: 'flow-auditoria',
    title: 'Auditoría Interna',
    description: 'Checklist de hallazgos, NCR y seguimiento CAPA.',
    classification: 'por área',
    area: 'Calidad',
    visibilityRoles: ['QA'],
    companyId: '7d9cf77c-bc42-405c-b211-b905d576624b',
    createdAt: '2024-11-02T12:00:00Z',
    updatedAt: '2024-11-02T12:00:00Z',
  },
  {
    id: 'flow-capa',
    title: 'NCR / CAPA',
    description: 'Seguimiento de acciones correctivas y preventivas.',
    classification: 'auxiliar',
    area: 'QA',
    visibilityRoles: ['Root', 'QA'],
    companyId: '7d9cf77c-bc42-405c-b211-b905d576624b',
    createdAt: '2024-11-03T12:00:00Z',
    updatedAt: '2024-11-03T12:00:00Z',
  },
]
