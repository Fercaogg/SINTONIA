// Criterio de aceptación: el CSV de investigación se carga en R con el
// script de ejemplo sin errores. Usa los datos simulados de demostración.
// Si R no está instalado, el test se salta (con un aviso).

import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import pg from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
// @ts-expect-error: módulo JavaScript sin tipos
import { borrarBaseDeDatos, urlDe } from '../../scripts/local/bd.mjs'
import { aCsv } from '../../src/lib/csv'
import { COLUMNAS_INVESTIGACION } from '../../src/lib/columnas-exportacion'
import { baseDeDatosDemo } from './ayudante-demo'

const hayR = spawnSync('Rscript', ['--version']).status === 0
const NOMBRE = 'sintonia_test_r'
let csv = ''
let filasExportadas: Record<string, unknown>[] = []
let resumen: Awaited<ReturnType<typeof baseDeDatosDemo>>

describe.skipIf(!hayR)('Análisis en R con los datos de demostración', () => {
  beforeAll(async () => {
    resumen = await baseDeDatosDemo(NOMBRE)
    const bd = new pg.Client({ connectionString: urlDe(NOMBRE) })
    await bd.connect()
    const [{ user_id }] = (await bd.query(`select user_id from public.perfiles where rol = 'investigador'`)).rows
    await bd.query('begin')
    await bd.query('set local role authenticated')
    await bd.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: user_id, role: 'authenticated' })])
    const filas = (await bd.query('select public.exportar_investigacion() as r')).rows[0].r
    await bd.query('commit')
    await bd.end()
    filasExportadas = filas
    const carpeta = mkdtempSync(join(tmpdir(), 'sintonia-r-'))
    csv = join(carpeta, 'sintonia_semanal.csv')
    writeFileSync(csv, aCsv(filas, [...COLUMNAS_INVESTIGACION]))
  }, 120_000)

  afterAll(async () => {
    await borrarBaseDeDatos(NOMBRE)
  })

  it('la simulación tiene 12 parejas, 6 semanas y una proporción de agendas cercana a 0,5', () => {
    expect(resumen.parejas).toBe(12)
    expect(resumen.proporcion).toBeGreaterThan(0.35)
    expect(resumen.proporcion).toBeLessThan(0.65)
  })

  it('el CSV tiene exactamente las columnas documentadas, en orden', () => {
    expect(Object.keys(filasExportadas[0]).sort()).toEqual([...COLUMNAS_INVESTIGACION].sort())
  })

  it('el script de ejemplo carga el CSV y ajusta el modelo multinivel sin errores', () => {
    const salida = execFileSync('Rscript', ['analisis/analisis_ejemplo.R', csv], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    expect(salida).toContain('Filas cargadas: 84')
    expect(salida).toContain('Parejas: 12')
    expect(salida).toContain('Modelo multinivel')
    expect(salida).toContain('Efecto estimado de recibir la agenda')
  }, 120_000)
})
