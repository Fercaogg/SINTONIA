/**
 * REGISTRO, ACCESO Y CONTACTO (lo que puede usar cualquiera sin sesión)
 *
 * Pasan por el servidor para poder:
 *   - validar cada petición con un esquema (Zod);
 *   - limitar los intentos por IP y por correo;
 *   - responder siempre con mensajes que no revelan si un correo o un código
 *     existen (AUDITORIA.md, A5, A6 y M6).
 *
 * Las dependencias (base de datos, envío de enlaces y correos) se pasan desde
 * fuera para poder probar esta lógica sin Supabase.
 */

import { z } from 'zod'
import type { Enviador } from './correo.js'

export interface Dependencias {
  /** false si alguna de las claves ha llegado al límite en la ventana. */
  limitar(tipo: string, claves: string[], limite: number, minutos: number): Promise<boolean>
  /** Comprueba código y correo y, si valen, autoriza crear la cuenta. */
  autorizarRegistro(codigo: string, email: string): Promise<{ ok: boolean }>
  /** Pide a Supabase que envíe el enlace de acceso. Lanza un error si falla. */
  enviarEnlace(email: string, opciones: { crearCuenta: boolean; datos?: Record<string, string> }): Promise<void>
  /** Para el formulario de contacto. */
  enviador: Enviador | null
  correoContacto: string
}

export interface Respuesta {
  status: number
  cuerpo: Record<string, unknown>
}

export const LIMITES = {
  registro: { ip: [10, 15], correo: [5, 15] },
  acceso: { ip: [20, 15], correo: [5, 15] },
  contacto: { ip: [5, 60], correo: [3, 60] },
} as const

export const MENSAJES = {
  datos: 'Revisa los datos del formulario.',
  registro: 'No hemos podido completar el registro. Revisa el código y que el correo sea el institucional de la Universidad.',
  demasiados: 'Has hecho demasiados intentos. Espera unos minutos y vuelve a probarlo.',
  servicio: 'No hemos podido enviar el correo. Inténtalo de nuevo en unos minutos.',
  sinCorreo: 'Ahora mismo el formulario no puede enviar correos. Puedes escribirnos directamente.',
} as const

const email = z.string().trim().toLowerCase().max(254).pipe(z.email())
// Campo trampa: invisible para las personas. Si llega relleno, es un programa.
const trampa = z.string().max(500).optional()

export const esquemaRegistro = z.object({
  codigo: z.string().transform((c) => c.toUpperCase().replace(/[\s-]/g, '')).pipe(z.string().regex(/^[A-Z0-9]{8,16}$/)),
  nombre: z.string().trim().min(1).max(120),
  email,
  sitio: trampa,
})

export const esquemaAcceso = z.object({ email, sitio: trampa })

export const esquemaContacto = z
  .object({
    nombre: z.string().trim().min(1).max(120),
    email,
    // "demostracion": solicitud de demostración desde /instituciones.
    tipo: z.enum(['contacto', 'demostracion']).default('contacto'),
    institucion: z.string().trim().max(200).optional(),
    cargo: z.string().trim().max(120).optional(),
    mensaje: z.string().trim().max(3000).default(''),
    sitio: trampa,
  })
  // Un mensaje de contacto necesita texto; una solicitud de demostración, la institución.
  .refine((c) => (c.tipo === 'demostracion' ? !!c.institucion && c.institucion.length >= 2 : c.mensaje.length >= 10))

const ok = (cuerpo: Record<string, unknown> = {}): Respuesta => ({ status: 200, cuerpo: { ok: true, ...cuerpo } })
const fallo = (status: number, error: string): Respuesta => ({ status, cuerpo: { ok: false, error } })

