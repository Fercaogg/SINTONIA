// Buscador de oposiciones según los estudios. Todo se calcula en el navegador:
// lo que la persona elige no se envía ni se guarda en ningún sitio.
//
// Orden de la lista (como en la hoja de cálculo de la fase 1):
//   1. Las que exigen tu titulación concreta.
//   2. Las afines a tu rama o a tu titulación.
//   3. Las que piden un requisito general (un nivel de estudios).
// Dentro de cada grupo, primero las de más nivel y, a igual nivel, las de más plazas.

import { OPOSICIONES, RAMAS, TITULACIONES, type Ambito, type Nivel, type Oposicion, type Rama } from '@/contenido/oposiciones'

export type Encaje = 'exige' | 'afin' | 'general'
export type MasterProfesorado = 'si' | 'cursando' | 'no'

export interface Perfil {
  nivel: Nivel
  /** Rama del grado; null si no se ha elegido. */
  rama: Rama | null
  /** Titulación concreta; null si no se ha elegido o no está en la lista. */
  titulacion: string | null
  master: MasterProfesorado
  ambito: Ambito | 'Todos'
}

export interface Resultado {
  oposicion: Oposicion
  encaje: Encaje
  /** Cumple todo salvo el Máster, que está cursando. */
  alTerminarMaster: boolean
}

export const ENCAJES: { clave: Encaje; titulo: string; texto: string }[] = [
  { clave: 'exige', titulo: 'Piden tu titulación', texto: 'La convocatoria exige justo la titulación que tienes.' },
  { clave: 'afin', titulo: 'Afines a tus estudios', texto: 'Cualquier titulación del nivel vale, pero el temario o el trabajo encajan con tu rama o tu titulación.' },
  { clave: 'general', titulo: 'Cumples el requisito general', texto: 'Piden un nivel de estudios, no una titulación concreta.' },
]

const ORDEN: Record<Encaje, number> = { exige: 0, afin: 1, general: 2 }

/** Rama a la que pertenece una titulación de la lista. */
export function ramaDe(titulacion: string): Rama | null {
  return RAMAS.find((r) => TITULACIONES[r].includes(titulacion)) ?? null
}

function encajeDe(o: Oposicion, p: Perfil): Encaje | null {
  if (o.exige?.length) return p.titulacion && o.exige.includes(p.titulacion) ? 'exige' : null
  const afinTitulacion = !!p.titulacion && !!o.afinidad?.titulaciones?.includes(p.titulacion)
  const afinRama = !!p.rama && !!o.afinidad?.ramas?.includes(p.rama)
  return afinTitulacion || afinRama ? 'afin' : 'general'
}

function cumpleMaster(o: Oposicion, p: Perfil) {
  return !o.masterProfesorado || p.master !== 'no'
}

/** Oposiciones a las que se puede presentar alguien con este perfil, ya ordenadas. */
export function buscarOposiciones(p: Perfil, lista: Oposicion[] = OPOSICIONES): Resultado[] {
  return lista
    .filter((o) => p.ambito === 'Todos' || o.ambito === p.ambito)
    .filter((o) => p.nivel >= o.nivelMinimo && cumpleMaster(o, p))
    .flatMap((o) => {
      const encaje = encajeDe(o, p)
      return encaje ? [{ oposicion: o, encaje, alTerminarMaster: !!o.masterProfesorado && p.master === 'cursando' }] : []
    })
    .sort((a, b) =>
      ORDEN[a.encaje] - ORDEN[b.encaje]
      || b.oposicion.nivelMinimo - a.oposicion.nivelMinimo
      || b.oposicion.plazas - a.oposicion.plazas,
    )
}

/** Cuántas oposiciones más se abrirían con el Máster en Formación del Profesorado. */
export function abiertasConMaster(p: Perfil, lista: Oposicion[] = OPOSICIONES): number {
  if (p.master !== 'no') return 0
  return buscarOposiciones({ ...p, master: 'si' }, lista).length - buscarOposiciones(p, lista).length
}

/** Plazas con separador de miles (1.255), también en números de cuatro cifras. */
export function formatoPlazas(n: number): string {
  // toLocaleString('es-ES') no pone el punto en 1255 (norma de la RAE para cuatro cifras).
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
