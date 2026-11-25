import { beforeEach, describe, expect, it } from 'vitest'
import { destinoTrasEntrar, recordarVolver, rutaSegura, tomarVolver } from './volver'

describe('volver a la pantalla tras entrar', () => {
  beforeEach(() => localStorage.clear())

  it('recuerda la pantalla una sola vez', () => {
    recordarVolver('/estudiante/checkin')
    expect(tomarVolver()).toBe('/estudiante/checkin')
    expect(tomarVolver()).toBeNull()
  })

  it('solo admite rutas internas', () => {
    for (const r of ['https://otro.sitio', '//otro.sitio/x', '/\\otro.sitio', 'estudiante', '/acceso', '/acceso/confirmar', '/registro?c=1']) {
      expect(rutaSegura(r), r).toBe(false)
    }
    expect(rutaSegura('/tutor/checkin?x=1')).toBe(true)
    expect(rutaSegura('/accesibilidad')).toBe(true)
  })

  it('caduca a la hora', () => {
    recordarVolver('/cuenta')
    expect(tomarVolver(Date.now() + 2 * 60 * 60 * 1000)).toBeNull()
  })

  it('sin pantalla recordada, va al inicio del perfil', () => {
    expect(destinoTrasEntrar('/tutor')).toBe('/tutor')
    expect(destinoTrasEntrar(null)).toBe('/')
    recordarVolver('/calendario')
    expect(destinoTrasEntrar('/tutor')).toBe('/calendario')
  })
})
