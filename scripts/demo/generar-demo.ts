/**
 * DATOS SIMULADOS DE DEMOSTRACIÓN
 *
 * 1 máster, 4 tutores, 12 estudiantes y 6 semanas simuladas. Todos los
 * nombres son inventados y los correos usan el dominio reservado
 * sintonia.example, que no existe.
 *
 * La simulación usa el proceso real de cierre de semana (desajuste, sorteo y
 * agenda). Semana a semana: se escriben los check-ins, se cierra la semana y
 * la agenda recibida influye un poco en la semana siguiente (para que el
 * análisis de ejemplo tenga algo que mostrar).
 *
 * SOLO para bases de datos de demostración: se niega a ejecutarse si la base
 * de datos ya tiene personas registradas.
 */

import type pg from 'pg'
import { cerrarSemanas, type Almacen } from '../../servidor/cierre-semana'
import { sortear } from '../../servidor/logica/sorteo'

export const CONTRASENA_DEMO = 'demo-sintonia'
export const DOMINIO_DEMO = 'sintonia.example'
export const SEMANAS_SIMULADAS = 6

export const CUENTAS_DEMO = {
  investigador: `investigacion@${DOMINIO_DEMO}`,
  direccion: `direccion@${DOMINIO_DEMO}`,
  tutor: `tutor1@${DOMINIO_DEMO}`,
  estudiante: `estudiante01@${DOMINIO_DEMO}`,
}

const TUTORES = ['Rosa Castaño', 'Miguel Ferrer', 'Lucía Benítez', 'Andrés Quiroga']
const ESTUDIANTES = [
  'Irene Montes', 'Pablo Ibarra', 'Sara Llorente', 'Daniel Ortega', 'Nuria Salcedo', 'Javier Prieto',
  'Marta Escudero', 'Óscar Villar', 'Clara Aranda', 'Hugo Medina', 'Laura Peñalver', 'Adrián Soto',
]

