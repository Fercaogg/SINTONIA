import { describe, expect, it } from 'vitest'
import { calcularDesajustes, REGLA_V1, type SemanaPareja } from './desajuste'

const sem = (semana: number, e: [number, number] | null, t: [number, number | null] | null): SemanaPareja => ({
  semana,
  estudiante: e ? { avance: e[0], siguiente_paso: e[1] } : null,
  tutor: t ? { avance: t[0], siguiente_paso: t[1] } : null,
})

const avance = (semanas: SemanaPareja[], semana: number, regla = REGLA_V1) =>
  calcularDesajustes(semanas, semana, regla).find((d) => d.item === 'avance')

describe('Desajuste: diferencia = estudiante − tutor', () => {
  it('si coinciden, no hay desajuste', () => {
    const d = avance([sem(1, [3, 3], [3, 3])], 1)!
    expect(d).toMatchObject({ diferencia: 0, magnitud: 0, signo: 'coinciden', relevante: false, motivo: null })
  })

  it('el signo indica quién ve más avance', () => {
    expect(avance([sem(1, [4, 3], [3, 3])], 1)!.signo).toBe('estudiante_mayor')
    expect(avance([sem(1, [2, 3], [3, 3])], 1)!.signo).toBe('tutor_mayor')
  })

  it('guarda los valores y la versión de la regla', () => {
    expect(avance([sem(1, [5, 3], [2, 3])], 1)).toMatchObject({ valorEstudiante: 5, valorTutor: 2, diferencia: 3, reglaVersion: 'v1' })
  })
})

describe('Regla v1: relevante si |dif| ≥ 2, o 1 punto con el mismo signo 2 semanas seguidas', () => {
  it('2 puntos o más: relevante en cualquier sentido', () => {
    expect(avance([sem(1, [4, 3], [2, 3])], 1)).toMatchObject({ relevante: true, motivo: 'absoluto' })
    expect(avance([sem(1, [1, 3], [4, 3])], 1)).toMatchObject({ relevante: true, motivo: 'absoluto' })
  })

  it('1 punto una sola semana: no es relevante', () => {
    expect(avance([sem(1, [4, 3], [3, 3])], 1)!.relevante).toBe(false)
  })

  it('1 punto con el mismo signo dos semanas seguidas: relevante por persistencia', () => {
    const s = [sem(1, [4, 3], [3, 3]), sem(2, [3, 3], [2, 3])]
    expect(avance(s, 2)).toMatchObject({ relevante: true, motivo: 'persistente' })
  })

  it('1 punto pero con signo contrario a la semana anterior: no es relevante', () => {
    const s = [sem(1, [2, 3], [3, 3]), sem(2, [3, 3], [2, 3])]
    expect(avance(s, 2)!.relevante).toBe(false)
  })

  it('la semana anterior con 2 puntos del mismo signo también cuenta como persistencia', () => {
    const s = [sem(1, [5, 3], [3, 3]), sem(2, [3, 3], [2, 3])]
    expect(avance(s, 2)).toMatchObject({ relevante: true, motivo: 'persistente' })
  })

  it('si la semana anterior falta alguna respuesta, no hay persistencia', () => {
    expect(avance([sem(1, [4, 3], null), sem(2, [3, 3], [2, 3])], 2)!.relevante).toBe(false)
    expect(avance([sem(2, [3, 3], [2, 3])], 2)!.relevante).toBe(false)
  })

  it('las semanas deben ser seguidas', () => {
    const s = [sem(1, [4, 3], [3, 3]), sem(3, [3, 3], [2, 3])]
    expect(avance(s, 3)!.relevante).toBe(false)
  })
})

describe('Casos especiales', () => {
  it('si el tutor no responde el siguiente paso, solo se calcula el avance', () => {
    const d = calcularDesajustes([sem(1, [3, 5], [3, null])], 1)
    expect(d.map((x) => x.item)).toEqual(['avance'])
  })

  it('si falta una de las dos respuestas de la semana, no se calcula nada', () => {
    expect(calcularDesajustes([sem(1, [3, 3], null)], 1)).toEqual([])
    expect(calcularDesajustes([sem(1, null, [3, 3])], 1)).toEqual([])
  })

  it('evalúa los dos ítems por separado', () => {
    const d = calcularDesajustes([sem(1, [3, 5], [3, 2])], 1)
    expect(d.map((x) => [x.item, x.relevante])).toEqual([['avance', false], ['siguiente_paso', true]])
  })

  it('rechaza valores fuera de la escala', () => {
    expect(() => calcularDesajustes([sem(1, [6, 3], [3, 3])], 1)).toThrow(/entre 1 y 5/)
    expect(() => calcularDesajustes([sem(1, [2.5, 3], [3, 3])], 1)).toThrow(/entre 1 y 5/)
  })
})

describe('Los umbrales son configurables', () => {
  it('con umbral absoluto 3, una diferencia de 2 no basta', () => {
    const regla = { version: 'prueba', umbralAbsoluto: 3, umbralPersistente: 1, semanasPersistencia: 2 }
    expect(avance([sem(1, [4, 3], [2, 3])], 1, regla)).toMatchObject({ relevante: false, reglaVersion: 'prueba' })
  })

  it('con persistencia de 3 semanas, 2 seguidas no bastan', () => {
    const regla = { version: 'p3', umbralAbsoluto: 2, umbralPersistente: 1, semanasPersistencia: 3 }
    const dos = [sem(1, [4, 3], [3, 3]), sem(2, [4, 3], [3, 3])]
    expect(avance(dos, 2, regla)!.relevante).toBe(false)
    const tres = [sem(0, [4, 3], [3, 3]), ...dos].map((s, i) => ({ ...s, semana: i + 1 }))
    expect(avance(tres, 3, regla)!.relevante).toBe(true)
  })

  it('rechaza reglas sin sentido', () => {
    expect(() => calcularDesajustes([], 1, { version: 'x', umbralAbsoluto: 0, umbralPersistente: 1, semanasPersistencia: 2 })).toThrow()
  })
})
