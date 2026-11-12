<script setup lang="ts">
// Muestra un texto que contiene la marca [PENDIENTE: ...] de forma visible,
// para que nadie lo confunda con un texto definitivo.
import { computed } from 'vue'

const props = defineProps<{ texto: string | null | undefined }>()
const esPendiente = computed(() => !props.texto || props.texto.includes('[PENDIENTE'))
</script>

<template>
  <span v-if="esPendiente" class="aviso-pendiente inline-block" data-pendiente="true">
    {{ texto || '[PENDIENTE]' }}
  </span>
  <span v-else>{{ texto }}</span>
</template>