async function dentroDelLimite(d: Dependencias, tipo: keyof typeof LIMITES, ip: string, correo: string) {
  const l = LIMITES[tipo]
  const porIp = await d.limitar(tipo, [`ip:${ip}`], l.ip[0], l.ip[1])
  const porCorreo = await d.limitar(tipo, [`correo:${correo}`], l.correo[0], l.correo[1])
  return porIp && porCorreo
}

export async function registro(entrada: unknown, ip: string, d: Dependencias): Promise<Respuesta> {
  const r = esquemaRegistro.safeParse(entrada)
  if (!r.success) {
    // Un código con forma imposible cuenta como intento fallido, sin pistas.
    const correo = typeof (entrada as any)?.email === 'string' ? String((entrada as any).email).toLowerCase() : ''
    if (!(await dentroDelLimite(d, 'registro', ip, correo))) return fallo(429, MENSAJES.demasiados)
    return fallo(400, r.error.issues.some((i) => i.path[0] === 'codigo') ? MENSAJES.registro : MENSAJES.datos)
  }
  const { codigo, nombre, email: correo, sitio } = r.data
  if (sitio) return ok()
  if (!(await dentroDelLimite(d, 'registro', ip, correo))) return fallo(429, MENSAJES.demasiados)
  const autorizacion = await d.autorizarRegistro(codigo, correo)
  if (!autorizacion.ok) return fallo(400, MENSAJES.registro)
  try {
    await d.enviarEnlace(correo, { crearCuenta: true, datos: { codigo, nombre } })
  } catch {
    return fallo(503, MENSAJES.servicio)
  }
  return ok()
}

export async function acceso(entrada: unknown, ip: string, d: Dependencias): Promise<Respuesta> {
  const r = esquemaAcceso.safeParse(entrada)
  if (!r.success) return fallo(400, MENSAJES.datos)
  const { email: correo, sitio } = r.data
  if (sitio) return ok()
  if (!(await dentroDelLimite(d, 'acceso', ip, correo))) return fallo(429, MENSAJES.demasiados)
  try {
    await d.enviarEnlace(correo, { crearCuenta: false })
  } catch (e) {
    // Si no hay cuenta con ese correo, se responde igual que si la hubiera.
    if (!/signups not allowed|not found|otp_disabled/i.test(String((e as Error)?.message ?? e))) return fallo(503, MENSAJES.servicio)
  }
  return ok()
}

export async function contacto(entrada: unknown, ip: string, d: Dependencias): Promise<Respuesta> {
  const r = esquemaContacto.safeParse(entrada)
  if (!r.success) return fallo(400, MENSAJES.datos)
  const { nombre, email: correo, mensaje, sitio, tipo, institucion, cargo } = r.data
  if (sitio) return ok()
  if (!(await dentroDelLimite(d, 'contacto', ip, correo))) return fallo(429, MENSAJES.demasiados)
  // Sin servicio de correo configurado, se dice claramente (no es un fallo pasajero).
  if (!d.enviador) return fallo(503, MENSAJES.sinCorreo)
  const demostracion = tipo === 'demostracion'
  try {
    await d.enviador.enviar({
      para: d.correoContacto,
      asunto: demostracion ? `SINTONÍA: solicitud de demostración (${institucion})` : `SINTONÍA: mensaje de ${nombre}`,
      texto: demostracion
        ? `Solicitud de demostración enviada desde /instituciones.\n\nNombre: ${nombre}\nCorreo: ${correo}\nInstitución: ${institucion}\nCargo: ${cargo || 'No indicado'}\n\n${mensaje || '(Sin mensaje)'}\n`
        : `Mensaje enviado desde el formulario de contacto de SINTONÍA.\n\nNombre: ${nombre}\nCorreo: ${correo}\n\n${mensaje}\n`,
    })
  } catch {
    return fallo(503, MENSAJES.servicio)
  }
  return ok()
}

/** IP de quien hace la petición (Vercel la pone en x-forwarded-for). */
export function ipDe(request: Request): string {
  return (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || request.headers.get('x-real-ip') || 'desconocida'
}
