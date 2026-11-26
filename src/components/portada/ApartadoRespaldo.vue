<script setup lang="ts">
// Apartado «Respaldo» de la portada, como en LUMBRA360: lo ya hecho
// (WORKWELL360 → YMCA Salamanca → SINTONÍA), los avales y las personas
// detrás del proyecto. Contenido en src/contenido/respaldo.ts.
import { vCursor, vRevelar } from '@/lib/efectos'
import { useIdioma } from '@/lib/idioma'
import { AVALES, EQUIPO, HITOS, type Texto } from '@/contenido/respaldo'
import CabeceraSeccion from '@/components/portada/CabeceraSeccion.vue'
import SimboloSintonia from '@/components/comun/SimboloSintonia.vue'

const { t, idioma } = useIdioma()
const tx = (v: Texto) => (idioma.value === 'en' ? v.en : v.es)
</script>

<template>
  <section id="respaldo" class="scroll-mt-20 bg-surface-100 py-16 sm:py-24 lg:py-40" aria-labelledby="t-respaldo">
    <div class="max-w-[1264px] mx-auto px-6 sm:px-8">
      <CabeceraSeccion id="t-respaldo" :etiqueta="t('Respaldo', 'Backing')" :titulo="t('No partimos de cero', 'We are not starting from scratch')" />

      <!-- Lo ya hecho -->
      <div v-revelar class="relative overflow-hidden rounded-[28px] bg-marino p-8 text-white sm:p-10 lg:p-14">
        <div class="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div class="flex flex-col gap-5 lg:col-span-5">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-brand-400">{{ t('Ya lo hemos hecho', 'We have done it before') }}</p>
            <h3 class="font-display text-[1.875rem] lg:text-[2.5rem] font-medium leading-[1.08] tracking-tight text-balance">
              {{ t('Antes de SINTONÍA, ya pusimos a prueba WORKWELL360', 'Before SINTONÍA, we put WORKWELL360 to the test') }}
            </h3>
            <p class="max-w-[46ch] text-lg text-white/80 text-pretty">
              {{
                t(
                  'Monitorizamos el prototipo en YMCA Salamanca con resultados satisfactorios. SINTONÍA es su evolución.',
                  'We monitored the prototype at YMCA Salamanca with satisfactory results. SINTONÍA is its evolution.',
                )
              }}
            </p>
          </div>
          <ol class="relative grid gap-8 sm:grid-cols-3 sm:gap-6 lg:col-span-7">
            <span aria-hidden="true" class="absolute left-7 right-[calc((100%-3rem)/3-1.75rem)] top-7 hidden h-0.5 rounded-full bg-white/15 sm:block">
              <span class="absolute inset-0 rounded-full bg-brand-500" />
            </span>
            <li v-for="(h, i) in HITOS" :key="h.titulo" v-revelar="i + 1" class="relative flex flex-col gap-4">
              <span class="grid h-14 w-14 place-items-center rounded-full" :class="h.destacado ? 'bg-brand-500' : 'bg-white'">
                <img v-if="h.logo === 'workwell'" src="/marca/terceros/workwell360.svg" alt="WORKWELL360" width="34" height="20" class="h-auto w-[34px]" />
                <img v-else-if="h.logo === 'ymca'" src="/marca/terceros/ymca.svg" alt="YMCA" width="40" height="12" class="h-auto w-10" />
                <SimboloSintonia v-else class="h-7 w-7 text-[#111111] [&_path]:fill-[#111111]" />
              </span>
              <span class="text-xs font-semibold uppercase tracking-[0.08em] text-white/70">{{ tx(h.etiqueta) }}</span>
              <span class="text-lg font-semibold leading-snug">{{ h.titulo }}</span>
              <span class="text-sm text-white/80">{{ tx(h.texto) }}</span>
            </li>
          </ol>
        </div>
      </div>

      <!-- Avales -->
      <ul class="mt-6 grid grid-cols-2 gap-4 lg:mt-8 lg:grid-cols-4" :aria-label="t('Avales y programas', 'Endorsements and programmes')">
        <li
          v-for="(a, i) in AVALES"
          :key="a.nombre"
          v-revelar="i"
          class="flex flex-col items-center gap-3 rounded-[20px] border border-surface-200 bg-surface-50 px-4 py-5 text-center"
        >
          <div class="flex h-14 items-center justify-center rounded-lg px-2 dark:bg-white">
            <img
              :src="a.logo.src"
              :alt="a.nombre"
              :width="a.logo.ancho"
              :height="a.logo.alto"
              loading="lazy"
              decoding="async"
              class="h-auto max-h-12 w-auto max-w-[9.5rem] object-contain"
            />
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-surface-600">{{ tx(a.tipo) }}</span>
            <span class="text-sm font-medium leading-snug text-surface-900">{{ a.nombre }}</span>
          </div>
        </li>
      </ul>

      <!-- Equipo -->
      <div id="equipo" class="mt-16 flex scroll-mt-24 flex-col items-center gap-8 lg:mt-20">
        <div v-revelar class="flex flex-col items-center gap-3 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-surface-600">{{ t('Quiénes somos', 'Who we are') }}</p>
          <h3 class="font-display text-2xl lg:text-[1.75rem] font-medium tracking-tight text-surface-900">
            {{ t('Las personas detrás del proyecto', 'The people behind the project') }}
          </h3>
        </div>
        <ul class="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3 lg:gap-6">
          <li v-for="(m, i) in EQUIPO" :key="m.nombre" v-revelar="i" v-cursor="'inclinar'" class="rounded-[20px]">
            <article class="flex h-full flex-col gap-4 rounded-[20px] border border-surface-200 bg-surface-50 p-6" :aria-label="m.nombre">
              <div class="flex items-center gap-4">
                <img
                  :src="m.foto"
                  :alt="t(`Retrato de ${m.nombre}`, `Portrait of ${m.nombre}`)"
                  width="128"
                  height="128"
                  loading="lazy"
                  decoding="async"
                  class="h-16 w-16 shrink-0 rounded-full object-cover"
                />
                <div class="flex min-w-0 flex-col">
                  <p class="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-lumbre-texto">{{ tx(m.papel) }}</p>
                  <h4 class="font-semibold leading-snug text-surface-900">{{ m.nombre }}</h4>
                  <p class="text-sm texto-suave">{{ tx(m.cargo) }}</p>
                </div>
              </div>
              <ul class="flex flex-col gap-1.5 border-t border-surface-200 pt-4 text-sm texto-suave">
                <li v-for="d in m.detalle" :key="d.es">{{ tx(d) }}</li>
              </ul>
              <p class="mt-auto flex flex-wrap gap-x-5 gap-y-1">
                <a
                  v-for="e in m.enlaces"
                  :key="e.href"
                  :href="e.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="enlace inline-flex min-h-tactil items-center gap-1 text-sm"
                >
                  {{ tx(e.texto) }}<span aria-hidden="true">↗</span
                  ><span class="sr-only">{{ t(` de ${m.nombre} (se abre en otra pestaña)`, ` of ${m.nombre} (opens in a new tab)`) }}</span>
                </a>
              </p>
            </article>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
