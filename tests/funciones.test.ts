// Las funciones de Vercel arrancan tal como las ejecuta Vercel (cada archivo
// por separado, sin empaquetar, cargado por Node) y, sin credenciales,
// responden "No autorizado" (o, las públicas sin base de datos configurada,
// "servicio no disponible"). Este test existe porque un fallo así llegó a
// publicarse (AUDITORIA.md, A1). Se ejecuta en un proceso de Node aparte:
// dentro de Vitest las importaciones se resuelven de otra forma y el fallo
// no se vería.

import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

describe('funciones de Vercel', () => {
  it('arrancan y rechazan las peticiones sin credenciales', () => {
    const env = { ...process.env }
    for (const k of ['CRON_SECRET', 'SUPABASE_URL', 'VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']) delete env[k]
    const salida = execFileSync('node', ['scripts/comprobar-funciones.mjs'], { env, encoding: 'utf8' })
    expect(JSON.parse(salida.trim().split('\n').at(-1)!)).toEqual({
      'api/acceso': 503,
      'api/cerrar-semana': 401,
      'api/contacto': 503,
      'api/notificar-apoyo': 401,
      'api/recordatorios': 401,
      'api/registro': 503,
    })
  }, 60_000)
})
