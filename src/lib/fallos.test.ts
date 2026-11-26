import { beforeEach, describe, expect, it, vi } from 'vitest'
import { esErrorDeCarga, recargarUnaVez } from './fallos'

describe('versión nueva con la pestaña abierta', () => {
  beforeEach(() => sessionStorage.clear())

  it('reconoce los errores de carga de Chrome, Firefox y Safari', () => {
    expect(esErrorDeCarga(new TypeError('Failed to fetch dynamically imported module: https://x/assets/A-1.js'))).toBe(true)
    expect(esErrorDeCarga(new TypeError('error loading dynamically imported module'))).toBe(true)
    expect(esErrorDeCarga(new TypeError('Importing a module script failed.'))).toBe(true)
    expect(esErrorDeCarga(new Error('Unable to preload CSS for /assets/a.css'))).toBe(true)
    expect(esErrorDeCarga(new Error('Cannot read properties of undefined'))).toBe(false)
  })

  it('recarga una sola vez: si vuelve a fallar enseguida, no entra en bucle', () => {
    const assign = vi.fn()
    vi.stubGlobal('location', { ...window.location, assign, reload: vi.fn() })
    expect(recargarUnaVez('/tutor', 1_000_000)).toBe(true)
    expect(assign).toHaveBeenCalledWith('/tutor')
    expect(recargarUnaVez('/tutor', 1_010_000)).toBe(false)
    expect(recargarUnaVez('/tutor', 1_040_000)).toBe(true)
    vi.unstubAllGlobals()
  })
})
