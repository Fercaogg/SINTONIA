// Cotutoría y cambio de tutor (Reglamento de TFM de la USAL, art. 4.3, 4.7 y 4.9).

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { escenarioBasico, nuevaBd, registrar, type Bd, type Escenario } from './ayudantes'

let bd: Bd
let e: Escenario
let tutor2: string
let tutor3: string
let tutor4: string

beforeAll(async () => {
  bd = await nuevaBd('cotutoria')
  e = await escenarioBasico(bd)
  const codigos = await bd.rpc(e.investigador, 'crear_codigos', { p_master_id: e.master, p_rol: 'tutor', p_cantidad: 3 })
  tutor2 = await registrar(bd, 'tutor2@usal.es', { codigo: codigos[0], nombre: 'Tutor Dos A' })
  tutor3 = await registrar(bd, 'tutor3@usal.es', { codigo: codigos[1], nombre: 'Tutor Tres A' })
  tutor4 = await registrar(bd, 'tutor4@usal.es', { codigo: codigos[2], nombre: 'Tutor Cuatro A' })
  for (const u of [e.tutor, tutor2, tutor3, tutor4, e.estudianteA, e.estudianteB]) await bd.rpc(u, 'aceptar_consentimiento', { p_version: 1 })
  await bd.rpc(e.investigador, 'configurar_estudio', { p_fecha_inicio: '2027-02-01', p_semanas: 10, p_dia_apertura: 1, p_dia_cierre: 7 })
  bd.ahora = '2027-02-10T10:00:00Z'
})

afterAll(async () => {
  await bd?.cerrar()
})

describe('Gestión de cotutores (investigador)', () => {
  it('solo el investigador puede asignarlos', async () => {
    await expect(bd.rpc(e.tutor, 'asignar_cotutor', { p_pareja_id: e.parejaA, p_tutor_id: tutor2 })).rejects.toThrow(/No tienes permiso/)
  })

  it('asigna hasta dos cotutores del mismo máster', async () => {
    await bd.rpc(e.investigador, 'asignar_cotutor', { p_pareja_id: e.parejaA, p_tutor_id: tutor2 })
    await bd.rpc(e.investigador, 'asignar_cotutor', { p_pareja_id: e.parejaA, p_tutor_id: tutor3 })
    await expect(bd.rpc(e.investigador, 'asignar_cotutor', { p_pareja_id: e.parejaA, p_tutor_id: tutor4 })).rejects.toThrow(/como máximo dos cotutores/)
    const [a] = (await bd.rpc(e.investigador, 'listar_parejas', { p_master_id: e.master })).filter((p: any) => p.pareja_id === e.parejaA)
    expect(a.cotutores).toHaveLength(2)
    expect(JSON.stringify(a)).not.toMatch(/Ana|Tutor Dos/)
  })

  it('no admite al tutor principal ni a tutores de otro máster', async () => {
    await expect(bd.rpc(e.investigador, 'asignar_cotutor', { p_pareja_id: e.parejaB, p_tutor_id: e.tutor })).rejects.toThrow(/tutor principal/)
    await expect(bd.rpc(e.investigador, 'asignar_cotutor', { p_pareja_id: e.parejaB, p_tutor_id: e.tutorB })).rejects.toThrow(/de este máster/)
  })
})

describe('El cotutor participa como un tutor más', () => {
  it('ve al estudiante en su lista, marcado como cotutoría', async () => {
    const lista = await bd.rpc(tutor2, 'mis_estudiantes')
    expect(lista).toEqual([{ pareja_id: e.parejaA, nombre: 'Ana', cotutor: true }])
  })

  it('hace su propio check-in sobre ese estudiante', async () => {
    await bd.rpc(tutor2, 'guardar_checkin_tutor', { p_respuestas: JSON.stringify([{ pareja_id: e.parejaA, avance: 1 }]) })
    await bd.rpc(e.tutor, 'guardar_checkin_tutor', {
      p_respuestas: JSON.stringify([{ pareja_id: e.parejaA, avance: 4 }, { pareja_id: e.parejaB, avance: 3 }]),
    })
    const filas = await bd.admin(`select tutor_id, principal, avance from public.respuestas_tutor where pareja_id = $1 and semana = 2 order by avance`, [e.parejaA])
    expect(filas).toEqual([{ tutor_id: tutor2, principal: false, avance: 1 }, { tutor_id: e.tutor, principal: true, avance: 4 }])
  })

  it('cada tutor ve solo sus propias respuestas, no las del otro', async () => {
    const delCotutor = await bd.como(tutor2, `select tutor_id from public.respuestas_tutor`)
    expect(delCotutor.every((f) => f.tutor_id === tutor2)).toBe(true)
    const delPrincipal = await bd.como(e.tutor, `select tutor_id from public.respuestas_tutor`)
    expect(delPrincipal.every((f) => f.tutor_id === e.tutor)).toBe(true)
    const c = await bd.rpc(tutor2, 'checkin_tutor')
    expect(c.estudiantes[0].avance).toBe(1)
  })

  it('tampoco ve el bienestar ni las respuestas del estudiante', async () => {
    expect(await bd.como(tutor2, `select * from public.bienestar`)).toHaveLength(0)
    expect(await bd.como(tutor2, `select * from public.respuestas_estudiante`)).toHaveLength(0)
  })

  it('ve la agenda de la pareja', async () => {
    const agendas = await bd.rpc(tutor2, 'agendas_tutor')
    expect(agendas.map((a: any) => a.pareja_id)).toEqual([e.parejaA])
  })

  it('no puede responder sobre estudiantes de los que no es tutor', async () => {
    await expect(bd.rpc(tutor2, 'guardar_checkin_tutor', { p_respuestas: JSON.stringify([{ pareja_id: e.parejaB, avance: 3 }]) }))
      .rejects.toThrow(/no está en tu lista/)
  })

  it('el recordatorio le cuenta como pendiente hasta que responde sobre todas sus parejas', async () => {
    const r = await bd.servidor('servicio_recordatorios_pendientes')
    const ids = r.map((x: any) => x.user_id)
    expect(ids).not.toContain(tutor2) // ya respondió
    expect(ids).toContain(tutor3) // cotutor que aún no ha respondido
  })

  it('al quitarlo, deja de ver al estudiante (sus respuestas se conservan)', async () => {
    await bd.rpc(e.investigador, 'quitar_cotutor', { p_pareja_id: e.parejaA, p_tutor_id: tutor3 })
    expect(await bd.rpc(tutor3, 'mis_estudiantes')).toEqual([])
  })
})

