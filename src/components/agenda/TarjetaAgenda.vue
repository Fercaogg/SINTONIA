<script setup lang="ts">
// Agenda para la próxima tutoría: las mismas tres preguntas para los dos.
// Si esa semana no hay agenda, un mensaje neutro (no se explica por qué).
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/comun/AppIcon.vue'
import type { AgendaSemana } from '@/lib/tipos-checkin'

withDefaults(defineProps<{ agenda: AgendaSemana | null; otraPersona: string; titulo?: string; idTitulo?: string }>(), {
  titulo: 'Agenda para la próxima tutoría',
  idTitulo: 't-agenda',
})
</script>

<template>
  <section class="card p-5 sm:p-6" :aria-labelledby="idTitulo">
    <h2 :id="idTitulo" class="font-semibold text-surface-900 flex items-center gap-2">
      <AppIcon name="chat" :size="18" /> {{ titulo }}
    </h2>

    <p v-if="!agenda" class="text-sm texto-suave mt-1">Cuando haya preguntas para la próxima tutoría, las verás aquí.</p>

    <template v-else-if="agenda.estado === 'sin_agenda'">
      <p class="text-sm text-surface-800 mt-2" data-agenda="sin_agenda">Esta semana no hay agenda. Sigue como siempre.</p>
      <p v-if="agenda.linea_puente" class="mt-4 p-3 rounded-xl bg-surface-100 text-sm text-surface-900 flex gap-2" data-agenda="puente">
        <AppIcon name="graduation" :size="18" class="shrink-0" /> {{ agenda.linea_puente }}
      </p>
    </template>

    <template v-else>
      <p class="text-sm texto-suave mt-1">Tres preguntas para hablar juntos. {{ otraPersona }} ve las mismas.</p>
      <ol class="mt-4 space-y-3" data-agenda="preguntas">
        <li v-for="(p, i) in agenda.preguntas" :key="i" class="flex gap-3">
          <span class="w-7 h-7 rounded-full bg-brand-100 text-surface-900 text-sm font-semibold flex items-center justify-center shrink-0" aria-hidden="true">{{ i + 1 }}</span>
          <span class="text-surface-900 leading-relaxed pt-0.5">{{ p }}</span>
        </li>
      </ol>
      <p v-if="agenda.linea_puente" class="mt-4 p-3 rounded-xl bg-surface-100 text-sm text-surface-900 flex gap-2" data-agenda="puente">
        <AppIcon name="graduation" :size="18" class="shrink-0" /> {{ agenda.linea_puente }}
      </p>
      <p class="mt-4 text-xs texto-suave">
        <RouterLink to="/como-funciona" class="enlace">¿De dónde salen estas preguntas?</RouterLink>
      </p>
    </template>
  </section>
</template>
