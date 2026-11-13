// Calendario: quién puede anotar y quién ve cada anotación.

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { escenarioBasico, nuevaBd, registrar, type Bd, type Escenario } from './ayudantes'

let bd: Bd
let e: Escenario
let cotutor: string

const DESDE = '2027-02-01'
const HASTA = '2027-02-28'

const titulos = async (uid: string) =>
  ((await bd.rpc(uid, 'mi_calendario', { p_desde: DESDE, p_hasta: HASTA })).eventos as any[]).map((x) => x.titulo).sort()

const guardar = (uid: string, evento: Record<string, unknown>) =>
  bd.rpc(uid, 'guardar_evento', { p_evento: JSON.stringify({ tipo: 'otro', fecha: '2027-02-10', ...evento }) })

beforeAll(async () => {
  bd = await nuevaBd('calendario')
  e = await escenarioBasico(bd)
  const [codigo] = await bd.rpc(e.investigador, 'crear_codigos', { p_master_id: e.master, p_rol: 'tutor' })
  cotutor = await registrar(bd, 'cotutor@usal.es', { codigo, nombre: 'Cotutor Uno' })
  for (const u of [e.tutor, e.tutorB, cotutor, e.estudianteA, e.estudianteB, e.estudianteC]) {
    await bd.rpc(u, 'aceptar_consentimiento', { p_version: 1 })
  }
  await bd.rpc(e.investigador, 'asignar_cotutor', { p_pareja_id: e.parejaA, p_tutor_id: cotutor })

  await guardar(e.estudianteA, { titulo: 'Privado de Ana', ambito: 'privado' })
  await guardar(e.estudianteA, { titulo: 'Tutoría (de Ana)', tipo: 'tutoria', ambito: 'pareja', hora_inicio: '10:00', hora_fin: '11:00' })
  await guardar(e.tutor, { titulo: 'Entrega de Bruno', tipo: 'entrega', ambito: 'pareja', pareja_id: e.parejaB })
  await guardar(e.tutor, { titulo: 'Privado de la tutora', ambito: 'privado' })
  await guardar(e.direccion, { titulo: 'Congreso del máster A', tipo: 'congreso', ambito: 'master', fecha: '2027-02-15', fecha_fin: '2027-02-17' })
  await guardar(e.investigador, { titulo: 'Seminario del máster B', tipo: 'evento', ambito: 'master', master_id: e.masterB })
})

afterAll(async () => {
  await bd?.cerrar()
})

describe('Quién ve cada anotación', () => {
  it('el estudiante ve lo suyo, lo de su pareja y lo de su máster', async () => {
    expect(await titulos(e.estudianteA)).toEqual(['Congreso del máster A', 'Privado de Ana', 'Tutoría (de Ana)'])
    expect(await titulos(e.estudianteB)).toEqual(['Congreso del máster A', 'Entrega de Bruno'])
  })

  it('el tutor y el cotutor ven lo de sus parejas, pero no lo privado del estudiante', async () => {
    expect(await titulos(e.tutor)).toEqual(['Congreso del máster A', 'Entrega de Bruno', 'Privado de la tutora', 'Tutoría (de Ana)'])
    expect(await titulos(cotutor)).toEqual(['Congreso del máster A', 'Tutoría (de Ana)'])
  })

  it('la dirección y el investigador no ven nada de las parejas ni lo privado', async () => {
    expect(await titulos(e.direccion)).toEqual(['Congreso del máster A'])
    expect(await titulos(e.investigador)).toEqual(['Congreso del máster A', 'Seminario del máster B'])
  })

  it('otro máster no ve los eventos de este', async () => {
    expect(await titulos(e.estudianteC)).toEqual(['Seminario del máster B'])
    expect(await titulos(e.tutorB)).toEqual(['Seminario del máster B'])
  })

  it('las reglas de la tabla (RLS) dicen lo mismo que la función', async () => {
    const filas = await bd.como(e.direccion, `select titulo from public.eventos order by titulo`)
    expect(filas.map((f) => f.titulo)).toEqual(['Congreso del máster A'])
    const anon = await bd.como(null, `select count(*)::int as n from public.eventos`).catch(() => [{ n: 0 }])
    expect(anon[0].n).toBe(0)
  })

  it('el tutor sabe con qué estudiante es y quién lo anotó', async () => {
    const { eventos } = await bd.rpc(e.tutor, 'mi_calendario', { p_desde: DESDE, p_hasta: HASTA })
    const tutoria = eventos.find((x: any) => x.titulo === 'Tutoría (de Ana)')
    expect(tutoria).toMatchObject({ con: 'Ana', autor: 'Ana', mio: false, editable: false, hora_inicio: '10:00', hora_fin: '11:00' })
    const congreso = eventos.find((x: any) => x.titulo === 'Congreso del máster A')
    expect(congreso).toMatchObject({ autor: 'Dirección del máster', fecha_fin: '2027-02-17' })
  })

  it('un evento de varios días aparece si se solapa con el periodo pedido', async () => {
    const { eventos } = await bd.rpc(e.estudianteA, 'mi_calendario', { p_desde: '2027-02-16', p_hasta: '2027-02-16' })
    expect(eventos.map((x: any) => x.titulo)).toEqual(['Congreso del máster A'])
  })

  it('quien se retira deja de ver el calendario, y su tutor deja de ver lo que anotó', async () => {
    const { id } = await guardar(e.estudianteB, { titulo: 'Anotado por Bruno', ambito: 'pareja' })
    expect(await titulos(e.tutor)).toContain('Anotado por Bruno')
    await bd.admin(`update public.perfiles set retirado_at = now() where user_id = $1`, [e.estudianteB])
    await expect(titulos(e.estudianteB)).rejects.toThrow(/No tienes permiso/)
    // El tutor conserva lo que anotó él mismo.
    expect(await titulos(e.tutor)).toEqual(expect.arrayContaining(['Entrega de Bruno']))
    expect(await titulos(e.tutor)).not.toContain('Anotado por Bruno')
    await bd.admin(`update public.perfiles set retirado_at = null where user_id = $1`, [e.estudianteB])
    await bd.admin(`update public.consentimientos set retirado_at = null where user_id = $1`, [e.estudianteB])
    await bd.admin(`delete from public.eventos where id = $1`, [id])
  })

  it('el calendario no aparece en la exportación de investigación', async () => {
    const datos = JSON.stringify(await bd.rpc(e.investigador, 'exportar_investigacion'))
    expect(datos).not.toMatch(/Tutoría|Entrega|Privado/)
  })
})

