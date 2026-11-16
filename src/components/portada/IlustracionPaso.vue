<script setup lang="ts">
// Ilustración de cada paso de "Cómo funciona" (decorativa: el texto del paso
// lo explica entero). 1: los dos registros; 2: las dos miradas comparadas;
// 3: la agenda con tres preguntas del banco real.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { compararMiradas } from '@/lib/demo-portada'
import { alAvanzar, desfasarOndas, sinMovimiento } from '@/lib/efectos'
import AppIcon from '@/components/comun/AppIcon.vue'
import OndasSintonia from './OndasSintonia.vue'

const props = defineProps<{ paso: 1 | 2 | 3 }>()
// Movimiento: al aparecer la tarjeta, las respuestas se marcan y las preguntas
// llegan una a una (CSS); en el paso 2, las ondas se acercan con el scroll.
const raiz = ref<HTMLElement | null>(null)
let quitar = () => {}
onMounted(() => {
  if (props.paso !== 2 || !raiz.value || sinMovimiento()) return
  const el = raiz.value
  quitar = alAvanzar(el, (v) => desfasarOndas(el, 1 - 0.5 * Math.min(1, Math.max(0, (v - 0.1) / 0.45))))
})
onBeforeUnmount(() => quitar())
import { useIdioma } from '@/lib/idioma'
const { t, idioma } = useIdioma()
const agenda = computed(() => compararMiradas(4, 2, idioma.value).preguntas)
const filas = [4, 3, 4, 3]
// Estilos en línea siempre aplicados desde código (la CSP no admite atributos style).
const retraso = (ms: number) => ({ animationDelay: `${ms}ms` })
const estilo = (e: Record<string, string>) => e
</script>

<template>
  <div ref="raiz" class="ilustracion h-44 rounded-xl bg-surface-100 border border-surface-200 p-4 flex items-center justify-center overflow-hidden" aria-hidden="true">
    <!-- 1. Dos registros por separado -->
    <div v-if="paso === 1" class="grid w-full grid-cols-2 gap-3">
      <div class="rounded-lg bg-papel p-3 shadow-sm">
        <p class="text-[0.65rem] font-semibold text-surface-900 flex items-center gap-1"><span class="h-1 w-3 rounded-full bg-brand-500" />{{ t('Estudiante', 'Student') }}</p>
        <div v-for="(v, i) in filas" :key="i" class="mt-1.5 grid grid-cols-5 gap-0.5">
          <span v-for="n in 5" :key="n" class="h-2.5 rounded-sm" :class="n === v ? 'bg-brand-800 anim-marca' : 'bg-surface-200'" :style="n === v ? { animationDelay: `${300 + i * 160}ms` } : undefined" />
        </div>
      </div>
      <div class="rounded-lg bg-papel p-3 shadow-sm self-start">
        <p class="text-[0.65rem] font-semibold text-surface-900 flex items-center gap-1"><span class="h-1 w-3 rounded-full bg-surface-900" />{{ t('Tutor/a', 'Supervisor') }}</p>
        <div class="mt-1.5 grid grid-cols-5 gap-0.5">
          <span v-for="n in 5" :key="n" class="h-2.5 rounded-sm" :class="n === 2 ? 'bg-marino anim-marca' : 'bg-surface-200'" :style="retraso(1000)" />
        </div>
        <p class="mt-2 text-[0.6rem] texto-suave flex items-center gap-1"><AppIcon name="clock" :size="11" />30 s</p>
      </div>
    </div>

    <!-- 2. Las dos miradas -->
    <div v-else-if="paso === 2" class="w-full">
      <OndasSintonia :desfase="0.5" :alto="70" :grosor="3" />
      <div class="mt-3 flex items-center justify-center gap-2">
        <span class="rounded-full bg-papel border border-surface-200 px-2.5 py-1 text-xs font-semibold text-surface-900">4</span>
        <span class="text-xs texto-suave">{{ t('frente a', 'versus') }}</span>
        <span class="rounded-full bg-papel border border-surface-200 px-2.5 py-1 text-xs font-semibold text-surface-900">2</span>
        <span class="anim-llega rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-surface-900" :style="retraso(700)">{{ t('Desajuste', 'Mismatch') }}</span>
      </div>
    </div>

    <!-- 3. La agenda -->
    <ol v-else class="w-full space-y-1.5">
      <li v-for="(q, i) in agenda" :key="q" class="anim-llega flex items-center gap-2 rounded-lg bg-papel px-2.5 py-2 shadow-sm" :style="{ animationDelay: `${350 + i * 220}ms` }">
        <span class="h-5 w-5 shrink-0 rounded-full bg-marino text-white text-[0.65rem] font-semibold flex items-center justify-center">{{ i + 1 }}</span>
        <span class="text-[0.7rem] leading-snug text-surface-900 line-clamp-1">{{ q }}</span>
      </li>
    </ol>
  </div>
</template>

<style scoped>
/* Se ponen en marcha cuando la tarjeta aparece (clase .revelado de efectos.ts). */
:global(.revelado) .anim-marca {
  animation: marcar 360ms var(--ease-out) both;
}
:global(.revelado) .anim-llega {
  animation: llegar 460ms var(--ease-out) both;
}
@keyframes marcar {
  from {
    opacity: 0;
    transform: scale(0.4);
  }
}
@keyframes llegar {
  from {
    opacity: 0;
    transform: translateX(14px);
  }
}
</style>
