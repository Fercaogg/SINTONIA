<script setup lang="ts">
// Tipografía gigante que cruza la pantalla en horizontal con el scroll.
// Dos filas en sentidos contrarios; se inclinan según la velocidad.
// Es decorativa: repite frases que ya están en la página y queda oculta a
// los lectores de pantalla. Con "reducir movimiento" no se muestra.
//
// converger: las dos filas van a coincidir en la misma línea (las dos
// miradas que terminan en sintonía) cuando la banda llega al centro.
import { ref } from 'vue'
import { esMovil, inclinar, poner, salida, tramo } from '@/lib/cine'
import { cineActivo, usarFondo, usarPieza } from '@/lib/usar-cine'

const props = withDefaults(defineProps<{ texto: string; fondo?: 'claro' | 'marino' | 'verde'; converger?: boolean }>(), {
  fondo: 'claro',
  converger: false,
})
const cine = cineActivo()
const raiz = ref<HTMLElement | null>(null)
const fila1 = ref<HTMLElement | null>(null)
const fila2 = ref<HTMLElement | null>(null)
const oscuro = props.fondo === 'marino'
const repetido = Array.from({ length: 4 }, () => props.texto).join(' · ') + ' ·'

usarFondo(raiz, props.fondo)
usarPieza(
  raiz,
  (v, vel) => {
    const vw = window.innerWidth
    const sk = inclinar(vel, 0.25, 12)
    if (props.converger) {
      // De separadas a una sola línea en el centro de la pantalla.
      const j = 1 - salida(tramo(v, 0.1, 0.55))
      const x = (0.5 - v) * vw * 0.25
      poner(fila1.value, { x: x - j * vw * 0.45, y: -j * 40, sk })
      poner(fila2.value, { x: x + j * vw * 0.45, y: j * 40, sk, o: 0.35 + 0.65 * (1 - j) })
    } else {
      const d = (v - 0.5) * vw * (esMovil() ? 1.1 : 0.7)
      poner(fila1.value, { x: -d - vw * 0.15, sk })
      poner(fila2.value, { x: d - vw * 0.35, sk })
    }
  },
  { muelle: 0.09 },
)
</script>

<template>
  <div v-if="cine" ref="raiz" class="relative overflow-hidden select-none pointer-events-none py-10 sm:py-16" :class="{ 'bg-marino': oscuro }" aria-hidden="true">
    <div :class="converger ? 'grid' : ''">
      <p
        ref="fila1"
        class="fila font-display font-bold whitespace-nowrap leading-[0.95] tracking-tight"
        :class="[oscuro ? 'text-white' : 'text-surface-900', converger ? 'text-center [grid-area:1/1]' : '']"
      >
        {{ converger ? texto : repetido }}
      </p>
      <p
        ref="fila2"
        class="fila font-display font-bold whitespace-nowrap leading-[0.95] tracking-tight"
        :class="[converger ? 'text-brand-800 text-center [grid-area:1/1] mix-blend-normal' : 'contorno']"
      >
        {{ converger ? texto : repetido }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.fila {
  font-size: clamp(3.5rem, 13vw, 12rem);
  will-change: transform;
}
.contorno {
  color: transparent;
  -webkit-text-stroke: 2px #34c6a3;
}
</style>