describe('Quién puede anotar qué', () => {
  it('sin consentimiento no se puede usar', async () => {
    await bd.admin(`update public.consentimientos set retirado_at = now() where user_id = $1`, [e.estudianteA])
    await expect(titulos(e.estudianteA)).rejects.toThrow(/consentimiento/)
    await bd.admin(`update public.consentimientos set retirado_at = null where user_id = $1`, [e.estudianteA])
  })

  it('un tutor no puede anotar en una pareja que no es suya', async () => {
    await expect(guardar(e.tutorB, { titulo: 'X', ambito: 'pareja', pareja_id: e.parejaA })).rejects.toThrow(/con qué estudiante/)
  })

  it('el estudiante siempre anota en su propia pareja, aunque pida otra', async () => {
    const { id } = await guardar(e.estudianteB, { titulo: 'Mía', ambito: 'pareja', pareja_id: e.parejaA })
    const [fila] = await bd.admin(`select pareja_id from public.eventos where id = $1`, [id])
    expect(fila.pareja_id).toBe(e.parejaB)
    await bd.rpc(e.estudianteB, 'borrar_evento', { p_id: id })
  })

  it('solo dirección e investigación publican para todo el máster', async () => {
    await expect(guardar(e.estudianteA, { titulo: 'X', ambito: 'master' })).rejects.toThrow(/dirección del máster/)
    await expect(guardar(e.tutor, { titulo: 'X', ambito: 'master' })).rejects.toThrow(/dirección del máster/)
    await expect(guardar(e.direccion, { titulo: 'X', ambito: 'pareja', pareja_id: e.parejaA })).rejects.toThrow(/Solo los estudiantes/)
  })

  it('valida tipo, título y fechas', async () => {
    await expect(guardar(e.estudianteA, { titulo: 'X', tipo: 'fiesta' })).rejects.toThrow(/tipo/)
    await expect(guardar(e.estudianteA, { titulo: '   ' })).rejects.toThrow(/título/)
    await expect(guardar(e.estudianteA, { titulo: 'X', fecha_fin: '2027-02-01' })).rejects.toThrow(/anterior/)
    await expect(guardar(e.estudianteA, { titulo: 'X', hora_inicio: '12:00', hora_fin: '11:00' })).rejects.toThrow(/anterior/)
    await expect(guardar(e.estudianteA, { titulo: 'X', fecha: 'mañana' })).rejects.toThrow(/fecha/)
  })

  it('solo quien lo anotó puede cambiarlo o borrarlo', async () => {
    const [{ id }] = await bd.admin(`select id from public.eventos where titulo = 'Tutoría (de Ana)'`)
    await expect(guardar(e.tutor, { id, titulo: 'Cambiado', ambito: 'pareja', pareja_id: e.parejaA })).rejects.toThrow(/Solo puedes cambiar/)
    await expect(bd.rpc(e.tutor, 'borrar_evento', { p_id: id })).rejects.toThrow(/Solo puedes borrar/)
    await guardar(e.estudianteA, { id, titulo: 'Tutoría con la tutora', tipo: 'tutoria', ambito: 'pareja' })
    expect(await titulos(e.tutor)).toContain('Tutoría con la tutora')
  })

  it('el investigador puede corregir eventos del máster, pero no hacerlos privados', async () => {
    const [{ id }] = await bd.admin(`select id from public.eventos where titulo = 'Congreso del máster A'`)
    await guardar(e.investigador, { id, titulo: 'Congreso del máster A (corregido)', tipo: 'congreso', ambito: 'master', master_id: e.master, fecha: '2027-02-15' })
    expect(await titulos(e.estudianteA)).toContain('Congreso del máster A (corregido)')
    await expect(guardar(e.investigador, { id, titulo: 'X', ambito: 'privado' })).rejects.toThrow(/quién lo ve/)
    await expect(bd.rpc(e.direccion, 'borrar_evento', { p_id: id })).resolves.toEqual({ borrado: true })
  })

  it('los eventos del máster quedan en la auditoría', async () => {
    const filas = await bd.admin(`select accion from public.auditoria where accion like '%evento_master' order by id`)
    expect(filas.map((f) => f.accion)).toEqual(['guardar_evento_master', 'guardar_evento_master', 'guardar_evento_master', 'borrar_evento_master'])
  })
})

describe('Plazos de convocatorias', () => {
  it('aparecen en el calendario si tienen fecha', async () => {
    await bd.admin(`update public.convocatorias set fecha_cierre = '2027-02-20' where id = (select min(id) from public.convocatorias)`)
    const { convocatorias } = await bd.rpc(e.estudianteA, 'mi_calendario', { p_desde: DESDE, p_hasta: HASTA })
    expect(convocatorias).toHaveLength(1)
    expect(convocatorias[0]).toMatchObject({ fecha: '2027-02-20' })
    expect(convocatorias[0].titulo).toMatch(/^Cierra: /)
  })
})
