import { IntegrationPanel } from './IntegrationPanel'
import { ProtectedDashboard } from './ProtectedDashboard'

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <IntegrationPanel />
      <ProtectedDashboard />
    </div>
  )
}
