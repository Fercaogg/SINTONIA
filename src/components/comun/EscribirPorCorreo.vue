<script setup lang="ts">
// Si el formulario no puede enviar correos, se ofrece escribir directamente,
// con el mensaje ya preparado en el programa de correo de la persona.
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import { CORREO_CONTACTO } from '@/lib/publico'
import { useIdioma } from '@/lib/idioma'
const { t } = useIdioma()

const props = defineProps<{ asunto: string; cuerpo: string }>()
const enlace = computed(() => `mailto:${CORREO_CONTACTO}?subject=${encodeURIComponent(props.asunto)}&body=${encodeURIComponent(props.cuerpo)}`)
</script>

<template>
  <div class="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:bg-amber-950/30" role="status">
    <p class="font-medium text-surface-900">{{ t('Ahora mismo el formulario no puede enviar correos.', 'Right now the form cannot send emails.') }}</p>
    <p class="mt-1 text-sm texto-suave">{{ t('Tu mensaje no se ha perdido: ábrelo en tu correo, ya preparado, y envíalo a', 'Your message is not lost: open it in your email, already prepared, and send it to') }} {{ CORREO_CONTACTO }}.</p>
    <a :href="enlace" class="btn-primary mt-3 text-sm"><AppIcon name="mail" :size="16" />{{ t('Escribir a', 'Write to') }} {{ CORREO_CONTACTO }}</a>
  </div>
</template>
