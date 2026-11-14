<script setup lang="ts">
// Preguntas frecuentes con <details>: se abren con teclado y lector de
// pantalla sin código extra.
import { PREGUNTAS } from '@/contenido/portada'
import { EN_ELABORACION } from '@/lib/publico'
</script>

<template>
  <div class="divide-y divide-surface-200 card">
    <details v-for="p in PREGUNTAS" :key="p.pregunta" class="group">
      <summary class="flex items-center justify-between gap-4 px-5 py-4 min-h-tactil cursor-pointer list-none font-medium text-surface-900">
        {{ p.pregunta }}
        <span class="shrink-0 transition-transform group-open:rotate-45 text-xl leading-none" aria-hidden="true">+</span>
      </summary>
      <div class="px-5 pb-5 text-base leading-relaxed space-y-2">
        <p>{{ p.respuesta }}</p>
        <p v-if="'pendiente' in p && p.pendiente" class="italic texto-suave">{{ EN_ELABORACION }}</p>
      </div>
    </details>
  </div>
</template>
