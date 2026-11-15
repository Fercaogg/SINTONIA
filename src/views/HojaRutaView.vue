<script setup lang="ts">
// /hoja-de-ruta: lo hecho y lo planificado, en tres columnas. Solo lo que
// existe o está en el plan del proyecto (src/contenido/instituciones.ts).
import { RouterLink } from 'vue-router'
import LayoutPublico from '@/components/layout/LayoutPublico.vue'
import AppIcon from '@/components/comun/AppIcon.vue'
import { HOJA_DE_RUTA } from '@/contenido/instituciones'

const COLUMNAS = [
  { clave: 'hecho', titulo: 'Hecho', icono: 'check', estilo: 'bg-[#1d7060] text-white' },
  { clave: 'piloto', titulo: 'Durante el piloto (febrero a abril de 2027)', icono: 'calendar', estilo: 'bg-marino text-white' },
  { clave: 'despues', titulo: 'Después (TFG y tesis)', icono: 'graduation', estilo: 'bg-surface-100 text-surface-900' },
] as const
</script>

<template>
  <LayoutPublico ancho="amplio">
    <h1 class="titulo-pagina mb-2">Hoja de ruta</h1>
    <p class="texto-suave mb-10">Lo que ya funciona y lo que está planificado. Nada más.</p>

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
      El detalle de cada cambio, con fecha y versión, está en <RouterLink to="/novedades" class="enlace">Novedades</RouterLink>, y el calendario del
      estudio en <RouterLink to="/investigacion#calendario" class="enlace">La investigación</RouterLink>.
    </p>
  </LayoutPublico>
</template>
