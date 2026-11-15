// Estado de la plataforma (página /estado): comprobaciones reales y baratas,
// sin datos personales y sin servicios externos.
//   - servidor: si esta función responde, las funciones de Vercel funcionan.
//   - base de datos: la función servicio_estado (una lectura mínima, sin datos).
//   - acceso: el servicio de inicio de sesión de Supabase responde.

export type Comprobacion = 'ok' | 'error'
export interface Estado {
  ok: boolean
  comprobadoEn: string
  servidor: Comprobacion
  baseDeDatos: Comprobacion
  acceso: Comprobacion
  milisegundos: number
}

export interface DependenciasEstado {
  url: string
  clave: string
  fetch: typeof fetch
  ahora?: () => Date
}

const MAXIMO_MS = 5000

async function conTiempoMaximo(p: Promise<Response>): Promise<Response | null> {
  let t: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([p, new Promise<null>((r) => (t = setTimeout(() => r(null), MAXIMO_MS)))])
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

export async function comprobarEstado(d: DependenciasEstado): Promise<Estado> {
  const inicio = Date.now()
  const base = d.url.replace(/\/$/, '')
  const cabeceras = { apikey: d.clave, Authorization: `Bearer ${d.clave}` }
  const [bd, acceso] = await Promise.all([
    conTiempoMaximo(d.fetch(`${base}/rest/v1/rpc/servicio_estado`, { method: 'POST', headers: { ...cabeceras, 'Content-Type': 'application/json' }, body: '{}' })),
    conTiempoMaximo(d.fetch(`${base}/auth/v1/health`, { headers: { apikey: d.clave } })),
  ])
  const baseDeDatos: Comprobacion = bd?.ok ? 'ok' : 'error'
  const accesoOk: Comprobacion = acceso?.ok ? 'ok' : 'error'
  return {
    ok: baseDeDatos === 'ok' && accesoOk === 'ok',
    comprobadoEn: (d.ahora?.() ?? new Date()).toISOString(),
    servidor: 'ok',
    baseDeDatos,
    acceso: accesoOk,
    milisegundos: Date.now() - inicio,
  }
}
