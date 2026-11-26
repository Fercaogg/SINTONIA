// Borradores del check-in: lo que alguien ha marcado y aún no ha enviado se
// guarda en este navegador, para no perderlo si la sesión caduca, se va la
// conexión o se cierra la pestaña por error.
//
// Qué NO se guarda: las preguntas privadas (el bienestar), por ser un dato
// sensible que no debe quedar en un ordenador compartido. Al cerrar sesión se
// borran todos los borradores. Cada borrador caduca al cerrarse su semana.

const PREFIJO = 'sintonia:borrador:'

export interface Borrador<T> {
  valores: T
  /** Fecha de cierre de la semana (ISO): después ya no sirve. */
  caduca: string
}

function almacen(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function claveBorrador(tipo: 'estudiante' | 'tutor', usuario: string, semana: number) {
  return `${PREFIJO}${tipo}:${usuario}:${semana}`
}

export function guardarBorrador<T>(clave: string, valores: T, caduca: string) {
  try {
    almacen()?.setItem(clave, JSON.stringify({ valores, caduca } satisfies Borrador<T>))
  } catch {
    // Sin espacio o almacenamiento bloqueado: el borrador es una ayuda, no imprescindible.
  }
}

export function leerBorrador<T>(clave: string, ahora = new Date()): T | null {
  try {
    const texto = almacen()?.getItem(clave)
    if (!texto) return null
    const b = JSON.parse(texto) as Borrador<T>
    if (!b || typeof b !== 'object' || !b.caduca || new Date(b.caduca) < ahora) {
      almacen()?.removeItem(clave)
      return null
    }
    return b.valores
  } catch {
    return null
  }
}

export function borrarBorrador(clave: string) {
  try {
    almacen()?.removeItem(clave)
  } catch {
    // Nada que hacer.
  }
}

/** Borra todos los borradores de SINTONÍA de este navegador (al cerrar sesión). */
export function borrarBorradores() {
  const a = almacen()
  if (!a) return
  try {
    const claves: string[] = []
    for (let i = 0; i < a.length; i++) {
      const k = a.key(i)
      if (k?.startsWith(PREFIJO)) claves.push(k)
    }
    claves.forEach((k) => a.removeItem(k))
  } catch {
    // Nada que hacer.
  }
}
