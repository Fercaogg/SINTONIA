<script setup lang="ts">
// Maqueta del producto para el inicio: el registro semanal del estudiante en
// un móvil, con dos tarjetas flotantes (las dos miradas y la agenda de la
// tutoría). Es una ilustración con valores de ejemplo; las preguntas de la
// agenda salen del banco real (src/lib/demo-portada.ts).
// Entra una sola vez al cargar (Emil: corta, ease-out, solapada, nunca en
// cola); con "reducir movimiento" se ve directamente.
import { compararMiradas } from '@/lib/demo-portada'
import AppIcon from '@/components/comun/AppIcon.vue'
import OndasSintonia from './OndasSintonia.vue'

const PREGUNTAS = [
  { texto: 'Avance', valor: 4 },
  { texto: 'Siguiente paso', valor: 3 },
  { texto: 'Apoyo percibido', valor: 4 },
  { texto: 'Bienestar', valor: 3, privada: true },
]
const agenda = compararMiradas(4, 2).preguntas
</script>

<template>
  <figure class="maqueta relative mx-auto w-full max-w-[34rem] pb-32 sm:pb-0" aria-labelledby="maqueta-pie">
    <figcaption id="maqueta-pie" class="sr-only">
      Ejemplo de SINTONÍA: el registro semanal del estudiante (avance, siguiente paso, apoyo percibido y bienestar, de 1 a 5), la comparación
      de las dos miradas y la agenda de la tutoría con tres preguntas neutras.
    </figcaption>

    <!-- Móvil -->
    <div class="pieza pieza-1 relative mx-auto sm:mx-0 sm:ml-2 w-[17.5rem] sm:w-[19rem] rounded-[2.6rem] bg-marino p-2.5 shadow-[0_30px_60px_-20px_rgba(10,74,108,0.45)]" aria-hidden="true">
      <div class="rounded-[2.1rem] bg-papel overflow-hidden">
        <div class="flex justify-center pt-2.5"><span class="h-5 w-20 rounded-full bg-marino" /></div>
        <div class="px-5 pt-4 pb-6">
          <div class="flex items-center justify-between">
            <p class="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-brand-900">Esta semana</p>
            <span class="rounded-full bg-surface-100 px-2 py-0.5 text-[0.65rem] font-medium text-surface-800">Ejemplo</span>
          </div>
          <p class="mt-1 font-display text-lg font-semibold leading-tight text-surface-900">¿Cómo va el trabajo?</p>
          <ul class="mt-4 space-y-3.5">
            <li v-for="p in PREGUNTAS" :key="p.texto">
              <div class="flex items-center justify-between text-xs">
                <span class="font-medium text-surface-900">{{ p.texto }}</span>
                <span v-if="p.privada" class="inline-flex items-center gap-1 text-brand-900"><AppIcon name="lock" :size="12" />Solo tú</span>
              </div>
              <div class="mt-1.5 grid grid-cols-5 gap-1.5">
                <span
                  v-for="n in 5"
                  :key="n"
                  class="h-7 rounded-md text-[0.7rem] font-semibold flex items-center justify-center"
                  :class="n === p.valor ? 'bg-brand-800 text-white' : 'bg-surface-100 text-surface-800'"
                >{{ n }}</span>
              </div>
            </li>
          </ul>
          <div class="mt-5 h-10 rounded-lg bg-marino text-white text-sm font-semibold flex items-center justify-center">Enviar</div>
          <p class="mt-2 text-center text-[0.65rem] texto-suave">Unos 60 segundos</p>
        </div>
      </div>
    </div>

    <!-- Tarjeta: las dos miradas -->
    <div class="pieza pieza-2 absolute inset-x-0 mx-auto bottom-0 sm:left-auto sm:mx-0 sm:right-0 sm:bottom-10 w-[15rem] rounded-2xl bg-papel border border-surface-200 p-4 shadow-xl" aria-hidden="true">
      <p class="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-brand-900">Dos miradas</p>
      <OndasSintonia :desfase="0.5" :alto="46" :grosor="3" />
      <div class="mt-2 flex items-center justify-between text-xs">
        <span class="inline-flex items-center gap-1.5 text-surface-900"><span class="h-1 w-3 rounded-full bg-brand-500" />Estudiante 4</span>
        <span class="inline-flex items-center gap-1.5 text-surface-900"><span class="h-1 w-3 rounded-full bg-surface-900" />Tutor/a 2</span>
      </div>
      <p class="mt-2 rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-surface-900">2 puntos de diferencia: hay desajuste</p>
    </div>

    <!-- Tarjeta: la agenda -->
    <div class="pieza pieza-3 absolute right-0 top-12 hidden sm:block w-[15rem] rounded-2xl bg-papel border border-surface-200 p-4 shadow-xl" aria-hidden="true">
      <p class="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-brand-900"><AppIcon name="chat" :size="14" />Agenda de la tutoría</p>
      <ol class="mt-2.5 space-y-2">
        <li v-for="(q, i) in agenda" :key="q" class="flex gap-2 text-[0.72rem] leading-snug text-surface-900">
          <span class="mt-px h-4 w-4 shrink-0 rounded-full bg-marino text-white text-[0.6rem] font-semibold flex items-center justify-center">{{ i + 1 }}</span>
          <span class="line-clamp-2">{{ q }}</span>
        </li>
      </ol>
    </div>
  </figure>
</template>

<style scoped>
.pieza {
  animation: llegar 560ms var(--ease-out) both;
}
.pieza-2 {
  animation-delay: 140ms;
}
.pieza-3 {
  animation-delay: 220ms;
}
@keyframes llegar {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.98);
  }
}
@media (prefers-reduced-motion: reduce) {
  .pieza {
    animation: none;
  }
}
</style>
