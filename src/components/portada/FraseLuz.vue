<script setup lang="ts">
// Frase que se "lee sola": al deslizar, cada palabra pasa de tenue a plena,
// en orden, como en las páginas de producto de Apple.
//   - Es texto normal (los lectores de pantalla lo leen entero).
//   - Solo cambia la opacidad de cada palabra, una vez por fotograma.
//   - Con "reducir movimiento", todas las palabras se ven plenas desde el principio.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { alAvanzar, sinMovimiento } from '@/lib/efectos'

const props = defineProps<{ texto: string; tag?: string }>()
const palabras = computed(() => props.texto.split(/\s+/).filter(Boolean))
const raiz = ref<HTMLElement | null>(null)
const TENUE = 0.22
let quitar = () => {}

onMounted(() => {
  if (sinMovimiento() || !raiz.value) return
  const el = raiz.value
  const spans = () => el.querySelectorAll<HTMLElement>('.palabra-luz')
  spans().forEach((s) => (s.style.opacity = String(TENUE)))
  quitar = alAvanzar(el, (v) => {
    // Se ilumina mientras la frase sube del 85 % al 40 % de la pantalla.
    const avance = Math.min(1, Math.max(0, (v - 0.18) / 0.32))
    const lista = spans()
    const n = lista.length
    lista.forEach((s, i) => {
      const local = Math.min(1, Math.max(0, avance * n - i))
      s.style.opacity = (TENUE + (1 - TENUE) * local).toFixed(3)
    })
  })
})
onBeforeUnmount(() => quitar())
</script>

<template>
  <component :is="tag ?? 'p'" ref="raiz">
    <template v-for="(p, i) in palabras" :key="i"><span class="palabra-luz">{{ p }}</span>{{ i < palabras.length - 1 ? ' ' : '' }}</template>
  </component>
</template>
