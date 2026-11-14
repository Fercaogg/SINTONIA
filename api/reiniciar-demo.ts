// Función de Vercel: reinicia cada noche la base de datos de DEMOSTRACIÓN
// (encargo de blindaje, Fase 5). Vuelve a generar los datos ficticios, con
// las semanas simuladas contadas desde hoy.
//
// Triple seguro para no tocar nunca datos reales:
//   1. Solo funciona en el proyecto de demostración (MODO_DEMO=true).
//   2. Usa la conexión de la demostración (DEMO_DATABASE_URL o, si toda la
//      instalación es de demostración, la de la integración de Supabase).
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
  // La de demostración: DEMO_DATABASE_URL o, si la instalación entera es de
  // demostración, la que pone la integración de Supabase en Vercel.
  const urlBd = process.env.DEMO_DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!urlBd || !url || !clave) {
    return Response.json({ ok: false, error: 'Faltan DEMO_DATABASE_URL, SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
  }
  const conexion = new URL(urlBd)
  conexion.searchParams.delete('sslmode')
  const bd = new pg.Client({ connectionString: conexion.toString(), ssl: { rejectUnauthorized: false } })
  const cliente = clienteServidor(url, clave)
  try {
    await bd.connect()
    // La primera vez la base de datos está vacía: no hay nada que vaciar.
    const [{ n }] = (await bd.query(`select count(*)::int as n from public.perfiles`)).rows
    const resumen = await generarDemo({
      bd,
      almacen: crearAlmacenSupabase(cliente),
      reiniciar: n > 0,
      crearCuenta: async (email, datos, contrasena) => {
        const { data, error } = await cliente.auth.admin.createUser({ email, password: contrasena, email_confirm: true, user_metadata: datos })
        if (error || !data.user) throw new Error(`No se pudo crear ${email}: ${error?.message}`)
        return data.user.id
      },
    })
    return Response.json({ ok: true, reiniciada: true, resumen })
  } catch (e) {
    console.error('[reiniciar-demo]', e)
    return Response.json({ ok: false, error: 'No se ha podido reiniciar la demostración.' }, { status: 500 })
  } finally {
    await bd.end().catch(() => {})
  }
}
