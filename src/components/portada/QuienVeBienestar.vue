<script setup lang="ts">
// Gráfico de "Privacidad y ética": quién ve el bienestar del estudiante.
// Sale tal cual de PERFILES (qué ve y qué no ve cada persona).
import AppIcon from '@/components/comun/AppIcon.vue'
import { vRevelar } from '@/lib/efectos'

import { computed } from 'vue'
import { useIdioma } from '@/lib/idioma'
const { t } = useIdioma()
const FILAS = computed(() => [
  { quien: t('Tú, estudiante', 'You, the student'), icono: 'person', ve: true, texto: t('Ves tus respuestas, tu bienestar y tu histórico.', 'You see your answers, your wellbeing and your history.') },
  { quien: t('Tu tutor/a', 'Your supervisor'), icono: 'users', ve: false, texto: t('No ve tus respuestas ni tu bienestar.', 'Does not see your answers or your wellbeing.') },
  { quien: t('Dirección del máster', 'Programme directors'), icono: 'chart', ve: false, texto: t('Solo cifras del máster, calculadas sobre 5 personas o más.', 'Only programme figures, calculated over 5 people or more.') },
] as const)
</script>

<template>
  <div class="card p-6 sm:p-7">
    <p class="text-xs font-semibold uppercase tracking-[0.08em] text-surface-600">{{ t('Tu bienestar, ¿quién lo ve?', 'Your wellbeing: who sees it?') }}</p>
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
          <AppIcon :name="f.ve ? 'eye' : 'lock'" :size="14" />{{ f.ve ? t('Lo ve', 'Sees it') : t('No lo ve', 'Does not see it') }}
        </span>
      </li>
    </ul>
  </div>
</template>
