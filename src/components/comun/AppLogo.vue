<script setup lang="ts">
// LOGOTIPO PROVISIONAL de SINTONÍA.
// Sigue la lógica del logotipo de WORKWELL360 (src/components/shared/AppLogo.vue):
// solo tipográfico, Fira Sans en negrita, azul marino más el verde de la marca.
// Pendiente de sustituir por el logotipo definitivo (ver PENDIENTES.md).
// Sobre fondo claro, el "ÍA" usa el verde oscuro de la marca (#248a73) para
// tener contraste suficiente (AUDITORIA.md, B1); sobre azul marino o en modo
// oscuro, el verde de identidad (#34C6A3).
withDefaults(defineProps<{ variante?: 'claro' | 'oscuro' }>(), { variante: 'oscuro' })
</script>

<template>
  <span class="font-display font-bold leading-none select-none tracking-tight" aria-label="SINTONÍA" data-logotipo="provisional">
    <span aria-hidden="true" :class="variante === 'claro' ? 'text-white' : 'text-surface-900'">SINTON</span><span aria-hidden="true" :class="variante === 'claro' ? 'text-brand-500' : 'text-brand-800 dark:text-brand-500'">ÍA</span>
  </span>
</template>
