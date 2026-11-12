// Acceso a la base de datos para el cierre de semana, con la clave de
// servidor (service_role). Solo se usa en el servidor, nunca en el navegador.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Almacen } from './cierre-semana'
import type { AlmacenCorreos } from './recordatorios'

export function clienteServidor(url: string, claveServidor: string): SupabaseClient {
  return createClient(url, claveServidor, { auth: { persistSession: false, autoRefreshToken: false } })
}

export function crearAlmacenSupabase(cliente: SupabaseClient): Almacen & AlmacenCorreos {
  async function rpc<T>(funcion: string, args: Record<string, unknown> = {}): Promise<T> {
    const { data, error } = await cliente.rpc(funcion, args)
    if (error) throw new Error(`${funcion}: ${error.message}`)
    return data as T
  }
  return {
    semanasPorCerrar: () => rpc('servicio_semanas_por_cerrar'),
    datosSemana: (estudioId, semana) => rpc('servicio_datos_semana', { p_estudio_id: estudioId, p_semana: semana }),
    registrarSorteos: (estudioId, semana, desajustes, sorteos) =>
      rpc('servicio_registrar_sorteos', { p_estudio_id: estudioId, p_semana: semana, p_desajustes: desajustes, p_sorteos: sorteos }),
    datosPuente: (estudioId, semana) => rpc('servicio_datos_puente', { p_estudio_id: estudioId, p_semana: semana }),
    registrarPuente: async (semana, filas) => {
      await rpc('servicio_registrar_puente', { p_semana: semana, p_filas: filas })
    },
    recordatoriosPendientes: () => rpc('servicio_recordatorios_pendientes'),
    avisosPorNotificar: () => rpc('servicio_avisos_por_notificar'),
    registrarCorreo: async (userId, tipo, semana, referencia) => {
      await rpc('servicio_registrar_correo', { p_user_id: userId, p_tipo: tipo, p_semana: semana, p_referencia: referencia })
    },
    avisoNotificado: async (avisoId) => {
      await rpc('servicio_aviso_notificado', { p_aviso_id: avisoId })
    },
    guardarAgenda: async (parejaId, semana, agenda) => {
      await rpc('servicio_guardar_agenda', { p_pareja_id: parejaId, p_semana: semana, p_agenda: agenda })
    },
    completarCierre: async (estudioId, semana) => {
      await rpc('servicio_completar_cierre', { p_estudio_id: estudioId, p_semana: semana })
    },
  }
}
