<script setup lang="ts">
// /hoja-de-ruta: lo hecho y lo planificado, en tres columnas. Solo lo que
// existe o está en el plan del proyecto (src/contenido/instituciones.ts).
import { RouterLink } from 'vue-router'
import LayoutPublico from '@/components/layout/LayoutPublico.vue'
import AppIcon from '@/components/comun/AppIcon.vue'
import { computed } from 'vue'
import { HOJA_DE_RUTA as HOJA_ES } from '@/contenido/instituciones'
import { HOJA_DE_RUTA as HOJA_EN } from '@/contenido/en'
import { useIdioma } from '@/lib/idioma'
const { t, idioma, ruta } = useIdioma()
const HOJA_DE_RUTA = computed(() => (idioma.value === 'en' ? HOJA_EN : HOJA_ES))

const COLUMNAS = computed(() => [
  { clave: 'hecho', titulo: t('Hecho', 'Done'), icono: 'check', estilo: 'bg-brand-800 text-white' },
  { clave: 'piloto', titulo: t('Durante el piloto (febrero a abril de 2027)', 'During the pilot (February to April 2027)'), icono: 'calendar', estilo: 'bg-marino text-white' },
  { clave: 'despues', titulo: t('Después (TFG y tesis)', 'Afterwards (final projects and PhD theses)'), icono: 'graduation', estilo: 'bg-surface-100 text-surface-900' },
] as const)
</script>

<template>
  <LayoutPublico ancho="amplio">
    <h1 class="titulo-pagina mb-2">{{ t('Hoja de ruta', 'Roadmap') }}</h1>
    <p class="texto-suave mb-10">{{ t('Lo que ya funciona y lo que está planificado. Nada más.', 'What already works and what is planned. Nothing more.') }}</p>

    <div class="grid gap-5 md:grid-cols-3">
      <section v-for="c in COLUMNAS" :key="c.clave" class="card overflow-hidden" :aria-labelledby="`t-${c.clave}`">
        <h2 :id="`t-${c.clave}`" class="flex items-center gap-2 px-4 py-3 font-display text-base font-semibold" :class="c.estilo">
          <AppIcon :name="c.icono" :size="18" />{{ c.titulo }}
        </h2>
        <ul class="p-4 space-y-2.5 text-sm leading-relaxed">
          <li v-for="t in HOJA_DE_RUTA[c.clave]" :key="t" class="flex gap-2">
            <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" :class="c.clave === 'hecho' ? 'bg-brand-800' : 'bg-surface-300'" aria-hidden="true" />{{ t }}
          </li>
        </ul>
      </section>
    </div>

    <p class="mt-10 text-sm texto-suave">
      {{ t('El detalle de cada cambio, con fecha y versión, está en', 'The detail of each change, with date and version, is in the') }}
      <RouterLink :to="ruta('/novedades')" class="enlace">{{ t('Novedades', 'Changelog') }}</RouterLink>{{ t(', y el calendario del estudio en', ', and the study timeline in') }}
      <RouterLink :to="ruta('/investigacion#calendario')" class="enlace">{{ t('La investigación', 'The research') }}</RouterLink>.
    </p>
  </LayoutPublico>
</template>
