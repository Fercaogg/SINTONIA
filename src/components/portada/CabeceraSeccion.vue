<script setup lang="ts">
// Cabecera común de los apartados de la portada: etiqueta pequeña, título y,
// si hay, una entradilla alineada a la derecha en la misma retícula de 12
// columnas. Así todos los apartados empiezan exactamente igual.
defineProps<{ id: string; etiqueta: string; titulo: string; claro?: boolean }>()
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-12 lg:items-end mb-12 sm:mb-14">
    <div class="lg:col-span-6">
      <p class="text-xs font-semibold uppercase tracking-[0.16em]" :class="claro ? 'text-brand-400' : 'text-brand-900'">{{ etiqueta }}</p>
      <h2 :id="id" class="mt-3 font-display text-4xl sm:text-5xl font-semibold tracking-tight text-balance" :class="claro ? 'text-white' : 'text-surface-900'">
        {{ titulo }}
      </h2>
    </div>
    <div v-if="$slots.default" class="lg:col-span-5 lg:col-start-8 text-lg leading-relaxed" :class="claro ? 'text-white/85' : 'texto-suave'">
      <slot />
    </div>
  </div>
</template>
