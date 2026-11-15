// Función de Vercel: estado de la plataforma para la página /estado.
// Pública y sin datos personales. La respuesta se guarda 30 segundos en la
// red de Vercel, para que nadie pueda saturar la base de datos con ella.
import { comprobarEstado } from '../servidor/estado.js'

export async function GET(): Promise<Response> {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY
  const cabeceras = { 'Cache-Control': 'public, max-age=0, s-maxage=30' }
  if (!url || !clave) {
    return Response.json(
      { ok: false, comprobadoEn: new Date().toISOString(), servidor: 'ok', baseDeDatos: 'error', acceso: 'error', milisegundos: 0 },
      { status: 503, headers: cabeceras },
    )
  }
  const estado = await comprobarEstado({ url, clave, fetch })
  return Response.json(estado, { status: estado.ok ? 200 : 503, headers: cabeceras })
}
