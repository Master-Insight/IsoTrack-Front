import { createFileRoute } from '@tanstack/react-router'

import { HeroSection } from '../features/dashboard/HeroSection'
import { ProcessesShowcase } from '../features/processes/components'

export const Route = createFileRoute('/processes')({
  component: ProcessesView,
})

function ProcessesView() {
  return (
    <div className="space-y-6 bg-gradient-to-b from-slate-100 to-white px-6 pb-10 pt-8">
      <HeroSection />
      <ProcessesShowcase />
    </div>
  )
}
