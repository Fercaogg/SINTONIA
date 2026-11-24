<script setup lang="ts">
// Un dato real del producto (60 s, 30 s, 3 preguntas, 5 personas) que cuenta
// hasta su valor la primera vez que se ve. El número final está siempre en el
// texto accesible; con "reducir movimiento" se muestra directamente.
import { ref, watch } from 'vue'
import { prefiereMenosMovimiento, useVisibleUnaVez } from '@/lib/movimiento'

const props = defineProps<{ valor: number; unidad: string; texto: string }>()
const raiz = ref<HTMLElement | null>(null)
const visible = useVisibleUnaVez(raiz)
const mostrado = ref(prefiereMenosMovimiento() ? props.valor : 0)

watch(visible, (v) => {
  if (!v || prefiereMenosMovimiento()) {
    mostrado.value = props.valor
    return
  }
  const inicio = performance.now()
  const DURACION = 700
  const paso = (t: number) => {
    const p = Math.min(1, (t - inicio) / DURACION)
    // Curva ease-out: arranca rápido y frena al llegar.
    mostrado.value = Math.round(props.valor * (1 - Math.pow(1 - p, 3)))
    if (p < 1) requestAnimationFrame(paso)
  }
  requestAnimationFrame(paso)
})
</script>

<template>
  <div ref="raiz">
    <p class="sr-only">{{ valor }} {{ unidad }} {{ texto }}</p>
    <p aria-hidden="true" class="font-display font-medium leading-none tracking-tight">
      <span class="inline-block text-6xl sm:text-7xl tabular-nums text-right" :style="{ minWidth: `${String(valor).length}ch` }">{{ mostrado }}</span>
      <span class="text-2xl sm:text-3xl ml-1">{{ unidad }}</span>
    </p>
    <p aria-hidden="true" class="mt-3 text-sm sm:text-base text-white/85 max-w-[16rem]">{{ texto }}</p>
  </div>
</template>
