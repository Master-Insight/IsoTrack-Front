import { createFileRoute } from '@tanstack/react-router'

import { PrivateLayout } from '@/components/layouts/PrivateLayout'
import { FlowEditor } from '@/features/flows/FlowEditor'

export const Route = createFileRoute('/_private/flows/$id/editor')({
  component: FlowEditorPage,
})

function FlowEditorPage() {
  const { id } = Route.useParams()

  return (
    <PrivateLayout
      title="Editor de flujo"
      subtitle="Crea nodos, conecta edges, arrastra y guarda el layout."
    >
      <FlowEditor flowId={id} />
    </PrivateLayout>
  )
}
