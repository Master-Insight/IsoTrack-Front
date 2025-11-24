import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { hasAvailableSession } from '@/features/auth/session'

export const Route = createFileRoute('/_private')({
  beforeLoad: () => {
    if (!hasAvailableSession()) {
      throw redirect({ to: '/' })
    }
  },
  component: PrivateLayoutRoute,
})

function PrivateLayoutRoute() {
  return <Outlet />
}
