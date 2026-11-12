<script setup lang="ts">
// LOGOTIPO PROVISIONAL de SINTONÍA.
// Sigue la lógica del logotipo de WORKWELL360 (src/components/shared/AppLogo.vue):
// solo tipográfico, Fira Sans en negrita, azul marino más el verde de la marca.
// Pendiente de sustituir por el logotipo definitivo (ver PENDIENTES.md).
withDefaults(defineProps<{ variante?: 'claro' | 'oscuro' }>(), { variante: 'oscuro' })
</script>

<template>
  <span class="font-display font-bold leading-none select-none tracking-tight" aria-label="SINTONÍA" data-logotipo="provisional">
    <span aria-hidden="true" :class="variante === 'claro' ? 'text-white' : 'text-surface-900'">SINTON</span><span aria-hidden="true" class="text-brand-500">ÍA</span>
  </span>
</template>
