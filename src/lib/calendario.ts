// Calendario: tipos de anotación y cálculos de fechas.
// Las fechas del calendario son días "de pared" (AAAA-MM-DD), sin zona horaria:
// una tutoría el 10 de febrero es el 10 de febrero para todos.

export type TipoEvento = 'tutoria' | 'entrega' | 'congreso' | 'evento' | 'plazo' | 'otro'
export type TipoCalendario = TipoEvento | 'convocatoria'
export type Ambito = 'privado' | 'pareja' | 'master'

export interface Evento {
  id: string
  tipo: TipoEvento
  titulo: string
  descripcion: string | null
  lugar: string | null
  fecha: string
  fecha_fin: string | null
  hora_inicio: string | null
  hora_fin: string | null
  ambito: Ambito
  pareja_id: string | null
  master_id: string | null
  mio: boolean
  con: string | null
  autor: string | null
  editable: boolean
}

export interface PlazoConvocatoria {
  id: string
  fecha: string
  titulo: string
  enlace: string
  organismo: string
}

export interface Calendario {
  eventos: Evento[]
  convocatorias: PlazoConvocatoria[]
  opciones: {
    rol: 'estudiante' | 'tutor' | 'direccion' | 'investigador'
    tesis: boolean
    parejas: { pareja_id: string; nombre: string | null }[]
    masters: { id: string; nombre: string }[]
  }
}

/** Lo que se pinta en el calendario: anotaciones y plazos de convocatorias. */
export interface Entrada {
  id: string
  tipo: TipoCalendario
  titulo: string
  fecha: string
  fecha_fin: string | null
  hora_inicio: string | null
  hora_fin: string | null
  evento?: Evento
  convocatoria?: PlazoConvocatoria
}

// Colores solo decorativos (la etiqueta y el icono siempre acompañan al color).
export const TIPOS: Record<TipoCalendario, { etiqueta: string; icono: string; color: string }> = {
  tutoria: { etiqueta: 'Tutoría', icono: 'chat', color: 'rgb(var(--rgb-b900))' },
  entrega: { etiqueta: 'Entrega de documentación', icono: 'document', color: '#b83a0e' },
  congreso: { etiqueta: 'Congreso', icono: 'users', color: '#24508f' },
  evento: { etiqueta: 'Seminario o evento', icono: 'star', color: 'var(--color-lumbre-texto)' },
  plazo: { etiqueta: 'Plazo', icono: 'clock', color: '#a3122f' },
  otro: { etiqueta: 'Otro', icono: 'bulb', color: 'rgb(var(--rgb-s600))' },
  convocatoria: { etiqueta: 'Convocatoria', icono: 'graduation', color: '#55554f' },
}

export const TIPOS_ANOTABLES: TipoEvento[] = ['tutoria', 'entrega', 'congreso', 'evento', 'plazo', 'otro']

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
export const DIAS_CORTOS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
export const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']

function aFecha(iso: string): Date {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, d))
}

function aIso(f: Date): string {
  return f.toISOString().slice(0, 10)
}

export function sumarDias(iso: string, dias: number): string {
  const f = aFecha(iso)
  f.setUTCDate(f.getUTCDate() + dias)
  return aIso(f)
}

/** Hoy en Madrid, como AAAA-MM-DD. */
export function hoy(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(ahora)
}

/** Primer día del mes de una fecha. */
export function inicioMes(iso: string): string {
  return iso.slice(0, 8) + '01'
}

export function sumarMeses(iso: string, meses: number): string {
  const [a, m] = iso.split('-').map(Number)
  const f = new Date(Date.UTC(a, m - 1 + meses, 1))
  return aIso(f)
}

/** "febrero de 2027" */
export function nombreMes(iso: string): string {
  const f = aFecha(iso)
  return `${MESES[f.getUTCMonth()]} de ${f.getUTCFullYear()}`
}

/** "miércoles 10 de febrero" */
export function nombreDia(iso: string): string {
  const f = aFecha(iso)
  return `${DIAS[f.getUTCDay()]} ${f.getUTCDate()} de ${MESES[f.getUTCMonth()]}`
}

/** "10 feb." */
export function diaCorto(iso: string): string {
  const f = aFecha(iso)
  return `${f.getUTCDate()} ${MESES[f.getUTCMonth()].slice(0, 3)}.`
}

/**
 * Semanas (de lunes a domingo) que cubren el mes. Cada día lleva su fecha y si
 * pertenece al mes mostrado.
 */
export function semanasDelMes(iso: string): { fecha: string; delMes: boolean }[][] {
  const primero = inicioMes(iso)
  const desfase = (aFecha(primero).getUTCDay() + 6) % 7 // lunes = 0
  let dia = sumarDias(primero, -desfase)
  const mes = primero.slice(0, 7)
  const semanas: { fecha: string; delMes: boolean }[][] = []
  do {
    const semana = []
    for (let i = 0; i < 7; i++) {
      semana.push({ fecha: dia, delMes: dia.slice(0, 7) === mes })
      dia = sumarDias(dia, 1)
    }
    semanas.push(semana)
  } while (dia.slice(0, 7) === mes)
  return semanas
}

/** Junta anotaciones y plazos, ordenados por fecha y hora. */
export function entradas(c: Pick<Calendario, 'eventos' | 'convocatorias'>): Entrada[] {
  const lista: Entrada[] = [
    ...c.eventos.map((e) => ({
      id: e.id, tipo: e.tipo as TipoCalendario, titulo: e.titulo, fecha: e.fecha, fecha_fin: e.fecha_fin,
      hora_inicio: e.hora_inicio, hora_fin: e.hora_fin, evento: e,
    })),
    ...c.convocatorias.map((v) => ({
      id: v.id, tipo: 'convocatoria' as const, titulo: v.titulo, fecha: v.fecha, fecha_fin: null,
      hora_inicio: null, hora_fin: null, convocatoria: v,
    })),
  ]
  return lista.sort((a, b) =>
    a.fecha.localeCompare(b.fecha) || (a.hora_inicio ?? '').localeCompare(b.hora_inicio ?? '') || a.titulo.localeCompare(b.titulo, 'es'))
}

/** Entradas que ocupan un día (las de varios días aparecen en todos ellos). */
export function delDia(lista: Entrada[], dia: string): Entrada[] {
  return lista.filter((e) => e.fecha <= dia && (e.fecha_fin ?? e.fecha) >= dia)
}

/** Entradas desde hoy (incluidas las que siguen en curso), las más próximas primero. */
export function proximas(lista: Entrada[], desde: string, cuantas = Infinity): Entrada[] {
  return lista.filter((e) => (e.fecha_fin ?? e.fecha) >= desde).slice(0, cuantas)
}

/** "10:00 a 11:00", "10:00", "Todo el día", "Del 15 al 17 feb." */
export function cuando(e: Pick<Entrada, 'fecha' | 'fecha_fin' | 'hora_inicio' | 'hora_fin'>): string {
  const horas = e.hora_inicio ? (e.hora_fin ? `${e.hora_inicio} a ${e.hora_fin}` : e.hora_inicio) : ''
  if (e.fecha_fin) {
    const rango = `Del ${diaCorto(e.fecha)} al ${diaCorto(e.fecha_fin)}`
    return horas ? `${rango}, ${horas}` : rango
  }
  return horas || 'Todo el día'
}
