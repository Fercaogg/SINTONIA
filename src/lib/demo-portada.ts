// Demostración de la portada: dos miradas de 1 a 5 y, si se separan, tres
// preguntas de ejemplo. Todo ocurre en el navegador: sin llamadas a ninguna
// API y sin guardar nada.
//
// Usa la misma regla pública que SINTONÍA (una diferencia de 2 puntos o más;
// la regla de 1 punto durante 2 semanas no se puede ver en una sola semana) y
// preguntas del banco local (supabase/migrations/20261114000100_agenda.sql).

export const BANCO = {
  avance: [
    '¿Qué parte del trabajo consideráis cerrada y cuál sigue abierta?',
    '¿Qué se ha hecho desde la última tutoría y qué falta para el próximo entregable?',
    '¿Qué criterio vais a usar para dar por terminada una parte del trabajo?',
    '¿Qué parte del trabajo conviene revisar juntos en esta tutoría?',
  ],
  siguiente: [
    '¿Cuál es el próximo entregable y para cuándo?',
    '¿Cuál es el siguiente paso concreto y qué hace falta para darlo?',
    '¿Qué decisión pendiente conviene tomar para poder seguir?',
    '¿Qué hará cada uno antes de la próxima tutoría?',
  ],
  general: [
    '¿Hay algo que esté frenando el avance?',
    '¿Qué dudas conviene resolver antes de seguir?',
    '¿Cómo y cuándo vais a estar en contacto hasta la próxima tutoría?',
  ],
} as const

export interface ResultadoDemo {
  diferencia: number
  desajuste: boolean
  preguntas: string[]
}

export function compararMiradas(estudiante: number, tutor: number): ResultadoDemo {
  const diferencia = Math.abs(estudiante - tutor)
  const desajuste = diferencia >= 2
  if (!desajuste) return { diferencia, desajuste, preguntas: [] }
  const i = estudiante + tutor
  return {
    diferencia,
    desajuste,
    preguntas: [
      BANCO.avance[i % BANCO.avance.length],
      BANCO.siguiente[(i + 1) % BANCO.siguiente.length],
      BANCO.general[i % BANCO.general.length],
    ],
  }
}
