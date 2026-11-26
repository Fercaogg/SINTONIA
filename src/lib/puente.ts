// Datos de Puente al doctorado y cálculo de los plazos de las convocatorias.

import { llamar } from './api'
import { fechaCorta } from './fechas'
import { entradas, hoy, proximas, sumarDias, type Calendario, type Entrada } from './calendario'

export interface Convocatoria {
  id: number
  nombre: string
  organismo: string
  fecha_apertura: string | null
  fecha_cierre: string | null
  enlace: string
  estado: string
}

export interface EnlaceNormativa {
  titulo: string
  descripcion: string | null
  url: string
}

export interface DatosPuente {
  activado: boolean
  convocatorias: Convocatoria[]
  normativa: EnlaceNormativa[]
}

export async function leerPuente(): Promise<DatosPuente> {
  const r = await llamar<DatosPuente>('mi_puente')
  return { activado: r.activado, convocatorias: r.convocatorias ?? [], normativa: r.normativa ?? [] }
}

export type GrupoPlazo = 'abierta' | 'proxima' | 'cerrada' | 'sin_fechas'

export const GRUPOS_PLAZO: { clave: GrupoPlazo; titulo: string; vacio: string }[] = [
  { clave: 'abierta', titulo: 'Abiertas ahora', vacio: 'Ahora no hay ninguna convocatoria abierta.' },
  { clave: 'proxima', titulo: 'Abren próximamente', vacio: 'No hay ninguna con fecha de apertura próxima.' },
  { clave: 'sin_fechas', titulo: 'Sin fechas todavía', vacio: '' },
  { clave: 'cerrada', titulo: 'Ya cerradas', vacio: '' },
]

/** En qué punto está una convocatoria el día `hoy` (fechas AAAA-MM-DD). */
export function grupoPlazo(c: Pick<Convocatoria, 'fecha_apertura' | 'fecha_cierre'>, hoy: string): GrupoPlazo {
  const { fecha_apertura: abre, fecha_cierre: cierra } = c
  if (!abre && !cierra) return 'sin_fechas'
  if (cierra && cierra < hoy) return 'cerrada'
  if (abre && abre > hoy) return 'proxima'
  return 'abierta'
}

export function agruparPlazos<T extends Pick<Convocatoria, 'fecha_apertura' | 'fecha_cierre'>>(lista: T[], hoy: string) {
  const grupos: Record<GrupoPlazo, T[]> = { abierta: [], proxima: [], cerrada: [], sin_fechas: [] }
  for (const c of lista) grupos[grupoPlazo(c, hoy)].push(c)
  const fecha = (c: T, g: GrupoPlazo) => (g === 'proxima' ? c.fecha_apertura : c.fecha_cierre) ?? '9999-12-31'
  grupos.abierta.sort((a, b) => fecha(a, 'abierta').localeCompare(fecha(b, 'abierta')))
  grupos.proxima.sort((a, b) => fecha(a, 'proxima').localeCompare(fecha(b, 'proxima')))
  grupos.cerrada.sort((a, b) => fecha(b, 'cerrada').localeCompare(fecha(a, 'cerrada')))
  return grupos
}

/** Lo que dice la puerta de "Plazos": lo más urgente primero. */
export function resumenPlazos(lista: Pick<Convocatoria, 'fecha_apertura' | 'fecha_cierre'>[], hoy: string): string {
  const g = agruparPlazos(lista, hoy)
  const cierre = g.abierta.find((c) => c.fecha_cierre)?.fecha_cierre
  if (g.abierta.length) {
    const n = g.abierta.length === 1 ? '1 abierta' : `${g.abierta.length} abiertas`
    return cierre ? `${n} · la primera cierra el ${fechaCorta(cierre)}` : n
  }
  const abre = g.proxima[0]?.fecha_apertura
  if (abre) return `Ninguna abierta · la próxima abre el ${fechaCorta(abre)}`
  return 'Ninguna abierta ahora'
}

/** Congresos y eventos de los próximos 12 meses del calendario (los del máster y los propios). */
export async function leerEventos(): Promise<Entrada[]> {
  const desde = hoy()
  const c = await llamar<Calendario>('mi_calendario', { p_desde: desde, p_hasta: sumarDias(desde, 365) })
  return proximas(entradas(c).filter((e) => e.tipo === 'congreso' || e.tipo === 'evento'), desde)
}
