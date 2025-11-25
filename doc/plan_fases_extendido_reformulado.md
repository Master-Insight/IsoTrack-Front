
# 📘 Plan de Desarrollo — IsoTrack (Extendido y Reformulado)

Versión centrada en flujos visuales como núcleo del sistema.

---

# ✅ Checkpoint 1 — MVP (Documentos + Procesos + Diagramas)

*(se mantiene exactamente igual al archivo original)*

➡ Este checkpoint representa el sistema base de documentos, procesos, tareas y primeros diagramas.

---

# 🟦 Checkpoint 2 — Flujos Visuales + Migración a React

Transformación del sistema para adoptar **ReactFlow** + migración completa del frontend.

## 🎯 Objetivo General

Convertir IsoTrack en una plataforma cuya navegación central sea el **flujo visual**, reemplazando la lógica basada en módulos por un enfoque visual, dinámico y contextual.

---

## 2.1 — Migración del Frontend: Astro → React

### Incluye

- Creación del nuevo proyecto **React + Vite + Tailwind**
- Migración de:
  - `AppShell`
  - `AuthProvider`
  - Layouts
  - Componentes de Documentos / Procesos / Tareas
- Reemplazo de islands Astro por componentes React
- Creación del sistema de routing (TanStack Router recomendado)
- Manejo de estado global (Zustand o Context API)

---

## 2.2 — Nuevo módulo Backend: Flujos (Flow / Nodes / Edges)

### Tablas nuevas

- **flows**
- **flow_nodes**
- **flow_edges**

### Modelo de un nodo

```
Node {
  id: string
  label: string
  type: "step" | "decision" | "event" | "process" | "integration"
  system?: string

  metadata: {
    notes?: string
    artifacts?: [{ type, id }]
    roles?: string[]
    userAssigned?: string
    visibleFor?: string[]
  }

  position: { x, y }
}
```

### Endpoints nuevos

- `GET /flows`
- `POST /flows`
- `POST /flows/import`
- `POST /flows/{id}/nodes`
- `POST /flows/{id}/edges`

---

## 2.3 — Visualizador ReactFlow

Implementación del canvas visual para **consumir** flujos ya guardados. Esta fase no modifica datos; solo renderiza y permite navegar.

### Objetivo

Mostrar flujos con alta legibilidad y permitir que el usuario consulte la información de cada nodo sin necesidad de entrar al editor.

### Entregables

- Vista **/flows/:id/view** integrada al router.
- Canvas ReactFlow con nodos custom y edges interactivos (modo lectura, sin drag).
- Panel lateral de detalle sincronizado con la seleccin del nodo.
- Hook de data fetching para obtener `flow`, `flow_nodes` y `flow_edges` consumiendo **solo backend real**.

### Componentes / Funcionalidades clave

- **NodeRenderer**: nodos custom por tipo (`step`, `decision`, `event`, `process`, `integration`).
- **EdgeRenderer**: estilos diferenciados (por ejemplo, decisiones en línea punteada o color alternativo).
- **Minimap** y **Controls** de ReactFlow activados.
- **Hover / focus**: resaltar nodo y edges conectados.
- **Selección**: al hacer clic en un nodo, abre/actualiza el panel lateral.
- **Fit view** inicial y botón de reset zoom.
- **Persistencia de viewport** (opcional): si el usuario navega entre nodos, recordar zoom/posición mientras permanece en la vista.

### Panel lateral (solo lectura)

- Sección **Información**: etiqueta, tipo, sistema, notas principales.
- Sección **Documentos**: lista de IDs o títulos enlazables (placeholder si no hay backend).
- Sección **Procesos** y **Tareas**: chips con estado (ej. “pendiente”, “en curso”, “completada”).
- Sección **Notas y roles responsables**: texto enriquecido básico (markdown-light o preformateado).
- Acción “Ver en editor” (link hacia 2.4) sin modificar la data.

### Datos y carga

- Endpoint esperado: `GET /flows/:id` devolviendo nodos y edges desde backend (sin mocks en esta fase).
- Normalizar la data antes de pasarla a ReactFlow (IDs string, posicin `{x, y}`, metadata opcional).
- Manejo de **loading** y **empty state** (ej. "El flujo no tiene nodos").
- Manejo de **errores**: retry manual y mensaje contextual.
- Ejemplo de payload recomendado para aprovechar el panel lateral:

