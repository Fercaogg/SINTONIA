import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { entradaParaModelo, erroresDePregunta, seleccionarDelBanco, validarSalidaModelo, type PreguntaBanco } from './agenda'
import { calcularDesajustes, type Desajuste } from './desajuste'

// El banco de preguntas tal como se instala en la base de datos.
function bancoDeLaMigracion(): PreguntaBanco[] {
  const archivo = readdirSync('supabase/migrations').find((f) => f.endsWith('_agenda.sql'))!
  const sql = readFileSync(`supabase/migrations/${archivo}`, 'utf8')
  const filas = [...sql.matchAll(/\('(avance|siguiente_paso|general)', '(¿[^']+)'\)/g)]
  return filas.map((m, i) => ({ id: i + 1, tipo: m[1] as PreguntaBanco['tipo'], texto: m[2] }))
}
const banco = bancoDeLaMigracion()

const desajuste = (item: Desajuste['item'], diferencia: number, relevante: boolean): Desajuste => ({
  item, semana: 1, valorEstudiante: 3, valorTutor: 3 - diferencia, diferencia, magnitud: Math.abs(diferencia),
  signo: diferencia > 0 ? 'estudiante_mayor' : diferencia < 0 ? 'tutor_mayor' : 'coinciden',
  relevante, motivo: relevante ? 'absoluto' : null, reglaVersion: 'v1',
})

describe('Validación de una pregunta', () => {
  it.each([
    '¿Qué parte del trabajo consideráis cerrada y cuál sigue abierta?',
    '¿Cuál es el próximo entregable y para cuándo?',
    '¿Hay algo que esté frenando el avance?',
    '¿Qué vais a revisar juntos en la próxima tutoría?',
  ])('acepta: %s', (p) => {
    expect(erroresDePregunta(p)).toEqual([])
  })

  it.each([
    ['¿Por qué el tutor ve menos avance?', 'tutor'],
    ['¿Qué estudiante tiene razón esta semana?', 'razón'],
    ['¿Cómo te sientes con el trabajo esta semana?', 'sient'],
    ['¿Por qué hay 2 puntos de diferencia?', 'números'],
    ['¿Qué nota le pondríais al trabajo de esta semana?', 'nota'],
    ['¿Hay estrés con los plazos de entrega del trabajo?', 'estrés'],
    ['Revisad el plan de trabajo de la semana.', 'pregunta'],
    ['¿Qué falta? \u2014 revisad el plan de trabajo', 'rayas'],
    ['¿Qué ha salido mal en el trabajo de esta semana?', 'mal'],
  ])('rechaza: %s', (p, motivo) => {
    expect(erroresDePregunta(p).join(' ')).toContain(motivo)
  })

  it('"tutoría" sí está permitida, aunque contenga "tutor"', () => {
    expect(erroresDePregunta('¿Qué conviene preparar para la próxima tutoría?')).toEqual([])
  })
})

describe('Validación de la salida del modelo', () => {
  const tres = ['¿Qué parte del trabajo consideráis cerrada?', '¿Cuál es el próximo entregable y para cuándo?', '¿Hay algo que esté frenando el avance?']

  it('acepta exactamente 3 preguntas válidas', () => {
    expect(validarSalidaModelo({ preguntas: tres })).toEqual({ ok: true, preguntas: tres })
  })

  it('quita espacios sobrantes', () => {
    const r = validarSalidaModelo({ preguntas: tres.map((p) => `  ${p} `) })
    expect(r.ok && r.preguntas[0]).toBe(tres[0])
  })

  it.each([
    [{ preguntas: tres.slice(0, 2) }],
    [{ preguntas: [...tres, '¿Qué falta por revisar en el trabajo?'] }],
    [{ preguntas: [tres[0], tres[0], tres[1]] }],
    [{ preguntas: [tres[0], tres[1], '¿Cómo os sentís?'] }],
    [{ preguntas: [tres[0], tres[1], 42] }],
    [{ otra: tres }],
    [null],
    ['texto'],
  ])('rechaza salidas incorrectas (caso %#)', (salida) => {
    expect(validarSalidaModelo(salida).ok).toBe(false)
  })
})

describe('Banco de preguntas', () => {
  it('hay preguntas de cada tipo', () => {
    for (const tipo of ['avance', 'siguiente_paso', 'general']) {
      expect(banco.filter((p) => p.tipo === tipo).length).toBeGreaterThanOrEqual(4)
    }
  })

  it('todas las preguntas del banco pasan la misma validación que las del modelo', () => {
    for (const p of banco) expect(erroresDePregunta(p.texto), p.texto).toEqual([])
  })

  it('sin desajustes relevantes: tres preguntas generales', () => {
    const r = seleccionarDelBanco({ desajustes: [desajuste('avance', 1, false)], banco, previas: [], semilla: 'a' })
    const tipos = r.map((t) => banco.find((p) => p.texto === t)!.tipo)
    expect(tipos).toEqual(['general', 'general', 'general'])
  })

  it('con desajuste en el avance: dos de avance y una general', () => {
    const r = seleccionarDelBanco({ desajustes: [desajuste('avance', 2, true), desajuste('siguiente_paso', 0, false)], banco, previas: [], semilla: 'a' })
    const tipos = r.map((t) => banco.find((p) => p.texto === t)!.tipo)
    expect(tipos).toEqual(['avance', 'avance', 'general'])
  })

  it('con los dos ítems: uno de cada (primero el mayor) y una general', () => {
    const r = seleccionarDelBanco({ desajustes: [desajuste('avance', 2, true), desajuste('siguiente_paso', -3, true)], banco, previas: [], semilla: 'a' })
    const tipos = r.map((t) => banco.find((p) => p.texto === t)!.tipo)
    expect(tipos).toEqual(['siguiente_paso', 'avance', 'general'])
  })

  it('siempre devuelve 3 preguntas distintas y es reproducible', () => {
    const op = { desajustes: [desajuste('avance', 2, true)], banco, previas: [], semilla: 'x' }
    const r = seleccionarDelBanco(op)
    expect(new Set(r).size).toBe(3)
    expect(seleccionarDelBanco(op)).toEqual(r)
  })

  it('evita repetir preguntas que la pareja ya recibió', () => {
    const primera = seleccionarDelBanco({ desajustes: [], banco, previas: [], semilla: 's1' })
    const segunda = seleccionarDelBanco({ desajustes: [], banco, previas: primera, semilla: 's1' })
    expect(segunda.some((p) => primera.includes(p))).toBe(false)
  })
})

describe('Lo que se envía al modelo: ningún dato personal', () => {
  const desajustes = calcularDesajustes(
    [{ semana: 6, estudiante: { avance: 5, siguiente_paso: 2 }, tutor: { avance: 2, siguiente_paso: 2 } }],
    6,
  )
  const entrada = entradaParaModelo(desajustes, 6, 10)

  it('solo contiene la semana y, por ítem, desajuste, signo, magnitud y persistencia', () => {
    expect(Object.keys(entrada).sort()).toEqual(['items', 'semana_del_estudio', 'semanas_totales'])
    for (const i of entrada.items) {
      expect(Object.keys(i).sort()).toEqual(['desajuste_relevante', 'item', 'magnitud', 'persistente', 'signo'])
    }
    expect(entrada).toEqual({
      semana_del_estudio: 6,
      semanas_totales: 10,
      items: [
        { item: 'avance', desajuste_relevante: true, signo: 'estudiante_mayor', magnitud: 3, persistente: false },
        { item: 'siguiente_paso', desajuste_relevante: false, signo: 'coinciden', magnitud: 0, persistente: false },
      ],
    })
  })

  it('no incluye las respuestas originales (solo la diferencia)', () => {
    expect(JSON.stringify(entrada)).not.toMatch(/valor|pareja|nombre|email|@/i)
  })
})
