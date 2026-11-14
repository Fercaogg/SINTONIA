import { describe, expect, it } from 'vitest'
import { compararMiradas } from './demo-portada'

describe('demostración de la portada', () => {
  it('sin desajuste si la diferencia es de 0 o 1 puntos', () => {
    expect(compararMiradas(3, 3)).toEqual({ diferencia: 0, desajuste: false, preguntas: [] })
    expect(compararMiradas(4, 3).desajuste).toBe(false)
  })
  it('con 2 puntos o más, tres preguntas distintas y neutras', () => {
    const r = compararMiradas(5, 2)
    expect(r.desajuste).toBe(true)
    expect(r.preguntas).toHaveLength(3)
    expect(new Set(r.preguntas).size).toBe(3)
  })
  it('las preguntas no dependen de quién ve más avance', () => {
    expect(compararMiradas(5, 2).preguntas).toEqual(compararMiradas(2, 5).preguntas)
  })
})
