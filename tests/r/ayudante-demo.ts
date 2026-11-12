// Crea una base de datos local con los datos simulados de demostración.

import type { AddressInfo } from 'node:net'
import pg from 'pg'
// @ts-expect-error: módulo JavaScript sin tipos
import { crearBaseDeDatos, urlDe } from '../../scripts/local/bd.mjs'
import { CLAVE_SERVIDOR_LOCAL, crearServidor } from '../../scripts/local/servidor-local.mjs'
import { clienteServidor, crearAlmacenSupabase } from '../../servidor/almacen-supabase'
import { generarDemo } from '../../scripts/demo/generar-demo'

export async function baseDeDatosDemo(nombre: string) {
  await crearBaseDeDatos(nombre)
  const servidor = crearServidor({ baseDeDatos: nombre, silencioso: true })
  await new Promise<void>((ok) => servidor.listen(0, ok))
  const almacen = crearAlmacenSupabase(clienteServidor(`http://localhost:${(servidor.address() as AddressInfo).port}`, CLAVE_SERVIDOR_LOCAL))
  const bd = new pg.Client({ connectionString: urlDe(nombre) })
  await bd.connect()
  try {
    return await generarDemo({ bd, almacen })
  } finally {
    await bd.end()
    await new Promise((ok) => servidor.close(ok))
  }
}
