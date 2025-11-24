export const APP_NAME = 'IsoTrack'

export const API_URL =
  import.meta.env.PUBLIC_API_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000'

export const SUPABASE_URL =
  import.meta.env.PUBLIC_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL ||
  'https://supabase.local'

export const DEFAULT_COMPANY = {
  id: '7d9cf77c-bc42-405c-b211-b905d576624b',
  name: 'IsoTrack Root Company',
  theme: 'primary',
  brandLogo: '/assets/isotrack-logo-horizontal.svg',
}

export const DEFAULT_USER = {
  id: '05dc56fe-10eb-41d1-9305-340de88c5296',
  email: 'insightdev@isotrack.com',
  role: 'root',
  fullName: 'Root User',
}

export const NAV_ITEMS = [
  { label: 'Inicio', href: '/' },
  { label: 'Documentos', href: '/documents' },
  { label: 'Procesos', href: '/processes' },
  { label: 'Diagramas', href: '/diagrams' },
  { label: 'Login', href: '/login' },
]
