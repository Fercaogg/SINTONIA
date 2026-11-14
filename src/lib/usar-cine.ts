// Ayudas de Vue para el motor de la portada (src/lib/cine.ts).
// Con "reducir movimiento" no se registra nada: se ve la versión estática.
import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import { anadirFondo, anadirPieza, prefiereMenosMovimiento, type Dibujo } from './cine'

export const cineActivo = () => typeof window !== 'undefined' && !prefiereMenosMovimiento()

/** Mueve piezas de un componente según su paso por la pantalla. */
export function usarPieza(el: Ref<HTMLElement | null>, dibujar: Dibujo, opciones: { muelle?: number; modo?: 'paso' | 'inicio' } = {}) {
  let quitar: (() => void) | null = null
  onMounted(() => {
    if (!cineActivo() || !el.value) return
    quitar = anadirPieza(el.value, dibujar, opciones.muelle ?? 0.12, opciones.modo ?? 'paso')
  })
  onBeforeUnmount(() => quitar?.())
}

/** Marca una zona de la portada con su color de fondo (claro, marino o verde). */
export function usarFondo(el: Ref<HTMLElement | null>, color: 'claro' | 'marino' | 'verde') {
  let quitar: (() => void) | null = null
  onMounted(() => {
    if (!cineActivo() || !el.value) return
    quitar = anadirFondo(el.value, color)
  })
  onBeforeUnmount(() => quitar?.())
}
