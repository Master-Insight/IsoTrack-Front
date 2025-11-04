const FALLBACK_API_URL = 'http://localhost:8000';

export const API_BASE_URL = import.meta.env.PUBLIC_API_URL ?? FALLBACK_API_URL;

export const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
