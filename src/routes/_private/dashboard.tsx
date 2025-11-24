import { createFileRoute } from '@tanstack/react-router'

import { PrivateLayout } from '@/components/layouts/PrivateLayout'
import { DashboardOverview } from '@/features/dashboard/DashboardOverview'
import { HeroSection } from '@/features/dashboard/HeroSection'

export const Route = createFileRoute('/_private/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <PrivateLayout
      title="Dashboard"
      subtitle="Accedé a los recursos de IsoTrack desde el área privada con sesión activa o demo."
    >
      <div className="space-y-6">
        <HeroSection />
        <DashboardOverview />
      </div>
    </PrivateLayout>
  )
}
