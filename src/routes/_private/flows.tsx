import { createFileRoute } from '@tanstack/react-router'

import { PrivateLayout } from '@/components/layouts/PrivateLayout'
import { FlowsOverview } from '@/features/flows/FlowsOverview'

export const Route = createFileRoute('/_private/flows')({
  component: FlowsPage,
})

function FlowsPage() {
  return (
    <PrivateLayout
      title="Flujos"
      subtitle="Fase 2.2 enfocada en backend: flows, nodes y edges listos para ReactFlow."
    >
      <FlowsOverview />
    </PrivateLayout>
  )
}
