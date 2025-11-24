import { PublicLayout } from '@/components/layouts/PublicLayout'
import { LoginForm } from './LoginForm'

export function AuthLanding() {
  return (
    <PublicLayout
      title="Bienvenido a IsoTrack"
      subtitle="Centralizá la gestión de tus normas, documentos y diagramas en un portal listo para auditar."
      description="Ingresá con tus credenciales corporativas para acceder al panel seguro y continuar con tus flujos de trabajo."
    >
      <LoginForm />
    </PublicLayout>
  )
}
