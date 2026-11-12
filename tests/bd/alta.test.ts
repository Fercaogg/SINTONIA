// Tests del registro con código, del consentimiento y de las funciones del
// investigador.

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { escenarioBasico, nuevaBd, registrar, type Bd, type Escenario } from './ayudantes'

let bd: Bd
let e: Escenario

beforeAll(async () => {
  bd = await nuevaBd('alta')
  e = await escenarioBasico(bd)
})

afterAll(async () => {
  await bd?.cerrar()
})

describe('Registro con código', () => {
  it('sin código no se puede crear una cuenta', async () => {
    await expect(registrar(bd, 'sin.codigo@usal.es', { nombre: 'X' })).rejects.toThrow(/código de acceso/)
  })

  it('con un código inventado tampoco', async () => {
    await expect(registrar(bd, 'x@usal.es', { codigo: 'ZZZZZZZZ', nombre: 'X' })).rejects.toThrow(/no es válido/)
  })

  it('exige el correo institucional', async () => {
    const [codigo] = await bd.rpc(e.investigador, 'crear_codigos', { p_master_id: e.master, p_rol: 'estudiante', p_tutor_id: e.tutor })
    await expect(registrar(bd, 'alguien@gmail.com', { codigo, nombre: 'X' })).rejects.toThrow(/correo institucional/)
    const comprobacion = await bd.rpc(null, 'comprobar_codigo', { p_codigo: codigo, p_email: 'alguien@gmail.com' })
    expect(comprobacion).toEqual({ valido: false, motivo: 'DOMINIO_NO_PERMITIDO' })
  })

  it('un código solo se puede usar una vez', async () => {
    const [codigo] = await bd.rpc(e.investigador, 'crear_codigos', { p_master_id: e.master, p_rol: 'estudiante', p_tutor_id: e.tutor })
    expect((await bd.rpc(null, 'comprobar_codigo', { p_codigo: codigo.toLowerCase() })).valido).toBe(true)
    await registrar(bd, 'diego@usal.es', { codigo, nombre: 'Diego' })
    await expect(registrar(bd, 'elena@usal.es', { codigo, nombre: 'Elena' })).rejects.toThrow(/no es válido/)
  })

  it('el código de pareja empareja al estudiante con su tutor', async () => {
    const [p] = await bd.admin(`select * from public.parejas where id = $1`, [e.parejaA])
    expect(p.estudiante_id).toBe(e.estudianteA)
    expect(p.tutor_id).toBe(e.tutor)
    expect(p.seudonimo).toMatch(/^P-[A-Z2-9]{6}$/)
  })

  it('los seudónimos no contienen el nombre', async () => {
    const perfil = await bd.rpc(e.estudianteA, 'mi_perfil')
    expect(perfil.rol).toBe('estudiante')
    expect(perfil.seudonimo).toMatch(/^E-[A-Z2-9]{6}$/)
    expect(perfil.nombre).toBe('Ana')
  })

  it('el tutor ve los códigos de pareja que aún puede repartir', async () => {
    const codigos = await bd.rpc(e.tutor, 'mis_codigos_pareja')
    expect(codigos.length).toBeGreaterThan(0)
    const otro = await bd.rpc(e.tutorB, 'mis_codigos_pareja')
    const mios = new Set(codigos.map((c: any) => c.codigo))
    expect(otro.some((c: any) => mios.has(c.codigo))).toBe(false)
  })
})

describe('Consentimiento informado', () => {
  it('al principio no está aceptado', async () => {
    const perfil = await bd.rpc(e.estudianteB, 'mi_perfil')
    expect(perfil.consentimiento).toEqual({ version_vigente: 1, aceptado: false })
  })

  it('se acepta la versión vigente y queda registrado', async () => {
    await bd.rpc(e.estudianteB, 'aceptar_consentimiento', { p_version: 1 })
    const perfil = await bd.rpc(e.estudianteB, 'mi_perfil')
    expect(perfil.consentimiento.aceptado).toBe(true)
    const audit = await bd.admin(`select accion from public.auditoria where actor_id = $1`, [e.estudianteB])
    expect(audit.map((a) => a.accion)).toContain('consentimiento_aceptado')
  })

  it('no se puede aceptar una versión que no está vigente', async () => {
    await expect(bd.rpc(e.estudianteB, 'aceptar_consentimiento', { p_version: 99 })).rejects.toThrow(/no está vigente/)
  })

  it('al publicar una versión nueva hay que aceptarla otra vez', async () => {
    await bd.admin(`update public.consentimiento_textos set vigente = false`)
    await bd.admin(`insert into public.consentimiento_textos (version, texto, vigente) values (2, 'v2', true)`)
    const perfil = await bd.rpc(e.estudianteB, 'mi_perfil')
    expect(perfil.consentimiento).toEqual({ version_vigente: 2, aceptado: false })
    await bd.admin(`delete from public.consentimiento_textos where version = 2`)
    await bd.admin(`update public.consentimiento_textos set vigente = true where version = 1`)
  })
})

describe('Funciones del investigador', () => {
  it('solo el investigador puede crear códigos', async () => {
    for (const quien of [e.tutor, e.direccion, e.estudianteA]) {
      await expect(bd.rpc(quien, 'crear_codigos', { p_master_id: e.master, p_rol: 'tutor' })).rejects.toThrow(/No tienes permiso/)
    }
  })

  it('no se pueden crear códigos de investigador', async () => {
    await expect(bd.rpc(e.investigador, 'crear_codigos', { p_master_id: e.master, p_rol: 'investigador' })).rejects.toThrow()
  })

  it('un código de estudiante exige un tutor de ese mismo máster', async () => {
    await expect(
      bd.rpc(e.investigador, 'crear_codigos', { p_master_id: e.master, p_rol: 'estudiante', p_tutor_id: e.tutorB }),
    ).rejects.toThrow(/tutor de este máster/)
  })

  it('lista los tutores por seudónimo y etiqueta, sin nombres', async () => {
    const tutores = await bd.rpc(e.investigador, 'listar_tutores', { p_master_id: e.master })
    expect(tutores).toHaveLength(1)
    expect(tutores[0].etiqueta).toBe('Tutor 1')
    expect(JSON.stringify(tutores)).not.toContain('Tutora Uno')
  })

  it('las acciones quedan en la auditoría', async () => {
    const filas = await bd.admin(`select accion from public.auditoria where actor_id = $1`, [e.investigador])
    expect(filas.map((f) => f.accion)).toEqual(expect.arrayContaining(['master_creado', 'codigos_creados']))
  })
})
