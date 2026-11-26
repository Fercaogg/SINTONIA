// Recordar a qué pantalla quería ir alguien cuando tuvo que (volver a) entrar,
// para llevarle allí después. El enlace de acceso llega por correo y puede
// abrirse en otra pestaña, así que se guarda en el navegador durante un rato.

const CLAVE = 'sintonia:volver'
const DURACION_MS = 60 * 60 * 1000

/** Solo rutas internas de la aplicación: nada de //otro-sitio ni de /acceso. */
export function rutaSegura(ruta: unknown): ruta is string {
  return (
    typeof ruta === 'string' &&
    ruta.startsWith('/') &&
    !ruta.startsWith('//') &&
    !ruta.includes('\\') &&
    !/^\/(acceso|registro)(\/|\?|#|$)/.test(ruta)
  )
}

export function recordarVolver(ruta: string) {
  if (!rutaSegura(ruta)) return
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ ruta, hasta: Date.now() + DURACION_MS }))
  } catch {
    // Sin almacenamiento: se entra en el inicio, como antes.
  }
}

/** Devuelve la ruta guardada (una sola vez) o null. */
export function tomarVolver(ahora = Date.now()): string | null {
  try {
    const texto = localStorage.getItem(CLAVE)
    localStorage.removeItem(CLAVE)
    if (!texto) return null
    const { ruta, hasta } = JSON.parse(texto) as { ruta: unknown; hasta: number }
    return hasta > ahora && rutaSegura(ruta) ? ruta : null
  } catch {
    return null
  }
}

/** Adónde ir justo después de entrar: la pantalla recordada o el inicio del perfil. */
export function destinoTrasEntrar(inicio: string | null): string {
  return tomarVolver() ?? inicio ?? '/'
}
