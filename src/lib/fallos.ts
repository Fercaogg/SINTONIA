// Fallos inesperados de la aplicación.
//
// El caso más corriente: se publica una versión nueva mientras alguien tiene
// SINTONÍA abierta. Su pestaña pide los archivos de la versión anterior, que
// ya no existen, y la pantalla se quedaría en blanco. Se recarga la página una
// sola vez para traer la versión nueva; si vuelve a fallar, se avisa.

import { ref } from 'vue'

/** Mensaje del aviso general (vacío si no hay ningún fallo que mostrar). */
export const fallo = ref('')

export const MENSAJE_VERSION = 'No hemos podido abrir esta pantalla. Recarga la página para seguir.'
export const MENSAJE_FALLO = 'Algo ha fallado en esta pantalla. Si no ves bien la información, recarga la página.'

const CLAVE = 'sintonia:recarga'
const ESPERA_MS = 30_000

export function esErrorDeCarga(e: unknown): boolean {
  const m = e instanceof Error ? e.message : String(e ?? '')
  return /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS|Loading (CSS )?chunk .* failed/i.test(m)
}

/**
 * Recarga la página (en `destino`, si se da) salvo que ya se haya recargado
 * por este motivo hace menos de 30 s. Devuelve true si va a recargar.
 */
export function recargarUnaVez(destino?: string, ahora = Date.now()): boolean {
  try {
    const ultima = Number(sessionStorage.getItem(CLAVE) || 0)
    if (ahora - ultima < ESPERA_MS) return false
    sessionStorage.setItem(CLAVE, String(ahora))
  } catch {
    return false
  }
  if (destino) window.location.assign(destino)
  else window.location.reload()
  return true
}
