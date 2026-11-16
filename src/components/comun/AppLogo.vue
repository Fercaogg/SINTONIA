<script setup lang="ts">
// Logotipo de SINTONÍA: el símbolo (tres hojas que forman una S) y el nombre.
// El nombre sigue la lógica del logotipo de WORKWELL360: Fira Sans en
// negrita, azul marino más el verde de la marca. Sobre fondo claro, el "ÍA"
// usa el verde oscuro (#248a73) por contraste (AUDITORIA.md, B1); sobre azul
// marino o en modo oscuro, el verde de identidad (#34C6A3).
//   variante "oscuro": para fondos claros (azul marino; en modo oscuro, claro).
//   variante "claro": para fondos azul marino (blanco).
import SimboloSintonia from './SimboloSintonia.vue'

withDefaults(defineProps<{ variante?: 'claro' | 'oscuro'; soloSimbolo?: boolean }>(), { variante: 'oscuro', soloSimbolo: false })
</script>

<template>
  <span class="inline-flex items-center gap-[0.4em] font-display font-bold leading-none select-none tracking-tight" role="img" aria-label="SINTONÍA" data-logotipo>
    <SimboloSintonia class="h-[1.15em] w-[1.15em] shrink-0" :class="variante === 'claro' ? 'text-white' : 'text-[#0A4A6C] dark:text-surface-900'" />
    <span v-if="!soloSimbolo" aria-hidden="true"
      ><span :class="variante === 'claro' ? 'text-white' : 'text-surface-900'">SINTON</span
      ><span :class="variante === 'claro' ? 'text-brand-500' : 'text-brand-800 dark:text-brand-500'">ÍA</span></span
    >
  </span>
</template>
