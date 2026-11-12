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

export async function llamar<T = unknown>(funcion: string, args: Record<string, unknown> = {}): Promise<T> {
  let respuesta
  try {
    respuesta = await supabase.rpc(funcion, args)
  } catch {
    throw new ErrorSintonia('No hay conexión. Comprueba tu red e inténtalo de nuevo.', 'SIN_CONEXION')
  }
  const { data, error } = respuesta
  if (error) {
    // Los errores propios de SINTONÍA llevan un código en "hint" y un mensaje
    // ya redactado en español. El resto se sustituye por uno genérico.
    if (error.hint && /^[A-Z_]+$/.test(error.hint)) {
      throw new ErrorSintonia(error.message, error.hint)
    }
    throw new ErrorSintonia(MENSAJE_GENERICO, error.code || 'DESCONOCIDO')
  }
  return data as T
}

export function mensajeDeError(e: unknown): string {
  if (e instanceof ErrorSintonia) return e.message
  return MENSAJE_GENERICO
}
