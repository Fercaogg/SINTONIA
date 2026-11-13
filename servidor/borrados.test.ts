import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { terminarBorrados } from './borrados'

function clienteFalso(pendientes: string[], fallan: Record<string, string> = {}) {
  const completados: string[] = []
  const cliente = {
    rpc: async (f: string, a?: { p_user_id: string }) => {
      if (f === 'servicio_borrados_pendientes') return { data: pendientes, error: null }
      completados.push(a!.p_user_id)
      return { data: { ok: true }, error: null }
    },
    auth: { admin: { deleteUser: async (id: string) => ({ error: fallan[id] ? { message: fallan[id] } : null }) } },
  } as unknown as SupabaseClient
  return { cliente, completados }
}

describe('Borrados de cuenta pendientes', () => {
  it('borra cada cuenta pendiente y la quita de la lista', async () => {
    const f = clienteFalso(['a', 'b'])
    expect(await terminarBorrados(f.cliente)).toEqual({ borradas: 2, fallidas: 0 })
    expect(f.completados).toEqual(['a', 'b'])
  })

  it('si la cuenta ya no existe, el borrado también está terminado', async () => {
    const f = clienteFalso(['a'], { a: 'User not found' })
    expect(await terminarBorrados(f.cliente)).toEqual({ borradas: 1, fallidas: 0 })
  })

  it('si falla, la deja pendiente para el día siguiente', async () => {
    const f = clienteFalso(['a'], { a: 'Service unavailable' })
    expect(await terminarBorrados(f.cliente)).toEqual({ borradas: 0, fallidas: 1 })
    expect(f.completados).toEqual([])
  })
})
