<script setup lang="ts">
// Aviso de error (WW360 LoginView.vue): fondo rojo claro e icono de aviso.
// Con `reintentar`, ofrece volver a intentarlo sin recargar la página.
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps<{ mensaje: string; reintentar?: () => unknown }>()

const reintentando = ref(false)
async function alPulsar() {
  if (!props.reintentar) return
  reintentando.value = true
  try {
    await props.reintentar()
  } finally {
    reintentando.value = false
  }
}
</script>

<template>
  <div class="aviso-error" role="alert">
    <AppIcon name="warning" :size="18" class="flex-shrink-0 mt-0.5" />
    <div class="flex-1 min-w-0">
      <span>{{ mensaje }}</span>
      <div v-if="reintentar" class="mt-3">
        <button type="button" class="btn-secondary !py-2 text-sm" :disabled="reintentando" @click="alPulsar">
          {{ reintentando ? 'Reintentando...' : 'Reintentar' }}
        </button>
      </div>
    </div>
  </div>
</template>
