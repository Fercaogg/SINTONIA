// Conexión con Supabase. La dirección y la clave pública vienen de las
// variables de entorno (ver .env.example). La clave pública ("anon") no es un
// secreto: los permisos los decide la base de datos.

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const clave = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !clave) {
  // Mensaje para quien instala la aplicación, no para quien la usa.
  console.error('Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. Consulta el README.')
}

export const supabase = createClient(url ?? 'http://localhost:54321', clave ?? 'sin-clave', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // El enlace del correo se procesa en /acceso/confirmar, no automáticamente.
    detectSessionInUrl: false,
    flowType: 'implicit',
  },
})

export const entornoLocal = import.meta.env.VITE_ENTORNO_LOCAL === 'true'
export const modoDemo = import.meta.env.VITE_MODO_DEMO === 'true'
