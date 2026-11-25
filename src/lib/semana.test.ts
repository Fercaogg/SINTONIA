import { describe, expect, it } from 'vitest'
import { avisoCambioSemana } from './semana'
import type { Calendario } from './tipos-checkin'

const abierta = (semana: number): Calendario => ({ estado: 'abierta', semana, semanas: 12 })
const entre: Calendario = { estado: 'entre', proxima: 4, semanas: 12 }

describe('cambio de semana con la página abierta', () => {
  it('misma semana abierta: nada que avisar', () => {
    expect(avisoCambioSemana(abierta(3), abierta(3))).toBeNull()
    expect(avisoCambioSemana(undefined, abierta(3))).toBeNull()
  })
  it('se cerró la semana: lo dice y que no se ha guardado', () => {
    expect(avisoCambioSemana(abierta(3), entre)).toMatch(/semana 3 se cerró.*no se ha guardado\.$/)
  })
  it('empezó otra semana: dice cuál', () => {
    expect(avisoCambioSemana(abierta(3), abierta(4))).toMatch(/semana 3 se cerró.*Ahora está abierto el de la semana 4\./)
  })
  it('se abrió una semana con la página cerrada', () => {
    expect(avisoCambioSemana(entre, abierta(4))).toBe('Ya está abierto el check-in de la semana 4.')
  })
})
