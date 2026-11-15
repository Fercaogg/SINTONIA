<script setup lang="ts">
// /participantes: kit para participantes del piloto. Cada documento se puede
// leer aquí o descargar en PDF (generado desde la propia web con
// scripts/generar-pdf.mjs). Todo el kit es un borrador pendiente de revisión
// por el Comité de Ética, y así lo dice cada documento.
import LayoutPublico from '@/components/layout/LayoutPublico.vue'
import AppIcon from '@/components/comun/AppIcon.vue'
import DocumentoKit from '@/components/kit/DocumentoKit.vue'
import { DOCUMENTOS } from '@/contenido/participantes'
</script>

<template>
  <LayoutPublico>
    <h1 class="titulo-pagina mb-2">Kit para participantes</h1>
    <p class="texto-suave mb-8">Lo necesario para decidir si participas en el piloto, para leer aquí o descargar en PDF.</p>

    <ul class="space-y-4">
      <li v-for="d in DOCUMENTOS" :key="d.clave" class="card p-5">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex gap-3">
            <span class="h-10 w-10 shrink-0 rounded-lg bg-brand-100 text-brand-900 flex items-center justify-center"><AppIcon name="document" :size="20" /></span>
            <div>
              <h2 class="font-display text-lg font-semibold text-surface-900">{{ d.titulo }}</h2>
              <p class="text-sm texto-suave">{{ d.descripcion }}</p>
            </div>
          </div>
          <a :href="`/kit/${d.clave}.pdf`" :download="`sintonia-${d.clave}.pdf`" class="btn-secondary text-sm shrink-0">
            <AppIcon name="download" :size="16" />Descargar PDF<span class="sr-only">: {{ d.titulo }}</span>
          </a>
        </div>
        <details class="mt-4 group">
          <summary class="cursor-pointer min-h-tactil inline-flex items-center gap-2 font-medium text-brand-900">
            <AppIcon name="eye" :size="16" />Leer aquí<span class="sr-only">: {{ d.titulo }}</span>
          </summary>
          <div class="mt-4 border-t border-surface-200 pt-4">
            <DocumentoKit :doc="d.clave" :nivel="2" />
          </div>
        </details>
      </li>
    </ul>
  </LayoutPublico>
</template>
