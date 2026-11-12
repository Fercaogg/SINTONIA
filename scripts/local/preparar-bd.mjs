// Prepara la base de datos local de desarrollo (npm run local:db).
// Crea la base de datos "sintonia_local" desde cero, con unas pocas cuentas
// de prueba, y escribe el archivo .env.local para que la aplicación la use.
//
// Cuentas de prueba (contraseña de todas: sintonia-local):
//   investigador@usal.es, tutora@usal.es, direccion@usal.es, ana@usal.es

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import pg from 'pg'
import { crearBaseDeDatos } from './bd.mjs'
import { CLAVE_ANON_LOCAL, PUERTO_LOCAL } from './servidor-local.mjs'

const CONTRASENA = 'sintonia-local'

const nombreBd = process.env.LOCAL_BD || 'sintonia_local'
const url = await crearBaseDeDatos(nombreBd)
const c = new pg.Client({ connectionString: url })
await c.connect()

async function como(uid, sql, params = []) {
  await c.query('begin')
  await c.query('set local role authenticated')
  await c.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: uid, role: 'authenticated' })])
  const { rows } = await c.query(sql, params)
  await c.query('commit')
  return rows[0]?.r
}

async function cuenta(email, datos) {
  const { rows } = await c.query(
    `insert into auth.users (email, raw_user_meta_data, encrypted_password, email_confirmed_at)
     values ($1, $2, extensions.crypt($3, extensions.gen_salt('bf')), now()) returning id`,
    [email, JSON.stringify(datos), CONTRASENA],
  )
  return rows[0].id
}

await c.query(`insert into private.investigadores_autorizados (email) values ('investigador@usal.es')`)
const inv = await cuenta('investigador@usal.es', { nombre: 'Persona investigadora' })
const master = (await como(inv, `select public.crear_master('Máster de ejemplo') as r`)).id
const [codTutor] = await como(inv, `select public.crear_codigos($1, 'tutor', 1, null, 'Tutora de ejemplo') as r`, [master])
const [codDir] = await como(inv, `select public.crear_codigos($1, 'direccion', 1, null, 'Dirección de ejemplo') as r`, [master])
const tutora = await cuenta('tutora@usal.es', { codigo: codTutor, nombre: 'Tutora de ejemplo' })
await cuenta('direccion@usal.es', { codigo: codDir, nombre: 'Dirección de ejemplo' })
const codsEst = await como(inv, `select public.crear_codigos($1, 'estudiante', 6, $2) as r`, [master, tutora])
if (process.env.LOCAL_CODIGOS_ARCHIVO) mkdirSync(dirname(process.env.LOCAL_CODIGOS_ARCHIVO), { recursive: true })
if (process.env.LOCAL_CODIGOS_ARCHIVO) writeFileSync(process.env.LOCAL_CODIGOS_ARCHIVO, JSON.stringify({ estudiante: codsEst.slice(1) }))
const ana = await cuenta('ana@usal.es', { codigo: codsEst[0], nombre: 'Ana de ejemplo' })

// Calendario: la semana 3 está abierta hoy (de lunes a domingo, hora de Madrid).
await c.query(`update public.estudios set fecha_inicio = date_trunc('week', now() at time zone 'Europe/Madrid')::date - 14`)

// Ana ya respondió las semanas 1 y 2 (para ver su histórico).
await c.query(`insert into public.consentimientos (user_id, version) values ($1, 1)`, [ana])
const [{ id: parejaAna }] = (await c.query(`select id from public.parejas where estudiante_id = $1`, [ana])).rows
for (const [semana, av, sp, ap, bi] of [[1, 3, 2, 4, 3], [2, 4, 3, 4, 4]]) {
  await c.query(`insert into public.respuestas_estudiante (pareja_id, semana, avance, siguiente_paso, apoyo) values ($1, $2, $3, $4, $5)`, [parejaAna, semana, av, sp, ap])
  await c.query(`insert into public.bienestar (estudiante_id, semana, valor_cifrado) values ($1, $2, private.cifrar_bienestar($3))`, [ana, semana, bi])
}

// Un tutor con 8 estudiantes, para comprobar que su check-in cabe en un minuto.
const nombres8 = ['Alba Ruiz', 'Bruno Sanz', 'Carmen Vidal', 'David Pardo', 'Elena Gil', 'Fabio León', 'Gema Ortiz', 'Hugo Lara']
const [codTutor8] = await como(inv, `select public.crear_codigos($1, 'tutor', 1, null, 'Tutor con 8') as r`, [master])
const tutor8 = await cuenta('tutor8@usal.es', { codigo: codTutor8, nombre: 'Tutor de ocho' })
await c.query(`insert into public.consentimientos (user_id, version) values ($1, 1)`, [tutor8])
const cods8 = await como(inv, `select public.crear_codigos($1, 'estudiante', 8, $2) as r`, [master, tutor8])
for (const [i, nombre] of nombres8.entries()) {
  const uid = await cuenta(`est${i + 1}@usal.es`, { codigo: cods8[i], nombre })
  await c.query(`insert into public.consentimientos (user_id, version) values ($1, 1)`, [uid])
}
await c.end()

if (!process.env.LOCAL_BD) writeFileSync(
  '.env.local',
  [
    '# Generado por npm run local:db. Apunta al servidor local, no a Supabase.',
    `VITE_SUPABASE_URL=http://localhost:${PUERTO_LOCAL}`,
    `VITE_SUPABASE_ANON_KEY=${CLAVE_ANON_LOCAL}`,
    'VITE_ENTORNO_LOCAL=true',
    '',
  ].join('\n'),
)

console.log('Base de datos local lista.')
console.log(`Cuentas de prueba (contraseña: ${CONTRASENA}): investigador@usal.es, tutora@usal.es, tutor8@usal.es, direccion@usal.es, ana@usal.es`)
console.log(`Códigos de pareja libres para la tutora: ${codsEst.slice(1).join(', ')}`)
