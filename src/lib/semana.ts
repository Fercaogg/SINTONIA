// Cambios de semana con la página del check-in abierta.

import type { Calendario } from './tipos-checkin'

/**
 * Compara el calendario que se tenía en pantalla con el actual. Devuelve el
 * aviso que hay que mostrar, o null si sigue abierta la misma semana.
 */
export function avisoCambioSemana(antes: Calendario | undefined, ahora: Calendario): string | null {
  if (!antes) return null
  if (antes.estado === ahora.estado && antes.semana === ahora.semana) return null
  if (antes.estado !== 'abierta') {
    return ahora.estado === 'abierta' ? `Ya está abierto el check-in de la semana ${ahora.semana}.` : null
  }
  const cerrada = `El check-in de la semana ${antes.semana} se cerró mientras tenías la página abierta, y lo que no habías enviado no se ha guardado.`
  return ahora.estado === 'abierta' ? `${cerrada} Ahora está abierto el de la semana ${ahora.semana}.` : cerrada
}
