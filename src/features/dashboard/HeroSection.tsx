import { DEFAULT_COMPANY } from '../../config/constants'

export function HeroSection() {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="badge bg-cyan-100 text-cyan-700">Entorno React · Checkpoint 2.1</p>
          <h1 className="text-3xl font-bold text-slate-900">IsoTrack con flujo visual como núcleo</h1>
          <p className="text-slate-600 max-w-3xl">
            Migramos desde Astro a Vite + React + TanStack Router, manteniendo la narrativa de flujos y paneles protegidos.
            La navegación ahora se organiza por features para crecer con ReactFlow, Zustand y Radix.
          </p>
        </div>
        <div className="text-right space-y-2">
          <p className="text-xs uppercase text-slate-500">Empresa activa</p>
          <p className="font-semibold text-slate-900">{DEFAULT_COMPANY.name}</p>
          <p className="text-xs text-slate-500 max-w-xs">
            Configuración y endpoints quedan listos para la vista “Mis flujos” y clasificación por rol.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 text-sm text-slate-600">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3"
          >
            <div className="grid size-10 place-items-center rounded-full bg-cyan-100 font-semibold text-cyan-700">
              {step}
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                {step === 1 && 'Valida sesión con Zustand'}
                {step === 2 && 'Saluda con datos de empresa'}
                {step === 3 && 'Sincroniza documentos y nodos'}
              </p>
              <p className="text-xs text-slate-500">
                {step === 1 && 'Tokens y perfil se guardan en el store global.'}
                {step === 2 && 'Contexto listo para paneles protegidos y flows.'}
                {step === 3 && 'Documentos listos para ReactFlow + panel lateral.'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
