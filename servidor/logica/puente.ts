/**
 * PUENTE AL DOCTORADO
 *
 * Si el estudiante lo ha activado y alguna convocatoria abre o cierra en las
 * próximas 4 semanas, la agenda lleva una línea:
 *   "Se acerca el plazo de [convocatoria]. ¿Lo comentáis en la próxima tutoría?"
 * Las convocatorias sin fechas (pendientes de rellenar) no se tienen en cuenta.
 */

export interface Convocatoria {
  id: number
  nombre: string
  fecha_apertura: string | null
  fecha_cierre: string | null
}

export const DIAS_AVISO = 28

function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

/**
 * Convocatorias que abren o cierran entre la fecha de referencia (incluida) y
 * las 4 semanas siguientes (excluido el último día). Fechas en formato AAAA-MM-DD.
 */
export function convocatoriasProximas(convocatorias: Convocatoria[], referencia: string, dias = DIAS_AVISO): Convocatoria[] {
  const fin = sumarDias(referencia, dias)
  const dentro = (f: string | null) => !!f && f >= referencia && f < fin
  return convocatorias.filter((c) => dentro(c.fecha_apertura) || dentro(c.fecha_cierre))
}

function enumerar(nombres: string[]): string {
  if (nombres.length <= 1) return nombres.join('')
  return `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}`
}

export function lineaPuente(convocatorias: Convocatoria[]): string | null {
  if (!convocatorias.length) return null
  return `Se acerca el plazo de ${enumerar(convocatorias.map((c) => c.nombre))}. ¿Lo comentáis en la próxima tutoría?`
}

export interface DecisionPuente {
  pareja_id: string
  activado: boolean
  linea: string | null
  convocatorias: number[]
}

/** Decide la línea de Puente de cada pareja en una semana. */
export function decidirPuente(
  parejas: { pareja_id: string; activado: boolean }[],
  convocatorias: Convocatoria[],
  referencia: string,
): DecisionPuente[] {
  const proximas = convocatoriasProximas(convocatorias, referencia)
  const linea = lineaPuente(proximas)
  return parejas.map((p) => ({
    pareja_id: p.pareja_id,
    activado: p.activado,
    linea: p.activado ? linea : null,
    convocatorias: p.activado ? proximas.map((c) => c.id) : [],
  }))
}
