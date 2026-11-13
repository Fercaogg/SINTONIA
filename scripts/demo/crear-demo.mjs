// Crea la instalación de DEMOSTRACIÓN (datos ficticios).
//
//   npm run demo:local     base de datos local "sintonia_demo" (para probar en tu ordenador)
//   npm run demo:remoto    proyecto de Supabase de demostración (ver README)
//
// En remoto necesita estas variables (NUNCA las del proyecto real):
//   DEMO_DATABASE_URL                cadena de conexión de la base de datos de demostración
//   DEMO_SUPABASE_URL                dirección del proyecto de demostración
//   DEMO_SUPABASE_SERVICE_ROLE_KEY   clave de servidor del proyecto de demostración
// Añade --reiniciar para vaciarla y generarla de nuevo (solo si ya es de demostración).

import { writeFileSync } from 'node:fs'
import pg from 'pg'
import { crearBaseDeDatos, urlDe } from '../local/bd.mjs'
import { CLAVE_ANON_LOCAL, CLAVE_SERVIDOR_LOCAL, PUERTO_LOCAL, crearServidor } from '../local/servidor-local.mjs'
import { clienteServidor, crearAlmacenSupabase } from '../../servidor/almacen-supabase.ts'
import { generarDemo, CONTRASENA_DEMO, CUENTAS_DEMO } from './generar-demo.ts'

const remoto = process.argv.includes('--remoto')
// En local la base de datos se crea siempre de cero, así que --reiniciar solo
// hace falta (y solo se usa) con --remoto.
const reiniciar = remoto && process.argv.includes('--reiniciar')

let bd, almacen, cerrar = async () => {}
if (remoto) {
  const { DEMO_DATABASE_URL, DEMO_SUPABASE_URL, DEMO_SUPABASE_SERVICE_ROLE_KEY } = process.env
  if (!DEMO_DATABASE_URL || !DEMO_SUPABASE_URL || !DEMO_SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Faltan DEMO_DATABASE_URL, DEMO_SUPABASE_URL o DEMO_SUPABASE_SERVICE_ROLE_KEY.')
    process.exit(1)
  }
  bd = new pg.Client({ connectionString: DEMO_DATABASE_URL, ssl: { rejectUnauthorized: false } })
  almacen = crearAlmacenSupabase(clienteServidor(DEMO_SUPABASE_URL, DEMO_SUPABASE_SERVICE_ROLE_KEY))
} else {
  await crearBaseDeDatos('sintonia_demo')
  const servidor = crearServidor({ baseDeDatos: 'sintonia_demo', silencioso: true })
  await new Promise((ok) => servidor.listen(0, ok))
  bd = new pg.Client({ connectionString: urlDe('sintonia_demo') })
  almacen = crearAlmacenSupabase(clienteServidor(`http://localhost:${servidor.address().port}`, CLAVE_SERVIDOR_LOCAL))
  cerrar = () => new Promise((ok) => servidor.close(ok))
  writeFileSync('.env.demo.local', [
    '# Generado por npm run demo:local. Demostración local con datos ficticios.',
    `VITE_SUPABASE_URL=http://localhost:${PUERTO_LOCAL}`,
    `VITE_SUPABASE_ANON_KEY=${CLAVE_ANON_LOCAL}`,
    'VITE_MODO_DEMO=true',
    '',
  ].join('\n'))
}

await bd.connect()
try {
  const r = await generarDemo({ bd, almacen, reiniciar })
  console.log(`Demostración creada: ${r.parejas} parejas, ${r.semanas} semanas, ${r.con_agenda} de ${r.elegibles} sorteos con agenda (${r.proporcion.toFixed(2)}).`)
  console.log(`Cuentas (contraseña ${CONTRASENA_DEMO}):`, Object.values(CUENTAS_DEMO).join(', '))
  if (!remoto) console.log('Arranca: npm run demo:servidor  y, en otra terminal,  npm run demo:app')
} finally {
  await bd.end()
  await cerrar()
}
