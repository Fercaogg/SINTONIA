import { GUION } from './guion'

// Subtítulos: se calculan solos a partir de la locución de cada escena.
// El tiempo de cada frase es proporcional a su longitud. Cuando haya voz grabada,
// se podrán ajustar a mano con AJUSTES (segundos de inicio por escena y frase).
export interface Pista { inicio: number; fin: number; texto: string }

const MAX = 62 // letras por subtítulo, como mucho

function trocear(frase: string): string[] {
  if (frase.length <= MAX) return [frase]
  const cortes = [...frase.matchAll(/[,:;] | y /g)].map((m) => (m[0] === ' y ' ? m.index! : m.index! + 1))
  if (!cortes.length) return [frase]
  const medio = cortes.reduce((a, b) => (Math.abs(b - frase.length / 2) < Math.abs(a - frase.length / 2) ? b : a))
  return [...trocear(frase.slice(0, medio).trim()), ...trocear(frase.slice(medio).trim())]
}

export function pistas(): Pista[] {
  const todas: Pista[] = []
  for (const e of GUION) {
    if (e.locucion.startsWith('(')) continue
    const trozos = e.locucion.split(/(?<=[.?!])\s+/).flatMap(trocear)
    const total = trozos.reduce((s, x) => s + x.length + 8, 0)
    let t = e.inicio + 0.4
    const hueco = e.fin - e.inicio - 0.9
    for (const x of trozos) {
      const d = ((x.length + 8) / total) * hueco
      todas.push({ inicio: t, fin: t + d - 0.08, texto: x })
      t += d
    }
  }
  return todas
}
