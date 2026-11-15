<script setup lang="ts">
// Si el formulario no puede enviar correos, se ofrece escribir directamente,
// con el mensaje ya preparado en el programa de correo de la persona.
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import { CORREO_CONTACTO } from '@/lib/publico'

const props = defineProps<{ asunto: string; cuerpo: string }>()
const enlace = computed(() => `mailto:${CORREO_CONTACTO}?subject=${encodeURIComponent(props.asunto)}&body=${encodeURIComponent(props.cuerpo)}`)
</script>

<template>
  <div class="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:bg-amber-950/30" role="status">
    <p class="font-medium text-surface-900">Ahora mismo el formulario no puede enviar correos.</p>
    <p class="mt-1 text-sm texto-suave">Tu mensaje no se ha perdido: ábrelo en tu correo, ya preparado, y envíalo a {{ CORREO_CONTACTO }}.</p>
    <a :href="enlace" class="btn-primary mt-3 text-sm"><AppIcon name="mail" :size="16" />Escribir a {{ CORREO_CONTACTO }}</a>
  </div>
</template>
