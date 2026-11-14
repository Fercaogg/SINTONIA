// Utilidades de movimiento (skill de Emil Kowalski): respetar "reducir
// movimiento", medir el avance del scroll sin bloquear la página y saber
// cuándo un elemento entra en pantalla.

import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

export function prefiereMenosMovimiento(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

/**
 * Avance (0 a 1) del scroll dentro de un elemento: 0 cuando su parte de
 * arriba llega a la mitad de la pantalla, 1 cuando la de abajo llega ahí.
 * Se calcula como mucho una vez por fotograma.
 */
export function useAvanceScroll(elemento: Ref<HTMLElement | null>) {
  const avance = ref(0)
  let pendiente = false
  function medir() {
    pendiente = false
    const el = elemento.value
    if (!el) return
    const r = el.getBoundingClientRect()
    const mitad = window.innerHeight / 2
    avance.value = Math.min(1, Math.max(0, (mitad - r.top) / Math.max(1, r.height)))
  }
  function alMover() {
    if (!pendiente) {
      pendiente = true
      requestAnimationFrame(medir)
    }
  }
  onMounted(() => {
    if (prefiereMenosMovimiento()) {
      avance.value = 1
      return
    }
    medir()
    window.addEventListener('scroll', alMover, { passive: true })
    window.addEventListener('resize', alMover, { passive: true })
  })
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', alMover)
    window.removeEventListener('resize', alMover)
  })
  return avance
}

/** true la primera vez que el elemento entra en pantalla (y ya no cambia). */
export function useVisibleUnaVez(elemento: Ref<HTMLElement | null>) {
  const visible = ref(false)
  let observador: IntersectionObserver | null = null
  onMounted(() => {
    if (!elemento.value || typeof IntersectionObserver === 'undefined' || prefiereMenosMovimiento()) {
      visible.value = true
      return
    }
    observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          visible.value = true
          observador?.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observador.observe(elemento.value)
  })
  onBeforeUnmount(() => observador?.disconnect())
  return visible
}
