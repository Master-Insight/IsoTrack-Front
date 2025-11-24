import { PublicLayout } from '@/components/layouts/PublicLayout'
import { LoginForm } from './LoginForm'

export function AuthLanding() {
  return (
    <PublicLayout
      title="Ingresá a IsoTrack"
      subtitle="Gestioná documentos, procesos y diagramas desde un panel protegido."
      description="El layout público mantiene visible el acceso mientras separa el área privada con restricciones claras."
    >
      <LoginForm />
    </PublicLayout>
  )
}
