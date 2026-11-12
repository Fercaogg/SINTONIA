<script setup lang="ts">
// Estado de carga: icono giratorio de color de marca (WW360 HistoryView.vue:47).
withDefaults(defineProps<{ texto?: string }>(), { texto: 'Cargando...' })
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20 gap-3" role="status" aria-live="polite">
    <svg class="animate-spin h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <span class="text-sm texto-suave">{{ texto }}</span>
  </div>
</template>
