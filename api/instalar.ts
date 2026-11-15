// Función de Vercel: instala la base de datos de SINTONÍA en el Supabase que
// la integración de Vercel ha conectado al proyecto (POSTGRES_URL_NON_POOLING).
// Así no hace falta copiar ninguna clave secreta: se ejecuta dentro de Vercel.
//
//   - Protegida con INSTALAR_SECRETO (Authorization: Bearer ...).
//   - Solo instala si la base de datos está vacía. Si ya hay instalación,
//     solo aplica supabase/actualizaciones.sql (cambios idempotentes).
//   - Opcional: { "investigador": "correo" } autoriza a esa persona como
//     investigador (sin duplicados).
//   - Responde la región del servidor de la base de datos (para comprobar
//     que está en la UE). Nunca devuelve claves ni la cadena de conexión.

import pg from 'pg'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'

const Entrada = z.object({ investigador: z.string().trim().toLowerCase().pipe(z.email()).optional() }).default({})

function regionDe(url: string): string | null {
  try {
    const host = new URL(url).hostname
    return host.match(/(?:aws-\d+-)?([a-z]{2}-[a-z]+-\d)/)?.[1] ?? host.replace(/^db\./, '').split('.')[0]
  } catch {
    return null
  }
}

export async function POST(request: Request): Promise<Response> {
  const secreto = process.env.INSTALAR_SECRETO
  if (!secreto || request.headers.get('authorization') !== `Bearer ${secreto}`) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }
  const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
  if (!url) return Response.json({ ok: false, error: 'Falta POSTGRES_URL_NON_POOLING' }, { status: 500 })
  const entrada = Entrada.safeParse(await request.json().catch(() => ({})))
  if (!entrada.success) return Response.json({ ok: false, error: 'Revisa el correo.' }, { status: 400 })

  const conexion = new URL(url)
  conexion.searchParams.delete('sslmode')
  const bd = new pg.Client({ connectionString: conexion.toString(), ssl: { rejectUnauthorized: false } })
  try {
    await bd.connect()
    const [{ instalada }] = (await bd.query(`select to_regclass('public.perfiles') is not null as instalada`)).rows
    let instaladaAhora = false
    if (!instalada) {
      const sql = readFileSync(join(process.cwd(), 'supabase', 'instalacion-completa.sql'), 'utf8')
      await bd.query(sql)
      instaladaAhora = true
    } else {
      // Ya instalada: se aplican las actualizaciones idempotentes (datos
      // comprobados después de la instalación, como enlaces oficiales).
      await bd.query(readFileSync(join(process.cwd(), 'supabase', 'actualizaciones.sql'), 'utf8'))
    }
    if (entrada.data.investigador) {
      await bd.query(
        `insert into private.investigadores_autorizados (email) select $1 where not exists (select 1 from private.investigadores_autorizados where lower(email) = $1)`,
        [entrada.data.investigador],
      )
    }
    const [{ migraciones }] = (await bd.query(`select count(*)::int as migraciones from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public'`)).rows
    return Response.json({ ok: true, instaladaAhora, yaEstaba: instalada, funcionesPublicas: migraciones, region: regionDe(url) })
  } catch (e) {
    console.error('[instalar]', e)
    return Response.json({ ok: false, error: e instanceof Error ? e.message.slice(0, 300) : 'Error' }, { status: 500 })
  } finally {
    await bd.end().catch(() => {})
  }
}
