<script setup lang="ts">
// Interruptor de los avisos de Puente al doctorado en la agenda de la tutoría.
// Es la variable de la hipótesis 3: cada cambio queda registrado en la base
// de datos (cambiar_puente). La explicación va siempre antes del interruptor.
import { ref } from 'vue'
import { llamar, mensajeDeError } from '@/lib/api'
import { useTerminos } from '@/lib/terminos'
import AvisoError from '@/components/comun/AvisoError.vue'

const activado = defineModel<boolean>({ required: true })
const guardando = ref(false)
const error = ref('')
const { t } = useTerminos()

async function cambiar() {
  guardando.value = true
  error.value = ''
  try {
    const r = await llamar<{ activado: boolean }>('cambiar_puente', { p_activado: !activado.value })
    activado.value = r.activado
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <section class="card p-5 sm:p-6" aria-labelledby="t-activar">
    <AvisoError v-if="error" :mensaje="error" class="mb-4" />
    <div class="flex items-start gap-4">
      <div class="flex-1">
        <h2 id="t-activar" class="font-semibold text-surface-900">Avisarme de los plazos en la agenda</h2>
        <p class="text-sm texto-suave mt-1 leading-relaxed">
          Si lo activas, cuando una convocatoria abra o cierre en las próximas 4 semanas, la agenda de la tutoría
          incluirá una línea para comentarlo. {{ t('Tu tutor/a también verá esa línea.') }} Puedes desactivarlo cuando quieras.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        :aria-checked="activado"
        aria-labelledby="t-activar"
        :disabled="guardando"
        class="shrink-0 w-14 h-11 flex items-center"
        @click="cambiar"
      >
        <!-- Zona táctil de 44 px de alto; el carril visible mide 32 px. -->
        <span
          class="relative w-14 h-8 rounded-full transition-colors duration-200"
          :class="activado ? 'bg-brand-900' : 'bg-surface-300'"
          aria-hidden="true"
        >
          <span
            class="absolute top-1 left-1 w-6 h-6 rounded-full bg-papel shadow transition-transform duration-200"
            :class="{ 'translate-x-6': activado }"
          />
        </span>
      </button>
    </div>
    <p class="text-sm font-medium mt-3" :class="activado ? 'text-brand-900' : 'texto-suave'" aria-live="polite">
      {{ activado ? 'Activado' : 'Desactivado' }}
    </p>
  </section>
</template>
