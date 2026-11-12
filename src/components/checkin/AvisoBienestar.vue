<script setup lang="ts">
// Mensaje amable cuando el estudiante dice que está mal (1 o 2).
// No avisa a nadie: solo lo ve el propio estudiante.
import { computed } from 'vue'
import AppIcon from '@/components/comun/AppIcon.vue'
import Pendiente from '@/components/comun/Pendiente.vue'

const props = defineProps<{ url: string | null }>()
const urlValida = computed(() => !!props.url && /^https?:\/\//.test(props.url))
</script>

<template>
  <div class="mt-4 p-4 rounded-xl bg-brand-50 border border-brand-200" role="status">
    <div class="flex items-start gap-3">
      <div class="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0">
        <AppIcon name="heart" :size="18" class="text-surface-900" />
      </div>
      <div class="text-sm">
        <p class="font-semibold text-surface-900">Gracias por decirlo</p>
        <p class="texto-suave mt-1 leading-relaxed">
          Si te apetece hablar con alguien, el servicio de atención psicológica
          de la Universidad puede ayudarte. Esta respuesta no se envía a nadie.
        </p>
        <a v-if="urlValida" :href="url!" target="_blank" rel="noopener" class="btn-secondary text-sm mt-3">
          Servicio de atención psicológica
          <span class="sr-only">(se abre en otra pestaña)</span>
        </a>
        <p v-else class="mt-3"><Pendiente :texto="url" /></p>
      </div>
    </div>
  </div>
</template>
