/**
 * RECORDATORIOS Y AVISOS POR CORREO
 *
 * - Recordatorio al abrirse el check-in de la semana.
 * - Recordatorio 48 horas antes del cierre, solo si aún no se ha respondido.
 * - Aviso a la dirección cuando un estudiante pulsa "Necesito apoyo".
 *
 * Textos breves, sin culpa ni presión. Cada correo se registra para no
 * enviarlo dos veces; si un envío falla, se reintenta en la siguiente ejecución.
 */

import type { Enviador } from './correo'

export interface Recordatorio {
  user_id: string
  email: string
  nombre: string
  rol: 'estudiante' | 'tutor'
  tipo: 'apertura' | 'cierre_48h'
  semana: number
  cierra: string
}

export interface AvisoPorNotificar {
  aviso_id: string
  master: string
  nombre_autorizado: string | null
  destinatarios: { user_id: string; email: string }[]
}

export interface AlmacenCorreos {
  recordatoriosPendientes(): Promise<Recordatorio[]>
  avisosPorNotificar(): Promise<AvisoPorNotificar[]>
  registrarCorreo(userId: string, tipo: string, semana: number | null, referencia: string | null): Promise<void>
  avisoNotificado(avisoId: string): Promise<void>
}

const dia = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', weekday: 'long', day: 'numeric', month: 'long' })
const hora = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' })

/** "domingo 14 de febrero a las 23:59" (la ventana cierra a las 00:00 del día siguiente). */
export function textoCierre(cierra: string): string {
  const d = new Date(new Date(cierra).getTime() - 60_000)
  return `${dia.format(d).replace(',', '')} a las ${hora.format(d)}`
}

const PIE = '\n\nSi prefieres no recibir estos recordatorios, puedes desactivarlos en "Mi cuenta".\n\nSINTONÍA, Universidad de Salamanca'

export function textoRecordatorio(r: Recordatorio, urlApp: string): { asunto: string; texto: string } {
  const nombre = r.nombre.split(' ')[0]
  const enlace = `${urlApp}/${r.rol === 'tutor' ? 'tutor' : 'estudiante'}/checkin`
  const que = r.rol === 'tutor' ? 'tu check-in sobre tus estudiantes' : 'tu check-in'
  if (r.tipo === 'apertura') {
    return {
      asunto: `Ya puedes hacer el check-in de la semana ${r.semana}`,
      texto: `Hola, ${nombre}:\n\nYa puedes hacer ${que} de esta semana. Te llevará alrededor de un minuto.\n\n${enlace}\n\nEstá abierto hasta el ${textoCierre(r.cierra)}.${PIE}`,
    }
  }
  return {
    asunto: 'Aún estás a tiempo de hacer el check-in de esta semana',
    texto: `Hola, ${nombre}:\n\nSi te viene bien, todavía puedes hacer ${que} de esta semana, hasta el ${textoCierre(r.cierra)}. Si esta semana no puedes, no pasa nada.\n\n${enlace}${PIE}`,
  }
}

export function textoAvisoApoyo(a: AvisoPorNotificar, urlApp: string): { asunto: string; texto: string } {
  const quien = a.nombre_autorizado
    ? `Ha decidido compartir su nombre: ${a.nombre_autorizado}.`
    : 'No ha querido compartir su nombre.'
  return {
    asunto: 'Un estudiante ha pedido apoyo en SINTONÍA',
    texto: `Hola:\n\nUn estudiante de ${a.master} ha pulsado "Necesito apoyo" en SINTONÍA. ${quien}\n\nPuedes verlo en tu panel: ${urlApp}/direccion/avisos\n\nEste aviso no incluye ninguna respuesta del check-in ni ningún dato de bienestar.\n\nSINTONÍA, Universidad de Salamanca`,
  }
}

export interface ResumenCorreos {
  enviados: number
  fallidos: number
}

export async function enviarRecordatorios(almacen: AlmacenCorreos, enviador: Enviador | null, urlApp: string): Promise<ResumenCorreos> {
  const resumen = { enviados: 0, fallidos: 0 }
  if (!enviador) return resumen
  for (const r of await almacen.recordatoriosPendientes()) {
    const { asunto, texto } = textoRecordatorio(r, urlApp)
    try {
      await enviador.enviar({ para: r.email, asunto, texto })
      await almacen.registrarCorreo(r.user_id, r.tipo, r.semana, null)
      resumen.enviados++
    } catch {
      resumen.fallidos++
    }
  }
  return resumen
}

export async function notificarAvisosApoyo(almacen: AlmacenCorreos, enviador: Enviador | null, urlApp: string): Promise<ResumenCorreos> {
  const resumen = { enviados: 0, fallidos: 0 }
  if (!enviador) return resumen
  for (const a of await almacen.avisosPorNotificar()) {
    const { asunto, texto } = textoAvisoApoyo(a, urlApp)
    let fallo = false
    for (const d of a.destinatarios) {
      try {
        await enviador.enviar({ para: d.email, asunto, texto })
        await almacen.registrarCorreo(d.user_id, 'aviso_apoyo', null, a.aviso_id)
        resumen.enviados++
      } catch {
        fallo = true
        resumen.fallidos++
      }
    }
    // Si no hay nadie de dirección dado de alta, el aviso queda en el panel.
    if (!fallo && a.destinatarios.length) await almacen.avisoNotificado(a.aviso_id)
  }
  return resumen
}
