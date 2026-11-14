<script setup lang="ts">
// Pestañas accesibles (patrón WAI-ARIA): estudiante, tutor/a y dirección.
import { ref } from 'vue'
import { PERFILES } from '@/contenido/portada'
import AppIcon from '@/components/comun/AppIcon.vue'

const activa = ref(0)
const botones = ref<HTMLButtonElement[]>([])

function mover(delta: number) {
  activa.value = (activa.value + delta + PERFILES.length) % PERFILES.length
  botones.value[activa.value]?.focus()
}
</script>

<template>
  <div>
    <div role="tablist" aria-label="Perfiles" class="flex flex-wrap gap-2" @keydown.right.prevent="mover(1)" @keydown.left.prevent="mover(-1)">
      <button
        v-for="(p, i) in PERFILES"
        :id="`pestana-${p.clave}`"
        :key="p.clave"
        ref="botones"
        type="button"
        role="tab"
        :aria-selected="activa === i"
        :aria-controls="`panel-${p.clave}`"
        :tabindex="activa === i ? 0 : -1"
        class="px-4 min-h-tactil rounded-full border text-sm font-medium"
        :class="activa === i ? 'bg-marino text-white border-marino' : 'bg-papel text-surface-800 border-surface-200 hover:border-surface-800'"
        @click="activa = i"
      >
        {{ p.nombre }}
      </button>
    </div>
    <div
      v-for="(p, i) in PERFILES"
      v-show="activa === i"
      :id="`panel-${p.clave}`"
      :key="p.clave"
      role="tabpanel"
      :aria-labelledby="`pestana-${p.clave}`"
      tabindex="0"
      class="card p-5 sm:p-6 mt-4 grid gap-6 md:grid-cols-3"
    >
      <div class="md:col-span-3">
        <p class="text-sm texto-suave">Tiempo</p>
        <p class="font-display text-xl font-semibold text-surface-900">{{ p.tiempo }}</p>
      </div>
      <div>
        <h3 class="font-semibold text-surface-900 mb-2">Qué hace</h3>
        <ul class="space-y-2 text-sm">
          <li v-for="t in p.hace" :key="t">{{ t }}</li>
        </ul>
      </div>
      <div>
        <h3 class="font-semibold text-surface-900 mb-2">Qué ve</h3>
        <ul class="space-y-2 text-sm">
          <li v-for="t in p.ve" :key="t" class="flex gap-2"><AppIcon name="eye" :size="16" class="mt-0.5 shrink-0 text-brand-900" />{{ t }}</li>
        </ul>
      </div>
      <div>
        <h3 class="font-semibold text-surface-900 mb-2">Qué NO ve</h3>
        <ul class="space-y-2 text-sm">
          <li v-for="t in p.noVe" :key="t" class="flex gap-2"><AppIcon name="lock" :size="16" class="mt-0.5 shrink-0 text-surface-800" />{{ t }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>
