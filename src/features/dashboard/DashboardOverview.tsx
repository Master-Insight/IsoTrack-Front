import { IntegrationPanel } from './IntegrationPanel'
import { DashboardPrimer } from './DashboardPrimer'

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <IntegrationPanel />
      <DashboardPrimer />
    </div>
  )
}
