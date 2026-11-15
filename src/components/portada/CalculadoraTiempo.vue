<script setup lang="ts">
// Calculadora de tiempo: cuántos minutos a la semana pide SINTONÍA a un
// máster. Solo el cálculo con los datos del producto (60 s por estudiante y
// 30 s por tutor/a, para todos sus estudiantes). Sin promesas de resultados.
import { computed, ref } from 'vue'

const estudiantes = ref(30)
const tutores = ref(8)
const limpiar = (n: number, max: number) => (Number.isFinite(n) ? Math.min(max, Math.max(0, Math.round(n))) : 0)

const segEst = computed(() => limpiar(estudiantes.value, 2000) * 60)
const segTut = computed(() => limpiar(tutores.value, 500) * 30)
const minutos = (s: number) => {
  const m = s / 60
  return Number.isInteger(m) ? String(m) : m.toLocaleString('es-ES', { maximumFractionDigits: 1 })
}
const total = computed(() => minutos(segEst.value + segTut.value))
</script>

<template>
  <div class="card p-6 sm:p-8">
    <div class="grid gap-5 sm:grid-cols-2">
      <div>
        <label for="calc-est" class="label">Estudiantes del máster</label>
        <input id="calc-est" v-model.number="estudiantes" type="number" inputmode="numeric" min="0" max="2000" class="input-field text-lg tabular-nums" />
      </div>
      <div>
        <label for="calc-tut" class="label">Tutores y tutoras</label>
        <input id="calc-tut" v-model.number="tutores" type="number" inputmode="numeric" min="0" max="500" class="input-field text-lg tabular-nums" />
      </div>
    </div>

    <div class="mt-8 border-t border-surface-200 pt-6" aria-live="polite">
      <p class="text-sm font-medium texto-suave">Tiempo de todo el máster, cada semana</p>
      <p class="mt-1 font-display text-5xl font-bold tracking-tight text-surface-900 tabular-nums">{{ total }} <span class="text-2xl">min</span></p>
      <dl class="mt-5 grid gap-3 sm:grid-cols-2 text-sm">
        <div class="rounded-lg bg-surface-100 p-3">
          <dt class="texto-suave">Estudiantes (60 s cada uno)</dt>
          <dd class="font-semibold text-surface-900 tabular-nums">{{ minutos(segEst) }} min</dd>
        </div>
        <div class="rounded-lg bg-surface-100 p-3">
          <dt class="texto-suave">Tutores (30 s cada uno, para todos sus estudiantes)</dt>
          <dd class="font-semibold text-surface-900 tabular-nums">{{ minutos(segTut) }} min</dd>
        </div>
      </dl>
    </div>
    <p class="mt-5 text-sm texto-suave">Es solo el cálculo con los tiempos de SINTONÍA. No dice nada de los resultados.</p>
  </div>
</template>
