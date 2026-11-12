// Ayudantes para los tests de la base de datos.
// Cada archivo de tests crea su propia base de datos local desde cero.

import pg from 'pg'
// @ts-expect-error: módulo JavaScript sin tipos
import { crearBaseDeDatos, borrarBaseDeDatos } from '../../scripts/local/bd.mjs'

export interface Bd {
  nombre: string
  pool: pg.Pool
  /** Ejecuta SQL con permisos de administrador (como el panel de Supabase). */
  admin: <T = any>(sql: string, params?: unknown[]) => Promise<T[]>
  /** Ejecuta SQL como una persona identificada, igual que la API de Supabase. */
  como: <T = any>(userId: string | null, sql: string, params?: unknown[]) => Promise<T[]>
  /** Llama a una función de la API como una persona identificada. */
  rpc: <T = any>(userId: string | null, funcion: string, args?: Record<string, unknown>) => Promise<T>
  cerrar: () => Promise<void>
}

export async function nuevaBd(prefijo: string): Promise<Bd> {
  const nombre = `sintonia_test_${prefijo}_${Math.random().toString(36).slice(2, 8)}`
  const url = await crearBaseDeDatos(nombre)
  const pool = new pg.Pool({ connectionString: url, max: 4 })

  const admin = async (sql: string, params: unknown[] = []) => (await pool.query(sql, params)).rows

  const como = async (userId: string | null, sql: string, params: unknown[] = []) => {
    const cliente = await pool.connect()
    try {
      await cliente.query('begin')
      const rol = userId ? 'authenticated' : 'anon'
      await cliente.query(`set local role ${rol}`)
      const claims = userId ? { sub: userId, role: rol } : { role: rol }
      await cliente.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify(claims)])
      const res = await cliente.query(sql, params)
      await cliente.query('commit')
      return res.rows
    } catch (e) {
      await cliente.query('rollback')
      throw e
    } finally {
      cliente.release()
    }
  }

  const rpc = async (userId: string | null, funcion: string, args: Record<string, unknown> = {}) => {
    const claves = Object.keys(args)
    const lista = claves.map((k, i) => `${k} => $${i + 1}`).join(', ')
    const filas = await como(userId, `select public.${funcion}(${lista}) as r`, claves.map((k) => args[k]))
    return filas[0].r
  }

  return {
    nombre,
    pool,
    admin,
    como,
    rpc,
    cerrar: async () => {
      await pool.end()
      await borrarBaseDeDatos(nombre)
    },
  }
}

/** Crea una cuenta igual que lo haría Supabase al registrarse. */
export async function registrar(bd: Bd, email: string, datos: Record<string, string> = {}): Promise<string> {
  const filas = await bd.admin<{ id: string }>(
    `insert into auth.users (email, raw_user_meta_data) values ($1, $2) returning id`,
    [email, JSON.stringify(datos)],
  )
  return filas[0].id
}

export interface Escenario {
  investigador: string
  master: string
  masterB: string
  tutor: string
  tutorB: string
  direccion: string
  estudianteA: string
  estudianteB: string
  estudianteC: string
  parejaA: string
  parejaB: string
  parejaC: string
}

/**
 * Un máster con un tutor (2 estudiantes) y una persona de dirección,
 * y un segundo máster con otro tutor y un estudiante.
 */
export async function escenarioBasico(bd: Bd): Promise<Escenario> {
  await bd.admin(`insert into private.investigadores_autorizados (email) values ('investigador@usal.es')`)
  const investigador = await registrar(bd, 'investigador@usal.es', { nombre: 'Investigador' })

  const master = (await bd.rpc(investigador, 'crear_master', { p_nombre: 'Máster A' })).id
  const masterB = (await bd.rpc(investigador, 'crear_master', { p_nombre: 'Máster B' })).id

  const [codTutor] = await bd.rpc(investigador, 'crear_codigos', { p_master_id: master, p_rol: 'tutor', p_etiqueta: 'Tutor 1' })
  const [codTutorB] = await bd.rpc(investigador, 'crear_codigos', { p_master_id: masterB, p_rol: 'tutor' })
  const [codDir] = await bd.rpc(investigador, 'crear_codigos', { p_master_id: master, p_rol: 'direccion' })

  const tutor = await registrar(bd, 'tutora@usal.es', { codigo: codTutor, nombre: 'Tutora Uno' })
  const tutorB = await registrar(bd, 'tutorb@usal.es', { codigo: codTutorB, nombre: 'Tutor Dos' })
  const direccion = await registrar(bd, 'direccion@usal.es', { codigo: codDir, nombre: 'Dirección' })

  const codsEst = await bd.rpc(investigador, 'crear_codigos', { p_master_id: master, p_rol: 'estudiante', p_cantidad: 2, p_tutor_id: tutor })
  const [codEstB] = await bd.rpc(investigador, 'crear_codigos', { p_master_id: masterB, p_rol: 'estudiante', p_tutor_id: tutorB })

  const estudianteA = await registrar(bd, 'ana@usal.es', { codigo: codsEst[0], nombre: 'Ana' })
  const estudianteB = await registrar(bd, 'bruno@usal.es', { codigo: codsEst[1], nombre: 'Bruno' })
  const estudianteC = await registrar(bd, 'carla@usal.es', { codigo: codEstB, nombre: 'Carla' })

  const pareja = async (uid: string) =>
    (await bd.admin<{ id: string }>(`select id from public.parejas where estudiante_id = $1`, [uid]))[0].id

  const escenario = {
    investigador, master, masterB, tutor, tutorB, direccion,
    estudianteA, estudianteB, estudianteC,
    parejaA: await pareja(estudianteA),
    parejaB: await pareja(estudianteB),
    parejaC: await pareja(estudianteC),
  }

  // Respuestas de la semana 1 escritas directamente (como haría el servidor).
  for (const [pareja, est, bienestar] of [
    [escenario.parejaA, estudianteA, 2],
    [escenario.parejaB, estudianteB, 4],
    [escenario.parejaC, estudianteC, 5],
  ] as const) {
    await bd.admin(`insert into public.respuestas_estudiante (pareja_id, semana, avance, siguiente_paso, apoyo) values ($1, 1, 4, 3, 5)`, [pareja])
    await bd.admin(`insert into public.respuestas_tutor (pareja_id, semana, avance, siguiente_paso) values ($1, 1, 2, 3)`, [pareja])
    await bd.admin(`insert into public.bienestar (estudiante_id, semana, valor_cifrado) values ($1, 1, private.cifrar_bienestar($2))`, [est, bienestar])
  }

  return escenario
}
