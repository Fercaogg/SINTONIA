<script setup lang="ts">
// Aviso de error (WW360 LoginView.vue): fondo rojo claro e icono de aviso.
import AppIcon from './AppIcon.vue'

defineProps<{ mensaje: string }>()
</script>

<template>
  <div class="aviso-error" role="alert">
    <AppIcon name="warning" :size="18" class="flex-shrink-0 mt-0.5" />
    <span>{{ mensaje }}</span>
  </div>
</template>
