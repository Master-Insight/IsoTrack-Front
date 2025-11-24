import { createFileRoute } from '@tanstack/react-router'

import { LoginForm } from '../features/auth/LoginForm'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const title = 'Iniciar sesión en IsoTrack'
  return (
    <main className="grid items-start gap-8 bg-gradient-to-b from-slate-100 to-white px-6 pb-10 pt-8 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="card-surface space-y-4 p-8">
        <p className="badge bg-primary/10 text-primary">Control de acceso</p>
        <h1 className="text-3xl font-bold text-ink">{title}</h1>
        <p className="text-slate-600">
          Si ya tenés sesión activa con el usuario raíz de la empresa, serás redirigido al panel principal.
        </p>
        <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
          <li>Credenciales predeterminadas disponibles en el formulario.</li>
          <li>El acceso protegido requiere token almacenado en el navegador.</li>
          <li>Tras autenticarte, volverás automáticamente al inicio.</li>
        </ul>
      </section>

      <LoginForm />
    </main>
  )
}
