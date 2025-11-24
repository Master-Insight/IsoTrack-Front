import { createFileRoute } from '@tanstack/react-router'

import { AuthLanding } from '@/features/auth/AuthLanding'

export const Route = createFileRoute('/_public/login')({
  component: LoginPage,
})

function LoginPage() {
  return <AuthLanding />
}
