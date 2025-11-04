# ISOTrack Frontend

Interfaz inicial del MVP de ISOTrack construida con [Astro](https://astro.build/), React y TailwindCSS. Esta primera entrega cubre las fases 1.1 y 1.2 del plan: entorno base, conexión al backend FastAPI y flujo de login mediante Supabase Auth.

## 🚀 Tecnologías

- [Astro 5](https://docs.astro.build/) con islands React
- [TailwindCSS](https://tailwindcss.com/) para estilos utilitarios
- [Radix UI](https://www.radix-ui.com/primitives) para componentes accesibles (selector de empresa, labels)
- FastAPI + Supabase Auth como backend (consumido mediante `fetch` tipado)

## 📁 Estructura relevante

```
src/
├── components/
│   ├── auth/        # Contexto y helpers de autenticación
│   ├── layout/      # Header y navegación lateral
│   └── ui/          # Botones, inputs y labels reutilizables
├── layouts/         # BaseLayout con provider global
├── lib/             # Cliente HTTP, sesión y servicios
├── pages/           # Rutas Astro (dashboard, login, documentos)
└── styles/          # Tailwind global
```

## 🔐 Variables de entorno

Crea un archivo `.env` en la raíz con las variables públicas que consume Astro:

```
PUBLIC_API_URL="https://tu-backend-fastapi"
# Opcional: solo si se expone desde el front
PUBLIC_SUPABASE_URL="https://tu-supabase-project"
```

Astro expone las variables prefijadas con `PUBLIC_` al cliente. El valor por defecto del backend es `http://localhost:8000`.

Todos los comandos se ejecutan con [pnpm](https://pnpm.io/):

| Comando       | Descripción                              |
| ------------- | ---------------------------------------- |
| `pnpm install`| Instala dependencias                     |
| `pnpm dev`    | Inicia el servidor de desarrollo (4321)  |
| `pnpm build`  | Genera la build de producción            |
| `pnpm preview`| Previsualiza la build                    |
| `pnpm lint`   | Ejecuta ESLint sobre archivos Astro/TSX  |

## 🔄 Flujo de autenticación

1. `LoginForm` envía las credenciales a `/auth/login` (FastAPI).
2. El `auth-service` persiste `access_token` y `refresh_token` en `localStorage`.
3. `AuthProvider` carga perfil (`/me`) y empresas (`/companies`) para disponibilizarlo en toda la app.
4. `ProtectedIsland` protege rutas privadas y redirige a `/login` si no hay sesión válida.

Los tokens y la empresa activa se guardan en `localStorage` para mantener la sesión entre recargas.

## ✅ Próximos pasos sugeridos

- Implementar refresco automático del token cuando `/me` responda 401.
- Añadir tests de integración para los flujos críticos de login.
- Completar páginas funcionales (documentos, auditorías, indicadores) consumiendo el backend real.
