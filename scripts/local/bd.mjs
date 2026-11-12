// Utilidades para crear una base de datos local que se comporta como Supabase.
// Se usan en los tests y en el entorno de desarrollo local. No se usan en
// producción: allí las migraciones se aplican en Supabase.

import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

export const URL_ADMIN = process.env.LOCAL_PG_URL || 'postgresql://postgres:postgres@localhost:5432/postgres'

export function urlDe(nombreBd) {
  const url = new URL(URL_ADMIN)
  url.pathname = '/' + nombreBd
  return url.toString()
}

export function migraciones() {
  const carpeta = join(raiz, 'supabase', 'migrations')
  return readdirSync(carpeta)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => ({ nombre: f, sql: readFileSync(join(carpeta, f), 'utf8') }))
}

// Crea (o recrea) una base de datos y le aplica el simulador y las migraciones.
export async function crearBaseDeDatos(nombreBd, { extras = [] } = {}) {
  if (!/^[a-z0-9_]+$/.test(nombreBd)) throw new Error('Nombre de base de datos no válido')
  const admin = new pg.Client({ connectionString: URL_ADMIN })
  await admin.connect()
  await admin.query(`drop database if exists ${nombreBd} with (force)`)
  await admin.query(`create database ${nombreBd}`)
  await admin.end()

  const cliente = new pg.Client({ connectionString: urlDe(nombreBd) })
  await cliente.connect()
  try {
    await cliente.query(readFileSync(join(raiz, 'supabase', 'local', 'simulador-supabase.sql'), 'utf8'))
    for (const m of migraciones()) {
      try {
        await cliente.query(m.sql)
      } catch (e) {
        throw new Error(`Error en la migración ${m.nombre}: ${e.message}`)
      }
    }
    for (const sql of extras) await cliente.query(sql)
  } finally {
    await cliente.end()
  }
  return urlDe(nombreBd)
}

export async function borrarBaseDeDatos(nombreBd) {
  const admin = new pg.Client({ connectionString: URL_ADMIN })
  await admin.connect()
  await admin.query(`drop database if exists ${nombreBd} with (force)`)
  await admin.end()
}
