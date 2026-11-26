// Puente al doctorado, cuestionarios (pretest y postest) y recordatorios.

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { escenarioBasico, nuevaBd, type Bd, type Escenario } from './ayudantes'

let bd: Bd
let e: Escenario

beforeAll(async () => {
  bd = await nuevaBd('fase5')
  e = await escenarioBasico(bd)
  for (const u of [e.estudianteA, e.estudianteB, e.estudianteC, e.tutor, e.tutorB]) {
    await bd.rpc(u, 'aceptar_consentimiento', { p_version: 1 })
  }
  // Semana 1: lunes 1 de febrero de 2027. Semana 11: del 12 al 18 de abril.
  await bd.rpc(e.investigador, 'configurar_estudio', { p_fecha_inicio: '2027-02-01', p_semanas: 10, p_dia_apertura: 1, p_dia_cierre: 7 })
})

afterAll(async () => {
  await bd?.cerrar()
})

describe('Puente al doctorado', () => {
  it('está desactivado por defecto y el estudiante lo activa cuando quiere', async () => {
    expect((await bd.rpc(e.estudianteA, 'mi_puente')).activado).toBe(false)
    await bd.rpc(e.estudianteA, 'cambiar_puente', { p_activado: true })
    expect((await bd.rpc(e.estudianteA, 'mi_puente')).activado).toBe(true)
    const cambios = await bd.admin(`select activado from public.puente_cambios where estudiante_id = $1`, [e.estudianteA])
    expect(cambios).toEqual([{ activado: true }])
  })

  it('el tutor no puede activarlo ni consultarlo', async () => {
    await expect(bd.rpc(e.tutor, 'mi_puente')).rejects.toThrow(/No tienes permiso/)
    await expect(bd.rpc(e.tutor, 'cambiar_puente', { p_activado: true })).rejects.toThrow(/No tienes permiso/)
    await expect(bd.como(e.tutor, `select * from public.puente_cambios`)).rejects.toThrow(/permission denied/)
  })

  it('las convocatorias llevan su enlace oficial, sin fechas y con lo de 2027 pendiente', async () => {
    const { convocatorias } = await bd.rpc(e.estudianteA, 'mi_puente')
    expect(convocatorias).toHaveLength(6)
    for (const c of convocatorias) {
      expect(c.fecha_apertura).toBeNull()
      expect(c.fecha_cierre).toBeNull()
      expect(c.enlace).toMatch(/^https:\/\//)
      expect(c.estado).toContain('[PENDIENTE')
    }
  })

  it('solo el investigador edita las convocatorias, con fechas coherentes', async () => {
    const [fpu] = await bd.rpc(e.investigador, 'listar_convocatorias')
    await expect(bd.rpc(e.tutor, 'guardar_convocatoria', { p_convocatoria: JSON.stringify({ ...fpu }) })).rejects.toThrow(/No tienes permiso/)
    await expect(bd.rpc(e.investigador, 'guardar_convocatoria', {
      p_convocatoria: JSON.stringify({ ...fpu, fecha_apertura: '2027-03-10', fecha_cierre: '2027-03-01' }),
    })).rejects.toThrow(/anterior a la de apertura/)
    await bd.rpc(e.investigador, 'guardar_convocatoria', {
      p_convocatoria: JSON.stringify({ ...fpu, fecha_apertura: '2027-02-25', fecha_cierre: '2027-03-25' }),
    })
    const [editada] = await bd.rpc(e.investigador, 'listar_convocatorias')
    expect(editada.fecha_apertura).toBe('2027-02-25')
  })

  it('el servidor recibe, para cada pareja, solo si Puente está activado', async () => {
    const d = await bd.servidor('servicio_datos_puente', { p_estudio_id: (await bd.admin(`select id from public.estudios`))[0].id, p_semana: 2 })
    expect(d.referencia).toBe('2027-02-15')
    const a = d.parejas.find((p: any) => p.pareja_id === e.parejaA)
    expect(a).toEqual({ pareja_id: e.parejaA, activado: true })
    expect(JSON.stringify(d.parejas)).not.toMatch(/nombre|email|@/)
  })

  it('la línea se muestra aunque esa semana no haya agenda, y se registra que se vio', async () => {
    const [{ id: estudio }] = await bd.admin(`select id from public.estudios`)
    const linea = 'Se acerca el plazo de FPU. ¿Lo comentáis en la próxima tutoría?'
    await bd.servidor('servicio_registrar_sorteos', {
      p_estudio_id: estudio, p_semana: 1, p_desajustes: '[]',
      p_sorteos: JSON.stringify([{ pareja_id: e.parejaA, elegible: true, probabilidad: 0.5, semilla: 's', valor_aleatorio: 0.9, resultado: false, algoritmo_version: 'v' }]),
    })
    await bd.servidor('servicio_registrar_puente', { p_semana: 1, p_filas: JSON.stringify([{ pareja_id: e.parejaA, activado: true, linea, convocatorias: [1] }]) })
    await bd.servidor('servicio_completar_cierre', { p_estudio_id: estudio, p_semana: 1 })

    expect(await bd.rpc(e.estudianteA, 'mi_agenda')).toEqual({ estado: 'sin_agenda', semana: 1, linea_puente: linea })
    const delTutor = await bd.rpc(e.tutor, 'agendas_tutor')
    expect(delTutor.find((x: any) => x.pareja_id === e.parejaA).agenda.linea_puente).toBe(linea)
    const [ps] = await bd.admin(`select * from public.puente_semanal where pareja_id = $1 and semana = 1`, [e.parejaA])
    expect(ps.vista_estudiante_at).not.toBeNull()
    expect(ps.vista_tutor_at).not.toBeNull()
  })

  it('otro estudiante no ve la línea de Puente de una pareja ajena', async () => {
    expect(await bd.como(e.estudianteB, `select * from public.puente_semanal`)).toHaveLength(0)
  })
})

describe('Pretest y postest', () => {
  const abiertos = async (quien: string, ahora: string) => {
    bd.ahora = ahora
    const lista = await bd.rpc(quien, 'mis_cuestionarios')
    return Object.fromEntries(lista.map((c: any) => [c.clave, c.abierto]))
  }

  it('el pretest está abierto antes del inicio y durante la semana 1; el postest, en la semana 11', async () => {
    expect(await abiertos(e.estudianteA, '2027-01-20T10:00:00Z')).toEqual({ pretest: true, postest: false })
    expect(await abiertos(e.estudianteA, '2027-02-05T10:00:00Z')).toEqual({ pretest: true, postest: false })
    expect(await abiertos(e.estudianteA, '2027-02-10T10:00:00Z')).toEqual({ pretest: false, postest: false })
    expect(await abiertos(e.estudianteA, '2027-04-14T10:00:00Z')).toEqual({ pretest: false, postest: true })
    expect(await abiertos(e.estudianteA, '2027-04-20T10:00:00Z')).toEqual({ pretest: false, postest: false })
  })

  it('incluye el ítem de la hipótesis 3 y deja pendientes los de la escala validada', async () => {
    bd.ahora = '2027-01-20T10:00:00Z'
    const c = await bd.rpc(e.estudianteA, 'ver_cuestionario', { p_clave: 'pretest' })
    const h3 = c.items.find((i: any) => i.tipo === 'si_no')
    expect(h3.texto).toBe('¿Cuentas con alguna persona del ámbito académico, distinta de tu tutor/a, que te oriente sobre el doctorado?')
    expect(c.items.filter((i: any) => i.pendiente).every((i: any) => i.texto.includes('[PENDIENTE'))).toBe(true)
  })

  it('valida cada respuesta según su tipo', async () => {
    bd.ahora = '2027-01-20T10:00:00Z'
    const c = await bd.rpc(e.estudianteA, 'ver_cuestionario', { p_clave: 'pretest' })
    const [escala, sino, opcion] = c.items
    const responder = (r: Record<number, unknown>) =>
      bd.rpc(e.estudianteA, 'responder_cuestionario', { p_clave: 'pretest', p_respuestas: JSON.stringify(r) })
    await expect(responder({ [escala.id]: 3, [sino.id]: true })).rejects.toThrow(/todas las preguntas/)
    await expect(responder({ [escala.id]: 7, [sino.id]: true, [opcion.id]: 'No lo sé' })).rejects.toThrow(/fuera de la escala/)
    await expect(responder({ [escala.id]: 3, [sino.id]: 'sí', [opcion.id]: 'No lo sé' })).rejects.toThrow(/sí o no/)
    await expect(responder({ [escala.id]: 3, [sino.id]: true, [opcion.id]: 'Otra' })).rejects.toThrow(/opciones/)
    await responder({ [escala.id]: 3, [sino.id]: false, [opcion.id]: 'No lo sé' })
    const lista = await bd.rpc(e.estudianteA, 'mis_cuestionarios')
    expect(lista.find((x: any) => x.clave === 'pretest').completado).toBe(true)
    // Se puede cambiar mientras esté abierto.
    await responder({ [escala.id]: 4, [sino.id]: true, [opcion.id]: 'No lo sé' })
    const otra = await bd.rpc(e.estudianteA, 'ver_cuestionario', { p_clave: 'pretest' })
    expect(otra.items[1].respuesta).toBe(true)
  })

  it('cerrado, no se puede responder', async () => {
    bd.ahora = '2027-03-01T10:00:00Z'
    await expect(bd.rpc(e.estudianteA, 'responder_cuestionario', { p_clave: 'pretest', p_respuestas: '{}' })).rejects.toThrow(/no está abierto/)
  })

  it('las respuestas solo las ven el propio estudiante y el investigador', async () => {
    expect(await bd.como(e.estudianteB, `select * from public.cuestionario_respuestas`)).toHaveLength(0)
    expect(await bd.como(e.tutor, `select * from public.cuestionario_respuestas`)).toHaveLength(0)
    expect(await bd.como(e.direccion, `select * from public.cuestionario_respuestas`)).toHaveLength(0)
    expect((await bd.como(e.investigador, `select * from public.cuestionario_respuestas`)).length).toBe(3)
  })

  it('el tutor no tiene cuestionarios de estudiante', async () => {
    expect(await bd.rpc(e.tutor, 'mis_cuestionarios')).toEqual([])
    await expect(bd.rpc(e.tutor, 'ver_cuestionario', { p_clave: 'pretest' })).rejects.toThrow(/No tienes permiso/)
  })

  it('el investigador ve cuántas personas han respondido, no sus respuestas', async () => {
    const r = await bd.rpc(e.investigador, 'resumen_cuestionarios')
    expect(r.find((x: any) => x.clave === 'pretest')).toMatchObject({ personas: 1, items: 3, pendientes: 2 })
  })
})

describe('Recordatorios', () => {
  const pendientes = async (ahora: string) => {
    bd.ahora = ahora
    return (await bd.servidor('servicio_recordatorios_pendientes')) as any[]
  }

  it('solo el servidor puede consultarlos (contienen correos)', async () => {
    await expect(bd.rpc(e.investigador, 'servicio_recordatorios_pendientes')).rejects.toThrow(/permission denied/)
  })

  it('al abrirse la semana: a quien aún no ha respondido', async () => {
    const r = await pendientes('2027-02-10T10:00:00Z') // miércoles de la semana 2
    expect(new Set(r.map((x) => x.tipo))).toEqual(new Set(['apertura']))
    expect(r.map((x) => x.user_id).sort()).toEqual([e.estudianteA, e.estudianteB, e.estudianteC, e.tutor, e.tutorB].sort())
  })

  it('un recordatorio enviado no se repite', async () => {
    await bd.servidor('servicio_registrar_correo', { p_user_id: e.estudianteA, p_tipo: 'apertura', p_semana: 2, p_referencia: null })
    const r = await pendientes('2027-02-10T10:00:00Z')
    expect(r.map((x) => x.user_id)).not.toContain(e.estudianteA)
  })

  it('48 horas antes del cierre: solo a quien no ha respondido', async () => {
    bd.ahora = '2027-02-10T10:00:00Z'
    await bd.rpc(e.estudianteA, 'guardar_checkin_estudiante', { p_avance: 3, p_siguiente_paso: 3, p_apoyo: 3, p_bienestar: 3 })
    expect((await pendientes('2027-02-12T22:59:00Z')).every((x) => x.tipo === 'apertura')).toBe(true)
    const r = await pendientes('2027-02-13T09:00:00Z') // sábado, menos de 48 horas
    expect(new Set(r.map((x) => x.tipo))).toEqual(new Set(['cierre_48h']))
    expect(r.map((x) => x.user_id)).not.toContain(e.estudianteA)
    expect(r.map((x) => x.user_id)).toContain(e.estudianteB)
  })

  it('el tutor deja de recibirlo cuando ha respondido sobre todos sus estudiantes', async () => {
    bd.ahora = '2027-02-13T09:00:00Z'
    await bd.rpc(e.tutor, 'guardar_checkin_tutor', {
      p_respuestas: JSON.stringify([{ pareja_id: e.parejaA, avance: 3 }, { pareja_id: e.parejaB, avance: 3 }]),
    })
    expect((await pendientes('2027-02-13T09:00:00Z')).map((x) => x.user_id)).not.toContain(e.tutor)
  })

  it('quien los desactiva, o se retira, no los recibe', async () => {
    bd.ahora = '2027-02-13T09:00:00Z'
    await bd.rpc(e.estudianteB, 'cambiar_recordatorios', { p_activos: false })
    await bd.rpc(e.estudianteC, 'retirarme', { p_borrar: false })
    const r = await pendientes('2027-02-13T09:00:00Z')
    expect(r.map((x) => x.user_id)).not.toContain(e.estudianteB)
    expect(r.map((x) => x.user_id)).not.toContain(e.estudianteC)
  })

  it('fuera de una semana abierta no hay recordatorios', async () => {
    expect(await pendientes('2027-05-01T10:00:00Z')).toEqual([])
  })
})

describe('Avisos de apoyo por correo', () => {
  it('el servidor obtiene los avisos pendientes con los correos de la dirección del máster', async () => {
    bd.ahora = null
    await bd.rpc(e.estudianteA, 'pedir_apoyo', { p_compartir_nombre: false })
    const avisos = await bd.servidor('servicio_avisos_por_notificar')
    expect(avisos).toHaveLength(1)
    expect(avisos[0]).toMatchObject({ nombre_autorizado: null, destinatarios: [{ user_id: e.direccion, email: 'direccion@usal.es' }] })
    await bd.servidor('servicio_aviso_notificado', { p_aviso_id: avisos[0].aviso_id })
    expect(await bd.servidor('servicio_avisos_por_notificar')).toEqual([])
  })
})
