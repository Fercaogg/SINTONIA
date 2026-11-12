<script setup lang="ts">
// Estado vacío: tarjeta centrada con icono, título y una frase
// (WW360 HistoryView.vue:54 a 58).
import AppIcon from './AppIcon.vue'

withDefaults(defineProps<{ icono?: string; titulo: string; texto?: string }>(), { icono: 'inbox', texto: '' })
</script>

<template>
  <div class="card p-8 text-center">
    <AppIcon :name="icono" :size="40" class="text-surface-300 mx-auto mb-4" />
    <h2 class="font-display text-xl font-semibold text-surface-900 mb-2">{{ titulo }}</h2>
    <p v-if="texto" class="texto-suave text-sm max-w-md mx-auto">{{ texto }}</p>
    <slot />
  </div>
</template>
