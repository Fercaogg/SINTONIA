/**
 * AGENDA DE TUTORÍA
 *
 * Tres preguntas neutras para la próxima tutoría. Las preguntas:
 *   - nunca culpan a nadie ni dicen quién "tiene razón",
 *   - no mencionan puntuaciones,
 *   - no hablan de emociones.
 *
 * Este módulo contiene:
 *   - la validación de cualquier pregunta (venga del modelo o del banco),
 *   - la selección de preguntas del banco (modo sin modelo),
 *   - la construcción de lo ÚNICO que se envía al modelo de lenguaje.
 */

import { createHash } from 'node:crypto'
import type { Desajuste, Item } from './desajuste'

export interface PreguntaBanco {
  id: number
  tipo: Item | 'general'
  texto: string
}

// ---------------------------------------------------------------------------
// Validación
// ---------------------------------------------------------------------------

/**
 * Raíces de palabras que una pregunta no puede contener.
 * Puntuaciones, juicios y emociones.
 */
export const RAICES_PROHIBIDAS = [
  // puntuaciones y comparaciones
  'punt', 'nota', 'calific', 'escala', 'diferencia', 'desajuste', 'coincid', 'mayor', 'menor',
  // juicios y culpa
  'culpa', 'razón', 'razon', 'error', 'falla', 'fallo', 'deberías', 'deberias', 'tienes que',
  // emociones y bienestar
  'sient', 'sentí', 'emoci', 'ánimo', 'animo', 'estrés', 'estres', 'ansie', 'agobi', 'frustr', 'preocup',
  'trist', 'feliz', 'miedo', 'bienestar', 'motivaci', 'cansa', 'humor',
]

/**
 * Palabras completas prohibidas. Las preguntas se dirigen a los dos por igual,
 * así que no señalan a una de las dos personas ("tutoría" sí está permitida).
 */
export const PALABRAS_PROHIBIDAS = [
  'mal', 'tutor', 'tutora', 'tutores', 'tutoras', 'estudiante', 'estudiantes', 'alumno', 'alumna', 'alumnos',
  'alumnas', 'profesor', 'profesora', 'director', 'directora', 'tú', 'usted',
]

const LETRA = 'a-záéíóúüñ'

function contienePalabra(texto: string, palabra: string): boolean {
  return new RegExp(`(^|[^${LETRA}])${palabra}([^${LETRA}]|$)`, 'i').test(texto)
}

export function erroresDePregunta(texto: unknown): string[] {
  const errores: string[] = []
  if (typeof texto !== 'string') return ['no es un texto']
  const t = texto.trim()
  if (t.length < 15) errores.push('demasiado corta')
  if (t.length > 160) errores.push('demasiado larga')
  if (!t.startsWith('¿') || !t.endsWith('?')) errores.push('no es una pregunta (¿...?)')
  if (/\d/.test(t)) errores.push('contiene números')
  if (/[—–]/.test(t)) errores.push('contiene rayas')
  if (/[\n\r]/.test(t)) errores.push('contiene saltos de línea')
  const minus = ` ${t.toLowerCase()} `
  for (const raiz of RAICES_PROHIBIDAS) {
    if (minus.includes(raiz)) errores.push(`contiene "${raiz}"`)
  }
  for (const palabra of PALABRAS_PROHIBIDAS) {
    if (contienePalabra(minus, palabra)) errores.push(`contiene la palabra "${palabra}"`)
  }
  return errores
}

export type ResultadoValidacion = { ok: true; preguntas: [string, string, string] } | { ok: false; errores: string[] }

/** Valida la salida del modelo: exactamente 3 preguntas válidas y distintas. */
export function validarSalidaModelo(salida: unknown): ResultadoValidacion {
  const preguntas = (salida as { preguntas?: unknown } | null)?.preguntas
  if (!Array.isArray(preguntas)) return { ok: false, errores: ['falta la lista "preguntas"'] }
  if (preguntas.length !== 3) return { ok: false, errores: [`hay ${preguntas.length} preguntas, no 3`] }
  const errores = preguntas.flatMap((p, i) => erroresDePregunta(p).map((e) => `pregunta ${i + 1}: ${e}`))
  const limpias = preguntas.map((p) => String(p).trim())
  if (new Set(limpias.map((p) => p.toLowerCase())).size !== 3) errores.push('hay preguntas repetidas')
  if (errores.length) return { ok: false, errores }
  return { ok: true, preguntas: limpias as [string, string, string] }
}

// ---------------------------------------------------------------------------
// Banco de preguntas (modo sin modelo)
// ---------------------------------------------------------------------------

/** Orden pseudoaleatorio pero reproducible a partir de una semilla. */
function ordenar<T extends { id: number }>(lista: T[], semilla: string): T[] {
  const clave = (p: T) => createHash('sha256').update(`${semilla}:${p.id}`).digest('hex')
  return [...lista].sort((a, b) => (clave(a) < clave(b) ? -1 : 1))
}

/**
 * Elige 3 preguntas del banco según los desajustes relevantes:
 *   - un ítem relevante: 2 de ese ítem + 1 general;
 *   - los dos relevantes: 1 de cada uno (primero el de más magnitud) + 1 general;
 *   - ninguno: 3 generales.
 * Evita repetir preguntas que la pareja ya recibió, mientras queden otras.
 */
export function seleccionarDelBanco(opciones: {
  desajustes: Desajuste[]
  banco: PreguntaBanco[]
  previas: string[]
  semilla: string
}): [string, string, string] {
  const relevantes = opciones.desajustes.filter((d) => d.relevante).sort((a, b) => b.magnitud - a.magnitud)
  const plan: (Item | 'general')[] =
    relevantes.length === 0
      ? ['general', 'general', 'general']
      : relevantes.length === 1
        ? [relevantes[0].item, relevantes[0].item, 'general']
        : [relevantes[0].item, relevantes[1].item, 'general']

  const usadas = new Set(opciones.previas.map((p) => p.trim().toLowerCase()))
  const elegidas: string[] = []
  for (const tipo of plan) {
    const candidatas = ordenar(opciones.banco.filter((p) => p.tipo === tipo), `${opciones.semilla}:${tipo}`)
    const libre = (p: PreguntaBanco) => !elegidas.includes(p.texto)
    const nueva = candidatas.find((p) => libre(p) && !usadas.has(p.texto.toLowerCase())) ?? candidatas.find(libre)
    const deReserva = ordenar(opciones.banco, opciones.semilla).find(libre)
    const p = nueva ?? deReserva
    if (!p) throw new Error('El banco de preguntas no tiene suficientes preguntas')
    elegidas.push(p.texto)
  }
  return elegidas as [string, string, string]
}

// ---------------------------------------------------------------------------
// Lo único que se envía al modelo de lenguaje
// ---------------------------------------------------------------------------

export interface EntradaModelo {
  semana_del_estudio: number
  semanas_totales: number
  items: { item: Item; desajuste_relevante: boolean; signo: Desajuste['signo']; magnitud: number; persistente: boolean }[]
}

/**
 * Construye la entrada del modelo SOLO con datos no personales: qué ítems
 * presentan desajuste, el signo, la magnitud y la semana del estudio.
 * Nunca nombres, correos, identificadores ni textos libres.
 */
export function entradaParaModelo(desajustes: Desajuste[], semana: number, semanas: number): EntradaModelo {
  return {
    semana_del_estudio: semana,
    semanas_totales: semanas,
    items: desajustes.map((d) => ({
      item: d.item,
      desajuste_relevante: d.relevante,
      signo: d.signo,
      magnitud: d.magnitud,
      persistente: d.motivo === 'persistente',
    })),
  }
}
