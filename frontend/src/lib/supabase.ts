import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase para el Frontend.
 * 
 * Este módulo crea y exporta una instancia única del cliente de Supabase
 * que se utiliza en toda la aplicación para:
 * - Autenticación (login, registro, recuperación de contraseña).
 * - Verificación de tokens OTP.
 * - Actualización de contraseñas.
 * 
 * Configuración:
 * - Las credenciales se leen de las variables de entorno:
 *   VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
 * - En desarrollo, se muestra una advertencia si las variables no están configuradas.
 * 
 * Seguridad:
 * - La ANON_KEY es pública por diseño y está protegida por Row Level Security (RLS).
 * - NUNCA se debe usar la SERVICE_ROLE_KEY en el frontend.
 * 
 * Fecha: 05/05/26
 */


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