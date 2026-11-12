import { describe, expect, it } from 'vitest'
import { cerrarSemanas, type Agenda, type Almacen, type DatosPareja, type FilaSorteo } from './cierre-semana'
import { REGLA_V1 } from './logica/desajuste'
import type { Redactor } from './logica/modelo'

const banco = [
  { id: 1, tipo: 'avance' as const, texto: '¿Qué parte del trabajo consideráis cerrada y cuál sigue abierta?' },
  { id: 2, tipo: 'avance' as const, texto: '¿Qué parte del trabajo conviene revisar juntos en esta tutoría?' },
  { id: 3, tipo: 'siguiente_paso' as const, texto: '¿Cuál es el próximo entregable y para cuándo?' },
  { id: 4, tipo: 'siguiente_paso' as const, texto: '¿Qué decisión pendiente conviene tomar para poder seguir?' },
  { id: 5, tipo: 'general' as const, texto: '¿Hay algo que esté frenando el avance?' },
  { id: 6, tipo: 'general' as const, texto: '¿Qué dudas conviene resolver antes de seguir?' },
  { id: 7, tipo: 'general' as const, texto: '¿Cómo y cuándo vais a estar en contacto hasta la próxima tutoría?' },
]

const pareja = (id: string, e: number | null, t: number | null, extra: Partial<DatosPareja> = {}): DatosPareja => ({
  pareja_id: id,
  sin_tutor: false,
  retirado: false,
  tiene_agenda: false,
  preguntas_previas: [],
  semanas: [{
    semana: 2,
    estudiante: e === null ? null : { avance: e, siguiente_paso: 3 },
    tutor: t === null ? null : { avance: t, siguiente_paso: 3 },
  }],
  ...extra,
})

/** Base de datos en memoria que anota el orden de las llamadas. */
function almacenFalso(parejas: DatosPareja[], opciones: { guardados?: Record<string, boolean | null>; fallaAgenda?: boolean } = {}) {
  const registro: string[] = []
  const sorteos: FilaSorteo[] = []
  const agendas = new Map<string, Agenda>()
  let completado = false
  const almacen: Almacen = {
    semanasPorCerrar: async () => (completado ? [] : [{ estudio_id: 'E', semana: 2, semanas: 10, probabilidad: 0.5 }]),
    datosSemana: async () => ({ regla: REGLA_V1, parejas, banco }),
    registrarSorteos: async (_e, _s, _d, filas) => {
      registro.push('sorteos')
      sorteos.push(...filas)
      return filas.map((f) => ({ pareja_id: f.pareja_id, resultado: opciones.guardados?.[f.pareja_id] ?? f.resultado }))
    },
    guardarAgenda: async (id, _s, agenda) => {
      if (opciones.fallaAgenda) throw new Error('fallo de red')
      registro.push(`agenda:${id}`)
      agendas.set(id, agenda)
    },
    completarCierre: async () => {
      registro.push('completado')
      completado = true
    },
  }
  return { almacen, registro, sorteos, agendas }
}

const SEMILLA = () => 'semilla-de-prueba'

