// Tests de permisos (RLS): comprueban en la propia base de datos que cada
// perfil solo puede leer lo que le corresponde.

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { escenarioBasico, nuevaBd, type Bd, type Escenario } from './ayudantes'

let bd: Bd
let e: Escenario

beforeAll(async () => {
  bd = await nuevaBd('permisos')
  e = await escenarioBasico(bd)
})

afterAll(async () => {
  await bd?.cerrar()
})

const cuenta = async (uid: string | null, tabla: string) =>
  Number((await bd.como(uid, `select count(*)::int as n from public.${tabla}`))[0].n)

describe('Bienestar: solo lo ve el propio estudiante', () => {
  it('el tutor no puede leer ninguna fila de bienestar', async () => {
    expect(await cuenta(e.tutor, 'bienestar')).toBe(0)
  })

  it('la dirección no puede leer ninguna fila de bienestar', async () => {
    expect(await cuenta(e.direccion, 'bienestar')).toBe(0)
  })

  it('el investigador tampoco puede leer la tabla de bienestar directamente', async () => {
    expect(await cuenta(e.investigador, 'bienestar')).toBe(0)
  })

  it('el estudiante ve solo su propia fila', async () => {
    const filas = await bd.como(e.estudianteA, `select estudiante_id from public.bienestar`)
    expect(filas).toHaveLength(1)
    expect(filas[0].estudiante_id).toBe(e.estudianteA)
  })

  it('el valor se guarda cifrado y no se puede descifrar sin permiso', async () => {
    const [fila] = await bd.admin(`select valor_cifrado from public.bienestar where estudiante_id = $1`, [e.estudianteA])
    expect(Buffer.from(fila.valor_cifrado).toString('utf8')).not.toBe('2')
    await expect(
      bd.como(e.tutor, `select private.descifrar_bienestar(valor_cifrado) from public.bienestar`),
    ).rejects.toThrow(/permission denied/)
  })
})

describe('Tutor', () => {
  it('no ve las respuestas de sus estudiantes', async () => {
    expect(await cuenta(e.tutor, 'respuestas_estudiante')).toBe(0)
  })

  it('ve sus propias respuestas y solo las de sus parejas', async () => {
    const filas = await bd.como(e.tutor, `select pareja_id from public.respuestas_tutor order by pareja_id`)
    expect(filas.map((f) => f.pareja_id).sort()).toEqual([e.parejaA, e.parejaB].sort())
  })

  it('no ve los correos ni los perfiles de sus estudiantes', async () => {
    const identidades = await bd.como(e.tutor, `select user_id from public.identidades`)
    expect(identidades.map((f) => f.user_id)).toEqual([e.tutor])
    const perfiles = await bd.como(e.tutor, `select user_id from public.perfiles`)
    expect(perfiles.map((f) => f.user_id)).toEqual([e.tutor])
  })

  it('obtiene el nombre de sus estudiantes, sin correo, para poder responder', async () => {
    const lista = await bd.rpc(e.tutor, 'mis_estudiantes')
    expect(lista.map((x: any) => x.nombre)).toEqual(['Ana', 'Bruno'])
    expect(JSON.stringify(lista)).not.toContain('@')
  })

  it('no ve parejas de otros tutores', async () => {
    const filas = await bd.como(e.tutor, `select id from public.parejas`)
    expect(filas.map((f) => f.id)).not.toContain(e.parejaC)
  })
})

describe('Dirección del máster', () => {
  it.each(['respuestas_estudiante', 'respuestas_tutor', 'parejas', 'bienestar', 'consentimientos', 'auditoria', 'codigos_acceso'])(
    'no puede leer ninguna fila individual de %s',
    async (tabla) => {
      expect(await cuenta(e.direccion, tabla)).toBe(0)
    },
  )

  it('solo ve su propio perfil e identidad', async () => {
    expect((await bd.como(e.direccion, `select user_id from public.perfiles`)).map((f) => f.user_id)).toEqual([e.direccion])
    expect((await bd.como(e.direccion, `select user_id from public.identidades`)).map((f) => f.user_id)).toEqual([e.direccion])
  })

  it('no puede usar las funciones del tutor ni del investigador', async () => {
    await expect(bd.rpc(e.direccion, 'mis_estudiantes')).rejects.toThrow(/No tienes permiso/)
    await expect(bd.rpc(e.direccion, 'listar_masters')).rejects.toThrow(/No tienes permiso/)
  })
})

describe('Estudiante: no ve a otros estudiantes', () => {
  it.each(['respuestas_estudiante', 'parejas', 'bienestar', 'perfiles', 'identidades'])(
    'en %s solo aparece lo suyo',
    async (tabla) => {
      expect(await cuenta(e.estudianteA, tabla)).toBe(1)
    },
  )

  it('no ve las respuestas de su tutor', async () => {
    expect(await cuenta(e.estudianteA, 'respuestas_tutor')).toBe(0)
  })

  it('no puede leer datos de otro estudiante aunque conozca su identificador', async () => {
    const filas = await bd.como(e.estudianteA, `select * from public.respuestas_estudiante where pareja_id = $1`, [e.parejaB])
    expect(filas).toHaveLength(0)
  })
})

describe('Investigador: datos seudonimizados, sin nombres', () => {
  it('ve las respuestas de todas las parejas', async () => {
    expect(await cuenta(e.investigador, 'respuestas_estudiante')).toBe(3)
    expect(await cuenta(e.investigador, 'respuestas_tutor')).toBe(3)
  })

  it('no ve nombres ni correos de nadie (solo los suyos)', async () => {
    const filas = await bd.como(e.investigador, `select user_id from public.identidades`)
    expect(filas.map((f) => f.user_id)).toEqual([e.investigador])
  })

  it('los perfiles que ve no contienen nombre ni correo', async () => {
    const [fila] = await bd.como(e.investigador, `select * from public.perfiles limit 1`)
    expect(Object.keys(fila)).not.toContain('nombre')
    expect(Object.keys(fila)).not.toContain('email')
  })
})

describe('Nadie escribe directamente en las tablas', () => {
  it.each([
    ['estudiante', 'estudianteA', `insert into public.respuestas_estudiante (pareja_id, semana, avance, siguiente_paso, apoyo) values ('00000000-0000-0000-0000-000000000000', 2, 1, 1, 1)`],
    ['tutor', 'tutor', `update public.respuestas_tutor set avance = 5`],
    ['investigador', 'investigador', `delete from public.auditoria`],
    ['dirección', 'direccion', `update public.perfiles set rol = 'investigador'`],
  ] as const)('%s: escritura directa rechazada', async (_n, quien, sql) => {
    await expect(bd.como(e[quien], sql)).rejects.toThrow(/permission denied/)
  })

  it('un perfil no puede cambiarse de rol a sí mismo', async () => {
    await expect(bd.como(e.estudianteA, `update public.perfiles set rol = 'investigador' where user_id = auth.uid()`)).rejects.toThrow(/permission denied/)
  })
})

describe('Visitantes sin cuenta', () => {
  it.each(['perfiles', 'respuestas_estudiante', 'bienestar', 'identidades', 'configuracion'])(
    'no pueden leer %s',
    async (tabla) => {
      await expect(bd.como(null, `select * from public.${tabla}`)).rejects.toThrow(/permission denied/)
    },
  )

  it('solo pueden leer la configuración pública (los códigos se comprueban en el servidor)', async () => {
    await expect(bd.rpc(null, 'comprobar_codigo', { p_codigo: 'NOEXISTE' })).rejects.toThrow()
    await expect(bd.rpc(null, 'mi_perfil')).rejects.toThrow(/permission denied/)
  })
})
