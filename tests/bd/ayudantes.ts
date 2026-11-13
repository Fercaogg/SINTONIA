// Ayudantes para los tests de la base de datos.
// Cada archivo de tests crea su propia base de datos local desde cero.

import pg from 'pg'
// @ts-expect-error: módulo JavaScript sin tipos
import { crearBaseDeDatos, borrarBaseDeDatos } from '../../scripts/local/bd.mjs'

const SERVIDOR = '__servidor__'

export interface Bd {
  nombre: string
  /** Si se fija, la base de datos "cree" que es esta hora (ISO 8601). */
  ahora: string | null
  pool: pg.Pool
  /** Ejecuta SQL con permisos de administrador (como el panel de Supabase). */
  admin: <T = any>(sql: string, params?: unknown[]) => Promise<T[]>
  /** Ejecuta SQL como una persona identificada, igual que la API de Supabase. */
  como: <T = any>(userId: string | null, sql: string, params?: unknown[]) => Promise<T[]>
  /** Llama a una función como el servidor (clave service_role). */
  servidor: <T = any>(funcion: string, args?: Record<string, unknown>) => Promise<T>
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
      const rol = userId === SERVIDOR ? 'service_role' : userId ? 'authenticated' : 'anon'
      await cliente.query(`set local role ${rol}`)
      const claims = userId && userId !== SERVIDOR ? { sub: userId, role: rol } : { role: rol }
      await cliente.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify(claims)])
      if (bd.ahora) await cliente.query(`select set_config('sintonia.ahora', $1, true)`, [bd.ahora])
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

  const bd: Bd = {
    nombre,
    ahora: null,
    pool,
    admin,
    como,
    rpc,
    servidor: (funcion, args = {}) => rpc(SERVIDOR, funcion, args),
    cerrar: async () => {
      await pool.end()
      await borrarBaseDeDatos(nombre)
    },
  }
  return bd
}

/** Autoriza un registro como lo haría el servidor (api/registro) tras comprobar el código. */
export async function autorizarRegistro(bd: Bd, email: string, codigo: string) {
  await bd.admin(`insert into private.registros_autorizados (email, codigo, expira_at) values (lower($1), upper($2), now() + interval '15 minutes') on conflict (email) do update set codigo = excluded.codigo, expira_at = excluded.expira_at`, [email, codigo])
}

/**
 * Crea una cuenta igual que lo haría Supabase al registrarse. Si lleva código,
 * antes la autoriza como lo haría el servidor (salvo autorizar: false).
 */
export async function registrar(bd: Bd, email: string, datos: Record<string, string> = {}, autorizar = true): Promise<string> {
  if (datos.codigo && autorizar) await autorizarRegistro(bd, email, datos.codigo)
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
