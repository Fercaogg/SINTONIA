<script setup lang="ts">
// "Cómo funciona": el momento de la página. Mientras se leen los tres pasos,
// las dos ondas (estudiante y tutor/a) pasan de desfasadas a alineadas.
// El movimiento explica algo: que dos miradas se acercan. Con "reducir
// movimiento" se ve directamente el final, en sintonía.
import { computed, ref } from 'vue'
import { PASOS } from '@/contenido/portada'
import { useAvanceScroll } from '@/lib/movimiento'
import AppIcon from '@/components/comun/AppIcon.vue'
import OndasSintonia from './OndasSintonia.vue'

const seccion = ref<HTMLElement | null>(null)
const avance = useAvanceScroll(seccion)
const desfase = computed(() => Math.max(0, 1 - avance.value * 1.3))
const pasoActivo = computed(() => Math.min(PASOS.length - 1, Math.floor(avance.value * PASOS.length)))
const estado = computed(() => (desfase.value < 0.08 ? 'En sintonía' : desfase.value < 0.6 ? 'Acercándose' : 'Dos miradas distintas'))
</script>

<template>
  <div ref="seccion" class="grid gap-10 lg:grid-cols-[5fr_7fr]">
    <div class="lg:sticky lg:top-28 self-start">
      <div class="card p-5 sm:p-6">
        <OndasSintonia :desfase="desfase" :alto="110" etiquetas />
        <p class="mt-4 font-display text-lg font-semibold text-surface-900" aria-hidden="true">{{ estado }}</p>
      </div>
    </div>
    <ol class="space-y-6 lg:space-y-[18vh] lg:py-[6vh]">
      <li
        v-for="(p, i) in PASOS"
        :key="p.titulo"
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
