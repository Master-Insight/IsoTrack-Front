import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private')({
  component: PrivateLayoutRoute,
})

function PrivateLayoutRoute() {
  return <Outlet />
}
