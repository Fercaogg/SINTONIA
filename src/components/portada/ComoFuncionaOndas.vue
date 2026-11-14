<script setup lang="ts">
// "Cómo funciona": el momento de la página. Mientras se leen los tres pasos,
// las dos ondas (estudiante y tutor/a) pasan de desfasadas a alineadas.
// El movimiento explica algo: que dos miradas se acercan. Con "reducir
// movimiento" se ve directamente el final, en sintonía.
//
// Portada en movimiento: las ondas están dentro de un móvil que se monta
// pieza a pieza al entrar la sección (marco, isla, pantalla, ondas y
// estado), y los pasos llegan desde la derecha, cada uno a su velocidad.
import { computed, ref } from 'vue'
import { PASOS } from '@/contenido/portada'
import { useAvanceScroll } from '@/lib/movimiento'
import { esMovil, inclinar, poner, salida, tramo } from '@/lib/cine'
import { usarPieza } from '@/lib/usar-cine'
import AppIcon from '@/components/comun/AppIcon.vue'
import OndasSintonia from './OndasSintonia.vue'

const seccion = ref<HTMLElement | null>(null)
const avance = useAvanceScroll(seccion)
const desfase = computed(() => Math.max(0, 1 - avance.value * 1.3))
const pasoActivo = computed(() => Math.min(PASOS.length - 1, Math.floor(avance.value * PASOS.length)))
const estado = computed(() => (desfase.value < 0.08 ? 'En sintonía' : desfase.value < 0.6 ? 'Acercándose' : 'Dos miradas distintas'))

const marco = ref<HTMLElement | null>(null)
const isla = ref<HTMLElement | null>(null)
const barras = ref<HTMLElement[]>([])
const ondas = ref<HTMLElement | null>(null)
const texto = ref<HTMLElement | null>(null)
const pasos = ref<HTMLElement[]>([])

usarPieza(seccion, (v, vel) => {
  const m = esMovil() ? 0.5 : 1
  // El móvil se monta entre 0,05 y 0,35 del paso de la sección.
  const a = (desde: number) => salida(tramo(v, desde, desde + 0.14))
  const fm = a(0.04)
  poner(marco.value, { s: 0.7 + 0.3 * fm, r: (1 - fm) * -14 * m, y: (1 - fm) * 120, o: fm })
  const fi = a(0.12)
  poner(isla.value, { y: (1 - fi) * -70, o: fi })
  barras.value.forEach((el, i) => {
    const fb = a(0.14 + i * 0.03)
    poner(el, { x: (1 - fb) * (i % 2 ? 140 : -140) * m, o: fb, sx: 0.3 + 0.7 * fb })
  })
  const fo = a(0.2)
  poner(ondas.value, { x: (1 - fo) * 200 * m, o: fo })
  const ft = a(0.26)
  poner(texto.value, { y: (1 - ft) * 30, o: ft })
  const sk = inclinar(vel, 0.1, 5)
  pasos.value.forEach((el, i) => {
    const fp = salida(tramo(v, 0.08 + i * 0.1, 0.3 + i * 0.1))
    poner(el, { x: (1 - fp) * (180 + i * 60) * m, o: 0.15 + 0.85 * fp, sk })
  })
})
</script>

<template>
  <div ref="seccion" class="grid gap-10 lg:grid-cols-[5fr_7fr]">
    <div class="lg:sticky lg:top-28 self-start">
      <div ref="marco" class="movil mx-auto max-w-[22rem] rounded-[2.4rem] border-[7px] border-surface-900 bg-papel p-4 pt-3 shadow-xl">
        <div ref="isla" class="mx-auto mb-5 h-5 w-24 rounded-full bg-surface-900" aria-hidden="true" />
        <div class="space-y-2 mb-5" aria-hidden="true">
          <div v-for="n in 3" :key="n" ref="barras" class="h-2.5 rounded-full origin-left" :class="n === 1 ? 'w-2/3 bg-brand-200' : n === 2 ? 'w-5/6 bg-surface-200' : 'w-1/2 bg-surface-200'" />
        </div>
        <div ref="ondas"><OndasSintonia :desfase="desfase" :alto="110" etiquetas /></div>
        <p ref="texto" class="mt-4 mb-2 font-display text-lg font-semibold text-surface-900" aria-hidden="true">{{ estado }}</p>
      </div>
    </div>
    <ol class="space-y-6 lg:space-y-[18vh] lg:py-[6vh]">
      <li
        v-for="(p, i) in PASOS"
        :key="p.titulo"
        ref="pasos"
        class="paso grid grid-cols-[auto_1fr] gap-x-5"
        :data-activo="i === pasoActivo"
      >
        <span class="paso-numero font-display text-5xl sm:text-6xl font-bold tabular-nums leading-none" aria-hidden="true">0{{ i + 1 }}</span>
        <div>
          <h3 class="font-display text-2xl font-semibold text-surface-900 flex items-center gap-2">
            <AppIcon :name="p.icono" :size="22" class="text-brand-900" />{{ p.titulo }}
          </h3>
          <p class="mt-2 text-lg leading-relaxed">{{ p.texto }}</p>
          <p class="mt-3 texto-suave leading-relaxed">{{ p.detalle }}</p>
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.paso-numero {
  color: rgb(var(--rgb-s600));
  transition: color var(--dur-ui) ease;
}
.paso[data-activo='true'] .paso-numero {
  color: rgb(var(--rgb-b900));
}
</style>
