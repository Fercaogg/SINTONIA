<script setup lang="ts">
// Franja superior que avisa de que no se está usando la instalación real.
// La de demostración aparece si la aplicación o la base de datos lo son.
import { computed, onMounted } from 'vue'
import { entornoLocal, modoDemo } from '@/lib/supabase'
import { comprobarModoServidor, modoServidor } from '@/lib/demo'

onMounted(comprobarModoServidor)
const esDemo = computed(() => modoDemo || modoServidor.value === 'demo')
const malConfigurada = computed(() => modoDemo && modoServidor.value === 'real')
</script>

<template>
  <div
    v-if="esDemo || entornoLocal"
    class="bg-amber-100 text-amber-900 text-xs sm:text-sm font-medium text-center px-4 py-2 border-b border-amber-200"
    role="note"
    data-banda-entorno
  >
    <template v-if="malConfigurada">Atención: la aplicación está en modo demostración pero la base de datos es real. Revisa la configuración.</template>
    <template v-else-if="esDemo">Demostración: todos los datos y nombres son ficticios.</template>
    <template v-else>Entorno local de desarrollo: no es la instalación real.</template>
  </div>
</template>
