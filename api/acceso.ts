// Función de Vercel: acceso sin sesión iniciada (ver servidor/acceso-publico.ts).
// Valida la petición, limita los intentos y responde sin revelar si un correo
// o un código existen.

import { acceso, ipDe, MENSAJES } from '../servidor/acceso-publico.js'
import { dependenciasDesdeEntorno } from '../servidor/dependencias-publicas.js'

export async function POST(request: Request): Promise<Response> {
  const d = dependenciasDesdeEntorno()
  if (!d) return Response.json({ ok: false, error: MENSAJES.servicio }, { status: 503 })
  let cuerpo: unknown = null
  try {
    cuerpo = await request.json()
  } catch {
    return Response.json({ ok: false, error: MENSAJES.datos }, { status: 400 })
  }
  try {
    const r = await acceso(cuerpo, ipDe(request), d)
    return Response.json(r.cuerpo, { status: r.status })
  } catch (e) {
    console.error('[acceso]', e)
    return Response.json({ ok: false, error: MENSAJES.servicio }, { status: 503 })
  }
}
