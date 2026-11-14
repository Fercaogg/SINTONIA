// MOTOR DE LA PORTADA CINEMATOGRÁFICA (docs/GUION-PORTADA.md)
//
// El scroll es la línea de tiempo. Cada escena es un bloque alto con un
// escenario fijado (position: sticky) dentro; su avance va de 0 a 1 mientras
// el escenario está fijado, y la escena mueve lo suyo con ese avance.
//
// Reglas (skills de Emil Kowalski y Taste):
//   - Scroll nativo: nada se secuestra. Un único oyente pasivo de scroll y,
//     como mucho, un cálculo por fotograma (requestAnimationFrame).
//   - Los estilos (solo transform y opacity) se escriben directamente en los
//     elementos, sin pasar por la reactividad de Vue en cada fotograma.
//   - Con el foco dentro de una escena, se dibuja su estado de reposo, para
//     que lo que se maneja con teclado esté siempre en su sitio y visible.

export interface Escena {
  /** El bloque alto que ocupa la escena en el documento. */
  raiz: HTMLElement
  /** Lo que queda fijado mientras dura la escena. */
  escenario: HTMLElement
  /** Scroll extra que dura la escena, en px (además de la altura del escenario). */
  extra: () => number
  /** Dibuja la escena en un avance de 0 a 1. */
  dibujar: (avance: number) => void
  /** Avance en el que todo está en su sitio (para el teclado). */
  reposo: number
  /** Medidas que dependen del tamaño de la ventana. */
  medir?: () => void
  /** Cuánto azul marino tiene el fondo en este avance (0 a 1). */
  fondo?: (avance: number) => number
}

const escenas = new Set<Escena>()
const ultimo = new WeakMap<Escena, number>()
let pendiente = false
let alFondo: ((marino: number) => void) | null = null

export const limitar = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
/** Avance local de un tramo [desde, hasta] dentro del avance de la escena. */
export const tramo = (p: number, desde: number, hasta: number) => limitar((p - desde) / (hasta - desde))
/** Curvas (las mismas familias que tokens.css). */
export const salida = (t: number) => 1 - Math.pow(1 - t, 3)
export const enMedio = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const mezclar = (a: number, b: number, t: number) => a + (b - a) * t

export function esMovil(): boolean {
  return window.innerWidth < 768
}

/** Alto de la cabecera fija de la portada (el escenario se fija debajo). */
export function altoCabecera(): number {
  return document.querySelector<HTMLElement>('[data-cabecera-portada]')?.offsetHeight ?? 0
}

/**
 * Cuánto hay que mover un elemento del escenario para que su centro quede en
 * (x, y) de la ventana MIENTRAS el escenario está fijado. Se mide en reposo.
 */
export function haciaPunto(escenario: HTMLElement, el: HTMLElement, xVentana: number, yVentana: number) {
  const t = el.style.transform
  el.style.transform = ''
  const r = el.getBoundingClientRect()
  const e = escenario.getBoundingClientRect()
  el.style.transform = t
  const fijo = Math.min(altoCabecera(), window.innerHeight - escenario.offsetHeight)
  return {
    dx: xVentana - (r.left + r.width / 2),
    dy: yVentana - fijo - (r.top + r.height / 2 - e.top),
    ancho: r.width,
  }
}

function avanceDe(e: Escena): number {
  const r = e.raiz.getBoundingClientRect()
  const cabecera = altoCabecera()
  const alto = e.escenario.offsetHeight
  const recorrido = r.height - alto
  if (recorrido <= 0) return 0
  // Empieza cuando el escenario queda fijado: arriba, bajo la cabecera, o,
  // si es más alto que la pantalla (móvil), cuando se ve su pie.
  const fijo = Math.min(cabecera, window.innerHeight - alto)
  return limitar((fijo - r.top) / recorrido)
}

function fotograma() {
  pendiente = false
  const mitad = window.innerHeight / 2
  let marino = 0
  for (const e of escenas) {
    const r = e.raiz.getBoundingClientRect()
    if (r.bottom < -window.innerHeight || r.top > window.innerHeight * 2) continue
    const conFoco = e.raiz.contains(document.activeElement) && document.activeElement !== document.body
    const p = conFoco ? e.reposo : avanceDe(e)
    if (ultimo.get(e) !== p) {
      ultimo.set(e, p)
      e.dibujar(p)
    }
    if (e.fondo && r.top <= mitad && r.bottom >= mitad) marino = e.fondo(p)
  }
  alFondo?.(marino)
}

function pedirFotograma() {
  if (!pendiente) {
    pendiente = true
    requestAnimationFrame(fotograma)
  }
}

function medirTodo() {
  for (const e of escenas) {
    e.medir?.()
    const alto = e.escenario.offsetHeight
    // Fijado arriba; si es más alto que la pantalla, se fija cuando se ve su pie.
    e.escenario.style.top = `${Math.min(altoCabecera(), window.innerHeight - alto)}px`
    e.raiz.style.height = `${alto + e.extra()}px`
    ultimo.delete(e)
  }
  pedirFotograma()
}

let oyendo = false
let medidor: ResizeObserver | null = null
function escuchar() {
  if (oyendo) return
  oyendo = true
  window.addEventListener('scroll', pedirFotograma, { passive: true })
  window.addEventListener('resize', medirTodo, { passive: true })
  document.addEventListener('focusin', pedirFotograma)
  document.addEventListener('focusout', pedirFotograma)
  medidor = new ResizeObserver(() => medirTodo())
}

export function registrarEscena(e: Escena) {
  escuchar()
  escenas.add(e)
  medidor?.observe(e.escenario)
  medirTodo()
}

export function quitarEscena(e: Escena) {
  escenas.delete(e)
  medidor?.unobserve(e.escenario)
  e.raiz.style.height = ''
  e.escenario.style.top = ''
  if (!escenas.size) alFondo?.(0)
}

export function alCambiarFondo(fn: ((marino: number) => void) | null) {
  alFondo = fn
  pedirFotograma()
}

export function prefiereMenosMovimiento(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}
