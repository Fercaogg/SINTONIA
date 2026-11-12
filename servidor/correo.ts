/**
 * ENVÍO DE CORREOS
 *
 * Proveedor configurable por variables de entorno:
 *   CORREO_PROVEEDOR=resend   envía con Resend (necesita RESEND_API_KEY)
 *   CORREO_PROVEEDOR=consola  no envía: escribe el correo en el registro (por defecto)
 *   CORREO_PROVEEDOR=ninguno  no envía nada
 *   CORREO_REMITENTE          dirección del remitente, por ejemplo "SINTONÍA <sintonia@dominio>"
 */

export interface Correo {
  para: string
  asunto: string
  texto: string
}

export interface Enviador {
  nombre: string
  enviar(correo: Correo): Promise<void>
}

export function enviadorResend(apiKey: string, remitente: string, fetchFn: typeof fetch = fetch): Enviador {
  return {
    nombre: 'resend',
    async enviar(c) {
      const r = await fetchFn('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: remitente, to: [c.para], subject: c.asunto, text: c.texto }),
      })
      if (!r.ok) throw new Error(`El proveedor de correo respondió ${r.status}`)
    },
  }
}

export function enviadorConsola(registro: (texto: string) => void = console.log): Enviador {
  return {
    nombre: 'consola',
    async enviar(c) {
      registro(`[correo] Para: ${c.para}\nAsunto: ${c.asunto}\n\n${c.texto}\n`)
    },
  }
}

export function enviadorDesdeEntorno(env: Record<string, string | undefined> = process.env): Enviador | null {
  const proveedor = env.CORREO_PROVEEDOR || 'consola'
  if (proveedor === 'ninguno') return null
  if (proveedor === 'resend') {
    if (!env.RESEND_API_KEY || !env.CORREO_REMITENTE) throw new Error('Faltan RESEND_API_KEY o CORREO_REMITENTE')
    return enviadorResend(env.RESEND_API_KEY, env.CORREO_REMITENTE)
  }
  return enviadorConsola()
}
