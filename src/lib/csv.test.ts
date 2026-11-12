import { describe, expect, it } from 'vitest'
import { aCsv, pivotarCuestionario } from './csv'

describe('CSV para el análisis', () => {
  it('cabecera, comas y salto de línea final', () => {
    expect(aCsv([{ a: 1, b: 'x' }, { a: 2, b: 'y' }])).toBe('a,b\n1,x\n2,y\n')
  })

  it('los valores que faltan se escriben como NA', () => {
    expect(aCsv([{ a: null, b: undefined, c: '' }], ['a', 'b', 'c'])).toBe('a,b,c\nNA,NA,NA\n')
  })

  it('pone comillas a los textos con comas, comillas o saltos de línea', () => {
    expect(aCsv([{ t: 'Máster en "CTS", USAL' }])).toBe('t\n"Máster en ""CTS"", USAL"\n')
    expect(aCsv([{ t: 'a\nb' }])).toBe('t\n"a\nb"\n')
  })

  it('distingue el texto "NA" de un valor que falta', () => {
    expect(aCsv([{ t: 'NA' }])).toBe('t\n"NA"\n')
  })

  it('números con punto decimal y verdadero/falso como 1/0', () => {
    expect(aCsv([{ p: 0.5, v: true, f: false }])).toBe('p,v,f\n0.5,1,0\n')
  })

  it('respeta el orden de columnas indicado', () => {
    expect(aCsv([{ b: 2, a: 1 }], ['a', 'b'])).toBe('a,b\n1,2\n')
  })
})

describe('Cuestionarios en formato ancho', () => {
  const r = (est: string, variable: string, valor: unknown, cuestionario = 'pretest', fecha = '2027-01-10') => ({
    id_estudiante: est, id_pareja: `P-${est}`, master: 'M', cuestionario, variable, valor, respondido_at: fecha,
  })

  it('una fila por estudiante y una columna por variable, en orden', () => {
    const filas = pivotarCuestionario(
      [r('E1', 'h3', true), r('E1', 'escala', 3), r('E2', 'escala', 4), r('E1', 'escala', 5, 'postest')],
      'pretest',
      ['escala', 'h3'],
    )
    expect(filas).toEqual([
      { id_estudiante: 'E1', id_pareja: 'P-E1', master: 'M', cuestionario: 'pretest', respondido_at: '2027-01-10', escala: 3, h3: true },
      { id_estudiante: 'E2', id_pareja: 'P-E2', master: 'M', cuestionario: 'pretest', respondido_at: '2027-01-10', escala: 4, h3: null },
    ])
  })

  it('la fecha es la de la última respuesta', () => {
    const [f] = pivotarCuestionario([r('E1', 'a', 1, 'pretest', '2027-01-10'), r('E1', 'b', 1, 'pretest', '2027-01-12')], 'pretest', ['a', 'b'])
    expect(f.respondido_at).toBe('2027-01-12')
  })
})
