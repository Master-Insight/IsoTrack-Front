export const flowTables = [
  {
    id: 'flows',
    title: 'flows',
    purpose: 'Cabecera del flujo: nombre, clasificación, visibilidad y owner.',
    fields: ['id', 'name', 'visibility', 'classification', 'owner', 'status'],
  },
  {
    id: 'flow_nodes',
    title: 'flow_nodes',
    purpose: 'Nodos que viven dentro de cada flow. Incluyen tipo, sistema y metadata.',
    fields: ['id', 'flow_id', 'label', 'type', 'system', 'metadata', 'position'],
  },
  {
    id: 'flow_edges',
    title: 'flow_edges',
    purpose: 'Relaciones entre nodos. Registra source, target y reglas de visibilidad.',
    fields: ['id', 'flow_id', 'source', 'target', 'label', 'rule'],
  },
]

export const flowEndpoints = [
  { method: 'GET', path: '/flows', detail: 'Listado plano para el dashboard y “Mis flujos”.' },
  { method: 'POST', path: '/flows', detail: 'Crear flujo vacío con clasificación y visibilidad.' },
  { method: 'POST', path: '/flows/import', detail: 'Ingesta CSV con nodos y edges iniciales.' },
  { method: 'POST', path: '/flows/{id}/nodes', detail: 'Agregar nodos step/decision/event/process/integration.' },
  { method: 'POST', path: '/flows/{id}/edges', detail: 'Conectar nodos y guardar el layout visual.' },
]

export const sampleFlows = [
  {
    id: 'flow-onboarding',
    name: 'Onboarding de Planta',
    classification: 'principal',
    visibility: ['Root', 'QA', 'Operaciones'],
    status: 'listo para ReactFlow',
  },
  {
    id: 'flow-auditoria',
    name: 'Auditoría Interna',
    classification: 'por área',
    visibility: ['Calidad'],
    status: 'pendiente de edges',
  },
  {
    id: 'flow-capa',
    name: 'NCR / CAPA',
    classification: 'auxiliar',
    visibility: ['Root', 'QA'],
    status: 'modo borrador',
  },
]

export const sampleNodes = [
  {
    id: 'node-plan',
    label: 'Planificación',
    type: 'step',
    system: 'IsoTrack',
    metadata: {
      notes: 'Define alcance y responsables de la auditoría.',
      artifacts: ['MQ-01', 'PR-ONB-02'],
      roles: ['QA Lead'],
      userAssigned: 'usuario_root',
      visibleFor: ['Root', 'QA'],
    },
    position: { x: 120, y: 140 },
  },
  {
    id: 'node-hallazgo',
    label: 'Hallazgo',
    type: 'event',
    system: 'IsoTrack',
    metadata: {
      notes: 'Carga de evidencia y estado de NCR.',
      artifacts: ['CAPA-01'],
      roles: ['Auditor', 'Owner de proceso'],
      userAssigned: 'qa_auditor',
      visibleFor: ['QA', 'Owner proceso'],
    },
    position: { x: 420, y: 210 },
  },
  {
    id: 'node-integracion',
    label: 'Integración ERP',
    type: 'integration',
    system: 'SAP',
    metadata: {
      notes: 'Evento externo para sincronizar hallazgos y estados de ordenes.',
      artifacts: ['EXT-ERP'],
      roles: ['Integraciones'],
      visibleFor: ['Root'],
    },
    position: { x: 680, y: 260 },
  },
]

export const sampleEdges = [
  {
    id: 'edge-plan-hallazgo',
    source: 'node-plan',
    target: 'node-hallazgo',
    label: 'Checklist de auditoría',
    rule: 'visibleFor incluye QA',
  },
  {
    id: 'edge-hallazgo-integracion',
    source: 'node-hallazgo',
    target: 'node-integracion',
    label: 'Webhook de hallazgo',
    rule: 'sincroniza NCR en SAP',
  },
]

export const flowNotes = [
  'Guardar layout: posición X/Y de los nodos via ReactFlow.',
  'Metadata conserva notas, roles y referencias a documentos desde el backend.',
  'Las visibilidades via roles resuelven el futuro “Mis flujos”.',
  'El import CSV crea nodos y edges listos para ser dibujados en el canvas.',
]
