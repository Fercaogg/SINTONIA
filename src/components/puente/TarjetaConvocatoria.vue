<script setup lang="ts">
// Una convocatoria con todos sus datos y el enlace a la página oficial.
import { computed } from 'vue'
import { fechaCorta } from '@/lib/fechas'
import { grupoPlazo, type Convocatoria } from '@/lib/puente'
import { hoy } from '@/lib/calendario'
import AppIcon from '@/components/comun/AppIcon.vue'
import Pendiente from '@/components/comun/Pendiente.vue'

const props = defineProps<{ convocatoria: Convocatoria }>()
const c = computed(() => props.convocatoria)
const esEnlace = (t: string) => /^https?:\/\//.test(t)

const ETIQUETAS = {
  abierta: { texto: 'Abierta', clase: 'badge-green' },
  proxima: { texto: 'Abre pronto', clase: 'badge-lumbre' },
  cerrada: { texto: 'Cerrada', clase: 'badge-sky' },
  sin_fechas: { texto: 'Sin fechas', clase: 'badge-sky' },
} as const
const etiqueta = computed(() => ETIQUETAS[grupoPlazo(c.value, hoy())])
</script>

<template>
  <article class="card p-5">
    <div class="flex items-start gap-3">
      <AppIcon name="graduation" :size="22" class="text-surface-900 shrink-0 mt-0.5" />
      <div class="flex-1 min-w-0 space-y-1.5">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <h3 class="font-semibold text-surface-900">{{ c.nombre }}</h3>
          <span class="badge" :class="etiqueta.clase">{{ etiqueta.texto }}</span>
        </div>
        <p class="text-sm"><span class="texto-suave">Organismo: </span><Pendiente :texto="c.organismo" /></p>
        <p class="text-sm">
          <span class="texto-suave">Plazo: </span>
          <template v-if="c.fecha_apertura || c.fecha_cierre">
            {{ c.fecha_apertura ? `del ${fechaCorta(c.fecha_apertura)}` : '' }}
            {{ c.fecha_cierre ? `al ${fechaCorta(c.fecha_cierre)}` : '' }}
          </template>
          <Pendiente v-else texto="[PENDIENTE: fechas de la convocatoria]" />
        </p>
        <p class="text-sm"><span class="texto-suave">Estado: </span><Pendiente :texto="c.estado" /></p>
        <p class="text-sm">
          <a v-if="esEnlace(c.enlace)" :href="c.enlace" target="_blank" rel="noopener" class="enlace">
            Información oficial <span class="sr-only">de {{ c.nombre }} (se abre en otra pestaña)</span>
          </a>
          <Pendiente v-else :texto="c.enlace" />
        </p>
      </div>
    </div>
  </article>
</template>
