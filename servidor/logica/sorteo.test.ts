import { describe, expect, it } from 'vitest'
import { motivoNoElegible, nuevaSemilla, sortear, valorAleatorio } from './sorteo'

describe('Sorteo con semilla registrada', () => {
  it('la semilla es aleatoria y de 32 bytes', () => {
    const a = nuevaSemilla()
    expect(a).toMatch(/^[0-9a-f]{64}$/)
    expect(nuevaSemilla()).not.toBe(a)
  })

  it('con la misma semilla, el resultado se puede repetir y comprobar', () => {
    const s = nuevaSemilla()
    expect(valorAleatorio(s, 'pareja-1', 3)).toBe(valorAleatorio(s, 'pareja-1', 3))
    expect(valorAleatorio(s, 'pareja-1', 3)).not.toBe(valorAleatorio(s, 'pareja-2', 3))
    expect(valorAleatorio(s, 'pareja-1', 3)).not.toBe(valorAleatorio(s, 'pareja-1', 4))
  })

  it('el valor está entre 0 y 1', () => {
    const s = nuevaSemilla()
    for (let i = 0; i < 1000; i++) {
      const v = valorAleatorio(s, `p${i}`, 1)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('con probabilidad 0 nunca hay agenda y con 1 siempre', () => {
    const s = nuevaSemilla()
    for (let i = 0; i < 200; i++) {
      expect(sortear(s, `p${i}`, 1, 0).resultado).toBe(false)
      expect(sortear(s, `p${i}`, 1, 1).resultado).toBe(true)
    }
  })

  it('con probabilidad 0,5 la proporción global es cercana a 0,5', () => {
    const s = nuevaSemilla()
    let si = 0
    const n = 20_000
    for (let i = 0; i < n; i++) if (sortear(s, `pareja-${i}`, (i % 10) + 1, 0.5).resultado) si++
    // Desviación típica esperada: 0,0035. Margen de 0,02 (casi 6 desviaciones).
    expect(Math.abs(si / n - 0.5)).toBeLessThan(0.02)
  })

  it('rechaza probabilidades fuera de 0 a 1', () => {
    expect(() => sortear('s', 'p', 1, 1.5)).toThrow()
    expect(() => sortear('s', 'p', 1, -0.1)).toThrow()
  })
})

describe('Elegibilidad: hacen falta los dos check-ins', () => {
  const r = { avance: 3, siguiente_paso: 3 }
  const nada = { sinTutor: false, retirado: false }
  it.each([
    [{ semana: 1, estudiante: r, tutor: r }, null],
    [{ semana: 1, estudiante: null, tutor: r }, 'falta_estudiante'],
    [{ semana: 1, estudiante: r, tutor: null }, 'falta_tutor'],
    [{ semana: 1, estudiante: null, tutor: null }, 'faltan_ambos'],
    [undefined, 'faltan_ambos'],
  ] as const)('caso %#', (semana, esperado) => {
    expect(motivoNoElegible(semana as any, nada)).toBe(esperado)
  })

  it('sin tutor o con alguien retirado no hay sorteo', () => {
    const s = { semana: 1, estudiante: r, tutor: r }
    expect(motivoNoElegible(s, { sinTutor: true, retirado: false })).toBe('sin_tutor')
    expect(motivoNoElegible(s, { sinTutor: false, retirado: true })).toBe('retirado')
  })
})
