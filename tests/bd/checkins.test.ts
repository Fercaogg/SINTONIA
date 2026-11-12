// Tests del calendario, los check-ins, el aviso de apoyo, la retirada y el borrado.

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { escenarioBasico, nuevaBd, type Bd, type Escenario } from './ayudantes'

let bd: Bd
let e: Escenario

beforeAll(async () => {
  bd = await nuevaBd('checkins')
  e = await escenarioBasico(bd)
  for (const u of [e.estudianteA, e.estudianteB, e.estudianteC, e.tutor, e.tutorB]) {
    await bd.rpc(u, 'aceptar_consentimiento', { p_version: 1 })
  }
})

afterAll(async () => {
  await bd?.cerrar()
})

const configurar = (fecha: string | null, semanas = 10, apertura = 1, cierre = 7) =>
  bd.rpc(e.investigador, 'configurar_estudio', { p_fecha_inicio: fecha, p_semanas: semanas, p_dia_apertura: apertura, p_dia_cierre: cierre })

const estado = async (ahora: string) => {
  bd.ahora = ahora
  return bd.rpc(e.estudianteA, 'estado_semana')
}

describe('Calendario del estudio (hora de Madrid)', () => {
  it('sin fecha de inicio, el estudio no ha empezado', async () => {
    bd.ahora = null
    expect((await bd.rpc(e.estudianteA, 'estado_semana')).estado).toBe('sin_fecha')
  })

  it('solo el investigador puede configurarlo', async () => {
    await expect(bd.rpc(e.tutor, 'configurar_estudio', { p_fecha_inicio: '2027-02-01', p_semanas: 10, p_dia_apertura: 1, p_dia_cierre: 7 }))
      .rejects.toThrow(/No tienes permiso/)
  })

  it('de lunes a domingo: abre a las 00:00 y cierra a las 23:59:59 del domingo (hora de Madrid)', async () => {
    await configurar('2027-02-01')
    expect((await estado('2027-01-31T22:59:59Z')).estado).toBe('antes') // 23:59:59 del domingo en Madrid
    const s1 = await estado('2027-01-31T23:00:00Z') // lunes 1 de febrero, 00:00 en Madrid
    expect(s1).toMatchObject({ estado: 'abierta', semana: 1, semanas: 10 })
    expect(new Date(s1.cierra).toISOString()).toBe('2027-02-07T23:00:00.000Z')
    expect((await estado('2027-02-07T22:59:59Z')).semana).toBe(1)
    expect((await estado('2027-02-07T23:00:00Z')).semana).toBe(2)
  })

  it('tiene en cuenta el cambio al horario de verano', async () => {
    // La semana 8 termina el domingo 28 de marzo de 2027, día del cambio de hora.
    const s8 = await estado('2027-03-25T12:00:00Z')
    expect(s8.semana).toBe(8)
    expect(new Date(s8.cierra).toISOString()).toBe('2027-03-28T22:00:00.000Z') // 00:00 del lunes en horario de verano
  })

  it('al terminar la última semana, el estudio está terminado', async () => {
    expect((await estado('2027-04-11T21:59:59Z')).semana).toBe(10)
    expect((await estado('2027-04-11T22:00:00Z')).estado).toBe('terminado')
  })

  it('con apertura el jueves y cierre el lunes, hay días entre semanas sin check-in', async () => {
    await configurar('2027-02-01', 10, 4, 1)
    expect((await estado('2027-02-02T12:00:00Z')).estado).toBe('antes')
    expect(await estado('2027-02-04T12:00:00Z')).toMatchObject({ estado: 'abierta', semana: 1 })
    expect((await estado('2027-02-08T22:00:00Z')).semana).toBe(1) // lunes 8 a las 23:00
    const entre = await estado('2027-02-09T12:00:00Z')
    expect(entre).toMatchObject({ estado: 'entre', semana: 1, proxima: 2 })
    expect(new Date(entre.abre).toISOString()).toBe('2027-02-10T23:00:00.000Z') // jueves 11, 00:00
  })

  it('el investigador ve todas las ventanas', async () => {
    const est = await bd.rpc(e.investigador, 'ver_estudio')
    expect(est.ventanas).toHaveLength(10)
    await configurar('2027-02-01')
  })
})