describe('Cierre de semana', () => {
  it('guarda los sorteos ANTES de generar cualquier agenda', async () => {
    const parejas = Array.from({ length: 20 }, (_, i) => pareja(`p${i}`, 4, 2))
    const f = almacenFalso(parejas)
    await cerrarSemanas({ almacen: f.almacen, redactor: null, semilla: SEMILLA })
    expect(f.registro[0]).toBe('sorteos')
    expect(f.registro.at(-1)).toBe('completado')
    expect(f.registro.filter((r) => r.startsWith('agenda')).length).toBe(f.sorteos.filter((s) => s.resultado).length)
  })

  it('registra la semilla, el valor, la probabilidad y la versión del algoritmo', async () => {
    const f = almacenFalso([pareja('p1', 4, 2)])
    await cerrarSemanas({ almacen: f.almacen, redactor: null, semilla: SEMILLA })
    expect(f.sorteos[0]).toMatchObject({
      elegible: true, probabilidad: 0.5, semilla: 'semilla-de-prueba', algoritmo_version: 'hmac-sha256-v1', desajuste_relevante: true,
    })
    expect(typeof f.sorteos[0].valor_aleatorio).toBe('number')
  })

  it('sin uno de los dos check-ins no hay sorteo, y se registra el motivo', async () => {
    const f = almacenFalso([pareja('a', 3, null), pareja('b', null, 3), pareja('c', 3, 3, { sin_tutor: true })])
    await cerrarSemanas({ almacen: f.almacen, redactor: null, semilla: SEMILLA })
    expect(f.sorteos.map((s) => [s.elegible, s.motivo_no_elegible, s.resultado])).toEqual([
      [false, 'falta_tutor', null], [false, 'falta_estudiante', null], [false, 'sin_tutor', null],
    ])
    expect(f.agendas.size).toBe(0)
  })

  it('si la semana ya se había sorteado, respeta lo guardado y no vuelve a sortear', async () => {
    const f = almacenFalso([pareja('p1', 3, 3), pareja('p2', 3, 3)], { guardados: { p1: true, p2: false } })
    await cerrarSemanas({ almacen: f.almacen, redactor: null, semilla: SEMILLA })
    expect([...f.agendas.keys()]).toEqual(['p1'])
  })

  it('no genera otra vez una agenda que ya existe', async () => {
    const f = almacenFalso([pareja('p1', 3, 3, { tiene_agenda: true })], { guardados: { p1: true } })
    await cerrarSemanas({ almacen: f.almacen, redactor: null, semilla: SEMILLA })
    expect(f.agendas.size).toBe(0)
  })

  it('si falla al guardar una agenda, los sorteos ya están guardados y la semana no se da por cerrada', async () => {
    const f = almacenFalso([pareja('p1', 3, 3)], { guardados: { p1: true }, fallaAgenda: true })
    await expect(cerrarSemanas({ almacen: f.almacen, redactor: null, semilla: SEMILLA })).rejects.toThrow()
    expect(f.registro).toEqual(['sorteos'])
  })
})

describe('Agenda: modelo o banco', () => {
  const unaPareja = () => almacenFalso([pareja('p1', 5, 2)], { guardados: { p1: true } })
  const redactor = (fn: Redactor extends (...a: infer A) => infer R ? (...a: A) => R : never): Redactor =>
    Object.assign(fn, { modelo: 'modelo-de-prueba' })

  it('sin modelo, usa el banco', async () => {
    const f = unaPareja()
    await cerrarSemanas({ almacen: f.almacen, redactor: null, semilla: SEMILLA })
    expect(f.agendas.get('p1')).toMatchObject({ origen: 'banco', motivo_banco: 'sin_modelo', version_prompt: null, entrada_modelo: null })
    expect(f.agendas.get('p1')!.preguntas).toHaveLength(3)
  })

  it('con modelo y una salida válida, guarda las preguntas, el origen y la versión del prompt', async () => {
    const f = unaPareja()
    let recibido: unknown
    const preguntas = ['¿Qué parte del trabajo consideráis cerrada?', '¿Qué falta para el próximo entregable?', '¿Hay algo que esté frenando el avance?']
    await cerrarSemanas({
      almacen: f.almacen,
      redactor: redactor(async (entrada) => { recibido = entrada; return { preguntas } }),
      semilla: SEMILLA,
    })
    expect(f.agendas.get('p1')).toMatchObject({ origen: 'modelo', preguntas, version_prompt: 'agenda-prompt-v1', modelo: 'modelo-de-prueba' })
    // El modelo no recibe ningún identificador.
    expect(JSON.stringify(recibido)).not.toContain('p1')
    expect(f.agendas.get('p1')!.entrada_modelo).toEqual(recibido)
  })

  it('si el modelo devuelve algo no válido, usa el banco', async () => {
    const f = unaPareja()
    await cerrarSemanas({
      almacen: f.almacen,
      redactor: redactor(async () => ({ preguntas: ['¿Quién tiene razón, el tutor o el estudiante?', '¿Y qué más?', '¿Algo?'] })),
      semilla: SEMILLA,
    })
    expect(f.agendas.get('p1')).toMatchObject({ origen: 'banco', motivo_banco: 'validacion' })
  })

  it('si el modelo falla, usa el banco', async () => {
    const f = unaPareja()
    await cerrarSemanas({
      almacen: f.almacen,
      redactor: redactor(async () => { throw new Error('sin conexión') }),
      semilla: SEMILLA,
    })
    expect(f.agendas.get('p1')).toMatchObject({ origen: 'banco', motivo_banco: 'error_modelo' })
  })
})
