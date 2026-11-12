import { describe, expect, it } from 'vitest'
import { convocatoriasProximas, decidirPuente, lineaPuente, type Convocatoria } from './puente'

const conv = (id: number, nombre: string, apertura: string | null, cierre: string | null): Convocatoria => ({
  id, nombre, fecha_apertura: apertura, fecha_cierre: cierre,
})

describe('Convocatorias en las próximas 4 semanas', () => {
  const ref = '2027-02-15'

  it('cuenta las que abren o cierran entre hoy y dentro de 28 días', () => {
    const lista = [
      conv(1, 'Abre pronto', '2027-03-01', '2027-04-30'),
      conv(2, 'Cierra pronto', '2027-01-10', '2027-03-14'),
      conv(3, 'Lejana', '2027-05-01', '2027-06-01'),
      conv(4, 'Ya cerrada', '2026-12-01', '2027-02-14'),
      conv(5, 'Abierta sin plazo cerca', '2027-01-01', '2027-04-01'),
    ]
    expect(convocatoriasProximas(lista, ref).map((c) => c.id)).toEqual([1, 2])
  })

  it('el día de referencia cuenta y el día 28 ya no', () => {
    expect(convocatoriasProximas([conv(1, 'A', ref, null)], ref)).toHaveLength(1)
    expect(convocatoriasProximas([conv(1, 'A', '2027-03-15', null)], ref)).toHaveLength(0)
    expect(convocatoriasProximas([conv(1, 'A', '2027-03-14', null)], ref)).toHaveLength(1)
  })

  it('ignora las convocatorias sin fechas (pendientes de rellenar)', () => {
    expect(convocatoriasProximas([conv(1, 'FPU', null, null)], ref)).toEqual([])
  })
})

describe('La línea de la agenda', () => {
  it('una convocatoria', () => {
    expect(lineaPuente([conv(1, 'FPU', null, null)])).toBe('Se acerca el plazo de FPU. ¿Lo comentáis en la próxima tutoría?')
  })

  it('varias convocatorias', () => {
    expect(lineaPuente([conv(1, 'FPU', null, null), conv(2, 'FPI', null, null), conv(3, 'Admisión', null, null)]))
      .toBe('Se acerca el plazo de FPU, FPI y Admisión. ¿Lo comentáis en la próxima tutoría?')
  })

  it('ninguna: sin línea', () => {
    expect(lineaPuente([])).toBeNull()
  })

  it('no contiene rayas largas', () => {
    expect(lineaPuente([conv(1, 'A', null, null), conv(2, 'B', null, null)])).not.toContain('—')
  })
})

describe('Decisión por pareja', () => {
  const convs = [conv(7, 'FPU', '2027-02-20', '2027-03-20')]

  it('solo lleva línea quien tiene Puente activado, pero se registra para todos', () => {
    const d = decidirPuente([{ pareja_id: 'a', activado: true }, { pareja_id: 'b', activado: false }], convs, '2027-02-15')
    expect(d).toEqual([
      { pareja_id: 'a', activado: true, linea: 'Se acerca el plazo de FPU. ¿Lo comentáis en la próxima tutoría?', convocatorias: [7] },
      { pareja_id: 'b', activado: false, linea: null, convocatorias: [] },
    ])
  })

  it('activado pero sin convocatorias cerca: sin línea', () => {
    const d = decidirPuente([{ pareja_id: 'a', activado: true }], convs, '2027-06-01')
    expect(d[0]).toMatchObject({ activado: true, linea: null })
  })
})