describe('Check-in del estudiante', () => {
  const semana2 = '2027-02-10T10:00:00Z'

  it('sin consentimiento no se puede responder', async () => {
    await bd.admin(`update public.consentimientos set retirado_at = now() where user_id = $1`, [e.estudianteA])
    bd.ahora = semana2
    await expect(bd.rpc(e.estudianteA, 'mi_checkin')).rejects.toThrow(/consentimiento/)
    await bd.admin(`update public.consentimientos set retirado_at = null where user_id = $1`, [e.estudianteA])
  })

  it('guarda las cuatro respuestas de la semana abierta', async () => {
    bd.ahora = semana2
    const r = await bd.rpc(e.estudianteA, 'guardar_checkin_estudiante', { p_avance: 4, p_siguiente_paso: 2, p_apoyo: 5, p_bienestar: 2 })
    expect(r).toEqual({ ok: true, semana: 2, bienestar_bajo: true })
    const c = await bd.rpc(e.estudianteA, 'mi_checkin')
    expect(c.respuesta).toMatchObject({ avance: 4, siguiente_paso: 2, apoyo: 5, bienestar: 2 })
    expect(c.items.map((i: any) => i.clave)).toEqual(['avance', 'siguiente_paso', 'apoyo', 'bienestar'])
    expect(c.items[3].privado).toBe(true)
  })

  it('se puede cambiar hasta el cierre, sin crear una segunda respuesta', async () => {
    bd.ahora = '2027-02-14T22:30:00Z' // domingo 14, 23:30 en Madrid
    const r = await bd.rpc(e.estudianteA, 'guardar_checkin_estudiante', { p_avance: 3, p_siguiente_paso: 3, p_apoyo: 5, p_bienestar: 4 })
    expect(r.bienestar_bajo).toBe(false)
    const filas = await bd.admin(`select avance from public.respuestas_estudiante where pareja_id = $1 and semana = 2`, [e.parejaA])
    expect(filas).toEqual([{ avance: 3 }])
    const bien = await bd.admin(`select count(*)::int as n from public.bienestar where estudiante_id = $1 and semana = 2`, [e.estudianteA])
    expect(bien[0].n).toBe(1)
  })

  it('el bienestar bajo no genera ningún aviso', async () => {
    const avisos = await bd.admin(`select count(*)::int as n from public.avisos_apoyo`)
    expect(avisos[0].n).toBe(0)
  })

  it('cuando la semana está cerrada, no se puede responder', async () => {
    bd.ahora = '2027-04-20T10:00:00Z'
    await expect(
      bd.rpc(e.estudianteA, 'guardar_checkin_estudiante', { p_avance: 3, p_siguiente_paso: 3, p_apoyo: 3, p_bienestar: 3 }),
    ).rejects.toThrow(/no está abierto/)
  })

  it('rechaza valores fuera de la escala y respuestas incompletas', async () => {
    bd.ahora = semana2
    await expect(bd.rpc(e.estudianteA, 'guardar_checkin_estudiante', { p_avance: 6, p_siguiente_paso: 3, p_apoyo: 3, p_bienestar: 3 }))
      .rejects.toThrow(/del 1 al 5/)
    await expect(bd.rpc(e.estudianteA, 'guardar_checkin_estudiante', { p_avance: 3, p_siguiente_paso: null, p_apoyo: 3, p_bienestar: 3 }))
      .rejects.toThrow(/Responde a todas/)
  })

  it('un tutor no puede usar el check-in del estudiante', async () => {
    await expect(bd.rpc(e.tutor, 'guardar_checkin_estudiante', { p_avance: 3, p_siguiente_paso: 3, p_apoyo: 3, p_bienestar: 3 }))
      .rejects.toThrow(/No tienes permiso/)
  })

  it('el histórico muestra al estudiante sus semanas, con su bienestar', async () => {
    const h = await bd.rpc(e.estudianteA, 'mi_historial')
    expect(h.map((x: any) => x.semana)).toEqual([2, 1])
    expect(h[0].bienestar).toBe(4)
  })
})

