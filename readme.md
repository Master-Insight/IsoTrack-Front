# IsoTrack · Fase 1.6

Panel completo hasta la fase 1.6: autenticación protegida, vistas de documentos/procesos/diagramas y tablero de integración con importadores y smoke tests. Se usa Astro + Tailwind 4 con **islas React** para manejar la sesión y Axios como cliente HTTP.

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

## Alcance de la fase

- Inicio actualizado con contexto de **Fase 1.6**, panel protegido y enlaces a documentos.
- Vistas dedicadas:
  - `/documents`: listado, filtros y detalle protegido (F1.3).
  - `/processes`: procesos, tareas y vínculos (F1.4).
  - `/diagrams`: editor visual y vínculos (F1.5).
- Panel de integración (F1.6) con importadores `import_excel.py` y `import_supabase.py` y checklist de smoke tests end-to-end.

## Flujo de autenticación

1. Navegá a `/login` y usá las credenciales prellenadas del usuario root.
2. El login usa Axios y hace `POST {base_url}/users/login`, guardando `accessToken`, `refreshToken` y el perfil en `sessionStorage`.
3. Si ya estás autenticado, `/login` redirige automáticamente al índice.
4. El índice (`/`) requiere sesión: sin token te redirige a `/login` y bloquea el contenido protegido.
5. Desde el índice podés cerrar sesión con el botón **Cerrar sesión**, que ejecuta `POST {base_url}/users/logout` y limpia el almacenamiento antes de volver al login.
