// Conexión con Supabase. La dirección y la clave pública vienen de las
// variables de entorno (ver .env.example). La clave pública ("anon") no es un
// secreto: los permisos los decide la base de datos.

import { createClient } from '@supabase/supabase-js'

// Admite una dirección relativa (por ejemplo, /supabase) para probar la
// aplicación detrás de un proxy, con la misma dirección que la página.
// Si no hay VITE_..., se usan las que pone la integración de Supabase en Vercel.
const urlEntorno: string | undefined = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL
const url = urlEntorno?.startsWith('/') ? `${window.location.origin}${urlEntorno}` : urlEntorno
const clave = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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