describe('Check-in del tutor', () => {
  it('lista a sus estudiantes sin ninguna respuesta de ellos', async () => {
    bd.ahora = '2027-02-10T10:00:00Z'
    const c = await bd.rpc(e.tutor, 'checkin_tutor')
    expect(c.estudiantes.map((x: any) => x.nombre)).toEqual(['Ana', 'Bruno'])
    const texto = JSON.stringify(c)
    expect(texto).not.toContain('bienestar')
    expect(texto).not.toContain('apoyo')
    expect(c.estudiantes[0]).toEqual({ pareja_id: e.parejaA, nombre: 'Ana', avance: null, siguiente_paso: null })
  })

  it('guarda todas sus respuestas de una vez; el siguiente paso es opcional', async () => {
    const r = await bd.rpc(e.tutor, 'guardar_checkin_tutor', {
      p_respuestas: JSON.stringify([
        { pareja_id: e.parejaA, avance: 2, siguiente_paso: 4 },
        { pareja_id: e.parejaB, avance: 3, siguiente_paso: null },
      ]),
    })
    expect(r).toEqual({ ok: true, semana: 2, guardadas: 2 })
    const c = await bd.rpc(e.tutor, 'checkin_tutor')
    expect(c.estudiantes.map((x: any) => [x.avance, x.siguiente_paso])).toEqual([[2, 4], [3, null]])
  })

  it('no puede responder sobre estudiantes de otro tutor, y entonces no guarda nada', async () => {
    await expect(bd.rpc(e.tutor, 'guardar_checkin_tutor', {
      p_respuestas: JSON.stringify([
        { pareja_id: e.parejaA, avance: 5 },
        { pareja_id: e.parejaC, avance: 1 },
      ]),
    })).rejects.toThrow(/no está en tu lista/)
    const c = await bd.rpc(e.tutor, 'checkin_tutor')
    expect(c.estudiantes[0].avance).toBe(2)
  })

  it('exige el avance de cada estudiante incluido', async () => {
    await expect(bd.rpc(e.tutor, 'guardar_checkin_tutor', { p_respuestas: JSON.stringify([{ pareja_id: e.parejaA }]) }))
      .rejects.toThrow(/Responde a todas/)
  })
})

describe('Necesito apoyo', () => {
  it('sin autorizar el nombre, la dirección recibe el aviso sin saber quién es', async () => {
    await bd.rpc(e.estudianteA, 'pedir_apoyo', { p_compartir_nombre: false })
    const avisos = await bd.rpc(e.direccion, 'avisos_apoyo_direccion')
    expect(avisos).toHaveLength(1)
    expect(avisos[0].nombre).toBeNull()
    const texto = JSON.stringify(avisos)
    expect(texto).not.toContain(e.estudianteA)
    expect(texto).not.toContain('Ana')
  })

  it('pulsar varias veces no duplica el aviso', async () => {
    const r = await bd.rpc(e.estudianteA, 'pedir_apoyo', { p_compartir_nombre: false })
    expect(r.duplicado).toBe(true)
  })

  it('si después decide compartir su nombre, se añade al mismo aviso', async () => {
    await bd.rpc(e.estudianteA, 'pedir_apoyo', { p_compartir_nombre: true })
    const avisos = await bd.rpc(e.direccion, 'avisos_apoyo_direccion')
    expect(avisos).toHaveLength(1)
    expect(avisos[0].nombre).toBe('Ana')
  })

  it('si lo autoriza, la dirección ve su nombre', async () => {
    await bd.rpc(e.estudianteB, 'pedir_apoyo', { p_compartir_nombre: true })
    const avisos = await bd.rpc(e.direccion, 'avisos_apoyo_direccion')
    expect(avisos.map((a: any) => a.nombre)).toContain('Bruno')
  })

  it('la dirección no puede leer la tabla de avisos directamente', async () => {
    expect((await bd.como(e.direccion, `select * from public.avisos_apoyo`))).toHaveLength(0)
  })

  it('el tutor no recibe ni puede consultar los avisos', async () => {
    await expect(bd.rpc(e.tutor, 'avisos_apoyo_direccion')).rejects.toThrow(/No tienes permiso/)
  })

  it('la dirección marca un aviso como atendido', async () => {
    const [primero] = await bd.rpc(e.direccion, 'avisos_apoyo_direccion')
    await bd.rpc(e.direccion, 'marcar_aviso_atendido', { p_id: primero.id })
    const avisos = await bd.rpc(e.direccion, 'avisos_apoyo_direccion')
    expect(avisos.find((a: any) => a.id === primero.id).atendido_at).not.toBeNull()
  })
})