describe('Cambio de tutor principal', () => {
  it('el nuevo tutor pasa a ser el principal y el cambio queda registrado', async () => {
    await bd.rpc(e.investigador, 'cambiar_tutor', { p_pareja_id: e.parejaB, p_tutor_id: tutor4 })
    const [p] = await bd.admin(`select tutor_id from public.parejas where id = $1`, [e.parejaB])
    expect(p.tutor_id).toBe(tutor4)
    const [c] = await bd.admin(`select tutor_anterior, tutor_nuevo from public.cambios_tutor where pareja_id = $1`, [e.parejaB])
    expect(c).toEqual({ tutor_anterior: e.tutor, tutor_nuevo: tutor4 })
    const audit = await bd.admin(`select accion from public.auditoria where accion = 'tutor_cambiado'`)
    expect(audit).toHaveLength(1)
  })

  it('el tutor anterior deja de verlo, pero sus respuestas anteriores se conservan', async () => {
    const lista = await bd.rpc(e.tutor, 'mis_estudiantes')
    expect(lista.map((x: any) => x.pareja_id)).not.toContain(e.parejaB)
    const filas = await bd.admin(`select count(*)::int as n from public.respuestas_tutor where pareja_id = $1 and tutor_id = $2`, [e.parejaB, e.tutor])
    expect(filas[0].n).toBeGreaterThan(0)
  })

  it('si el nuevo principal era cotutor, deja de serlo', async () => {
    await bd.rpc(e.investigador, 'cambiar_tutor', { p_pareja_id: e.parejaA, p_tutor_id: tutor2 })
    const lista = await bd.rpc(tutor2, 'mis_estudiantes')
    expect(lista).toEqual([{ pareja_id: e.parejaA, nombre: 'Ana', cotutor: false }])
  })
})

describe('Exportación con cotutoría', () => {
  it('el archivo de tutores tiene una fila por pareja, semana y tutor', async () => {
    const filas = await bd.rpc(e.investigador, 'exportar_tutores')
    const deA = filas.filter((f: any) => f.semana === 2 && f.tutor_principal !== undefined && f.id_pareja.startsWith('P-'))
    expect(deA.length).toBeGreaterThanOrEqual(3)
    expect(JSON.stringify(filas)).not.toMatch(/Ana|Tutor Dos|@usal/)
  })

  it('el archivo semanal toma las columnas del tutor principal y cuenta los cotutores que respondieron', async () => {
    const filas = await bd.rpc(e.investigador, 'exportar_investigacion')
    const [pa] = await bd.admin(`select seudonimo from public.parejas where id = $1`, [e.parejaA])
    const fila = filas.find((f: any) => f.id_pareja === pa.seudonimo && f.semana === 2)
    expect(fila.tut_avance).toBe(4)
    expect(fila.cotutores_respondieron).toBe(1)
  })

  it('los cambios de tutor se exportan con seudónimos', async () => {
    const cambios = await bd.rpc(e.investigador, 'exportar_cambios_tutor')
    expect(cambios).toHaveLength(2)
    expect(cambios[0].id_tutor_nuevo).toMatch(/^T-/)
  })
})

describe('Retirada de un cotutor', () => {
  it('si un tutor borra su cuenta, desaparecen sus respuestas y su cotutoría; el resto se conserva', async () => {
    await bd.rpc(e.investigador, 'asignar_cotutor', { p_pareja_id: e.parejaA, p_tutor_id: tutor3 })
    await bd.rpc(tutor3, 'retirarme', { p_borrar: true })
    expect((await bd.admin(`select count(*)::int as n from public.cotutores where tutor_id = $1`, [tutor3]))[0].n).toBe(0)
    expect((await bd.admin(`select count(*)::int as n from public.respuestas_tutor where pareja_id = $1`, [e.parejaA]))[0].n).toBeGreaterThan(0)
  })
})
