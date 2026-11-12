// La aplicación llama aquí justo después de que un estudiante pulse
// "Necesito apoyo", para avisar a la dirección por correo sin esperar al día
// siguiente. Solo procesa avisos pendientes: no recibe ningún dato.

import { clienteServidor, crearAlmacenSupabase } from '../servidor/almacen-supabase'
import { enviadorDesdeEntorno } from '../servidor/correo'
import { notificarAvisosApoyo } from '../servidor/recordatorios'

export async function POST(request: Request): Promise<Response> {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY
  const urlApp = process.env.APP_URL
  if (!url || !clave || !urlApp) return Response.json({ ok: false }, { status: 500 })

  // Solo personas con sesión iniciada.
  const token = (request.headers.get('authorization') || '').replace(/^Bearer /, '')
  const cliente = clienteServidor(url, clave)
  const { data, error } = await cliente.auth.getUser(token)
  if (error || !data.user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const resumen = await notificarAvisosApoyo(crearAlmacenSupabase(cliente), enviadorDesdeEntorno(), urlApp)
    return Response.json({ ok: true, ...resumen })
  } catch (e) {
    console.error('[notificar-apoyo]', e)
    return Response.json({ ok: false }, { status: 500 })
  }
}
