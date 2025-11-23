import { createFileRoute } from '@tanstack/react-router'

import { API_URL } from '../config/constants'
import { HeroSection } from '../features/dashboard/HeroSection'
import { IntegrationPanel } from '../features/dashboard/IntegrationPanel'
import { ProtectedDashboard } from '../features/dashboard/ProtectedDashboard'
import { ProcessesShowcase } from '../features/processes/components'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="space-y-6 bg-gradient-to-b from-slate-100 to-white px-6 pb-10 pt-8">
      <HeroSection />
      <ProtectedDashboard />
      <IntegrationPanel />
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Flujos visuales</p>
            <h3 className="text-xl font-semibold text-slate-900">Checklist para ReactFlow + TanStack</h3>
            <p className="text-xs text-slate-500">Endpoints prontos para /flows, nodos y edges.</p>
          </div>
          <span className="badge bg-indigo-100 text-indigo-700">API base {API_URL}</span>
        </div>
        <ProcessesShowcase />
      </section>
    </main>
  )
}
