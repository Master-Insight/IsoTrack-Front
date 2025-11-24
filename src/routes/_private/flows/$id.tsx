import { createFileRoute } from '@tanstack/react-router'

import { PrivateLayout } from '@/components/layouts/PrivateLayout'
import { FlowDetailCanvas } from '@/features/flows/FlowDetail'
import { FlowViewer } from '@/features/flows/FlowViewer'

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
      {/* <FlowDetailCanvas flowId={id} /> */}
      <FlowViewer flowId={id} />
    </PrivateLayout>
  )
}
