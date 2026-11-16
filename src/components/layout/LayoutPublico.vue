<script setup lang="ts">
import SaltarContenido from '@/components/layout/SaltarContenido.vue'
// Estructura de las páginas públicas de lectura (Cómo funciona, privacidad,
// aviso legal, cookies, consentimiento): cabecera sencilla, contenido y pie.
import { RouterLink, useRouter } from 'vue-router'
import AppLogo from '@/components/comun/AppLogo.vue'
import AppIcon from '@/components/comun/AppIcon.vue'
import BandaEntorno from '@/components/comun/BandaEntorno.vue'
import PiePublico from './PiePublico.vue'
import SelectorIdioma from '@/components/comun/SelectorIdioma.vue'
import { useIdioma } from '@/lib/idioma'
const { t, ruta } = useIdioma()

// ancho: 'amplio' para páginas con columnas (por ejemplo, la hoja de ruta).
const props = withDefaults(defineProps<{ ancho?: 'normal' | 'amplio' }>(), { ancho: 'normal' })
const router = useRouter()
function volver() {
  if (window.history.length > 1) router.back()
  else router.push(ruta('/'))
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <SaltarContenido />
    <BandaEntorno />
    <header class="bg-papel border-b border-surface-200">
      <div class="mx-auto px-4 py-4 flex items-center justify-between gap-3" :class="props.ancho === 'amplio' ? 'max-w-5xl' : 'max-w-3xl'">
        <RouterLink :to="ruta('/')" class="text-xl" :aria-label="t('SINTONÍA, inicio', 'SINTONÍA, home')"><AppLogo /></RouterLink>
        <div class="flex items-center gap-2">
          <SelectorIdioma />
          <button type="button" class="btn-secondary text-sm" @click="volver">
            <AppIcon name="back" :size="16" /> {{ t('Volver', 'Back') }}
          </button>
        </div>
      </div>
    </header>
    <main id="contenido" tabindex="-1" class="outline-none flex-1 w-full min-w-0 mx-auto px-4 py-10 fade-in" :class="props.ancho === 'amplio' ? 'max-w-5xl' : 'max-w-3xl'">
      <slot />
    </main>
    <PiePublico />
  </div>
</template>
