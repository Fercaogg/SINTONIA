<script setup lang="ts">
// Plantilla de la imagen para compartir (Open Graph, 1200 x 630) de cada
// página principal: azul marino #0A4A6C, el logotipo, el título y las dos
// ondas. Solo la usa scripts/generar-og.mjs; no aparece en buscadores.
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLogo from '@/components/comun/AppLogo.vue'
import OndasSintonia from '@/components/portada/OndasSintonia.vue'
import PAGINAS from '@/contenido/paginas.json'
import { URL_SITIO } from '@/lib/publico'

interface Pagina {
  ruta: string
  og: string
  idioma: string
  imagen?: { titulo: string; subtitulo: string }
}
const route = useRoute()
const pagina = computed(() => (PAGINAS as Pagina[]).find((p) => p.imagen && (p.idioma === 'en' ? `en-${p.og}` : p.og) === route.params.clave))
const dominio = URL_SITIO.replace('https://', '')
</script>

<template>
  <div v-if="pagina?.imagen" class="tarjeta relative overflow-hidden text-white" data-og-listo>
    <div class="absolute inset-x-[-80px] bottom-[38px] opacity-90"><OndasSintonia :desfase="pagina.og === 'inicio' ? 0 : 0.45" :alto="150" :grosor="3" sobre-oscuro /></div>
    <div class="relative flex h-full flex-col px-[80px] pt-[70px]">
      <p class="text-[44px]"><AppLogo variante="claro" /></p>
      <h1 class="mt-[46px] max-w-[960px] font-display text-[76px] font-bold leading-[1.02] tracking-tight">{{ pagina.imagen.titulo }}</h1>
      <p class="mt-[22px] max-w-[900px] text-[32px] leading-snug text-white/85">{{ pagina.imagen.subtitulo }}</p>
    </div>
    <p class="absolute bottom-[34px] right-[80px] text-[24px] font-medium text-white/80">{{ dominio }}</p>
  </div>
</template>

<style scoped>
.tarjeta {
  width: 1200px;
  height: 630px;
  background: radial-gradient(120% 90% at 85% 115%, rgba(52, 198, 163, 0.28), transparent 60%), #0a4a6c;
}
</style>
