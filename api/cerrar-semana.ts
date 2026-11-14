// Función de Vercel que cierra las semanas terminadas: desajuste, sorteo y
// agenda. La llama Vercel Cron una vez al día (ver vercel.json).
// Protegida con CRON_SECRET: Vercel envía "Authorization: Bearer <CRON_SECRET>".

import { cerrarSemanas } from '../servidor/cierre-semana.js'
import { clienteServidor, crearAlmacenSupabase } from '../servidor/almacen-supabase.js'
import { redactorDesdeEntorno } from '../servidor/logica/modelo.js'

export async function GET(request: Request): Promise<Response> {
  const secreto = process.env.CRON_SECRET
  if (!secreto || request.headers.get('authorization') !== `Bearer ${secreto}`) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !clave) {
    return Response.json({ error: 'Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
  }
  try {
    const resumen = await cerrarSemanas({
      almacen: crearAlmacenSupabase(clienteServidor(url, clave)),
      redactor: redactorDesdeEntorno(),
    })
    return Response.json({ ok: true, resumen })
  } catch (e) {
    console.error('[cerrar-semana]', e)
    return Response.json({ ok: false, error: 'Error al cerrar la semana. Se reintentará en la próxima ejecución.' }, { status: 500 })
  }
}