```json
{
  "success": true,
  "data": {
    "id": "flow-auditoria",
    "title": "Auditora interna",
    "description": "Checklist de hallazgos y seguimiento CAPA.",
    "type": "auditoria",
    "tags": ["QA", "NCR"],
    "area": "Calidad",
    "visibility": "public",
    "nodes": [
      {
        "id": "node-plan",
        "label": "Planificacin",
        "type": "step",
        "system": "IsoTrack",
        "code": "AUD-01",
        "metadata": {
          "notes": "Define alcance y responsables.",
          "artifacts": ["MQ-01"],
          "documents": ["DOC-PLAN-01"],
          "processes": ["PROC-01"],
          "roles": ["QA Lead"],
          "tasks": [
            { "label": "Checklist inicial", "status": "pendiente" }
          ]
        },
        "position": { "x": 80, "y": 140 }
      }
    ],
    "edges": [
      {
        "id": "edge-plan-hallazgo",
        "source_node": "node-plan",
        "target_node": "node-hallazgo",
        "label": "Checklist de auditora",
        "metadata": { "style": "decision" }
      }
    ]
  }
}
```

### UX / Accesibilidad

- Zoom y paneo fluidos (scroll/drag) sin bloquear la lectura.
- Contraste suficiente en nodos y edges; estados accesibles (color + iconografía).
- Navegación con teclado: permitir seleccionar siguiente/anterior nodo (fallback básico).

### ✅ Criterios de aceptación

- Puedo abrir un flujo existente y ver todos sus nodos en el canvas.
- Al seleccionar un nodo, el panel lateral muestra su metadata sin deshacer el zoom.
- Minimapa y controles funcionan y permiten reencuadrar el flujo.
- No se permite editar ni arrastrar nodos en esta fase (modo lectura).
- Carga y errores muestran UI clara (spinner/toast/mensaje) sin romper el canvas.

### Puentes hacia 2.4

- Reutilizar los nodos y edges para el modo edición, activando drag & drop.
- El link “Ver en editor” servirá como entrada directa al modo edición con el mismo `flowId`.
- La normalización de datos y hooks de fetch serán la base para guardar cambios luego.

---

## 2.4 — Editor de Flujos (modo edición)

- Crear/editar nodos
- Conectar edges
- Drag & drop
- Guardado de layout
- Importación desde CSV

---

## 2.5 — Clasificación de flujos

- **principales**
- **auxiliares**
- **por área**
- visibilidad por rol

---

## 2.6 — Vista “Mis flujos”

- Muestra solo flujos donde el usuario participa
- Resalta nodos asignados
- Estados de tareas/documentos por nodo

---

# 🟩 Checkpoint 3 — Calidad Lite Basada en Flujos

Antes se hacía con módulos separados.  
Ahora **todo es flujo**.

## 3.1 — Auditorías como flujos visuales

Nodos:

- planificación
- ejecución
- hallazgos
- revisión
- cierre

## 3.2 — NCR / CAPA como flujos

- detección
- análisis causa raíz
- acción correctiva
- verificación
- cierre

Cada etapa = nodo con evidencia adjunta.

---

## 3.3 — Entrenamientos como flujos

Nodos = módulos o pasos de capacitación:

- lectura
- video
- evaluación
- cierre

---

## 3.4 — Dashboard Lite

KPIs:

- % avance por flujo
- NCR abiertas
- CAPA en verificación
- Auditorías activas

---

# 🟧 Checkpoint 4 — Editor de Contenidos

Nuevo módulo para crear contenido desde nodos.

Incluye:

- Editor WYSIWYG (TipTap/Lexical)
- Subida de PDF
- Creación de:
  - documentos
  - procesos
  - tareas
- Versionado desde el nodo
- Previsualización integrada

---

# 🚀 Checkpoint 5 — Pro (Automatización + BI + Integraciones Avanzadas)

Extensión del sistema visual:

- Workflows automáticos entre nodos
- Aprobaciones multi-etapa
- Notificaciones internas y externas
- Exportación a BI
- Webhooks entre flujos y sistemas externos
- Multiempresa avanzado

---

# 🧩 Conclusión

Este plan reformulado coloca a **ReactFlow** y los **flujos visuales** como el centro conceptual, funcional y técnico de IsoTrack.
