// Función de Vercel: reinicia cada noche la base de datos de DEMOSTRACIÓN
// (encargo de blindaje, Fase 5). Vuelve a generar los datos ficticios, con
// las semanas simuladas contadas desde hoy.
//
// Triple seguro para no tocar nunca datos reales:
//   1. Solo funciona en el proyecto de demostración (MODO_DEMO=true).
//   2. Usa su propia conexión (DEMO_DATABASE_URL), que no existe en el real.
//   3. La base de datos se niega a vaciarse si no está marcada como
//      demostración (private.vaciar_demo).
// Protegida con CRON_SECRET, como las demás tareas.

import pg from 'pg'
import { generarDemo } from '../servidor/demo/generar-demo.js'
import { clienteServidor, crearAlmacenSupabase } from '../servidor/almacen-supabase.js'

export async function GET(request: Request): Promise<Response> {
  const secreto = process.env.CRON_SECRET
  if (!secreto || request.headers.get('authorization') !== `Bearer ${secreto}`) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (process.env.MODO_DEMO !== 'true') {
    return Response.json({ ok: true, reiniciada: false, motivo: 'Este proyecto no es la demostración.' })
  }
  const urlBd = process.env.DEMO_DATABASE_URL
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!urlBd || !url || !clave) {
    return Response.json({ ok: false, error: 'Faltan DEMO_DATABASE_URL, SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
  }
  const bd = new pg.Client({ connectionString: urlBd, ssl: { rejectUnauthorized: false } })
  try {
    await bd.connect()
    const resumen = await generarDemo({ bd, almacen: crearAlmacenSupabase(clienteServidor(url, clave)), reiniciar: true })
    return Response.json({ ok: true, reiniciada: true, resumen })
  } catch (e) {
    console.error('[reiniciar-demo]', e)
    return Response.json({ ok: false, error: 'No se ha podido reiniciar la demostración.' }, { status: 500 })
  } finally {
    await bd.end().catch(() => {})
  }
}
