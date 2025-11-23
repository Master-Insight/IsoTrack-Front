import { createFileRoute } from '@tanstack/react-router'

import { API_URL } from '../config/constants'
import { DocumentsPanel } from '../features/documents/components/DocumentsPanel'
import { HeroSection } from '../features/dashboard/HeroSection'

export const Route = createFileRoute('/documents')({
  component: DocumentsView,
})

function DocumentsView() {
  return (
    <div className="space-y-6 bg-gradient-to-b from-slate-100 to-white px-6 pb-10 pt-8">
      <HeroSection />
      <DocumentsPanel endpoint={`${API_URL}/documents`} />
    </div>
  )
}
