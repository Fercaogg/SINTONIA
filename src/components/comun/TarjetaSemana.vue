<script setup lang="ts">
// Tarjeta protagonista del inicio de los paneles: lo que toca esta semana.
// Fondo azul marino a sangre, la cifra en grande, un anillo con el avance y
// las dos ondas de la marca (las mismas que en la portada).
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import OndasSintonia from '@/components/portada/OndasSintonia.vue'

const props = withDefaults(
  defineProps<{
    etiqueta: string
    cifra: string
    titulo: string
    texto: string
    accion: { to: string; texto: string }
    progreso: number
    textoAnillo: string
    descripcionAnillo: string
    hecho?: boolean
  }>(),
  { hecho: false },
)

const R = 34
const PERIMETRO = 2 * Math.PI * R
const trazo = computed(() => `${Math.max(0, Math.min(1, props.progreso)) * PERIMETRO} ${PERIMETRO}`)
</script>

<template>
  <section class="tarjeta-semana relative overflow-hidden rounded-panel bg-marino text-white p-6 sm:p-8" :aria-label="titulo">
    <div class="absolute inset-x-0 bottom-0 opacity-40 pointer-events-none" aria-hidden="true">
      <OndasSintonia :desfase="hecho ? 0 : 0.7" :alto="90" :grosor="3" sobre-oscuro />
    </div>
    <div class="relative grid gap-6 sm:grid-cols-[1fr_auto] items-start">
      <div>
        <p class="text-xs font-mono font-normal uppercase tracking-[0.14em] text-brand-400">{{ etiqueta }}</p>
        <p class="font-display text-5xl sm:text-6xl font-medium tracking-tight leading-none mt-3 tabular-nums">{{ cifra }}</p>
        <h2 class="font-display text-xl sm:text-2xl font-semibold mt-4">{{ titulo }}</h2>
        <p class="mt-1 text-white/85">{{ texto }}</p>
        <RouterLink :to="accion.to" class="btn-claro mt-6">{{ accion.texto }}</RouterLink>
      </div>
      <div class="hidden sm:flex flex-col items-center gap-2" role="img" :aria-label="descripcionAnillo">
        <svg width="96" height="96" viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" :r="R" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="6" />
          <circle
            cx="40"
            cy="40"
            :r="R"
            fill="none"
            stroke="#FF6A33"
            stroke-width="6"
            stroke-linecap="round"
            :stroke-dasharray="trazo"
            transform="rotate(-90 40 40)"
          />
          <text x="40" y="45" text-anchor="middle" font-size="15" font-weight="500" fill="#ffffff">{{ textoAnillo }}</text>
        </svg>
      </div>
    </div>
  </section>
</template>
