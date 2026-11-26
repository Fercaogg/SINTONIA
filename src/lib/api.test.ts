import { afterEach, describe, expect, it, vi } from 'vitest'
import { cuandoCaduqueLaSesion, ErrorSintonia, interpretar, MENSAJE_SESION_CADUCADA, MENSAJE_SIN_CONEXION } from './api'

// Así devuelve supabase-js los errores: no los lanza.
const fallo = (status: number, error: { message: string; code?: string; hint?: string }) => ({ data: null, error, status })

function capturar(fn: () => unknown): ErrorSintonia {
  try {
    fn()
  } catch (e) {
    return e as ErrorSintonia
  }
  throw new Error('No ha lanzado ningún error')
}

describe('traducción de las respuestas de la base de datos', () => {
  afterEach(() => cuandoCaduqueLaSesion(() => {}))

  it('devuelve los datos si no hay error', () => {
    expect(interpretar({ data: { a: 1 }, error: null, status: 200 })).toEqual({ a: 1 })
  })

  it('sin red, avisa de la conexión (supabase-js devuelve estado 0, no lanza)', () => {
    const e = capturar(() => interpretar(fallo(0, { message: 'TypeError: Failed to fetch', code: '' })))
    expect(e.codigo).toBe('SIN_CONEXION')
    expect(e.message).toBe(MENSAJE_SIN_CONEXION)
  })

  it('con la sesión caducada, lo dice y avisa a quien vigila la sesión', () => {
    const aviso = vi.fn()
    cuandoCaduqueLaSesion(aviso)
    for (const r of [fallo(401, { message: 'JWT expired', code: 'PGRST303' }), fallo(401, { message: 'permission denied', code: '42501' })]) {
      const e = capturar(() => interpretar(r))
      expect(e.codigo).toBe('SESION_CADUCADA')
      expect(e.message).toBe(MENSAJE_SESION_CADUCADA)
    }
    expect(aviso).toHaveBeenCalledTimes(2)
  })

  it('los errores propios de SINTONÍA conservan su mensaje', () => {
    const e = capturar(() => interpretar(fallo(400, { message: 'La semana ya está cerrada.', code: 'P0001', hint: 'SEMANA_CERRADA' })))
    expect(e.codigo).toBe('SEMANA_CERRADA')
    expect(e.message).toBe('La semana ya está cerrada.')
  })

  it('el resto se sustituye por un mensaje genérico, sin detalles técnicos', () => {
    const e = capturar(() => interpretar(fallo(500, { message: 'relation "x" does not exist', code: '42P01' })))
    expect(e.message).not.toContain('relation')
    expect(e.codigo).toBe('42P01')
  })
})
