// Prueba de integración del cierre de semana: base de datos real, el
// servidor local que imita a Supabase y la clave de servidor.

import type { AddressInfo } from 'node:net'
import type { Server } from 'node:http'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { escenarioBasico, nuevaBd, type Bd, type Escenario } from './ayudantes'
import { cerrarSemanas } from '../../servidor/cierre-semana'
import { clienteServidor, crearAlmacenSupabase } from '../../servidor/almacen-supabase'
import { CLAVE_ANON_LOCAL, CLAVE_SERVIDOR_LOCAL, crearServidor } from '../../scripts/local/servidor-local.mjs'
import { GET } from '../../api/cerrar-semana'

let bd: Bd
let e: Escenario
let servidor: Server
let url: string

beforeAll(async () => {
  bd = await nuevaBd('cierre')
  e = await escenarioBasico(bd)
  // La semana 1 empezó hace dos semanas (lunes) y ya está cerrada. Las
  // parejas existían desde antes.
  await bd.admin(`update public.estudios set fecha_inicio = date_trunc('week', now() at time zone 'Europe/Madrid')::date - 14`)
  await bd.admin(`update public.parejas set created_at = now() - interval '30 days'`)
  servidor = crearServidor({ baseDeDatos: bd.nombre, silencioso: true })
  await new Promise<void>((ok) => servidor.listen(0, ok))
  url = `http://localhost:${(servidor.address() as AddressInfo).port}`
})

afterAll(async () => {
  await new Promise((ok) => servidor?.close(ok))
  await bd?.cerrar()
})

const almacen = () => crearAlmacenSupabase(clienteServidor(url, CLAVE_SERVIDOR_LOCAL))

