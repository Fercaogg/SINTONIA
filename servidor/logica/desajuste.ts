/**
 * MÓDULO DEL DESAJUSTE
 *
 * Calcula dónde no coinciden la mirada del estudiante y la del tutor/a sobre
 * la misma semana. Es un módulo "puro": no lee ni escribe nada, solo recibe
 * números y devuelve números, para que se pueda revisar y probar a mano.
 *
 * Reglas (versión v1, configurable en la tabla reglas_desajuste):
 *
 *   1. Para cada ítem (avance y, si el tutor lo responde, siguiente paso):
 *        diferencia = respuesta del estudiante − respuesta del tutor
 *      Una diferencia positiva significa que el estudiante ve más avance
 *      (o un siguiente paso más claro) que el tutor; negativa, lo contrario.
 *
 *   2. El desajuste es RELEVANTE si:
 *        a) |diferencia| ≥ umbralAbsoluto (2 puntos), o
 *        b) |diferencia| ≥ umbralPersistente (1 punto) esta semana y también
 *           en las semanasPersistencia − 1 semanas inmediatamente anteriores
 *           (en total, 2 semanas seguidas), siempre con el MISMO signo.
 *      Si en alguna de esas semanas falta una de las dos respuestas, no hay
 *      persistencia (no se puede saber si el desajuste continuó).
 *
 *   3. Si falta alguna de las dos respuestas de la semana, no se calcula nada.
 *
 * Nada de esto se muestra al estudiante ni al tutor como cifra: solo decide
 * qué tipo de preguntas lleva la agenda.
 */

export type Item = 'avance' | 'siguiente_paso'
export const ITEMS: readonly Item[] = ['avance', 'siguiente_paso']

export interface Regla {
  version: string
  umbralAbsoluto: number
  umbralPersistente: number
  semanasPersistencia: number
}

export const REGLA_V1: Regla = { version: 'v1', umbralAbsoluto: 2, umbralPersistente: 1, semanasPersistencia: 2 }

export interface RespuestaEstudiante {
  avance: number
  siguiente_paso: number
}

export interface RespuestaTutor {
  avance: number
  /** Opcional para el tutor. */
  siguiente_paso: number | null
}

export interface SemanaPareja {
  semana: number
  estudiante: RespuestaEstudiante | null
  tutor: RespuestaTutor | null
}

export type Signo = 'estudiante_mayor' | 'tutor_mayor' | 'coinciden'

export interface Desajuste {
  item: Item
  semana: number
  valorEstudiante: number
  valorTutor: number
  /** Estudiante menos tutor. */
  diferencia: number
  magnitud: number
  signo: Signo
  relevante: boolean
  motivo: 'absoluto' | 'persistente' | null
  reglaVersion: string
}

function comprobarValor(v: unknown, que: string): asserts v is number {
  if (typeof v !== 'number' || !Number.isInteger(v) || v < 1 || v > 5) {
    throw new Error(`Valor no válido para ${que}: debe ser un entero entre 1 y 5`)
  }
}

function comprobarRegla(r: Regla) {
  if (!(r.umbralAbsoluto >= 1 && r.umbralPersistente >= 1 && r.semanasPersistencia >= 2)) {
    throw new Error('Regla de desajuste no válida')
  }
}

export function signoDe(diferencia: number): Signo {
  if (diferencia > 0) return 'estudiante_mayor'
  if (diferencia < 0) return 'tutor_mayor'
  return 'coinciden'
}

/** Diferencia de un ítem en una semana, o null si falta alguna respuesta. */
export function diferenciaItem(s: SemanaPareja | undefined, item: Item): number | null {
  if (!s?.estudiante || !s.tutor) return null
  const e = s.estudiante[item]
  const t = s.tutor[item]
  if (t === null || t === undefined) return null
  comprobarValor(e, `${item} (estudiante)`)
  comprobarValor(t, `${item} (tutor)`)
  return e - t
}

/**
 * Calcula los desajustes de una pareja en una semana.
 * @param semanas las semanas de la pareja (al menos la actual y, para la
 *   regla de persistencia, las anteriores). El orden no importa.
 * @param semana la semana que se evalúa.
 * @returns un desajuste por ítem que se pueda calcular (puede estar vacío).
 */
export function calcularDesajustes(semanas: SemanaPareja[], semana: number, regla: Regla = REGLA_V1): Desajuste[] {
  comprobarRegla(regla)
  const porSemana = new Map(semanas.map((s) => [s.semana, s]))
  const actual = porSemana.get(semana)
  const resultado: Desajuste[] = []

  for (const item of ITEMS) {
    const d = diferenciaItem(actual, item)
    if (d === null) continue
    const magnitud = Math.abs(d)
    let motivo: Desajuste['motivo'] = null

    if (magnitud >= regla.umbralAbsoluto) {
      motivo = 'absoluto'
    } else if (magnitud >= regla.umbralPersistente) {
      let persiste = true
      for (let k = 1; k < regla.semanasPersistencia; k++) {
        const previa = diferenciaItem(porSemana.get(semana - k), item)
        if (previa === null || Math.abs(previa) < regla.umbralPersistente || Math.sign(previa) !== Math.sign(d)) {
          persiste = false
          break
        }
      }
      if (persiste) motivo = 'persistente'
    }

    resultado.push({
      item,
      semana,
      valorEstudiante: actual!.estudiante![item],
      valorTutor: actual!.tutor![item] as number,
      diferencia: d,
      magnitud,
      signo: signoDe(d),
      relevante: motivo !== null,
      motivo,
      reglaVersion: regla.version,
    })
  }
  return resultado
}
