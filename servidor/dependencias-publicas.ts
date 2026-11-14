// Dependencias reales de registro, acceso y contacto: Supabase y el correo.

import { clienteServidor } from './almacen-supabase.js'
import { enviadorDesdeEntorno } from './correo.js'
import type { Dependencias } from './acceso-publico.js'

export function dependenciasDesdeEntorno(env: Record<string, string | undefined> = process.env): Dependencias | null {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL
  const clave = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !clave) return null
  const cliente = clienteServidor(url, clave)
  const rpc = async <T>(funcion: string, args: Record<string, unknown>): Promise<T> => {
    const { data, error } = await cliente.rpc(funcion, args)
    if (error) throw new Error(`${funcion}: ${error.message}`)
    return data as T
  }
  return {
    limitar: (tipo, claves, limite, minutos) =>
      rpc<boolean>('servicio_limitar', { p_tipo: tipo, p_claves: claves, p_limite: limite, p_minutos: minutos }),
    autorizarRegistro: (codigo, email) => rpc<{ ok: boolean }>('servicio_autorizar_registro', { p_codigo: codigo, p_email: email }),
    enviarEnlace: async (email, { crearCuenta, datos }) => {
      const redireccion = env.APP_URL ? `${env.APP_URL.replace(/\/$/, '')}/acceso/confirmar` : undefined
      const { error } = await cliente.auth.signInWithOtp({ email, options: { shouldCreateUser: crearCuenta, data: datos, emailRedirectTo: redireccion } })
      if (error) throw new Error(error.message)
    },
    enviador: enviadorDesdeEntorno(env),
    // Dirección facilitada por Fernando para el formulario de contacto.
    correoContacto: env.CORREO_CONTACTO || 'ferca@usal.es',
  }
}
