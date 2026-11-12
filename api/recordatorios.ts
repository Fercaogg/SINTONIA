// Función de Vercel que envía los recordatorios semanales y los avisos de
// apoyo pendientes. La llama Vercel Cron una vez al día (ver vercel.json).

import { clienteServidor, crearAlmacenSupabase } from '../servidor/almacen-supabase'
import { enviadorDesdeEntorno } from '../servidor/correo'
import { enviarRecordatorios, notificarAvisosApoyo } from '../servidor/recordatorios'

export async function GET(request: Request): Promise<Response> {
  const secreto = process.env.CRON_SECRET
  if (!secreto || request.headers.get('authorization') !== `Bearer ${secreto}`) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY
  const urlApp = process.env.APP_URL
  if (!url || !clave || !urlApp) {
    return Response.json({ error: 'Faltan SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY o APP_URL' }, { status: 500 })
  }
  try {
    const almacen = crearAlmacenSupabase(clienteServidor(url, clave))
    const enviador = enviadorDesdeEntorno()
    const recordatorios = await enviarRecordatorios(almacen, enviador, urlApp)
    const avisos = await notificarAvisosApoyo(almacen, enviador, urlApp)
    return Response.json({ ok: true, recordatorios, avisos })
  } catch (e) {
    console.error('[recordatorios]', e)
    return Response.json({ ok: false, error: 'Error al enviar los correos. Se reintentará en la próxima ejecución.' }, { status: 500 })
  }
}
