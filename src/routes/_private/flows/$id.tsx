import { createFileRoute } from '@tanstack/react-router'

import { PrivateLayout } from '@/components/layouts/PrivateLayout'
import { FlowDetailCanvas } from '@/features/flows/FlowDetail'

export const Route = createFileRoute('/_private/flows/$id')({
  component: FlowDetailPage,
})

function FlowDetailPage() {
  const { id } = Route.useParams()
  console.log(id)
  return (
    <PrivateLayout
      title="Flujo"
      subtitle="Visualiza el detalle y canvas en ReactFlow."
    >
      <FlowDetailCanvas flowId={id} />
    </PrivateLayout>
  )
}
