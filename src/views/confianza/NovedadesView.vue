<script setup lang="ts">
// /novedades: registro de cambios con fecha y versión, sacado del historial
// real de git (src/contenido/novedades.ts).
import { RouterLink } from 'vue-router'
import LayoutPublico from '@/components/layout/LayoutPublico.vue'
import { NOVEDADES, fechaLarga } from '@/contenido/novedades'
import { NOVEDADES_EN, fechaLargaEn } from '@/contenido/en'
import { useIdioma } from '@/lib/idioma'
const { t, idioma, ruta } = useIdioma()
const fecha = (iso: string) => (idioma.value === 'en' ? fechaLargaEn(iso) : fechaLarga(iso))
const cambios = (v: string, es: readonly string[]) => (idioma.value === 'en' ? (NOVEDADES_EN[v] ?? es) : es)
</script>

<template>
  <LayoutPublico>
    <h1 class="titulo-pagina mb-2">{{ t('Novedades', 'Changelog') }}</h1>
    <p class="texto-suave mb-10">{{ t('Qué ha cambiado en SINTONÍA, de lo más reciente a lo más antiguo.', 'What has changed in SINTONÍA, from newest to oldest.') }}</p>

    <ol class="relative space-y-10 border-l-2 border-surface-200 pl-6 sm:pl-8">
      <li v-for="(n, i) in NOVEDADES" :key="n.version" class="relative">
        <span
          class="absolute -left-[calc(1.5rem+7px)] sm:-left-[calc(2rem+7px)] top-1.5 h-3 w-3 rounded-full ring-4 ring-surface-50"
          :class="i === 0 ? 'bg-brand-500' : 'bg-marino'"
          aria-hidden="true"
        />
        <h2 class="font-display text-xl font-semibold text-surface-900">
          {{ t('Versión', 'Version') }} {{ n.version }}
          <span v-if="i === 0" class="ml-2 align-middle rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-surface-900">{{ t('Actual', 'Current') }}</span>
        </h2>
        <p class="text-sm texto-suave mt-0.5"><time :datetime="n.fecha">{{ fecha(n.fecha) }}</time></p>
        <ul class="mt-3 space-y-1.5 list-disc pl-5">
          <li v-for="c in cambios(n.version, n.cambios)" :key="c">{{ c }}</li>
        </ul>
      </li>
    </ol>

    <p class="mt-12 text-sm texto-suave">
      {{ t('Lo que viene después está en el', 'What comes next is in the') }} <RouterLink :to="ruta('/investigacion#calendario')" class="enlace">{{ t('calendario de la investigación', 'research timeline') }}</RouterLink>.
    </p>
  </LayoutPublico>
</template>
