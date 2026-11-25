<script setup lang="ts">
// Cabecera común de los apartados de la portada, como el «Encabezado» de
// LUMBRA360: antetítulo en mono, título grande y entradilla, centrados.
// «claro» es para los apartados sobre fondo de tinta.
import { vRevelar } from '@/lib/efectos'

defineProps<{ id: string; etiqueta: string; titulo: string; claro?: boolean }>()
</script>

<template>
  <div v-revelar class="mx-auto mb-14 flex max-w-[44rem] flex-col items-center gap-5 text-center lg:mb-20">
    <p class="font-mono text-xs font-normal uppercase tracking-[0.14em]" :class="claro ? 'text-brand-400' : 'text-surface-600'">{{ etiqueta }}</p>
    <h2 :id="id" class="font-display text-[2rem] lg:text-[2.5rem] font-medium leading-[1.1] tracking-tight text-balance" :class="claro ? 'text-white' : 'text-surface-900'">
      {{ titulo }}
    </h2>
    <p v-if="$slots.default" class="text-lg text-pretty" :class="claro ? 'text-white/80' : 'texto-suave'">
      <slot />
    </p>
  </div>
</template>
