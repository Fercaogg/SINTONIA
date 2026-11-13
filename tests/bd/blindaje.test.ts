// Blindaje de la base de datos (AUDITORIA.md, Fase 2).
//
// 1. Ninguna tabla sin RLS y ninguna función abierta de más.
// 2. Los cinco casos del encargo, con sus mismos nombres:
//    - el tutor no lee el bienestar;
//    - la dirección no lee filas individuales;
//    - un estudiante no ve a otro;
//    - un anónimo no lee nada;
//    - la dirección no obtiene cifras con menos de 5 personas, ni siquiera
//      llamando a la API directamente.

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { escenarioBasico, nuevaBd, type Bd, type Escenario } from './ayudantes'

let bd: Bd
let e: Escenario

// Funciones que puede llamar alguien sin sesión (todas comprueban sus datos).
const PUBLICAS_ANONIMO = ['configuracion_publica', 'modo_instalacion']

// Funciones internas que usan las reglas de lectura (RLS).
const INTERNAS_PARA_RLS = [
  'es_investigador', 'master_actual', 'mis_parejas', 'parejas_como_estudiante',
  'parejas_como_tutor', 'puede_ver_evento', 'rol_actual',
]

beforeAll(async () => {
  bd = await nuevaBd('blindaje')
  e = await escenarioBasico(bd)
  for (const u of [e.tutor, e.estudianteA, e.estudianteB]) await bd.rpc(u, 'aceptar_consentimiento', { p_version: 1 })
  await bd.rpc(e.investigador, 'configurar_estudio', { p_fecha_inicio: '2027-02-01', p_semanas: 10, p_dia_apertura: 1, p_dia_cierre: 7 })
  await bd.admin(`update public.parejas set created_at = '2027-01-15'`)
  bd.ahora = '2027-02-17T10:00:00Z'
})

afterAll(async () => {
  await bd?.cerrar()
})

describe('Ninguna puerta abierta de más', () => {
  it('todas las tablas tienen RLS activada', async () => {
    const sin = await bd.admin(`
      select n.nspname || '.' || c.relname as tabla
      from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where c.relkind = 'r' and n.nspname in ('public', 'private') and not c.relrowsecurity`)
    expect(sin).toEqual([])
  })

  it('nadie puede escribir directamente en ninguna tabla', async () => {
    const escrituras = await bd.admin(`
      select table_schema || '.' || table_name || ':' || privilege_type || ':' || grantee as p
      from information_schema.role_table_grants
      where table_schema in ('public', 'private') and grantee in ('anon', 'authenticated', 'PUBLIC')
        and privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')`)
    expect(escrituras).toEqual([])
  })

  it('sin sesión solo se pueden usar dos funciones', async () => {
    const filas = await bd.admin(`
      select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname in ('public', 'private') and has_function_privilege('anon', p.oid, 'execute')
        and has_schema_privilege('anon', n.oid, 'usage')
      order by 1`)
    expect(filas.map((f) => f.proname)).toEqual(PUBLICAS_ANONIMO)
  })

  it('las funciones internas solo se abren a quien las necesita', async () => {
    const filas = await bd.admin(`
      select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'private' and has_function_privilege('authenticated', p.oid, 'execute')
      order by 1`)
    expect(filas.map((f) => f.proname)).toEqual(INTERNAS_PARA_RLS)
    const anonimo = await bd.admin(`
      select count(*)::int as n from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'private' and has_function_privilege('anon', p.oid, 'execute')`)
    expect(anonimo[0].n).toBe(0)
  })
})

describe('Los cinco casos del encargo', () => {
  it('1. el tutor no lee el bienestar', async () => {
    expect(await bd.como(e.tutor, `select * from public.bienestar`)).toEqual([])
    await expect(bd.rpc(e.tutor, 'mis_datos')).resolves.not.toHaveProperty('bienestar')
  })

  it('2. la dirección no lee filas individuales', async () => {
    for (const tabla of ['respuestas_estudiante', 'respuestas_tutor', 'bienestar', 'parejas', 'desajustes', 'sorteos', 'agendas', 'identidades']) {
      const filas = await bd.como(e.direccion, `select * from public.${tabla}`)
      // Solo podría ver lo suyo (su propia identidad), nunca lo de otras personas.
      expect(filas.every((f: any) => f.user_id === undefined || f.user_id === e.direccion), tabla).toBe(true)
      if (tabla !== 'identidades') expect(filas, tabla).toEqual([])
    }
  })

  it('3. un estudiante no ve a otro', async () => {
    for (const tabla of ['respuestas_estudiante', 'bienestar', 'parejas', 'perfiles', 'identidades', 'agendas']) {
      const filas = await bd.como(e.estudianteA, `select * from public.${tabla}`)
      expect(JSON.stringify(filas), tabla).not.toContain(e.estudianteB)
      expect(JSON.stringify(filas), tabla).not.toContain(e.parejaB)
    }
  })

  it('4. un anónimo no lee nada', async () => {
    const tablas = await bd.admin(`select tablename from pg_tables where schemaname = 'public' order by 1`)
    for (const { tablename } of tablas) {
      const r = await bd.como(null, `select * from public.${tablename}`).catch((err) => err)
      expect(r instanceof Error ? 'denegado' : r.length === 0 ? 'vacío' : 'LEE', tablename).not.toBe('LEE')
    }
    const internas = await bd.como(null, `select * from private.ajustes`).catch((err) => err)
    expect(internas).toBeInstanceOf(Error)
  })

  it('5. la dirección no obtiene cifras con menos de 5 personas, ni siquiera llamando a la API directamente', async () => {
    // En el máster A hay 2 estudiantes y 1 tutora: todo por debajo del mínimo.
    const r = await bd.rpc(e.direccion, 'resumen_direccion')
    expect(r.semanas.length).toBeGreaterThan(0)
    const cifras = JSON.stringify(r.semanas)
    expect(cifras).not.toMatch(/"suprimida":false/)
    // Y no hay otra vía: las tablas con los datos le devuelven 0 filas.
    expect(await bd.como(e.direccion, `select * from public.respuestas_estudiante`)).toEqual([])
  })
})
