import { createFileRoute } from '@tanstack/react-router'

import { PrivateLayout } from '@/components/layouts/PrivateLayout'
import { FlowDetail } from '@/features/flows/FlowDetail'

export const Route = createFileRoute('/_private/flows/$id')({
  component: FlowDetailPage,
})

function FlowDetailPage() {
  const { id } = Route.useParams()
  return (
    <PrivateLayout
      title="Flujo"
      subtitle="Visualiza el detalle y canvas en ReactFlow."
    >
      <FlowDetail flowId={id} />
    </PrivateLayout>
  )
}
