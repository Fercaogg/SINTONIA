<script setup lang="ts">
// Estructura de las páginas públicas de lectura (Cómo funciona, privacidad,
// aviso legal, cookies, consentimiento): cabecera sencilla, contenido y pie.
import { RouterLink, useRouter } from 'vue-router'
import AppLogo from '@/components/comun/AppLogo.vue'
import AppIcon from '@/components/comun/AppIcon.vue'
import BandaEntorno from '@/components/comun/BandaEntorno.vue'
import PiePublico from './PiePublico.vue'

const router = useRouter()
function volver() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <BandaEntorno />
    <header class="bg-papel border-b border-surface-200">
      <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <RouterLink to="/" class="text-xl" aria-label="SINTONÍA, inicio"><AppLogo /></RouterLink>
        <button type="button" class="btn-secondary text-sm" @click="volver">
          <AppIcon name="back" :size="16" /> Volver
        </button>
      </div>
    </header>
    <main id="contenido" class="flex-1 w-full min-w-0 max-w-3xl mx-auto px-4 py-10 fade-in">
      <slot />
    </main>
    <PiePublico />
  </div>
</template>
