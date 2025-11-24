import { Link } from '@tanstack/react-router'

export function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16 text-slate-900">
      <div className="w-full max-w-xl space-y-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Error 404
        </p>
        <h1 className="text-4xl font-bold sm:text-5xl">Página no encontrada</h1>
        <p className="text-base text-slate-600 sm:text-lg">
          No pudimos encontrar la página que estás buscando. Comprueba la dirección o
          vuelve al inicio para continuar.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/_public/"
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >
            Volver al inicio
          </Link>
          <Link
            to="/_public/login"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    </main>
  )
}

export default NotFound
