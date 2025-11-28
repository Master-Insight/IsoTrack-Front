import { createFileRoute } from '@tanstack/react-router'

import { PrivateLayout } from '@/components/layouts/PrivateLayout'
import { DiagramsPage } from '@/features/diagrams/DiagramsPage'
import { HeroSection } from '@/features/dashboard/HeroSection'

export const Route = createFileRoute('/_private/diagrams')({
  component: DiagramsView,
})

function DiagramsView() {
  return (
    <PrivateLayout
      title="Diagramas"
      subtitle="Administra diagramas de flujo privados solo visibles con autenticación."
    >
      <div className="space-y-6">
        <HeroSection />
        <DiagramsPage />
      </div>
    </PrivateLayout>
  )
}
