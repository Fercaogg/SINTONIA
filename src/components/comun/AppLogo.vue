<script setup lang="ts">
// Logotipo de SINTONÍA: el símbolo (tres hojas que forman una S) y el nombre.
// Sistema «Tinta y lumbre» (LUMBRA360): el nombre en una grotesca compacta
// (Instrument Sans), todo en tinta; el único acento es la hoja central del
// símbolo, en lumbre.
//   variante "oscuro": para fondos claros (tinta; en modo oscuro, blanco roto).
//   variante "claro": para bloques de tinta (blanco).
import SimboloSintonia from './SimboloSintonia.vue'

withDefaults(defineProps<{ variante?: 'claro' | 'oscuro'; soloSimbolo?: boolean }>(), { variante: 'oscuro', soloSimbolo: false })
</script>

<template>
  <span class="inline-flex items-center gap-[0.4em] font-display font-semibold leading-none select-none tracking-[-0.04em]" role="img" aria-label="SINTONÍA" data-logotipo>
    <SimboloSintonia class="h-[1.15em] w-[1.15em] shrink-0" :class="variante === 'claro' ? 'text-white' : 'text-surface-900'" />
    <span v-if="!soloSimbolo" aria-hidden="true" :class="variante === 'claro' ? 'text-white' : 'text-surface-900'">SINTONÍA</span>
  </span>
</template>
