import { createClient } from "@supabase/supabase-js";

// Obtener variables de entorno de forma segura
const getEnvVariable = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || '';
  }
  return '';
};

const supabaseUrl = getEnvVariable('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVariable('VITE_SUPABASE_ANON_KEY');

// Fallback para desarrollo (SOLO PARA PRUEBAS LOCALES)
const fallbackUrl = 'https://ywsptktjxqrfjgdwpsft.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3c3B0a3RqeHFyZmpnZHdwc2Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMjIzMjUsImV4cCI6MjA1OTg5ODMyNX0.Fv8Ztv9Nc9d2xLyx3YkKc5P7jX8qL2vB3R6tY1UwW4g';

export const supabase = createClient(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || fallbackKey
);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Usando credenciales de Supabase por defecto.");
}