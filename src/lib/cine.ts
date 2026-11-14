// MOTOR DE LA PORTADA EN MOVIMIENTO (docs/GUION-PORTADA.md)
//
// Nada se fija ni bloquea la pantalla: la página siempre avanza con el
// scroll, y cada pieza se mueve según por dónde pasa (0 cuando asoma por
// abajo, 1 cuando sale por arriba).
//
//   - Inercia: cada pieza sigue su objetivo con un "muelle" (interpolación
//     por fotograma), así al bajar rápido todo se estira y al parar se asienta.
//   - Velocidad: se mide lo rápido que se baja (suavizado) y se pasa a las
//     piezas que la usan (por ejemplo, la tipografía gigante se inclina).
//   - Rendimiento (skills de Emil Kowalski): un único oyente pasivo, posiciones
//     medidas solo al cambiar el tamaño, estilos escritos directamente (solo
//     transform y opacity) y el bucle se para cuando todo está quieto.
//   - Scroll nativo: nunca se intercepta ni se suaviza el desplazamiento.

export type Dibujo = (v: number, velocidad: number, el: HTMLElement) => void

interface Pieza {
  el: HTMLElement
  dibujar: Dibujo
  /** Posición en el documento (medida sin transformaciones). */
  arriba: number
  alto: number
  actual: number
  primera: boolean
  /** 0 a 1: cuánto se acerca a su objetivo en cada fotograma (más bajo, más inercia). */
  muelle: number
  /** 'paso': de asomar por abajo a salir por arriba. 'inicio': de 0 (arriba del todo) a 1 (ya ha salido). */
  modo: 'paso' | 'inicio'
}

interface Fondo {
  el: HTMLElement
  color: 'claro' | 'marino' | 'verde'
  arriba: number
  abajo: number
}

const piezas = new Set<Pieza>()
const fondos = new Set<Fondo>()
let capas: Partial<Record<'marino' | 'verde', HTMLElement>> = {}
let anterior = 0
let velocidad = 0
let marco = 0
let alturaVentana = 0

export const limitar = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
export const tramo = (p: number, desde: number, hasta: number) => limitar((p - desde) / (hasta - desde))
export const salida = (t: number) => 1 - Math.pow(1 - t, 3)
export const enMedio = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const mezclar = (a: number, b: number, t: number) => a + (b - a) * t
export const esMovil = () => window.innerWidth < 768

/** Escribe transform y opacidad de una vez. */
export function poner(
  el: Element | null | undefined,
  t: { x?: number; y?: number; s?: number; sx?: number; sy?: number; r?: number; sk?: number; o?: number },
) {
  if (!(el instanceof HTMLElement || el instanceof SVGElement)) return
  const s = t.s ?? 1
  el.style.transform = `translate3d(${(t.x ?? 0).toFixed(1)}px, ${(t.y ?? 0).toFixed(1)}px, 0) scale(${(s * (t.sx ?? 1)).toFixed(4)}, ${(s * (t.sy ?? 1)).toFixed(4)}) rotate(${(t.r ?? 0).toFixed(2)}deg) skewY(${(t.sk ?? 0).toFixed(2)}deg)`
  if (t.o !== undefined) el.style.opacity = limitar(t.o).toFixed(3)
}

// Medir todo de una vez: primero se quitan las transformaciones, luego se
// leen todas las posiciones y al final se devuelven (un solo cálculo de
// diseño, en lugar de uno por pieza).
function medirTodo() {
  medicionPendiente = 0
  alturaVentana = window.innerHeight
  const y = window.scrollY
  if (primeraMedida) {
    anterior = y
    primeraMedida = false
  }
  const guardadas = [...piezas].map((p) => {
    const t = p.el.style.transform
    p.el.style.transform = ''
    return t
  })
  const rects = [...piezas].map((p) => p.el.getBoundingClientRect())
  const zonas = [...fondos].map((f) => f.el.getBoundingClientRect())
  ;[...piezas].forEach((p, i) => {
    p.el.style.transform = guardadas[i]
    p.arriba = rects[i].top + y
    p.alto = rects[i].height
  })
  ;[...fondos].forEach((f, i) => {
    f.arriba = zonas[i].top + y
    f.abajo = zonas[i].bottom + y
  })
  despertar()
}

let medicionPendiente = 0
let primeraMedida = true
function medirPronto() {
  if (medicionPendiente) return
  // La primera vez se espera a que el navegador haya pintado la página: así
  // la medición no adelanta el primer cálculo del diseño (carga más fluida).
  medicionPendiente = primeraMedida ? window.setTimeout(medirTodo, 150) : requestAnimationFrame(medirTodo)
}

