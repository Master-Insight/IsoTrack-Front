import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { hasAvailableSession } from '@/features/auth/session'

export const Route = createFileRoute('/_public')({
  beforeLoad: () => {
    if (hasAvailableSession()) {
      throw redirect({ to: '/_private/dashboard' })
    }
  },
  component: PublicLayoutRoute,
})

function PublicLayoutRoute() {
  return <Outlet />
}
