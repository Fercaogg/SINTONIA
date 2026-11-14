<script setup lang="ts">
// Tarjeta de un miembro de la dirección del TFM. Las dos tarjetas usan este
// mismo componente: misma estructura, mismo tamaño y mismo peso. Si un dato
// solo existe para una persona (el instituto), no se inventa nada para la
// otra: la sección "Dirección" usa filas de igual altura (grid-auto-rows: 1fr)
// para que las dos tarjetas midan lo mismo.
import type { MiembroDireccion } from '@/contenido/portada'

defineProps<{ miembro: MiembroDireccion }>()
</script>

<template>
  <article class="card p-6 h-full flex flex-col" :aria-labelledby="`dir-${miembro.iniciales}`">
    <div class="flex items-center gap-4">
      <span class="w-14 h-14 rounded-full bg-surface-900 text-white font-display text-lg font-semibold flex items-center justify-center shrink-0" aria-hidden="true">
        {{ miembro.iniciales }}
      </span>
      <div class="min-w-0">
        <h3 :id="`dir-${miembro.iniciales}`" class="font-display text-lg font-semibold text-surface-900">{{ miembro.nombre }}</h3>
        <p class="text-sm texto-suave">{{ miembro.categoria }}</p>
      </div>
    </div>
    <dl class="mt-5 grid gap-3 text-sm flex-1">
      <div><dt class="font-medium text-surface-800">Departamento</dt><dd>{{ miembro.departamento }}</dd></div>
      <div><dt class="font-medium text-surface-800">Área</dt><dd>{{ miembro.area }}</dd></div>
      <div v-if="miembro.instituto"><dt class="font-medium text-surface-800">Instituto</dt><dd>{{ miembro.instituto }}</dd></div>
      <div>
        <dt class="font-medium text-surface-800">Grupos de investigación</dt>
        <dd><ul class="list-disc pl-5 space-y-0.5"><li v-for="g in miembro.grupos" :key="g">{{ g }}</li></ul></dd>
      </div>
      <div>
        <dt class="font-medium text-surface-800">Tesis doctoral</dt>
        <dd>"{{ miembro.tesis.titulo }}" ({{ miembro.tesis.universidad }}, {{ miembro.tesis.anio }})</dd>
      </div>
    </dl>
    <p class="mt-5 flex flex-wrap gap-x-4">
      <a :href="miembro.perfil" target="_blank" rel="noopener noreferrer" class="enlace inline-flex items-center min-h-tactil">
        Perfil USAL<span class="sr-only"> de {{ miembro.nombre }} (se abre en otra pestaña)</span>
      </a>
      <a :href="miembro.orcid" target="_blank" rel="noopener noreferrer" class="enlace inline-flex items-center min-h-tactil">
        ORCID<span class="sr-only"> de {{ miembro.nombre }} (se abre en otra pestaña)</span>
      </a>
    </p>
  </article>
</template>
