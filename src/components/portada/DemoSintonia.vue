<script setup lang="ts">
// Demostración del inicio: cómo ven el avance estudiante y tutor/a. Las dos
// ondas se separan o se juntan en tiempo real; si la diferencia es de 2
// puntos o más, aparecen tres preguntas de ejemplo, una tras otra.
// Sin llamadas a ninguna API y sin guardar nada.
import { computed, ref, watchEffect } from 'vue'
import { desfasePortada } from '@/lib/sintonia-estado'
import { compararMiradas } from '@/lib/demo-portada'
import OndasSintonia from './OndasSintonia.vue'

const estudiante = ref(4)
const tutor = ref(2)
const resultado = computed(() => compararMiradas(estudiante.value, tutor.value, idioma.value))
const desfase = computed(() => Math.abs(estudiante.value - tutor.value) / 4)
// El campo de ondas del fondo del inicio reacciona a lo mismo.
watchEffect(() => (desfasePortada.value = desfase.value))
import { useIdioma } from '@/lib/idioma'
const { t, idioma } = useIdioma()

</script>

<template>
  <section id="demostracion" class="card p-5 sm:p-7 text-left scroll-mt-24" aria-labelledby="t-demo">
    <p class="text-xs font-semibold uppercase tracking-[0.14em] text-brand-900">{{ t('Demostración', 'Demo') }}</p>
    <h2 id="t-demo" class="font-display text-xl font-semibold text-surface-900 mt-1">{{ t('¿Cómo va el trabajo esta semana?', 'How is the work going this week?') }}</h2>
    <p class="text-sm texto-suave mt-1">{{ t('Mueve las dos miradas, de 1 (poco avance) a 5 (mucho). No se guarda nada.', 'Move the two perspectives, from 1 (little progress) to 5 (a lot). Nothing is saved.') }}</p>

    <div class="mt-5 -mx-1">
      <OndasSintonia :desfase="desfase" :alto="88" etiquetas />
    </div>

    <div class="mt-5 space-y-4">
      <div>
        <label for="demo-est" class="label flex justify-between">
          <span>{{ t('Estudiante', 'Student') }}</span><span class="tabular-nums font-semibold text-surface-900" aria-hidden="true">{{ estudiante }}</span>
        </label>
        <input id="demo-est" v-model.number="estudiante" type="range" min="1" max="5" step="1" class="deslizador deslizador-estudiante" :aria-valuetext="`${estudiante} ${t('de', 'of')} 5`" />
      </div>
      <div>
        <label for="demo-tut" class="label flex justify-between">
          <span>{{ t('Tutor/a', 'Supervisor') }}</span><span class="tabular-nums font-semibold text-surface-900" aria-hidden="true">{{ tutor }}</span>
        </label>
        <input id="demo-tut" v-model.number="tutor" type="range" min="1" max="5" step="1" class="deslizador deslizador-tutor" :aria-valuetext="`${tutor} ${t('de', 'of')} 5`" />
      </div>
    </div>

    <!-- Altura mínima fija: el resultado cambia sin mover lo de alrededor (sin saltos de maquetación). -->
    <div class="mt-5 rounded-lg p-4 min-h-[15.5rem]" :class="resultado.desajuste ? 'bg-brand-50 border border-brand-200' : 'bg-surface-100 border border-transparent'" aria-live="polite">
      <template v-if="resultado.desajuste">
        <p class="font-medium text-surface-900">
          {{ resultado.diferencia }} {{ t('puntos de diferencia: hay desajuste. Si esa semana les toca en el sorteo, los dos recibirán estas preguntas:', 'points of difference: there is a mismatch. If the draw selects them that week, both will receive these questions:') }}
        </p>
        <TransitionGroup tag="ol" name="pregunta" class="mt-3 space-y-2 list-decimal pl-5 text-sm text-surface-900" appear>
          <li v-for="(p, i) in resultado.preguntas" :key="p" :style="{ transitionDelay: `${i * 60}ms` }">{{ p }}</li>
        </TransitionGroup>
      </template>
      <p v-else class="text-sm text-surface-900">
        {{ resultado.diferencia === 0 ? t('Ven el avance igual.', 'They see the progress in the same way.') : t('Solo 1 punto de diferencia.', 'Only 1 point of difference.') }}
        {{ t('Esta semana no hace falta agenda: las dos miradas están en sintonía.', 'No agenda is needed this week: the two perspectives are in tune.') }}
      </p>
    </div>
  </section>
</template>

<style scoped>
/* Preguntas que llegan una a una (desplazamiento corto y opacidad). */
.pregunta-enter-active {
  transition: opacity var(--dur-ui) var(--ease-out), transform var(--dur-ui) var(--ease-out);
}
.pregunta-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.pregunta-leave-active {
  display: none;
}

.deslizador {
  width: 100%;
  min-height: 44px;
  accent-color: var(--color-accion-fondo);
  cursor: pointer;
}
.deslizador-estudiante {
  accent-color: #248a73;
}
@media (prefers-reduced-motion: reduce) {
  .pregunta-enter-active {
    transition: none;
  }
}
</style>
