<script setup lang="ts">
// Demostración: cómo ven el avance estudiante y tutor/a. Si sus miradas se
// separan 2 puntos o más, aparecen tres preguntas de ejemplo. Sin llamadas a
// ninguna API y sin guardar nada.
import { computed, ref } from 'vue'
import { compararMiradas } from '@/lib/demo-portada'

const estudiante = ref(4)
const tutor = ref(2)
const resultado = computed(() => compararMiradas(estudiante.value, tutor.value))
</script>

<template>
  <section id="demostracion" class="card p-5 sm:p-6 text-left" aria-labelledby="t-demo">
    <h2 id="t-demo" class="font-semibold text-surface-900">Pruébalo: ¿cómo va el trabajo esta semana?</h2>
    <p class="text-sm texto-suave mt-1">Mueve las dos miradas, de 1 (poco avance) a 5 (mucho). Es solo un ejemplo: no se guarda nada.</p>

    <div class="mt-5 space-y-5">
      <div>
        <label for="demo-est" class="label flex justify-between">
          <span>Estudiante</span><span class="tabular-nums" aria-hidden="true">{{ estudiante }}</span>
        </label>
        <input id="demo-est" v-model.number="estudiante" type="range" min="1" max="5" step="1" class="w-full accent-brand-900 min-h-tactil" :aria-valuetext="`${estudiante} de 5`" />
      </div>
      <div>
        <label for="demo-tut" class="label flex justify-between">
          <span>Tutor/a</span><span class="tabular-nums" aria-hidden="true">{{ tutor }}</span>
        </label>
        <input id="demo-tut" v-model.number="tutor" type="range" min="1" max="5" step="1" class="w-full accent-brand-900 min-h-tactil" :aria-valuetext="`${tutor} de 5`" />
      </div>
    </div>

    <div class="mt-5 rounded-xl p-4" :class="resultado.desajuste ? 'bg-brand-50 border border-brand-200' : 'bg-surface-100'" aria-live="polite">
      <template v-if="resultado.desajuste">
        <p class="font-medium text-surface-900">
          {{ resultado.diferencia }} puntos de diferencia: hay desajuste. Si esa semana les toca en el sorteo, los dos recibirán estas preguntas:
        </p>
        <ol class="mt-3 space-y-2 list-decimal pl-5 text-sm text-surface-900">
          <li v-for="p in resultado.preguntas" :key="p">{{ p }}</li>
        </ol>
      </template>
      <p v-else class="text-sm text-surface-900">
        {{ resultado.diferencia === 0 ? 'Ven el avance igual.' : 'Solo 1 punto de diferencia.' }}
        Esta semana no hace falta agenda.
      </p>
    </div>
  </section>
</template>
