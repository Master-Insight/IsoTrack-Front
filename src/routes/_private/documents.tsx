import { createFileRoute } from '@tanstack/react-router'

import { PrivateLayout } from '@/components/layouts/PrivateLayout'
import { API_URL } from '@/config/constants'
import { DocumentsPanel } from '@/features/documents/components/DocumentsPanel'
import { HeroSection } from '@/features/dashboard/HeroSection'

export const Route = createFileRoute('/_private/documents')({
  component: DocumentsView,
})

function DocumentsView() {
  return (
    <PrivateLayout
      title="Documentos"
      subtitle="Consulta los documentos protegidos de la empresa con el contexto de autenticación activo."
    >
      <div className="space-y-6">
        <HeroSection />
        <DocumentsPanel endpoint={`${API_URL}/documents`} />
      </div>
    </PrivateLayout>
  )
}
