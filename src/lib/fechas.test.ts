import { describe, expect, it } from 'vitest'
import { desdeApertura, hastaCierre } from './fechas'

describe('fechas en hora de Madrid', () => {
  it('el cierre se muestra como el último minuto del día', () => {
    expect(hastaCierre('2027-02-14T23:00:00Z')).toBe('domingo 14 de febrero a las 23:59')
  })

  it('respeta el horario de verano', () => {
    expect(hastaCierre('2027-03-28T22:00:00Z')).toBe('domingo 28 de marzo a las 23:59')
  })

  it('la apertura se muestra a las 00:00', () => {
    expect(desdeApertura('2027-01-31T23:00:00Z')).toBe('lunes 1 de febrero a las 00:00')
  })
})
