import { createFileRoute } from '@tanstack/react-router'

import { API_URL } from '../config/constants'
import { DiagramsPage } from '../features/diagrams/DiagramsPage'

export const Route = createFileRoute('/diagrams')({
  component: DiagramsView,
})

function DiagramsView() {
  return (
    <div className="space-y-6 bg-gradient-to-b from-slate-100 to-white px-6 pb-10 pt-8">
      <DiagramsPage diagramsEndpoint={`${API_URL}/diagrams`} linksEndpoint={`${API_URL}/diagrams`} />
    </div>
  )
}
