<script setup lang="ts">
import SaltarContenido from '@/components/layout/SaltarContenido.vue'
// Página 404: las dos ondas, desajustadas, y un camino de vuelta.
// Las ondas se separan un poco más al entrar y se quedan quietas; con
// "reducir movimiento", directamente en su sitio.
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppLogo from '@/components/comun/AppLogo.vue'
import BandaEntorno from '@/components/comun/BandaEntorno.vue'
import OndasSintonia from '@/components/portada/OndasSintonia.vue'

const desfase = ref(0.4)
onMounted(() => requestAnimationFrame(() => (desfase.value = 1)))
// Estilos en línea siempre aplicados desde código (la CSP no admite atributos style).
const estilo = (e: Record<string, string>) => e
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <SaltarContenido />
    <BandaEntorno />
    <header class="border-b border-surface-200 bg-papel">
      <div class="max-w-3xl mx-auto px-4 py-4">
        <RouterLink to="/" class="text-xl" aria-label="SINTONÍA, inicio"><AppLogo /></RouterLink>
      </div>
    </header>
    <main id="contenido" tabindex="-1" class="outline-none flex-1 flex items-center">
      <div class="w-full max-w-xl mx-auto px-4 py-16 text-center">
        <div class="mx-auto max-w-md" :style="estilo({ '--ondas-duracion': '1400ms' })" aria-hidden="true">
          <OndasSintonia :desfase="desfase" :alto="110" />
        </div>
        <p class="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-brand-900">Error 404</p>
        <h1 class="mt-2 font-display text-4xl sm:text-5xl font-bold tracking-tight text-surface-900 text-balance">Esta página no está en sintonía</h1>
        <p class="mt-4 text-lg texto-suave">Puede que el enlace esté mal escrito o que la página se haya movido. Volvamos a un sitio conocido.</p>
        <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <RouterLink to="/" class="btn-primary px-6 py-3">Volver al inicio</RouterLink>
          <RouterLink to="/#contacto" class="btn-secondary px-6 py-3">Avisarnos del enlace</RouterLink>
        </div>
      </div>
    </main>
  </div>
</template>
