<script setup lang="ts">
// Selector de idioma de las páginas públicas: enlace a la misma página en el
// otro idioma (src/contenido/paginas.json, campo "alterna"). Si la página no
// tiene versión en inglés, no se muestra.
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import PAGINAS from '@/contenido/paginas.json'

const route = useRoute()
const otra = computed(() => {
  const p = (PAGINAS as { ruta: string; alterna?: string; idioma: string }[]).find((x) => x.ruta === route.path)
  if (!p?.alterna) return null
  return p.idioma === 'en' ? { ruta: p.alterna, texto: 'Español', lang: 'es', titulo: 'Ver esta página en español' } : { ruta: p.alterna, texto: 'English', lang: 'en', titulo: 'View this page in English' }
})
</script>

<template>
  <RouterLink
    v-if="otra"
    :to="otra.ruta"
    :hreflang="otra.lang"
    :lang="otra.lang"
    :aria-label="otra.titulo"
    class="inline-flex items-center gap-1.5 min-h-tactil rounded-md px-2.5 text-sm font-medium text-surface-900 hover:bg-surface-100"
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" /></svg>
    {{ otra.texto }}
  </RouterLink>
</template>
