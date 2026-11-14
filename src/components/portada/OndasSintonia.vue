<script setup lang="ts">
// Motivo de marca: dos ondas, estudiante (verde) y tutor/a (azul marino), que
// empiezan desfasadas y terminan en sintonía.
//
// desfase: 0 = en sintonía (las dos ondas coinciden); 1 = media onda de
// diferencia. Solo se anima transform (skill de Emil Kowalski: rendimiento),
// con una curva ease-in-out porque es un movimiento en pantalla.
// Con "reducir movimiento", no hay transición: se ve el estado directamente.
import { computed } from 'vue'

const props = withDefaults(defineProps<{ desfase: number; alto?: number; grosor?: number; etiquetas?: boolean }>(), {
  alto: 120,
  grosor: 4,
  etiquetas: false,
})

const ANCHO = 600
const ONDA = 200 // longitud de onda, en unidades del dibujo
const AMPLITUD = 30

// Una onda larga (el doble del ancho) para poder desplazarla sin que se vea el final.
const camino = (() => {
  const puntos: string[] = []
  for (let x = -ONDA; x <= ANCHO + ONDA * 2; x += 5) {
    const y = 60 + AMPLITUD * Math.sin((2 * Math.PI * x) / ONDA)
    puntos.push(`${x === -ONDA ? 'M' : 'L'}${x},${y.toFixed(1)}`)
  }
  return puntos.join(' ')
})()

const d = computed(() => Math.min(1, Math.max(0, props.desfase)))
// Media longitud de onda de desfase como máximo; la onda del tutor también se aplana un poco.
const transformTutor = computed(() => `translateX(${(d.value * ONDA) / 2}px) scaleY(${1 - d.value * 0.35})`)
</script>

<template>
  <svg
    :viewBox="`0 0 ${ANCHO} 120`"
    preserveAspectRatio="none"
    class="ondas w-full block overflow-hidden"
    :style="{ height: `${alto}px` }"
    aria-hidden="true"
    focusable="false"
  >
    <g class="ondas-tutor" :style="{ transform: transformTutor }">
      <path :d="camino" fill="none" :stroke-width="grosor" stroke-linecap="round" vector-effect="non-scaling-stroke" class="ondas-trazo-tutor" />
    </g>
    <path :d="camino" fill="none" :stroke-width="grosor" stroke-linecap="round" vector-effect="non-scaling-stroke" class="ondas-trazo-estudiante" />
  </svg>
  <p v-if="etiquetas" class="flex gap-4 text-xs font-medium text-surface-800 mt-2" aria-hidden="true">
    <span class="inline-flex items-center gap-1.5"><span class="w-4 h-1 rounded-full bg-brand-500" />Estudiante</span>
    <span class="inline-flex items-center gap-1.5"><span class="w-4 h-1 rounded-full bg-surface-900" />Tutor/a</span>
  </p>
</template>

<style scoped>
.ondas-tutor {
  transform-origin: 50% 50%;
  transform-box: fill-box;
  transition: transform 320ms var(--ease-in-out);
  will-change: transform;
}
.ondas-trazo-estudiante {
  stroke: var(--color-primary);
}
.ondas-trazo-tutor {
  stroke: rgb(var(--rgb-s900));
  opacity: 0.9;
}
@media (prefers-reduced-motion: reduce) {
  .ondas-tutor {
    transition: none;
  }
}
</style>