describe('Mi cuenta: acceso, retirada y borrado', () => {
  it('el estudiante descarga todos sus datos, y queda registrado', async () => {
    const datos = await bd.rpc(e.estudianteA, 'mis_datos')
    expect(datos.identidad.nombre).toBe('Ana')
    expect(datos.respuestas_como_estudiante.map((r: any) => r.semana)).toEqual([1, 2])
    expect(datos.respuestas_como_estudiante[0].bienestar).toBe(2)
    const audit = await bd.admin(`select accion from public.auditoria where actor_id = $1`, [e.estudianteA])
    expect(audit.map((a) => a.accion)).toContain('descarga_mis_datos')
  })

  it('el tutor descarga sus datos sin el bienestar de nadie', async () => {
    const datos = await bd.rpc(e.tutor, 'mis_datos')
    expect(datos.respuestas_como_tutor.length).toBeGreaterThan(0)
    expect(JSON.stringify(datos)).not.toContain('bienestar":2')
  })

  it('retirarse sin borrar: deja de participar y sus respuestas se conservan', async () => {
    await bd.rpc(e.estudianteB, 'retirarme', { p_borrar: false })
    await expect(bd.rpc(e.estudianteB, 'mi_checkin')).rejects.toThrow(/No tienes permiso/)
    expect((await bd.rpc(e.estudianteB, 'mi_perfil')).retirado).toBe(true)
    const n = await bd.admin(`select count(*)::int as n from public.respuestas_estudiante where pareja_id = $1`, [e.parejaB])
    expect(n[0].n).toBe(1)
    const lista = await bd.rpc(e.tutor, 'mis_estudiantes')
    expect(lista.map((x: any) => x.nombre)).toEqual(['Ana'])
  })

  it('retirarse y borrar: desaparece todo, también lo que el tutor respondió sobre él', async () => {
    const r = await bd.rpc(e.estudianteA, 'retirarme', { p_borrar: true })
    expect(r).toMatchObject({ ok: true, borrado: true, cuenta_borrada: true })
    for (const [tabla, col, valor] of [
      ['respuestas_estudiante', 'pareja_id', e.parejaA],
      ['respuestas_tutor', 'pareja_id', e.parejaA],
      ['bienestar', 'estudiante_id', e.estudianteA],
      ['avisos_apoyo', 'estudiante_id', e.estudianteA],
      ['identidades', 'user_id', e.estudianteA],
      ['perfiles', 'user_id', e.estudianteA],
      ['consentimientos', 'user_id', e.estudianteA],
    ]) {
      const f = await bd.admin(`select count(*)::int as n from public.${tabla} where ${col} = $1`, [valor])
      expect(f[0].n, tabla).toBe(0)
    }
    expect(await bd.admin(`select id from auth.users where id = $1`, [e.estudianteA])).toHaveLength(0)
  })

  it('si un tutor borra su cuenta, sus estudiantes conservan sus propios datos', async () => {
    await bd.rpc(e.tutorB, 'retirarme', { p_borrar: true })
    const [p] = await bd.admin(`select tutor_id from public.parejas where id = $1`, [e.parejaC])
    expect(p.tutor_id).toBeNull()
    expect((await bd.admin(`select count(*)::int as n from public.respuestas_tutor where pareja_id = $1`, [e.parejaC]))[0].n).toBe(0)
    expect((await bd.admin(`select count(*)::int as n from public.respuestas_estudiante where pareja_id = $1`, [e.parejaC]))[0].n).toBe(1)
  })

  it('la dirección no puede usar la retirada del estudio', async () => {
    await expect(bd.rpc(e.direccion, 'retirarme', { p_borrar: false })).rejects.toThrow(/estudiantes y tutores/)
  })
})
