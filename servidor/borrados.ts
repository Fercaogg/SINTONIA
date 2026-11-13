// Termina los borrados de cuenta que la base de datos no pudo completar
// (ver la migración 20261117000200_borrados_pendientes.sql).

import type { SupabaseClient } from '@supabase/supabase-js'

export async function terminarBorrados(cliente: SupabaseClient): Promise<{ borradas: number; fallidas: number }> {
  const { data, error } = await cliente.rpc('servicio_borrados_pendientes')
  if (error) throw new Error(`servicio_borrados_pendientes: ${error.message}`)
  const resumen = { borradas: 0, fallidas: 0 }
  for (const id of (data as string[]) ?? []) {
    const { error: e } = await cliente.auth.admin.deleteUser(id)
    // Si la cuenta ya no existe, el borrado también está terminado.
    if (e && !/not found/i.test(e.message)) {
      resumen.fallidas++
      continue
    }
    await cliente.rpc('servicio_borrado_completado', { p_user_id: id })
    resumen.borradas++
  }
  return resumen
}
