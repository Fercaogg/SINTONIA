// Formato de fechas en español y en la hora de Madrid.

const ZONA = 'Europe/Madrid'

const dia = new Intl.DateTimeFormat('es-ES', { timeZone: ZONA, weekday: 'long', day: 'numeric', month: 'long' })
const diaCorto = new Intl.DateTimeFormat('es-ES', { timeZone: ZONA, day: 'numeric', month: 'short', year: 'numeric' })
const hora = new Intl.DateTimeFormat('es-ES', { timeZone: ZONA, hour: '2-digit', minute: '2-digit' })

/** "lunes, 1 de febrero" → "lunes 1 de febrero" */
export function fechaLarga(iso: string | Date): string {
  return dia.format(new Date(iso)).replace(',', '')
}

export function fechaCorta(iso: string | Date): string {
  return diaCorto.format(new Date(iso))
}

export function horaDe(iso: string | Date): string {
  return hora.format(new Date(iso))
}

/**
 * La ventana cierra a las 00:00 del día siguiente (sin incluirla). Para las
 * personas, decimos "hasta el domingo 14 de febrero a las 23:59".
 */
export function hastaCierre(cierra: string): string {
  const ultimoMinuto = new Date(new Date(cierra).getTime() - 60_000)
  return `${fechaLarga(ultimoMinuto)} a las ${horaDe(ultimoMinuto)}`
}

export function desdeApertura(abre: string): string {
  return `${fechaLarga(abre)} a las ${horaDe(abre)}`
}
