// Única puerta de la aplicación hacia los datos: llama a las funciones de la
// base de datos (que comprueban los permisos) y traduce los errores a un
// español comprensible.

import { supabase } from './supabase'

export class ErrorSintonia extends Error {
  codigo: string
  constructor(mensaje: string, codigo = 'DESCONOCIDO') {
    super(mensaje)
    this.codigo = codigo
  }
}

const MENSAJE_GENERICO = 'Algo no ha ido bien. Inténtalo de nuevo en unos segundos.'
export const MENSAJE_SIN_CONEXION = 'No hay conexión. Comprueba tu red e inténtalo de nuevo.'
export const MENSAJE_SESION_CADUCADA = 'Tu sesión ha terminado. Vuelve a entrar y seguirás donde lo dejaste.'

// Quien quiera enterarse de que la sesión ha caducado (src/lib/vigilar-sesion.ts).
// Se hace así para no importar el router ni el almacén desde aquí.
let alCaducar: (() => void) | null = null
export function cuandoCaduqueLaSesion(fn: () => void) {
  alCaducar = fn
}

interface RespuestaRpc {
  data: unknown
  error: { message: string; code?: string; hint?: string } | null
  status: number
}

/**
 * Traduce la respuesta de Supabase. Ojo: la librería no lanza un error cuando
 * falla la red; lo devuelve con estado 0. Una sesión caducada llega con 401
 * (o con los códigos PGRST301 a PGRST303 del token).
 */
export function interpretar<T>(respuesta: RespuestaRpc): T {
  const { data, error, status } = respuesta
  if (!error) return data as T
  if (status === 0 || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
    throw new ErrorSintonia(MENSAJE_SIN_CONEXION, 'SIN_CONEXION')
  }
  if (status === 401 || /^PGRST30[0-3]$/.test(error.code ?? '')) {
    alCaducar?.()
    throw new ErrorSintonia(MENSAJE_SESION_CADUCADA, 'SESION_CADUCADA')
  }
  // Los errores propios de SINTONÍA llevan un código en "hint" y un mensaje
  // ya redactado en español. El resto se sustituye por uno genérico.
  if (error.hint && /^[A-Z_]+$/.test(error.hint)) {
    throw new ErrorSintonia(error.message, error.hint)
  }
  throw new ErrorSintonia(MENSAJE_GENERICO, error.code || 'DESCONOCIDO')
}

export async function llamar<T = unknown>(funcion: string, args: Record<string, unknown> = {}): Promise<T> {
  let respuesta: RespuestaRpc
  try {
    respuesta = await supabase.rpc(funcion, args)
  } catch {
    throw new ErrorSintonia(MENSAJE_SIN_CONEXION, 'SIN_CONEXION')
  }
  return interpretar<T>(respuesta)
}

export function mensajeDeError(e: unknown): string {
  if (e instanceof ErrorSintonia) return e.message
  return MENSAJE_GENERICO
}
