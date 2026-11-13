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

  it('con un código inventado tampoco, y el error no dice qué ha fallado', async () => {
    await expect(registrar(bd, 'x@usal.es', { codigo: 'ZZZZZZZZZZZZ', nombre: 'X' })).rejects.toThrow(/No hemos podido completar el registro/)
  })

  it('exige el correo institucional, con el mismo mensaje', async () => {
    const [codigo] = await bd.rpc(e.investigador, 'crear_codigos', { p_master_id: e.master, p_rol: 'estudiante', p_tutor_id: e.tutor })
    await expect(registrar(bd, 'alguien@gmail.com', { codigo, nombre: 'X' })).rejects.toThrow(/No hemos podido completar el registro/)
    expect(await bd.servidor('servicio_autorizar_registro', { p_codigo: codigo, p_email: 'alguien@gmail.com' })).toEqual({ ok: false })
    expect(await bd.servidor('servicio_autorizar_registro', { p_codigo: 'NOEXISTE1234', p_email: 'alguien@usal.es' })).toEqual({ ok: false })
  })

  it('los códigos tienen 12 caracteres y caducan a los 30 días por defecto', async () => {
    const [codigo] = await bd.rpc(e.investigador, 'crear_codigos', { p_master_id: e.master, p_rol: 'tutor' })
    expect(codigo).toMatch(/^[A-HJ-NP-Z2-9]{12}$/)
    const [c] = await bd.admin(`select usos_max, extract(day from caduca_at - created_at)::int as dias from public.codigos_acceso where codigo = $1`, [codigo])
    expect(c).toEqual({ usos_max: 1, dias: 30 })
  })

  it('un código solo se puede usar las veces indicadas', async () => {
    const [codigo] = await bd.rpc(e.investigador, 'crear_codigos', { p_master_id: e.master, p_rol: 'estudiante', p_tutor_id: e.tutor })
    // Con guiones y en minúsculas también vale.
    expect((await bd.servidor('servicio_autorizar_registro', { p_codigo: `${codigo.slice(0, 4)}-${codigo.slice(4)}`.toLowerCase(), p_email: 'diego@usal.es' })).ok).toBe(true)
    await registrar(bd, 'diego@usal.es', { codigo, nombre: 'Diego' }, false)
    expect(await bd.servidor('servicio_autorizar_registro', { p_codigo: codigo, p_email: 'elena@usal.es' })).toEqual({ ok: false })
    await expect(registrar(bd, 'elena@usal.es', { codigo, nombre: 'Elena' })).rejects.toThrow(/No hemos podido completar el registro/)

    const [doble] = await bd.rpc(e.investigador, 'crear_codigos', { p_master_id: e.master, p_rol: 'estudiante', p_tutor_id: e.tutor, p_usos_max: 2 })
    await registrar(bd, 'fran@usal.es', { codigo: doble, nombre: 'Fran' })
    await registrar(bd, 'gala@usal.es', { codigo: doble, nombre: 'Gala' })
    await expect(registrar(bd, 'hugo@usal.es', { codigo: doble, nombre: 'Hugo' })).rejects.toThrow(/No hemos podido/)
  })

  it('un código caducado o anulado no sirve', async () => {
    const [caducado, anulado] = await bd.rpc(e.investigador, 'crear_codigos', { p_master_id: e.master, p_rol: 'estudiante', p_tutor_id: e.tutor, p_cantidad: 2 })
    await bd.admin(`update public.codigos_acceso set caduca_at = now() - interval '1 minute' where codigo = $1`, [caducado])
    await expect(registrar(bd, 'ines@usal.es', { codigo: caducado, nombre: 'Inés' })).rejects.toThrow(/No hemos podido/)
    await expect(bd.rpc(e.tutorB, 'revocar_codigo', { p_codigo: anulado })).rejects.toThrow(/No tienes permiso/)
    await bd.rpc(e.tutor, 'revocar_codigo', { p_codigo: anulado })
    await expect(registrar(bd, 'juan@usal.es', { codigo: anulado, nombre: 'Juan' })).rejects.toThrow(/No hemos podido/)
    const lista = await bd.rpc(e.investigador, 'listar_codigos', { p_master_id: e.master })
    expect(lista.find((c: any) => c.codigo === anulado)).toMatchObject({ revocado: true, disponible: false })
    expect(lista.find((c: any) => c.codigo === caducado)).toMatchObject({ caducado: true, disponible: false })
  })

  it('sin la autorización del servidor no se crea la cuenta, aunque el código sea bueno', async () => {
    const [codigo] = await bd.rpc(e.investigador, 'crear_codigos', { p_master_id: e.master, p_rol: 'estudiante', p_tutor_id: e.tutor })
    await expect(registrar(bd, 'directo@usal.es', { codigo, nombre: 'Directo' }, false)).rejects.toThrow(/No hemos podido/)
    // La autorización caduca a los 15 minutos.
    await bd.servidor('servicio_autorizar_registro', { p_codigo: codigo, p_email: 'tarde@usal.es' })
    await bd.admin(`update private.registros_autorizados set expira_at = now() - interval '1 second' where email = 'tarde@usal.es'`)
    await expect(registrar(bd, 'tarde@usal.es', { codigo, nombre: 'Tarde' }, false)).rejects.toThrow(/No hemos podido/)
    // Y solo el servidor puede autorizar.
    await expect(bd.rpc(null, 'servicio_autorizar_registro', { p_codigo: codigo, p_email: 'x@usal.es' })).rejects.toThrow(/permission denied/)
    await expect(bd.rpc(e.estudianteA, 'servicio_autorizar_registro', { p_codigo: codigo, p_email: 'x@usal.es' })).rejects.toThrow(/permission denied/)
  })

  it('el límite de intentos corta al llegar al máximo, por IP o por correo', async () => {
    const intento = (claves: string[]) => bd.servidor('servicio_limitar', { p_tipo: 'prueba', p_claves: JSON.stringify(claves), p_limite: 3, p_minutos: 15 })
    for (let i = 0; i < 3; i++) expect(await intento(['ip:1.2.3.4', 'correo:a@usal.es'])).toBe(true)
    expect(await intento(['ip:1.2.3.4', 'correo:otro@usal.es'])).toBe(false)
    expect(await intento(['ip:5.6.7.8', 'correo:a@usal.es'])).toBe(false)
    expect(await intento(['ip:5.6.7.8', 'correo:b@usal.es'])).toBe(true)
    // No se guarda la IP ni el correo, solo una huella.
    const filas = await bd.admin(`select huella from private.intentos`)
    expect(JSON.stringify(filas)).not.toMatch(/1\.2\.3\.4|usal\.es/)
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
