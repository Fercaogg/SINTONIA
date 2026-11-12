// Tipos del servidor local (para TypeScript).
import type { Server } from 'node:http'
export const SECRETO_LOCAL: string
export const CLAVE_ANON_LOCAL: string
export const CLAVE_SERVIDOR_LOCAL: string
export const PUERTO_LOCAL: number
export function crearServidor(opciones?: { baseDeDatos?: string; urlApp?: string; silencioso?: boolean }): Server
