# IsoTrack · Fase 1.2

Landing con autenticación obligatoria contra FastAPI. Se usa Astro + Tailwind 4 con **islas React** para manejar la sesión y Axios como cliente HTTP.

## Requisitos previos

- Node 22 + pnpm 10 (el proyecto ya incluye `node_modules` para agilizar).
- Variables de entorno opcionales:
  - `PUBLIC_API_URL` o `VITE_API_URL` para apuntar a la API (por defecto `http://localhost:8000`).
  - `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_ANON_KEY` si querés personalizar la conexión.

## Ejecutar localmente

```bash
pnpm dev
```

> Ejecutá el comando desde la consola integrada de VS Code para que Tailwind cargue los estilos correctamente.

## Flujo de autenticación

1. Navegá a `/login` y usá las credenciales prellenadas del usuario root.
2. El login ahora es un componente React que usa Axios y hace `POST {base_url}/users/login`, guardando `accessToken`, `refreshToken` y el perfil en `localStorage`.
3. Si ya estás autenticado, `/login` redirige automáticamente al índice.
4. El índice (`/`) requiere sesión: sin token te redirige a `/login` y bloquea el contenido protegido.
5. Desde el índice podés cerrar sesión con el botón **Cerrar sesión**, que ejecuta `POST {base_url}/users/logout` y limpia el almacenamiento antes de volver al login.

Respuesta esperada del endpoint de logout:

```json
{
  "success": true,
  "message": "Sesión cerrada ✅",
  "data": {
    "status": "signed_out"
  }
}
```
