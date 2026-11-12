<script setup lang="ts">
// Resumen del máster para la dirección. Los datos agregados (con la regla
// de las 5 personas) se añaden en la Fase 6.
import { useSesion } from '@/stores/sesion'
import EstadoVacio from '@/components/comun/EstadoVacio.vue'

const sesion = useSesion()
</script>

<template>
  <div class="fade-in max-w-3xl">
    <h1 class="titulo-pagina">Resumen del máster</h1>
    <p class="texto-suave mt-1 mb-8">
      {{ sesion.perfil?.master?.nombre }}. Aquí verás solo datos agregados y anónimos. Ninguna cifra se calcula sobre menos de 5 personas.
    </p>
    <EstadoVacio icono="chart" titulo="Todavía no hay datos" texto="Los resúmenes aparecerán cuando empiece el estudio." />
  </div>
</template>
