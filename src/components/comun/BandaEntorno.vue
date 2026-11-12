<script setup lang="ts">
// Franja superior que avisa de que no se está usando la instalación real.
import { entornoLocal, modoDemo } from '@/lib/supabase'
</script>

<template>
  <div
    v-if="modoDemo || entornoLocal"
    class="bg-amber-100 text-amber-900 text-xs sm:text-sm font-medium text-center px-4 py-2 border-b border-amber-200"
    role="note"
  >
    <template v-if="modoDemo">Demostración: todos los datos son ficticios.</template>
    <template v-else>Entorno local de desarrollo: no es la instalación real.</template>
  </div>
</template>
