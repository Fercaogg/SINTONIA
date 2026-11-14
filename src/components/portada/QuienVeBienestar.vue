<script setup lang="ts">
// Gráfico de "Privacidad y ética": quién ve el bienestar del estudiante.
// Sale tal cual de PERFILES (qué ve y qué no ve cada persona).
import AppIcon from '@/components/comun/AppIcon.vue'
import { vRevelar } from '@/lib/efectos'

const FILAS = [
  { quien: 'Tú, estudiante', icono: 'person', ve: true, texto: 'Ves tus respuestas, tu bienestar y tu histórico.' },
  { quien: 'Tu tutor/a', icono: 'users', ve: false, texto: 'No ve tus respuestas ni tu bienestar.' },
  { quien: 'Dirección del máster', icono: 'chart', ve: false, texto: 'Solo cifras del máster, calculadas sobre 5 personas o más.' },
] as const
</script>

<template>
  <div class="card p-6 sm:p-7">
    <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-900">Tu bienestar, ¿quién lo ve?</p>
    <ul class="mt-5 divide-y divide-surface-200">
      <li v-for="(f, i) in FILAS" :key="f.quien" v-revelar="i + 1" class="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
        <span class="h-11 w-11 shrink-0 rounded-xl bg-surface-100 text-surface-900 flex items-center justify-center"><AppIcon :name="f.icono" :size="20" /></span>
        <div class="min-w-0 flex-1">
          <p class="font-semibold text-surface-900">{{ f.quien }}</p>
          <p class="text-sm texto-suave">{{ f.texto }}</p>
        </div>
        <span
          class="shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          :class="f.ve ? 'bg-brand-100 text-surface-900' : 'bg-marino text-white'"
        >
          <AppIcon :name="f.ve ? 'eye' : 'lock'" :size="14" />{{ f.ve ? 'Lo ve' : 'No lo ve' }}
        </span>
      </li>
    </ul>
  </div>
</template>