/** Generador pseudoaleatorio reproducible (mulberry32). */
function azar(semilla: number) {
  let a = semilla >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const escala = (v: number) => Math.min(5, Math.max(1, Math.round(v)))

export async function generarDemo(opciones: { bd: pg.Client; almacen: Almacen; semilla?: number; reiniciar?: boolean }) {
  const { bd, almacen } = opciones
  const r = azar(opciones.semilla ?? 2027)
  const q = (sql: string, p: unknown[] = []) => bd.query(sql, p).then((x) => x.rows)

  // Reiniciar solo vacía bases de datos marcadas como demostración.
  if (opciones.reiniciar) await q(`select private.vaciar_demo()`)
  const [{ n }] = await q(`select count(*)::int as n from public.perfiles`)
  if (n > 0) throw new Error('Esta base de datos ya tiene personas registradas: la demostración solo se crea en una base de datos vacía.')

  await q(`insert into private.ajustes (clave, valor) values ('modo', 'demo') on conflict (clave) do update set valor = 'demo'`)
  await q(`update public.configuracion set valor = $1 where clave = 'dominios_permitidos'`, [DOMINIO_DEMO])

  const cuenta = async (email: string, datos: Record<string, string>) => {
    // Como haría el servidor (api/registro) antes de crear la cuenta.
    if (datos.codigo) await q(`insert into private.registros_autorizados (email, codigo, expira_at) values (lower($1), upper($2), now() + interval '15 minutes') on conflict (email) do update set codigo = excluded.codigo, expira_at = excluded.expira_at`, [email, datos.codigo])
    return (await q(
      `insert into auth.users (email, raw_user_meta_data, encrypted_password, email_confirmed_at)
       values ($1, $2, extensions.crypt($3, extensions.gen_salt('bf')), now()) returning id`,
      [email, JSON.stringify(datos), CONTRASENA_DEMO],
    ))[0].id as string
  }
  const consentir = (uid: string) => q(`insert into public.consentimientos (user_id, version) values ($1, 1)`, [uid])

  // Personas y códigos (directamente en la base de datos, como lo haría el investigador).
  await q(`insert into private.investigadores_autorizados (email) values ($1)`, [CUENTAS_DEMO.investigador])
  await cuenta(CUENTAS_DEMO.investigador, { nombre: 'Equipo de investigación (demo)' })
  const [{ id: estudio }] = await q(`select id from public.estudios order by created_at limit 1`)
  const [{ id: master }] = await q(`insert into public.masters (estudio_id, nombre) values ($1, 'Máster de demostración') returning id`, [estudio])
  const codigo = async (rol: string, tutor: string | null, etiqueta: string) =>
    (await q(`insert into public.codigos_acceso (codigo, rol, master_id, tutor_id, etiqueta) values (private.nuevo_codigo(), $1, $2, $3, $4) returning codigo`,
      [rol, master, tutor, etiqueta]))[0].codigo as string

  await cuenta(CUENTAS_DEMO.direccion, { codigo: await codigo('direccion', null, 'Dirección'), nombre: 'Dirección del máster (demo)' })

  const parejas: { id: string; estudiante: string; tutorIdx: number; progreso: number; sesgo: number; respondeE: number; respondeT: number }[] = []
  const tutoresIds: string[] = []
  for (const [t, nombreT] of TUTORES.entries()) {
    const tutor = await cuenta(`tutor${t + 1}@${DOMINIO_DEMO}`, { codigo: await codigo('tutor', null, `Tutor/a ${t + 1}`), nombre: nombreT })
    await consentir(tutor)
    tutoresIds.push(tutor)
    for (let k = 0; k < 3; k++) {
      const i = t * 3 + k
      const est = await cuenta(`estudiante${String(i + 1).padStart(2, '0')}@${DOMINIO_DEMO}`, { codigo: await codigo('estudiante', tutor, ''), nombre: ESTUDIANTES[i] })
      await consentir(est)
      const [{ id }] = await q(`select id from public.parejas where estudiante_id = $1`, [est])
      parejas.push({
        id, estudiante: est, tutorIdx: t,
        progreso: 2.5 + r() * 1.5,
        // Algunas parejas ven el avance de forma distinta (el estudiante, más o menos que el tutor).
        sesgo: [0, 0, 1, -1, 2, 0][Math.floor(r() * 6)],
        respondeE: 0.8 + r() * 0.2,
        respondeT: 0.75 + r() * 0.25,
      })
    }
  }

  // Cotutoría: la tutora 2 es cotutora de la primera pareja (Reglamento de
  // TFM, art. 4.3). Responde por su cuenta cada semana.
  const cotutora = tutoresIds[1]
  await q(`insert into public.cotutores (pareja_id, tutor_id, created_at) values ($1, $2, now() - interval '${7 * (SEMANAS_SIMULADAS + 2)} days')`, [parejas[0].id, cotutora])

  // Puente al doctorado: la mitad lo activa (siempre la cuenta de acceso rápido). Una convocatoria ficticia con plazo
  // dentro de la simulación (en la demostración, nunca convocatorias reales).
  for (const p of parejas.filter((_, i) => i === 0 || r() < 0.5)) {
    await q(`update public.perfiles set puente_doctorado = true where user_id = $1`, [p.estudiante])
    await q(`insert into public.puente_cambios (estudiante_id, activado) values ($1, true)`, [p.estudiante])
  }
  await q(`insert into public.convocatorias (nombre, organismo, fecha_apertura, fecha_cierre, enlace, estado)
           values ('Convocatoria de demostración (ficticia)', 'Organismo ficticio',
                   date_trunc('week', now() at time zone 'Europe/Madrid')::date - 7,
                   date_trunc('week', now() at time zone 'Europe/Madrid')::date + 21,
                   '[PENDIENTE: enlace oficial]', 'Ficticia')`)

  // Las parejas existían antes de empezar el estudio.
  const lunes = `date_trunc('week', now() at time zone 'Europe/Madrid')::date`
  await q(`update public.parejas set created_at = (${lunes} - ${7 * (SEMANAS_SIMULADAS + 2)})::timestamp`)

  // En la demostración, el cuestionario inicial sigue abierto para poder enseñarlo.
  await q(`update public.cuestionarios set hasta_semana = ${SEMANAS_SIMULADAS + 1} where clave = 'pretest'`)

  // Pretest de casi todos (menos la cuenta de acceso rápido, para enseñarlo vacío).
  const items = await q(`select id, tipo, opciones from public.cuestionario_items where cuestionario = 'pretest' order by orden`)
  for (const p of parejas.filter((_, i) => i !== 0 && r() < 0.9)) {
    for (const it of items) {
      const valor = it.tipo === 'escala' ? escala(2 + r() * 3) : it.tipo === 'si_no' ? r() < 0.4 : it.opciones[Math.floor(r() * it.opciones.length)]
      await q(`insert into public.cuestionario_respuestas (user_id, item_id, valor) values ($1, $2, $3)`, [p.estudiante, it.id, JSON.stringify(valor)])
    }
  }

  // Semana a semana.
  const conAgenda = new Set<string>()
  for (let semana = 1; semana <= SEMANAS_SIMULADAS; semana++) {
    // Con esta fecha de inicio, las semanas 1..semana ya han terminado.
    await q(`update public.estudios set fecha_inicio = ${lunes} - ${7 * semana} where id = $1`, [estudio])
    const momento = `(${lunes} - ${7 * semana} + ${7 * (semana - 1) + 3})::timestamp + interval '10 hours'`
    for (const p of parejas) {
      // Si la pareja tuvo agenda la semana anterior, sus miradas se acercan un poco.
      const sesgo = conAgenda.has(p.id) ? p.sesgo * 0.5 : p.sesgo
      const base = p.progreso + (r() - 0.5) * 1.5
      const siempre = p === parejas[0] && semana === SEMANAS_SIMULADAS
      if (siempre || r() < p.respondeE) {
        await q(`insert into public.respuestas_estudiante (pareja_id, semana, avance, siguiente_paso, apoyo, created_at, updated_at)
                 values ($1, $2, $3, $4, $5, ${momento}, ${momento})`,
          [p.id, semana, escala(base + sesgo / 2), escala(base + (r() - 0.5)), escala(3.5 + r() * 1.5)])
        await q(`insert into public.bienestar (estudiante_id, semana, valor_cifrado, created_at, updated_at)
                 values ($1, $2, private.cifrar_bienestar($3), ${momento}, ${momento})`, [p.estudiante, semana, escala(2.5 + r() * 2.5)])
      }
      if (siempre || r() < p.respondeT) {
        await q(`insert into public.respuestas_tutor (pareja_id, semana, avance, siguiente_paso, created_at, updated_at)
                 values ($1, $2, $3, $4, ${momento}, ${momento})`,
          [p.id, semana, escala(base - sesgo / 2), r() < 0.7 ? escala(base + (r() - 0.5)) : null])
      }
      if (p === parejas[0] && r() < 0.85) {
        await q(`insert into public.respuestas_tutor (pareja_id, tutor_id, principal, semana, avance, siguiente_paso, created_at, updated_at)
                 values ($1, $2, false, $3, $4, null, ${momento}, ${momento})`,
          [p.id, cotutora, semana, escala(base - 1 + (r() - 0.5))])
      }
    }
    // En la última semana, la semilla se elige para que la cuenta de acceso
    // rápido del estudiante tenga agenda (así la demostración la enseña).
    let semilla = `demo-${opciones.semilla ?? 2027}-${semana}`
    if (semana === SEMANAS_SIMULADAS) {
      for (let k = 0; !sortear(semilla, parejas[0].id, semana, 0.5).resultado; k++) semilla = `demo-${opciones.semilla ?? 2027}-${semana}-${k}`
    }
    await cerrarSemanas({ almacen, redactor: null, semilla: () => semilla })
    conAgenda.clear()
    for (const { pareja_id } of await q(`select pareja_id from public.agendas where semana = $1`, [semana])) conAgenda.add(pareja_id)
    // La mayoría mira la agenda.
    await q(`update public.agendas set vista_estudiante_at = now() where semana = $1 and random() < 0.85`, [semana])
    await q(`update public.agendas set vista_tutor_at = now() where semana = $1 and random() < 0.75`, [semana])
  }
  // Ahora está abierta la semana 7.

  // Un aviso de apoyo, con nombre autorizado.
  const p0 = parejas[4]
  await q(`insert into public.avisos_apoyo (master_id, estudiante_id, nombre_autorizado, created_at) values ($1, $2, $3, now() - interval '3 days')`,
    [master, p0.estudiante, ESTUDIANTES[4]])

  // Calendario: tutorías y entregas de las parejas, una nota privada y eventos
  // del máster publicados por la dirección (todo ficticio).
  const [{ id: direccionId }] = await q(`select id from auth.users where email = $1`, [CUENTAS_DEMO.direccion])
  const evento = (autor: string, ambito: string, pareja: string | null, tipo: string, titulo: string, dia: number,
    extra: { fin?: number; hora?: string; horaFin?: string; lugar?: string; nota?: string } = {}) =>
    q(`insert into public.eventos (autor_id, ambito, pareja_id, master_id, tipo, titulo, fecha, fecha_fin, hora_inicio, hora_fin, lugar, descripcion)
       values ($1, $2, $3, $4, $5, $6, ${lunes} + $7::int, ${lunes} + $8::int, $9::time, $10::time, $11, $12)`,
      [autor, ambito, pareja, master, tipo, titulo, dia, extra.fin ?? null, extra.hora ?? null, extra.horaFin ?? null, extra.lugar ?? null, extra.nota ?? null])
  await evento(direccionId, 'master', null, 'evento', 'Seminario de metodología (ficticio)', 9, { hora: '16:00', horaFin: '18:00', lugar: 'Aula 2 (ficticia)' })
  await evento(direccionId, 'master', null, 'congreso', 'Congreso de demostración (ficticio)', 16, { fin: 18, lugar: 'Salamanca' })
  await evento(direccionId, 'master', null, 'plazo', 'Plazo de depósito (ficticio)', 31)
  const diasLaborables = [1, 2, 3, 4, 8, 10, 11]
  for (const [i, p] of parejas.entries()) {
    const tutor = tutoresIds[p.tutorIdx]
    const nombre = ESTUDIANTES[i].split(' ')[0]
    await evento(tutor, 'pareja', p.id, 'tutoria', `Tutoría con ${nombre}`, diasLaborables[i % diasLaborables.length],
      { hora: `${10 + (i % 4)}:00`, horaFin: `${10 + (i % 4)}:45`, lugar: i % 2 ? 'Videollamada' : 'Despacho del tutor/a' })
    if (i % 3 === 0) await evento(p.estudiante, 'pareja', p.id, 'entrega', 'Entrega del primer borrador', 11)
  }
  // La cuenta de acceso rápido del estudiante: una tutoría pasada, otra con la cotutora y una nota privada.
  await evento(parejas[0].estudiante, 'pareja', parejas[0].id, 'tutoria', 'Tutoría para revisar el índice', -7, { hora: '12:00', horaFin: '12:30' })
  await evento(cotutora, 'pareja', parejas[0].id, 'tutoria', 'Tutoría de seguimiento (cotutora)', 4, { hora: '17:00', horaFin: '17:30', lugar: 'Videollamada' })
  await evento(parejas[0].estudiante, 'privado', null, 'otro', 'Repasar la bibliografía', 3, { nota: 'Solo la veo yo.' })

  const [res] = await q(`select count(*) filter (where elegible)::int as elegibles, count(*) filter (where resultado)::int as con_agenda from public.sorteos`)
  return { parejas: parejas.length, semanas: SEMANAS_SIMULADAS, ...res, proporcion: res.con_agenda / res.elegibles }
}
