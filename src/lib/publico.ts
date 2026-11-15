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

/**
 * Para contenido del proyecto que Fernando aún no ha facilitado (por ejemplo,
 * las hipótesis): mismo criterio, sin atribuirlo al Comité de Ética.
 */
export const EN_ELABORACION_PROYECTO = 'En elaboración. Se publicará aquí cuando esté disponible.'

/**
 * Dirección pública de la web. Se cambia en un solo sitio (variable
 * VITE_URL_SITIO) cuando haya dominio propio.
 */
export const URL_SITIO = (import.meta.env.VITE_URL_SITIO as string | undefined)?.replace(/\/$/, '') || 'https://sintonia360-ferca.vercel.app'