describe('Cierre de la semana con la base de datos', () => {
  it('solo el servidor puede usar las funciones de cierre', async () => {
    await expect(crearAlmacenSupabase(clienteServidor(url, CLAVE_ANON_LOCAL)).semanasPorCerrar()).rejects.toThrow()
    await expect(bd.rpc(e.investigador, 'servicio_semanas_por_cerrar')).rejects.toThrow(/permission denied/)
  })

  it('procesa las semanas cerradas: la 1 tiene datos y la 2, ninguno', async () => {
    const resumen = await cerrarSemanas({ almacen: almacen(), redactor: null })
    expect(resumen.map((r) => r.semana)).toEqual([1, 2])
    expect(resumen[0]).toMatchObject({ parejas: 3, elegibles: 3 })
    expect(resumen[1]).toMatchObject({ parejas: 3, elegibles: 0, con_agenda: 0 })
  })

  it('cada sorteo se guardó antes que su agenda y lleva semilla, valor y probabilidad', async () => {
    const filas = await bd.admin(`
      select s.*, a.created_at as agenda_at from public.sorteos s
      left join public.agendas a using (pareja_id, semana) where s.semana = 1`)
    expect(filas).toHaveLength(3)
    for (const f of filas) {
      expect(f.semilla).toMatch(/^[0-9a-f]{64}$/)
      expect(Number(f.probabilidad)).toBe(0.5)
      expect(f.resultado).toBe(f.valor_aleatorio < 0.5)
      if (f.resultado) expect(new Date(f.agenda_at).getTime()).toBeGreaterThanOrEqual(new Date(f.realizado_at).getTime())
      else expect(f.agenda_at).toBeNull()
    }
  })

  it('las semanas sin check-ins quedan registradas con su motivo', async () => {
    const filas = await bd.admin(`select motivo_no_elegible from public.sorteos where semana = 2`)
    expect(filas.map((f) => f.motivo_no_elegible)).toEqual(['faltan_ambos', 'faltan_ambos', 'faltan_ambos'])
  })

  it('guarda los desajustes con la versión de la regla (en el escenario, el avance difiere en 2)', async () => {
    const filas = await bd.admin(`select * from public.desajustes where semana = 1 and item = 'avance'`)
    expect(filas).toHaveLength(3)
    expect(filas.every((f) => f.diferencia === 2 && f.relevante && f.regla_version === 'v1')).toBe(true)
  })

  it('volver a ejecutarlo no repite ni cambia ningún sorteo', async () => {
    const antes = await bd.admin(`select pareja_id, semana, valor_aleatorio, resultado from public.sorteos order by 1, 2`)
    expect(await cerrarSemanas({ almacen: almacen(), redactor: null })).toEqual([])
    const despues = await bd.admin(`select pareja_id, semana, valor_aleatorio, resultado from public.sorteos order by 1, 2`)
    expect(despues).toEqual(antes)
  })

  it('se muestra la agenda de la última semana procesada (la 2, sin datos: mensaje neutro)', async () => {
    for (const est of [e.estudianteA, e.estudianteB]) {
      await bd.rpc(est, 'aceptar_consentimiento', { p_version: 1 })
      expect(await bd.rpc(est, 'mi_agenda')).toEqual({ estado: 'sin_agenda', semana: 2, linea_puente: null })
    }
  })

  it('la agenda de la semana con datos se muestra igual a los dos', async () => {
    // Se borra el cierre de la semana 2 para mostrar la de la semana 1.
    await bd.admin(`delete from public.sorteos where semana = 2`)
    await bd.admin(`delete from public.cierres_semana where semana = 2`)
    await bd.rpc(e.tutor, 'aceptar_consentimiento', { p_version: 1 })
    const delTutor = await bd.rpc(e.tutor, 'agendas_tutor')
    for (const [est, pareja] of [[e.estudianteA, e.parejaA], [e.estudianteB, e.parejaB]] as const) {
      const [s] = await bd.admin(`select resultado from public.sorteos where pareja_id = $1 and semana = 1`, [pareja])
      const mia = await bd.rpc(est, 'mi_agenda')
      const suya = delTutor.find((x: any) => x.pareja_id === pareja).agenda
      if (s.resultado) {
        expect(mia.estado).toBe('agenda')
        expect(mia.preguntas).toHaveLength(3)
        expect(suya.preguntas).toEqual(mia.preguntas)
      } else {
        expect(mia).toEqual({ estado: 'sin_agenda', semana: 1, linea_puente: null })
        expect(suya).toEqual(mia)
      }
    }
  })

  it('queda registrado cuándo vio cada uno la agenda', async () => {
    const filas = await bd.admin(`select vista_estudiante_at, vista_tutor_at from public.agendas a join public.parejas p on p.id = a.pareja_id where p.tutor_id = $1`, [e.tutor])
    for (const f of filas) {
      expect(f.vista_estudiante_at).not.toBeNull()
      expect(f.vista_tutor_at).not.toBeNull()
    }
  })

  it('ni el estudiante ni el tutor pueden leer los desajustes ni los sorteos', async () => {
    for (const u of [e.estudianteA, e.tutor, e.direccion]) {
      expect(await bd.como(u, `select * from public.desajustes`)).toHaveLength(0)
      expect(await bd.como(u, `select * from public.sorteos`)).toHaveLength(0)
    }
  })

  it('un estudiante no ve la agenda de otra pareja', async () => {
    const filas = await bd.como(e.estudianteA, `select pareja_id from public.agendas`)
    expect(filas.every((f) => f.pareja_id === e.parejaA)).toBe(true)
  })

  it('el investigador ve el resumen de los sorteos', async () => {
    const r = await bd.rpc(e.investigador, 'resumen_sorteos')
    expect(r[0]).toMatchObject({ semana: 1, parejas: 3, elegibles: 3 })
  })
})

describe('La función de Vercel', () => {
  it('sin la clave secreta del cron responde 401', async () => {
    process.env.CRON_SECRET = 'secreto-de-prueba'
    const r = await GET(new Request('http://x/api/cerrar-semana'))
    expect(r.status).toBe(401)
    const r2 = await GET(new Request('http://x/api/cerrar-semana', { headers: { authorization: 'Bearer otro' } }))
    expect(r2.status).toBe(401)
  })

  it('con la clave correcta ejecuta el cierre', async () => {
    process.env.CRON_SECRET = 'secreto-de-prueba'
    process.env.SUPABASE_URL = url
    process.env.SUPABASE_SERVICE_ROLE_KEY = CLAVE_SERVIDOR_LOCAL
    const r = await GET(new Request('http://x/api/cerrar-semana', { headers: { authorization: 'Bearer secreto-de-prueba' } }))
    expect(r.status).toBe(200)
    expect((await r.json()).ok).toBe(true)
  })
})
