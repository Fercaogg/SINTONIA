<script setup lang="ts">
// LAS CIFRAS (docs/GUION-PORTADA.md), sobre azul marino.
// Cada dato sube desde abajo, grande, a una velocidad distinta, y se posa en
// su sitio de la fila cuando la sección llega al centro; al seguir bajando,
// se separan otra vez en capas (parallax). Las ondas, al pie, muy desfasadas
// todavía, empiezan a acercarse.
import { ref } from 'vue'
import { DATOS_CLAVE } from '@/contenido/portada'
import { desfasarOndas, esMovil, inclinar, mezclar, poner, salida, tramo } from '@/lib/cine'
import { usarFondo, usarPieza } from '@/lib/usar-cine'
import CifraAnimada from '@/components/portada/CifraAnimada.vue'
import OndasSintonia from '@/components/portada/OndasSintonia.vue'

const raiz = ref<HTMLElement | null>(null)
const items = ref<HTMLElement[]>([])
const ondas = ref<HTMLElement | null>(null)

usarFondo(raiz, 'marino')
usarPieza(raiz, (v, vel) => {
  const vh = window.innerHeight
  const m = esMovil() ? 0.55 : 1
  const sk = inclinar(vel, 0.12, 6)
  items.value.forEach((el, i) => {
    const llega = salida(tramo(v, 0.04 + i * 0.05, 0.38 + i * 0.03))
    const sale = tramo(v, 0.62, 1)
    poner(el, {
      y: (1 - llega) * vh * (0.35 + i * 0.12) * m - sale * vh * (0.08 + i * 0.07) * m,
      s: mezclar(1.45, 1, llega),
      r: (1 - llega) * (i % 2 ? 6 : -6),
      sk,
      o: llega,
    })
  })
  desfasarOndas(ondas.value, mezclar(0.95, 0.6, tramo(v, 0.2, 0.9)))
  poner(ondas.value, { x: (0.5 - v) * 220 * m })
})
</script>

<template>
  <section ref="raiz" aria-label="SINTONÍA en cifras" class="relative overflow-hidden bg-marino text-white">
    <div class="relative z-10 max-w-[1180px] w-full mx-auto px-4 sm:px-6 pt-24 pb-36 sm:pt-32 sm:pb-44 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
      <div v-for="d in DATOS_CLAVE" :key="d.texto" ref="items" class="origin-bottom-left will-change-transform">
        <CifraAnimada :valor="Number(d.cifra)" :unidad="d.unidad" :texto="d.texto" />
      </div>
    </div>
    <div ref="ondas" class="absolute -inset-x-24 bottom-8 opacity-70 pointer-events-none" aria-hidden="true">
      <OndasSintonia :desfase="0.85" :alto="90" :grosor="3" sobre-oscuro />
    </div>
  </section>
</template>
