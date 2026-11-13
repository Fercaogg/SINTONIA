<script setup lang="ts">
// Check-in semanal del estudiante: las 4 preguntas en una sola pantalla y un
// único botón de envío. Basado en el check-in de WORKWELL360.
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { llamar, mensajeDeError } from '@/lib/api'
import { hastaCierre } from '@/lib/fechas'
import type { CheckinEstudiante } from '@/lib/tipos-checkin'
import AppIcon from '@/components/comun/AppIcon.vue'
import AvisoError from '@/components/comun/AvisoError.vue'
import EstadoCarga from '@/components/comun/EstadoCarga.vue'
import EscalaTactil from '@/components/checkin/EscalaTactil.vue'
import EstadoCalendario from '@/components/checkin/EstadoCalendario.vue'
import AvisoBienestar from '@/components/checkin/AvisoBienestar.vue'
import { useTerminos } from '@/lib/terminos'

const datos = ref<CheckinEstudiante | null>(null)
const respuestas = ref<Record<string, number | null>>({ avance: null, siguiente_paso: null, apoyo: null, bienestar: null })
const cargando = ref(true)
const enviando = ref(false)
const guardado = ref(false)
const error = ref('')

const abierta = computed(() => datos.value?.calendario.estado === 'abierta')
const items = computed(() => datos.value?.items ?? [])
const respondidas = computed(() => items.value.filter((i) => respuestas.value[i.clave] != null).length)
const faltan = computed(() => items.value.length - respondidas.value)
const bienestarBajo = computed(() => (respuestas.value.bienestar ?? 5) <= 2)
const yaRespondido = computed(() => !!datos.value?.respuesta)

onMounted(async () => {
  try {
    datos.value = await llamar<CheckinEstudiante>('mi_checkin')
    const r = datos.value.respuesta
    if (r) respuestas.value = { avance: r.avance, siguiente_paso: r.siguiente_paso, apoyo: r.apoyo, bienestar: r.bienestar }
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    cargando.value = false
  }
})

async function enviar() {
  if (faltan.value > 0) return
  enviando.value = true
  error.value = ''
  try {
    await llamar('guardar_checkin_estudiante', {
      p_avance: respuestas.value.avance,
      p_siguiente_paso: respuestas.value.siguiente_paso,
      p_apoyo: respuestas.value.apoyo,
      p_bienestar: respuestas.value.bienestar,
    })
    datos.value = await llamar<CheckinEstudiante>('mi_checkin')
    guardado.value = true
    window.scrollTo({ top: 0 })
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    enviando.value = false
  }
}

const { t } = useTerminos()
</script>

<template>
  <div class="max-w-lg mx-auto fade-in">
    <EstadoCarga v-if="cargando" />
    <AvisoError v-else-if="!datos" :mensaje="error" />
    <template v-else-if="!abierta">
      <h1 class="titulo-pagina mb-6">Check-in semanal</h1>
      <EstadoCalendario :calendario="datos.calendario" />
    </template>

    <!-- Guardado -->
    <div v-else-if="guardado" class="text-center pt-8">
      <div class="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4 slide-up">
        <AppIcon name="check" :size="32" class="text-surface-900" />
      </div>
      <h1 class="titulo-pagina mb-2">Check-in guardado</h1>
      <p class="texto-suave">
        Gracias. Puedes cambiar tus respuestas hasta el {{ hastaCierre(datos.calendario.cierra!) }}.
      </p>
      <div class="text-left"><AvisoBienestar v-if="bienestarBajo" :url="datos.url_servicio_psicologico" /></div>
      <div class="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <RouterLink to="/estudiante" class="btn-primary">Volver al inicio</RouterLink>
        <button type="button" class="btn-secondary" @click="guardado = false">Revisar mis respuestas</button>
      </div>
    </div>

    <!-- Formulario -->
    <form v-else novalidate @submit.prevent="enviar">
      <div class="mb-6">
        <h1 class="titulo-pagina">Check-in de la semana {{ datos.calendario.semana }}</h1>
        <p class="texto-suave mt-1 text-sm">
          <template v-if="yaRespondido">Ya has respondido esta semana. Puedes cambiar tus respuestas</template>
          <template v-else>Puedes responder</template>
          hasta el {{ hastaCierre(datos.calendario.cierra!) }}.
        </p>
      </div>

      <div class="mb-6">
        <div class="flex items-center justify-between mb-2 text-sm">
          <span class="font-medium text-surface-800">Tu semana</span>
          <span class="texto-suave tabular-nums">{{ respondidas }} de {{ items.length }}</span>
        </div>
        <div
          class="h-2 bg-surface-100 rounded-full overflow-hidden"
          role="progressbar"
          :aria-valuenow="respondidas"
          aria-valuemin="0"
          :aria-valuemax="items.length"
          aria-label="Preguntas respondidas"
        >
          <div class="h-full bg-brand-500 rounded-full transition-all duration-500 ease-out" :style="{ width: (respondidas / items.length) * 100 + '%' }" />
        </div>
      </div>

      <AvisoError v-if="error" :mensaje="error" class="mb-6" />

      <div class="space-y-4">
        <section v-for="item in items" :key="item.clave" class="card p-5 sm:p-6">
          <div class="flex items-start justify-between gap-3 mb-4">
            <h2 :id="`p-${item.clave}`" class="font-display text-lg font-semibold text-surface-900 leading-snug">{{ t(item.texto) }}</h2>
          </div>
          <p v-if="item.privado" class="badge badge-sky mb-4 -mt-2">
            <AppIcon name="lock" :size="14" /> Solo lo ves tú
          </p>
          <EscalaTactil
            v-model="respuestas[item.clave]"
            :etiqueta-id="`p-${item.clave}`"
            :ancla-min="item.ancla_min"
            :ancla-max="item.ancla_max"
          />
          <AvisoBienestar v-if="item.clave === 'bienestar' && bienestarBajo" :url="datos.url_servicio_psicologico" />
        </section>
      </div>

      <div class="mt-6 mb-10">
        <button type="submit" class="btn-primary w-full py-3.5" :disabled="faltan > 0 || enviando">
          <template v-if="enviando">Enviando...</template>
          <template v-else>{{ yaRespondido ? 'Guardar cambios' : 'Enviar' }}</template>
        </button>
        <p v-if="faltan > 0" class="text-sm texto-suave text-center mt-2" aria-live="polite">
          {{ faltan === 1 ? 'Falta 1 pregunta' : `Faltan ${faltan} preguntas` }}
        </p>
      </div>
    </form>
  </div>
</template>
