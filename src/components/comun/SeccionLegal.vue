<script setup lang="ts">
// Un apartado de una página legal. Si no hay contenido confirmado, muestra el
// texto digno "En elaboración..." (nunca "[PENDIENTE]").
import { EN_ELABORACION, EN_ELABORACION_EN } from '@/lib/publico'
import { useIdioma } from '@/lib/idioma'
const { t } = useIdioma()

defineProps<{ id: string; titulo: string; pendiente?: boolean }>()
</script>

<template>
  <section class="mb-9" :aria-labelledby="id">
    <h2 :id="id" class="font-display text-xl font-semibold mb-3">{{ titulo }}</h2>
    <div class="space-y-3 text-base leading-relaxed">
      <slot />
      <p v-if="pendiente" class="italic texto-suave" data-en-elaboracion="true">{{ t(EN_ELABORACION, EN_ELABORACION_EN) }}</p>
    </div>
  </section>
</template>
