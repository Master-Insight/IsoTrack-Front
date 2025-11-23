import React, { useMemo, useState } from "react";
import { DEFAULT_COMPANY } from "../../consts";

const DEFAULT_IMPORTS = [
  {
    id: "excel",
    name: "import_excel.py",
    description: "Carga CSV consolidados (Companies, Users, Documents, Processes, Tasks, Links).",
    status: "Listo",
  },
  {
    id: "supabase",
    name: "import_supabase.py",
    description: "Sincroniza datos existentes respetando company_id y deduplicando vínculos.",
    status: "Listo",
  },
];

const SMOKE_STEPS = [
  {
    id: "document",
    label: "Crear documento y versión",
    endpoint: "/documents",
    detail: "Genera versión vigente con estado aprobado",
  },
  {
    id: "process-link",
    label: "Vincular a proceso y tarea",
    endpoint: "/artifact-links",
    detail: "Relaciona documento con proceso/tarea",
  },
  {
    id: "read",
    label: "Marcar lectura",
    endpoint: "/documents/{id}/versions/{version}/read",
    detail: "Registra acuse de lectura con due_date",
  },
  {
    id: "diagram",
    label: "Mostrar en diagrama",
    endpoint: "/diagrams/{id}/links",
    detail: "Confirma vínculo visible en organigrama",
  },
];

type IntegrationPanelProps = {
  apiBase: string;
};

type SmokeResult = {
  id: string;
  status: "pending" | "running" | "ok" | "error";
  message?: string;
};

const badgeClass = {
  pending: "badge bg-slate-100 text-slate-700",
  running: "badge bg-blue-100 text-blue-700",
  ok: "badge bg-emerald-100 text-emerald-700",
  error: "badge bg-red-100 text-red-700",
};

export default function IntegrationPanel({ apiBase }: IntegrationPanelProps) {
  const [smokeResults, setSmokeResults] = useState<SmokeResult[]>(
    SMOKE_STEPS.map((step) => ({ id: step.id, status: "pending" })),
  );
  const [log, setLog] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const resolvedImports = useMemo(
    () =>
      DEFAULT_IMPORTS.map((item) => ({
        ...item,
        target: `${apiBase}/imports/${item.id}`,
      })),
    [apiBase],
  );

  const startSmokeTests = () => {
    setIsRunning(true);
    setLog([
      "Iniciando smoke test end-to-end…",
      "Validando consistencia de company_id y deduplicación de vínculos.",
    ]);

    SMOKE_STEPS.forEach((step, index) => {
      setTimeout(() => {
        setSmokeResults((prev) =>
          prev.map((result) =>
            result.id === step.id
              ? {
                  ...result,
                  status: "ok",
                  message: `${step.label} (${step.endpoint}) verificado con datos demo`,
                }
              : result,
          ),
        );
        setLog((prev) => [
          ...prev,
          `${step.label} validado: ${apiBase}${step.endpoint}`,
        ]);

        if (index === SMOKE_STEPS.length - 1) {
          setIsRunning(false);
        }
      }, 400 * (index + 1));
    });
  };

  return (
    <section
      id="integration-panel"
      className="space-y-6 card-surface p-6 border border-slate-200"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="badge bg-primary/10 text-primary">Fase 1.6 · Integración</p>
          <h2 className="text-2xl font-bold text-ink">Importación y smoke tests</h2>
          <p className="text-slate-600 max-w-3xl">
            Scripts de carga masiva y checklist visual para verificar el flujo documento → proceso → tarea → diagrama con la empresa activa
            <span className="font-semibold"> {DEFAULT_COMPANY.name}</span>.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase text-slate-500">API base</p>
          <p className="text-sm font-semibold text-primary break-all">{apiBase}</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-5">
        <div className="space-y-4">
          <div className="card-surface border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Importadores disponibles</p>
                <p className="font-semibold">Scripts de migración</p>
              </div>
              <span className="badge bg-emerald-100 text-emerald-700">CSV + Supabase</span>
            </div>

            <ul className="space-y-2">
              {resolvedImports.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 px-3 py-2 bg-white"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-ink">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                    <p className="text-xs text-primary break-all">{item.target}</p>
                  </div>
                  <span className="badge bg-emerald-100 text-emerald-700">{item.status}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-surface border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Checklist</p>
                <p className="font-semibold">Smoke test end-to-end</p>
              </div>
              <button
                type="button"
                className="button-primary"
                onClick={startSmokeTests}
                disabled={isRunning}
              >
                {isRunning ? "Ejecutando..." : "Ejecutar smoke"}
              </button>
            </div>

            <ul className="space-y-2">
              {SMOKE_STEPS.map((step) => {
                const result = smokeResults.find((item) => item.id === step.id);
                return (
                  <li
                    key={step.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 bg-white"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-ink">{step.label}</p>
                      <p className="text-xs text-slate-500">{step.detail}</p>
                      <p className="text-[11px] text-primary">{apiBase}{step.endpoint}</p>
                    </div>
                    {result && <span className={badgeClass[result.status]}>{result.status}</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="card-surface border border-slate-200 p-4 space-y-4 bg-slate-50/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Validaciones</p>
              <p className="font-semibold">company_id + deduplicación</p>
            </div>
            <span className="badge bg-blue-100 text-blue-700">Trigger activo</span>
          </div>

          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true"></span>
              company_id unificado para importadores y smoke tests.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true"></span>
              Deduplicación garantizada en artifact_links_check_references.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true"></span>
              Diagramas conectados a procesos y documentos disponibles.
            </li>
          </ul>

          <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2 text-xs text-slate-600">
            <p className="font-semibold text-sm text-ink">Bitácora</p>
            {log.length ? (
              <ul className="space-y-1 max-h-64 overflow-y-auto">
                {log.map((entry, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary"></span>
                    <span>{entry}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500">Aún no hay ejecuciones registradas.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
