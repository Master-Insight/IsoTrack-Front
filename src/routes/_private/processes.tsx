import { createFileRoute } from '@tanstack/react-router'

import { PrivateLayout } from '@/components/layouts/PrivateLayout'
import { HeroSection } from '@/features/dashboard/HeroSection'
import { ProcessesPanel } from '@/features/processes/components/ProcessesPanel'

export const Route = createFileRoute('/_private/processes')({
  component: ProcessesView,
})

function ProcessesView() {
  return (
    <PrivateLayout
      title="Procesos"
      subtitle="Navega y gestiona procesos críticos dentro del área protegida."
    >
      <div className="space-y-6">
        <HeroSection />
        <ProcessesPanel />
      </div>
    </PrivateLayout>
  )
}
