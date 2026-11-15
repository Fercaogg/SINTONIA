// Llamadas a las funciones del servidor de SINTONÍA (carpeta api/) para lo
// que se puede hacer sin sesión: registro, acceso y contacto.

export interface RespuestaServidor {
  ok: boolean
  error?: string
  /** Código HTTP (503: el servidor no puede enviar correos ahora). */
  status?: number
}

const SIN_CONEXION = 'No hay conexión. Comprueba tu red e inténtalo de nuevo.'

export async function enviarAlServidor(funcion: 'registro' | 'acceso' | 'contacto', datos: Record<string, unknown>): Promise<RespuestaServidor> {
  try {
    const r = await fetch(`/api/${funcion}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    })
    const cuerpo = await r.json().catch(() => null)
    if (cuerpo && typeof cuerpo.ok === 'boolean') return { ...cuerpo, status: r.status }
    return { ok: false, error: 'Algo no ha ido bien. Inténtalo de nuevo en unos minutos.' }
  } catch {
    return { ok: false, error: SIN_CONEXION }
  }
}