function pintarFondo(y: number) {
  if (!fondos.size) return
  // El color cambia cuando la nueva zona ocupa ya buena parte de la pantalla.
  const centro = y + alturaVentana * 0.45
  const banda = alturaVentana * 0.15
  const peso = { claro: 0, marino: 0, verde: 0 }
  // Cada sección pesa según lo cerca que está su zona del centro de la pantalla.
  for (const f of fondos) {
    const dentro = centro >= f.arriba && centro <= f.abajo ? 1 : 0
    const distancia = dentro ? 0 : Math.min(Math.abs(centro - f.arriba), Math.abs(centro - f.abajo))
    peso[f.color] = Math.max(peso[f.color], dentro || limitar(1 - distancia / banda))
  }
  const total = peso.claro + peso.marino + peso.verde || 1
  const m = peso.marino / total
  const v = peso.verde / total
  if (capas.marino) capas.marino.style.opacity = m.toFixed(3)
  if (capas.verde) capas.verde.style.opacity = (v / Math.max(0.001, 1 - m)).toFixed(3)
}

function fotograma() {
  marco = 0
  const y = window.scrollY
  velocidad = mezclar(velocidad, y - anterior, 0.18)
  anterior = y
  let enMarcha = Math.abs(velocidad) > 0.05
  // Teclado: si el foco (visible) está dentro de una pieza, esa pieza vuelve a
  // su sitio de reposo, para que lo enfocado siempre se vea entero y quieto.
  const foco = document.activeElement
  const conTeclado = foco instanceof HTMLElement && foco !== document.body && foco.matches(':focus-visible')
  for (const p of piezas) {
    if (p.alto === 0 && p.arriba === 0) continue
    const arriba = p.arriba - y
    if (arriba > alturaVentana * 1.5 || arriba + p.alto < -alturaVentana * 0.5) continue
    const reposo = p.modo === 'inicio' ? 0 : 0.5
    const objetivo =
      conTeclado && p.el.contains(foco)
        ? reposo
        : p.modo === 'inicio'
          ? limitar(y / Math.max(1, p.arriba + p.alto))
          : limitar((alturaVentana - arriba) / (alturaVentana + p.alto))
    p.actual = p.primera ? objetivo : mezclar(p.actual, objetivo, p.muelle)
    p.primera = false
    if (Math.abs(p.actual - objetivo) > 0.0005) enMarcha = true
    else p.actual = objetivo
    p.dibujar(p.actual, velocidad, p.el)
  }
  pintarFondo(y)
  if (enMarcha) marco = requestAnimationFrame(fotograma)
}

function despertar() {
  if (!marco) marco = requestAnimationFrame(fotograma)
}

let oyendo = false
let medidor: ResizeObserver | null = null
function escuchar() {
  if (oyendo) return
  oyendo = true
  // Sin leer medidas aquí (forzaría el cálculo del diseño durante el montaje):
  // la primera medición se hace en el siguiente fotograma.
  primeraMedida = true
  window.addEventListener('scroll', despertar, { passive: true })
  window.addEventListener('resize', medirPronto, { passive: true })
  document.addEventListener('focusin', despertar)
  document.addEventListener('focusout', despertar)
  medidor = new ResizeObserver(medirPronto)
  medidor.observe(document.body)
}

export function anadirPieza(el: HTMLElement, dibujar: Dibujo, muelle = 0.12, modo: Pieza['modo'] = 'paso'): () => void {
  escuchar()
  const p: Pieza = { el, dibujar, arriba: 0, alto: 0, actual: 0, primera: true, muelle, modo }
  piezas.add(p)
  medirPronto()
  return () => {
    piezas.delete(p)
    el.style.transform = ''
    el.style.opacity = ''
  }
}

export function anadirFondo(el: HTMLElement, color: Fondo['color']): () => void {
  escuchar()
  const f: Fondo = { el, color, arriba: 0, abajo: 0 }
  fondos.add(f)
  medirPronto()
  return () => fondos.delete(f)
}

export function capasDeFondo(c: typeof capas) {
  capas = c
  despertar()
}

/** Inclinación según la velocidad del scroll (tipografía que "se estira"). */
export const inclinar = (velocidad: number, fuerza = 0.18, max = 9) => limitar(velocidad * fuerza, -max, max)

/** Desfase de las dos ondas (OndasSintonia) escrito directamente: 0 en sintonía, 1 media onda. */
export function desfasarOndas(raiz: Element | null | undefined, d: number) {
  const g = raiz?.querySelector<SVGGElement>('.ondas-tutor')
  if (!g) return
  g.style.transition = 'none'
  const t = limitar(d)
  g.style.transform = `translateX(${(t * 100).toFixed(1)}px) scaleY(${(1 - t * 0.35).toFixed(3)})`
}

export function prefiereMenosMovimiento(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}
