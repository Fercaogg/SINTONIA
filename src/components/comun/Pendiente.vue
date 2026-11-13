<script setup lang="ts">
// Un texto que todavía falta (marca [PENDIENTE: ...]).
//   - Dentro de la aplicación se muestra tal cual, sobre fondo amarillo, para
//     que nadie lo confunda con un texto definitivo.
//   - En una página pública (publico), nunca se muestra "[PENDIENTE]": se
//     muestra un texto digno (ver src/lib/publico.ts).
import { computed } from 'vue'
import { EN_ELABORACION, estaPendiente } from '@/lib/publico'

const props = defineProps<{ texto: string | null | undefined; publico?: boolean }>()
const esPendiente = computed(() => estaPendiente(props.texto))
</script>

<template>
  <span v-if="esPendiente && publico" class="italic texto-suave" data-en-elaboracion="true">{{ EN_ELABORACION }}</span>
  <span v-else-if="esPendiente" class="aviso-pendiente inline-block" data-pendiente="true">
    {{ texto || '[PENDIENTE]' }}
  </span>
  <span v-else>{{ texto }}</span>
</template>
