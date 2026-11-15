<script setup lang="ts">
// Página solo para generar los PDF (scripts/generar-pdf.mjs): un documento
// del kit, sin cabecera ni pie, en tamaño A4. No aparece en buscadores.
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DocumentoKit from '@/components/kit/DocumentoKit.vue'
import { DOCUMENTOS, type ClaveDocumento } from '@/contenido/participantes'

const route = useRoute()
const doc = computed(() => DOCUMENTOS.find((d) => d.clave === route.params.doc)?.clave as ClaveDocumento | undefined)
</script>

<template>
  <main class="imprimir mx-auto max-w-[44rem] bg-white px-8 py-10 text-surface-900">
    <p class="mb-6 font-display text-xl font-bold text-[#0A4A6C]">SINTON<span class="text-[#248a73]">ÍA</span></p>
    <DocumentoKit v-if="doc" :doc="doc" />
    <p v-else>Documento no encontrado.</p>
  </main>
</template>

<style scoped>
@page {
  size: A4;
  margin: 18mm 16mm;
}
@media print {
  :global(html),
  :global(body) {
    background: #fff !important;
  }
  .imprimir {
    padding: 0;
    max-width: none;
  }
}
</style>
