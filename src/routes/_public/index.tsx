import { createFileRoute } from '@tanstack/react-router'

import { AuthLanding } from '@/features/auth/AuthLanding'

export const Route = createFileRoute('/_public/')({
  component: HomePage,
})

function HomePage() {
  return <AuthLanding />
}
