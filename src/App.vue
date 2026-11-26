<script setup lang="ts">
import { RouterView } from 'vue-router'
import { fallo } from '@/lib/fallos'
import AppIcon from '@/components/comun/AppIcon.vue'

function recargar() {
  window.location.reload()
}
</script>

<template>
  <!-- Aviso general de fallo inesperado (src/lib/fallos.ts). -->
  <div
    v-if="fallo"
    class="fixed inset-x-0 bottom-0 z-[60] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex justify-center pointer-events-none"
  >
    <div class="aviso-error pointer-events-auto max-w-xl w-full shadow-lg items-center" role="alert">
      <AppIcon name="warning" :size="18" class="flex-shrink-0" />
      <span class="flex-1">{{ fallo }}</span>
      <button type="button" class="btn-secondary shrink-0 !py-2" @click="recargar">Recargar</button>
      <button type="button" class="shrink-0 p-2 rounded-lg min-h-tactil min-w-tactil flex items-center justify-center" aria-label="Cerrar el aviso" @click="fallo = ''">
        <AppIcon name="close" :size="18" />
      </button>
    </div>
  </div>
  <RouterView />
</template>
