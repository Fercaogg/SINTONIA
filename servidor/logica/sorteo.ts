/**
 * SORTEO DEL MICROENSAYO ALEATORIZADO
 *
 * Cada semana, para cada pareja con los dos check-ins, se decide al azar si
 * recibe la agenda (probabilidad 0,5 por defecto).
 *
 * Para que el sorteo sea auditable y reproducible:
 *   - Al cerrar la semana se genera una SEMILLA aleatoria (32 bytes) que se
 *     guarda junto a cada resultado.
 *   - El número aleatorio de cada pareja es HMAC-SHA256(semilla,
 *     "pareja:semana"), convertido a un número entre 0 y 1.
 *   - La pareja recibe agenda si ese número es menor que la probabilidad.
 * Con la semilla guardada, cualquiera puede repetir el cálculo y comprobar
 * que el resultado no se eligió a mano.
 */

import { createHmac, randomBytes } from 'node:crypto'
import type { SemanaPareja } from './desajuste.js'

export const ALGORITMO_SORTEO = 'hmac-sha256-v1'

export type MotivoNoElegible = 'falta_estudiante' | 'falta_tutor' | 'faltan_ambos' | 'sin_tutor' | 'retirado'

export function nuevaSemilla(): string {
  return randomBytes(32).toString('hex')
}

/** Número entre 0 (incluido) y 1 (excluido), determinado por la semilla. */
export function valorAleatorio(semilla: string, parejaId: string, semana: number): number {
  const hmac = createHmac('sha256', semilla).update(`${parejaId}:${semana}`).digest()
  // 48 bits: suficiente precisión y exacto en un número de JavaScript.
  return hmac.readUIntBE(0, 6) / 2 ** 48
}

export function sortear(semilla: string, parejaId: string, semana: number, probabilidad: number) {
  if (!(probabilidad >= 0 && probabilidad <= 1)) throw new Error('La probabilidad debe estar entre 0 y 1')
  const valor = valorAleatorio(semilla, parejaId, semana)
  return { valor, resultado: valor < probabilidad }
}

/** ¿Se puede sortear? Hacen falta los dos check-ins de la semana. */
export function motivoNoElegible(
  actual: SemanaPareja | undefined,
  opciones: { sinTutor: boolean; retirado: boolean },
): MotivoNoElegible | null {
  if (opciones.retirado) return 'retirado'
  if (opciones.sinTutor) return 'sin_tutor'
  const e = !!actual?.estudiante
  const t = !!actual?.tutor
  if (!e && !t) return 'faltan_ambos'
  if (!e) return 'falta_estudiante'
  if (!t) return 'falta_tutor'
  return null
}
