import { describe, expect, it } from 'vitest'
import { comprobarEstado } from './estado'

const respuesta = (ok: boolean) => ({ ok } as Response)

describe('estado de la plataforma', () => {
  it('todo funciona', async () => {
    const e = await comprobarEstado({ url: 'https://x.supabase.co/', clave: 'k', fetch: (async () => respuesta(true)) as typeof fetch, ahora: () => new Date('2026-11-15T10:00:00Z') })
    expect(e).toMatchObject({ ok: true, servidor: 'ok', baseDeDatos: 'ok', acceso: 'ok', comprobadoEn: '2026-11-15T10:00:00.000Z' })
  })
  it('la base de datos falla', async () => {
    const f = (async (u: string) => respuesta(!u.includes('/rest/'))) as typeof fetch
    const e = await comprobarEstado({ url: 'https://x', clave: 'k', fetch: f })
    expect(e).toMatchObject({ ok: false, baseDeDatos: 'error', acceso: 'ok' })
  })
  it('un error de red cuenta como fallo y no rompe la página', async () => {
    const f = (async () => { throw new Error('red') }) as typeof fetch
    const e = await comprobarEstado({ url: 'https://x', clave: 'k', fetch: f })
    expect(e).toMatchObject({ ok: false, baseDeDatos: 'error', acceso: 'error', servidor: 'ok' })
  })
  it('no devuelve claves ni direcciones', async () => {
    const e = await comprobarEstado({ url: 'https://secreto.supabase.co', clave: 'clave-secreta', fetch: (async () => respuesta(true)) as typeof fetch })
    expect(JSON.stringify(e)).not.toMatch(/secret|supabase/)
  })
})
