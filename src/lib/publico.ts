// Textos comunes de las páginas públicas.

/**
 * En una página pública nunca se muestra "[PENDIENTE]": en su lugar, este
 * texto (indicación de Fernando, 13/11/2026). Lo que falta está en PENDIENTES.md.
 */
export const EN_ELABORACION = 'En elaboración. Pendiente de revisión por el Comité de Ética de la Universidad de Salamanca.'

export const AUTORIA = 'Prototipo del Trabajo Fin de Máster de Fernando Martín Vaquero · Universidad de Salamanca'

/** Correo de contacto facilitado por Fernando. */
export const CORREO_CONTACTO = 'ferca@usal.es'

export function estaPendiente(texto: string | null | undefined): boolean {
  return !texto || texto.includes('[PENDIENTE')
}

export const VERSION = __VERSION_SINTONIA__
