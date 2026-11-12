<script setup lang="ts">
import { RouterLink } from 'vue-router'
import LayoutAcceso from '@/components/layout/LayoutAcceso.vue'
</script>

<template>
  <LayoutAcceso>
    <h1 class="titulo-pagina mb-2">Esta página no existe</h1>
    <p class="texto-suave mb-8">Puede que el enlace esté mal escrito o que la página se haya movido.</p>
    <RouterLink to="/" class="btn-primary">Ir al inicio</RouterLink>
  </LayoutAcceso>
</template>
