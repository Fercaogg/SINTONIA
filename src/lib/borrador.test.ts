import { beforeEach, describe, expect, it } from 'vitest'
import { borrarBorrador, borrarBorradores, claveBorrador, guardarBorrador, leerBorrador } from './borrador'

describe('borradores del check-in', () => {
  beforeEach(() => localStorage.clear())
  const futuro = new Date(Date.now() + 86_400_000).toISOString()

  it('guarda y recupera lo marcado', () => {
    const k = claveBorrador('estudiante', 'u1', 3)
    guardarBorrador(k, { avance: 4 }, futuro)
    expect(leerBorrador(k)).toEqual({ avance: 4 })
    borrarBorrador(k)
    expect(leerBorrador(k)).toBeNull()
  })

  it('caduca al cerrarse la semana', () => {
    const k = claveBorrador('tutor', 'u1', 3)
    guardarBorrador(k, { a: 1 }, new Date(Date.now() - 1000).toISOString())
    expect(leerBorrador(k)).toBeNull()
    expect(localStorage.getItem(k)).toBeNull()
  })

  it('cada persona y cada semana tienen su borrador', () => {
    guardarBorrador(claveBorrador('estudiante', 'u1', 3), { a: 1 }, futuro)
    expect(leerBorrador(claveBorrador('estudiante', 'u2', 3))).toBeNull()
    expect(leerBorrador(claveBorrador('estudiante', 'u1', 4))).toBeNull()
  })

  it('al cerrar sesión se borran todos, y nada más', () => {
    guardarBorrador(claveBorrador('estudiante', 'u1', 3), { a: 1 }, futuro)
    guardarBorrador(claveBorrador('tutor', 'u2', 3), { a: 1 }, futuro)
    localStorage.setItem('otra-cosa', 'x')
    borrarBorradores()
    expect(localStorage.length).toBe(1)
    expect(localStorage.getItem('otra-cosa')).toBe('x')
  })

  it('un borrador dañado no rompe nada', () => {
    const k = claveBorrador('estudiante', 'u1', 3)
    localStorage.setItem(k, '{no es json')
    expect(leerBorrador(k)).toBeNull()
  })
})
