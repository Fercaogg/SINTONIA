// Efectos de la portada (DISENO.md apartado 12.1): aparecer al llegar, luz e
// inclinación que siguen al ratón y piezas ligadas al desplazamiento.
//
// Reglas (skills de Emil, Taste y ui-ux-pro-max):
//   - Nunca se fija ni se intercepta el scroll; todo acompaña al desplazamiento.
//   - Solo transform y opacity en lo que se mueve (la luz del cursor solo
//     cambia dos variables CSS de una tarjeta).
//   - Aparecer: una sola vez, corto, ease-out y escalonado (no en cola).
//   - Ratón: solo en dispositivos con puntero fino y que permiten hover.
//   - Con "reducir movimiento": nada de esto; todo se ve en su sitio.
import type { Directive } from 'vue'

export const sinMovimiento = () => typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches
const conRaton = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

// ---------- Aparecer al llegar (v-revelar="orden") ----------
let observador: IntersectionObserver | null = null
function observar(el: Element) {
  observador ??= new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue
        const el = e.target as HTMLElement
        el.classList.add('revelado')
        observador?.unobserve(el)
        // Al terminar, fuera la clase de transición: así la inclinación con el
        // ratón no hereda el retraso escalonado.
        const limpiar = (ev: TransitionEvent) => {
          if (ev.target !== el || ev.propertyName !== 'transform') return
          el.classList.remove('revelar')
          el.style.removeProperty('--retraso')
          el.removeEventListener('transitionend', limpiar)
        }
        el.addEventListener('transitionend', limpiar)
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
  )
  observador.observe(el)
}

export const vRevelar: Directive<HTMLElement, number | undefined> = {
  mounted(el, { value }) {
    if (sinMovimiento()) return
    el.classList.add('revelar')
    el.style.setProperty('--retraso', `${(value ?? 0) * 90}ms`)
    observar(el)
  },
  unmounted(el) {
    observador?.unobserve(el)
  },
}

// ---------- Luz e inclinación con el ratón (v-cursor o v-cursor="'inclinar'") ----------
export const vCursor: Directive<HTMLElement, 'inclinar' | undefined> = {
  mounted(el, { value }) {
    if (sinMovimiento() || !conRaton()) return
    el.classList.add('con-luz')
    const inclinar = value === 'inclinar'
    let marco = 0
    let x = 0
    let y = 0
    const pintar = () => {
      marco = 0
      const r = el.getBoundingClientRect()
      const px = (x - r.left) / r.width
      const py = (y - r.top) / r.height
      el.style.setProperty('--luz-x', `${(px * 100).toFixed(1)}%`)
      el.style.setProperty('--luz-y', `${(py * 100).toFixed(1)}%`)
      if (inclinar) el.style.transform = `perspective(900px) rotateX(${((0.5 - py) * 3).toFixed(2)}deg) rotateY(${((px - 0.5) * 3.5).toFixed(2)}deg) translateY(-2px)`
    }
    const mover = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      if (!marco) marco = requestAnimationFrame(pintar)
    }
    const salir = () => {
      cancelAnimationFrame(marco)
      marco = 0
      if (inclinar) el.style.transform = ''
    }
    el.addEventListener('pointermove', mover)
    el.addEventListener('pointerleave', salir)
    ;(el as HTMLElement & { _quitarCursor?: () => void })._quitarCursor = () => {
      el.removeEventListener('pointermove', mover)
      el.removeEventListener('pointerleave', salir)
    }
  },
  unmounted(el) {
    ;(el as HTMLElement & { _quitarCursor?: () => void })._quitarCursor?.()
  },
}

// ---------- Piezas ligadas al desplazamiento ----------
// avance: 0 cuando el elemento asoma por abajo, 0,5 con su centro en el centro
// de la pantalla y 1 cuando sale por arriba. Un solo oyente pasivo y un
// cálculo por fotograma, solo mientras hay scroll.
type AlAvanzar = (avance: number) => void
const piezas = new Map<Element, AlAvanzar>()
let marcoScroll = 0
let escuchando = false

function calcular() {
  marcoScroll = 0
  const alto = window.innerHeight
  for (const [el, cb] of piezas) {
    const r = el.getBoundingClientRect()
    if (r.bottom < -alto * 0.5 || r.top > alto * 1.5) continue
    cb(Math.min(1, Math.max(0, (alto - r.top) / (alto + r.height))))
  }
}
const pedir = () => {
  if (!marcoScroll) marcoScroll = requestAnimationFrame(calcular)
}

export function alAvanzar(el: Element, cb: AlAvanzar): () => void {
  if (sinMovimiento()) {
    cb(0.5)
    return () => {}
  }
  piezas.set(el, cb)
  if (!escuchando) {
    escuchando = true
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir, { passive: true })
  }
  // Primera vez, después del primer pintado (no fuerza el diseño al montar).
  window.setTimeout(pedir, 120)
  return () => {
    piezas.delete(el)
  }
}

/** Desfase de las dos ondas (OndasSintonia) escrito directamente: 0 en sintonía, 1 media onda. */
export function desfasarOndas(raiz: Element | null | undefined, d: number) {
  const g = raiz?.querySelector<SVGGElement>('.ondas-tutor')
  if (!g) return
  g.style.transition = 'none'
  const t = Math.min(1, Math.max(0, d))
  g.style.transform = `translateX(${(t * 100).toFixed(1)}px) scaleY(${(1 - t * 0.35).toFixed(3)})`
}
