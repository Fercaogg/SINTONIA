<script setup lang="ts">
// Botón flotante de WhatsApp en las páginas públicas (nunca en los paneles).
// Solo aparece si hay número (VITE_WHATSAPP). Es un enlace normal a wa.me:
// no carga nada de WhatsApp en la página ni pone cookies.
// Verde oscuro (#0F7A5F): el blanco sobre él supera 4.5:1 en claro y en oscuro.
import { computed } from 'vue'
import { useIdioma } from '@/lib/idioma'
import { enlaceWhatsApp, WHATSAPP } from '@/lib/publico'

const props = withDefaults(defineProps<{ numero?: string }>(), { numero: WHATSAPP })
const { t } = useIdioma()
const enlace = computed(() =>
  enlaceWhatsApp(props.numero, t('Hola, os escribo desde la web de SINTONÍA.', 'Hello, I am writing from the SINTONÍA website.')),
)
</script>

<template>
  <a
    v-if="props.numero"
    :href="enlace"
    target="_blank"
    rel="noopener noreferrer"
    data-whatsapp
    class="boton-whatsapp fixed z-40 right-4 bottom-4 inline-flex items-center gap-2 rounded-full bg-[#0F7A5F] px-4 min-h-[48px] font-semibold text-white shadow-lg hover:bg-[#0B5E49] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F7A5F] print:hidden"
  >
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path
        d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z"
      />
    </svg>
    <span class="sr-only sm:not-sr-only">WhatsApp</span>
    <span class="sr-only">{{ t(' (se abre en otra pestaña)', ' (opens in a new tab)') }}</span>
  </a>
</template>

<style scoped>
/* Respeta la zona segura del iPhone (barra inferior). */
.boton-whatsapp {
  margin-bottom: env(safe-area-inset-bottom);
}
</style>
