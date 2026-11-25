<script setup lang="ts">
// Cabecera común de los apartados de la portada (rediseño del 25/11/2026):
// una etiqueta corta en color, un titular grande y, si hay, una entradilla
// debajo. Todos los apartados empiezan igual. "centrada" para los apartados
// que van al centro de la pantalla.
import { vRevelar } from '@/lib/efectos'

defineProps<{ id: string; etiqueta: string; titulo: string; claro?: boolean; centrada?: boolean }>()
</script>

<template>
  <div class="mb-12 sm:mb-16" :class="centrada ? 'text-center' : ''">
    <div v-revelar>
      <p class="etiqueta-seccion" :class="claro ? '!text-brand-400' : ''">{{ etiqueta }}</p>
      <h2 :id="id" class="titular-l mt-2 max-w-4xl" :class="[claro ? 'text-white' : 'text-surface-900', centrada ? 'mx-auto' : '']">
        {{ titulo }}
      </h2>
    </div>
    <div v-if="$slots.default" v-revelar="1" class="entradilla mt-5 max-w-2xl" :class="[claro ? '!text-white/85' : '', centrada ? 'mx-auto' : '']">
      <slot />
    </div>
  </div>
</template>
