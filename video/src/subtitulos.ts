import VOZ from './voz.json'

// Subtítulos: salen solos de la locución (src/voz.json, que escribe "npm run voz").
// Cada subtítulo dura lo que dura esa frase en la voz.
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
  for (const f of VOZ) {
    const trozos = trocear(f.texto)
    const total = trozos.reduce((s, x) => s + x.length, 0)
    let t = f.inicio
    trozos.forEach((x, i) => {
      const d = (x.length / total) * f.dur
      todas.push({ inicio: t, fin: t + d + (i === trozos.length - 1 ? 0.35 : 0), texto: x })
      t += d
    })
  }
  // ningún subtítulo pisa al siguiente
  todas.forEach((p, i) => { if (todas[i + 1]) p.fin = Math.min(p.fin, todas[i + 1].inicio - 0.04) })
  return todas
}

export { VOZ }
