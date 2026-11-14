<script setup lang="ts">
// Fondo continuo de la portada: tres capas fijas detrás de todo (claro,
// verde suave y azul marino) que se funden por opacidad según la zona que
// ocupa la pantalla. Sin animar colores: solo opacity.
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { capasDeFondo } from '@/lib/cine'

const marino = ref<HTMLElement | null>(null)
const verde = ref<HTMLElement | null>(null)
onMounted(() => capasDeFondo({ marino: marino.value ?? undefined, verde: verde.value ?? undefined }))
onBeforeUnmount(() => capasDeFondo({}))
</script>

<template>
  <div class="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
    <div class="absolute inset-0 bg-surface-50" />
    <div ref="verde" class="absolute inset-0 bg-brand-100 capa" style="opacity: 0" />
    <div ref="marino" class="absolute inset-0 fondo-marino capa" style="opacity: 0" />
  </div>
</template>

<style scoped>
.capa {
  will-change: opacity;
}
/* Azul marino con una luz verde muy suave (todo derivado de la marca). */
.fondo-marino {
  background: radial-gradient(120% 90% at 80% 110%, rgba(52, 198, 163, 0.22), transparent 60%), #0a4a6c;
}
</style>
