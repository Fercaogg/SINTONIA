<script setup lang="ts">
// Fondo continuo de la portada: una capa clara y otra azul marino, fijas
// detrás de todo, que se funden por opacidad según la escena (sin cortes y
// sin animar colores: solo opacity).
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { alCambiarFondo } from '@/lib/cine'

const marino = ref<HTMLElement | null>(null)
onMounted(() => alCambiarFondo((v) => { if (marino.value) marino.value.style.opacity = String(v) }))
onBeforeUnmount(() => alCambiarFondo(null))
</script>

<template>
  <div class="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
    <div class="absolute inset-0 bg-surface-50" />
    <div ref="marino" class="absolute inset-0 fondo-marino" style="opacity: 0" />
  </div>
</template>

<style scoped>
/* Azul marino con una luz verde muy suave (todo derivado de la marca). */
.fondo-marino {
  background: radial-gradient(120% 90% at 80% 110%, rgba(52, 198, 163, 0.22), transparent 60%), #0a4a6c;
  will-change: opacity;
}
</style>
