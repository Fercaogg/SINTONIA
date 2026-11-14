<script setup lang="ts">
// Escala táctil de 1 a 5, con el estilo del check-in de WORKWELL360
// (CheckInView.vue:158 a 161): botones de 48 a 56 px, radio de 16 px, borde
// de 2 px; la opción elegida se agranda y toma el color de la marca.
// Cambio de accesibilidad: el borde de la opción elegida usa #1d7060 para que
// se distinga con un contraste suficiente.
// Teclado: se comporta como un grupo de opciones (flechas, Inicio y Fin).
import { computed, nextTick, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: number | null
    etiquetaId: string
    anclaMin: string
    anclaMax: string
    compacta?: boolean
  }>(),
  { compacta: false },
)
const emit = defineEmits<{ 'update:modelValue': [valor: number] }>()

const botones = ref<HTMLButtonElement[]>([])
const enfocable = computed(() => props.modelValue ?? 1)

async function elegir(valor: number, enfocar = false) {
  emit('update:modelValue', valor)
  if (enfocar) {
    await nextTick()
    botones.value[valor - 1]?.focus()
  }
}

function teclado(ev: KeyboardEvent) {
  const actual = props.modelValue ?? 0
  let nuevo: number | null = null
  if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') nuevo = Math.min(5, actual + 1)
  else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') nuevo = Math.max(1, actual - 1 || 1)
  else if (ev.key === 'Home') nuevo = 1
  else if (ev.key === 'End') nuevo = 5
  if (nuevo !== null) {
    ev.preventDefault()
    elegir(nuevo, true)
  }
}
</script>

<template>
  <div role="radiogroup" :aria-labelledby="etiquetaId" @keydown="teclado">
    <div class="flex justify-between gap-2 sm:gap-3 max-w-sm">
      <button
        v-for="n in 5"
        :key="n"
        ref="botones"
        type="button"
        role="radio"
        :aria-checked="modelValue === n"
        :aria-label="n === 1 ? `1, ${anclaMin}` : n === 5 ? `5, ${anclaMax}` : String(n)"
        :tabindex="enfocable === n ? 0 : -1"
        class="rounded-2xl font-semibold border-2 transition-all duration-200 shrink-0 flex items-center justify-center"
        :class="[
          compacta ? 'w-11 h-11 text-base' : 'w-12 h-12 sm:w-14 sm:h-14 text-lg',
          modelValue === n
            ? 'border-brand-900 bg-brand-50 text-surface-900 scale-110 shadow-lg shadow-brand-500/20'
            : 'border-surface-300 bg-papel text-surface-800 hover:bg-surface-50',
        ]"
        @click="elegir(n)"
      >
        {{ n }}
      </button>
    </div>
    <div class="flex justify-between gap-4 text-xs texto-suave mt-2 max-w-sm" aria-hidden="true">
      <span>{{ anclaMin }}</span>
      <span class="text-right">{{ anclaMax }}</span>
    </div>
  </div>
</template>
