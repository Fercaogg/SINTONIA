import { describe, expect, it } from 'vitest'
import { agruparPlazos, grupoPlazo, resumenPlazos } from './puente'
import { NECESITO, PUERTAS, TIPOS_DOCTORADO } from '@/contenido/puente'

const c = (fecha_apertura: string | null, fecha_cierre: string | null, id = 0) => ({ id, fecha_apertura, fecha_cierre })
const HOY = '2027-02-10'

describe('plazos de las convocatorias', () => {
  it('sabe si está abierta, abre pronto, cerrada o sin fechas', () => {
    expect(grupoPlazo(c('2027-02-01', '2027-02-28'), HOY)).toBe('abierta')
    expect(grupoPlazo(c('2027-02-10', '2027-02-10'), HOY)).toBe('abierta') // el mismo día cuenta
    expect(grupoPlazo(c('2027-03-01', '2027-03-31'), HOY)).toBe('proxima')
    expect(grupoPlazo(c('2027-01-01', '2027-02-09'), HOY)).toBe('cerrada')
    expect(grupoPlazo(c(null, null), HOY)).toBe('sin_fechas')
    expect(grupoPlazo(c(null, '2027-02-20'), HOY)).toBe('abierta')
  })

  it('ordena lo más urgente primero y lo cerrado de más reciente a más antiguo', () => {
    const g = agruparPlazos([c('2027-01-01', '2027-03-01', 1), c('2027-01-01', '2027-02-15', 2), c('2027-05-01', null, 3), c('2027-04-01', null, 4), c('2026-01-01', '2026-02-01', 5), c('2026-01-01', '2026-12-01', 6)], HOY)
    expect(g.abierta.map((x) => x.id)).toEqual([2, 1])
    expect(g.proxima.map((x) => x.id)).toEqual([4, 3])
    expect(g.cerrada.map((x) => x.id)).toEqual([6, 5])
  })

  it('la puerta de plazos resume lo más urgente', () => {
    expect(resumenPlazos([c('2027-01-01', '2027-02-15')], HOY)).toMatch(/^1 abierta · la primera cierra el 15 feb/)
    expect(resumenPlazos([c('2027-04-01', '2027-04-30')], HOY)).toMatch(/^Ninguna abierta · la próxima abre el 1 abr/)
    expect(resumenPlazos([c(null, null)], HOY)).toBe('Ninguna abierta ahora')
  })
})

describe('contenido de Puente', () => {
  it('seis puertas con clave única', () => {
    expect(new Set(PUERTAS.map((p) => p.clave)).size).toBe(6)
  })

  it('nada sin fuente oficial, y lo no comprobado sale como [PENDIENTE]', () => {
    for (const a of [...NECESITO, ...TIPOS_DOCTORADO]) {
      expect(a.fuente.url, a.titulo).toMatch(/^https:\/\/[^/]*(boe\.es|usal\.es|jcyl\.es)\//)
      if (a.texto === null) expect(a.pendiente, a.titulo).toBeTruthy()
      if (a.pendiente) expect(a.pendiente, a.titulo).toMatch(/^\[PENDIENTE: .+\]$/)
    }
  })
})
