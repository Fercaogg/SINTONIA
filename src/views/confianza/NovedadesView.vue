<script setup lang="ts">
// /novedades: registro de cambios con fecha y versión, sacado del historial
// real de git (src/contenido/novedades.ts).
import { RouterLink } from 'vue-router'
import LayoutPublico from '@/components/layout/LayoutPublico.vue'
import { NOVEDADES, fechaLarga } from '@/contenido/novedades'
</script>

<template>
  <LayoutPublico>
    <h1 class="titulo-pagina mb-2">Novedades</h1>
    <p class="texto-suave mb-10">Qué ha cambiado en SINTONÍA, de lo más reciente a lo más antiguo.</p>

    <ol class="relative space-y-10 border-l-2 border-surface-200 pl-6 sm:pl-8">
      <li v-for="(n, i) in NOVEDADES" :key="n.version" class="relative">
        <span
          class="absolute -left-[calc(1.5rem+7px)] sm:-left-[calc(2rem+7px)] top-1.5 h-3 w-3 rounded-full ring-4 ring-surface-50"
          :class="i === 0 ? 'bg-brand-500' : 'bg-marino'"
          aria-hidden="true"
        />
        <h2 class="font-display text-xl font-semibold text-surface-900">
          Versión {{ n.version }}
          <span v-if="i === 0" class="ml-2 align-middle rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-surface-900">Actual</span>
        </h2>
        <p class="text-sm texto-suave mt-0.5"><time :datetime="n.fecha">{{ fechaLarga(n.fecha) }}</time></p>
        <ul class="mt-3 space-y-1.5 list-disc pl-5">
          <li v-for="c in n.cambios" :key="c">{{ c }}</li>
        </ul>
      </li>
    </ol>

    <p class="mt-12 text-sm texto-suave">
      Lo que viene después está en el <RouterLink to="/investigacion#calendario" class="enlace">calendario de la investigación</RouterLink>.
    </p>
  </LayoutPublico>
</template>
