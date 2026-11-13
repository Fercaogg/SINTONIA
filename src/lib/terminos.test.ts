import { describe, expect, it } from 'vitest'
import { adaptarTexto } from './terminos'

describe('Términos según el tipo de trabajo', () => {
  it('en TFG y TFM no cambia nada', () => {
    expect(adaptarTexto('¿Te sientes apoyado/a por tu tutor/a?', 'TFM')).toBe('¿Te sientes apoyado/a por tu tutor/a?')
    expect(adaptarTexto('Tus estudiantes', 'TFG')).toBe('Tus estudiantes')
    expect(adaptarTexto('Tus estudiantes', null)).toBe('Tus estudiantes')
  })

  it('en una tesis: director/a de tesis y doctorando/a', () => {
    expect(adaptarTexto('¿Te sientes apoyado/a por tu tutor/a?', 'TESIS')).toBe('¿Te sientes apoyado/a por tu director/a de tesis?')
    expect(adaptarTexto('Cada semana respondes sobre todos tus estudiantes.', 'TESIS')).toBe('Cada semana respondes sobre todos tus doctorandos/as.')
    expect(adaptarTexto('Tu estudiante ve las mismas.', 'TESIS')).toBe('Tu doctorando/a ve las mismas.')
    expect(adaptarTexto('Tutor/a', 'TESIS')).toBe('Director/a de tesis')
  })

  it('cotutoría pasa a codirección', () => {
    expect(adaptarTexto('Cotutor/a', 'TESIS')).toBe('Codirector/a')
    expect(adaptarTexto('la cotutoría', 'TESIS')).toBe('la codirección')
  })

  it('"tutoría" (la reunión) no cambia', () => {
    expect(adaptarTexto('para la próxima tutoría', 'TESIS')).toBe('para la próxima tutoría')
  })
})
