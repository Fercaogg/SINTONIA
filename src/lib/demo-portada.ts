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

/** El mismo banco, traducido para las páginas en inglés (/en). */
export const BANCO_EN = {
  avance: [
    'Which part of the work do you both consider finished, and which is still open?',
    'What has been done since the last meeting, and what is left for the next deliverable?',
    'What criterion will you use to consider a part of the work finished?',
    'Which part of the work is worth reviewing together in this meeting?',
  ],
  siguiente: [
    'What is the next deliverable, and when is it due?',
    'What is the concrete next step, and what is needed to take it?',
    'Which pending decision should be made in order to move on?',
    'What will each of you do before the next meeting?',
  ],
  general: [
    'Is anything slowing the progress down?',
    'Which doubts should be cleared up before going on?',
    'How and when will you keep in touch until the next meeting?',
  ],
} as const

export interface ResultadoDemo {
  diferencia: number
  desajuste: boolean
  preguntas: string[]
}

export function compararMiradas(estudiante: number, tutor: number, idioma: 'es' | 'en' = 'es'): ResultadoDemo {
  const diferencia = Math.abs(estudiante - tutor)
  const desajuste = diferencia >= 2
  if (!desajuste) return { diferencia, desajuste, preguntas: [] }
  const i = estudiante + tutor
  const banco = idioma === 'en' ? BANCO_EN : BANCO
  return {
    diferencia,
    desajuste,
    preguntas: [
      banco.avance[i % banco.avance.length],
      banco.siguiente[(i + 1) % banco.siguiente.length],
      banco.general[i % banco.general.length],
    ],
  }
}
