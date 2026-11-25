<script setup lang="ts">
import SaltarContenido from '@/components/layout/SaltarContenido.vue'
// Estructura de las páginas públicas de lectura (Cómo funciona, privacidad,
// aviso legal, cookies, consentimiento): la cabecera de la portada, una
// columna de lectura y el pie.
import BandaEntorno from '@/components/comun/BandaEntorno.vue'
import PiePublico from './PiePublico.vue'
import CabeceraPublica from './CabeceraPublica.vue'

// ancho: 'amplio' para páginas con columnas (por ejemplo, la hoja de ruta).
const props = withDefaults(defineProps<{ ancho?: 'normal' | 'amplio' }>(), { ancho: 'normal' })
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <SaltarContenido />
    <BandaEntorno />
    <CabeceraPublica />
    <main id="contenido" tabindex="-1" class="outline-none flex-1 w-full min-w-0 mx-auto px-6 sm:px-8 pt-10 pb-20 sm:pt-16 lg:pt-20 lg:pb-28 fade-in" :class="props.ancho === 'amplio' ? 'max-w-5xl' : 'max-w-3xl'">
      <slot />
    </main>
    <PiePublico />
  </div>
</template>
