<script setup lang="ts">
// Check-in del tutor/a: todos sus estudiantes en una pantalla y un único
// botón para enviarlo todo. El "siguiente paso" es opcional.
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { llamar, mensajeDeError } from '@/lib/api'
import { hastaCierre } from '@/lib/fechas'
import type { CheckinTutor } from '@/lib/tipos-checkin'
import AppIcon from '@/components/comun/AppIcon.vue'
import AvisoError from '@/components/comun/AvisoError.vue'
import EstadoCarga from '@/components/comun/EstadoCarga.vue'
import EstadoVacio from '@/components/comun/EstadoVacio.vue'
import EscalaTactil from '@/components/checkin/EscalaTactil.vue'
import EstadoCalendario from '@/components/checkin/EstadoCalendario.vue'

const datos = ref<CheckinTutor | null>(null)
const respuestas = ref<Record<string, { avance: number | null; siguiente_paso: number | null }>>({})
const cargando = ref(true)
const enviando = ref(false)
const guardado = ref(false)
const error = ref('')

const itemAvance = computed(() => datos.value?.items.find((i) => i.clave === 'avance'))
const itemSiguiente = computed(() => datos.value?.items.find((i) => i.clave === 'siguiente_paso'))
const estudiantes = computed(() => datos.value?.estudiantes ?? [])
const respondidos = computed(() => estudiantes.value.filter((e) => respuestas.value[e.pareja_id]?.avance != null).length)
const faltan = computed(() => estudiantes.value.length - respondidos.value)
const yaRespondido = computed(() => estudiantes.value.some((e) => e.avance != null))

onMounted(async () => {
  try {
    datos.value = await llamar<CheckinTutor>('checkin_tutor')
    for (const e of datos.value.estudiantes) {
      respuestas.value[e.pareja_id] = { avance: e.avance, siguiente_paso: e.siguiente_paso }
    }
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
    await llamar('guardar_checkin_tutor', {
      p_respuestas: estudiantes.value.map((e) => ({ pareja_id: e.pareja_id, ...respuestas.value[e.pareja_id] })),
    })
    datos.value = await llamar<CheckinTutor>('checkin_tutor')
    guardado.value = true
    window.scrollTo({ top: 0 })
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl fade-in">
    <EstadoCarga v-if="cargando" />
    <AvisoError v-else-if="!datos" :mensaje="error" />
    <template v-else-if="datos.calendario.estado !== 'abierta'">
      <h1 class="titulo-pagina mb-6">Check-in semanal</h1>
      <EstadoCalendario :calendario="datos.calendario" />
    </template>
    <EstadoVacio v-else-if="!estudiantes.length" icono="users" titulo="Aún no hay estudiantes contigo" texto="Dale a cada estudiante uno de tus códigos para que se registre.">
      <RouterLink to="/tutor/codigos" class="btn-primary mt-6">Ver mis códigos</RouterLink>
    </EstadoVacio>

    <div v-else-if="guardado" class="text-center pt-8">
      <div class="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4 slide-up">
        <AppIcon name="check" :size="32" class="text-surface-900" />
      </div>
      <h1 class="titulo-pagina mb-2">Check-in guardado</h1>
      <p class="texto-suave">Gracias. Puedes cambiar tus respuestas hasta el {{ hastaCierre(datos.calendario.cierra!) }}.</p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <RouterLink to="/tutor" class="btn-primary">Volver al inicio</RouterLink>
        <button type="button" class="btn-secondary" @click="guardado = false">Revisar mis respuestas</button>
      </div>
    </div>

    <form v-else novalidate @submit.prevent="enviar">
      <h1 class="titulo-pagina">Check-in de la semana {{ datos.calendario.semana }}</h1>
      <p class="texto-suave mt-1 text-sm mb-6">
        Una respuesta por estudiante.
        <template v-if="yaRespondido">Ya has respondido: puedes cambiarlo</template><template v-else>Tienes</template>
        hasta el {{ hastaCierre(datos.calendario.cierra!) }}.
      </p>

      <AvisoError v-if="error" :mensaje="error" class="mb-6" />

      <ul class="space-y-4">
        <li v-for="e in estudiantes" :key="e.pareja_id" class="card p-5">
          <h2 class="font-display text-lg font-semibold text-surface-900 mb-3">{{ e.nombre }}</h2>
          <p :id="`av-${e.pareja_id}`" class="text-sm font-medium text-surface-800 mb-2">{{ itemAvance?.texto }}</p>
          <EscalaTactil
            v-model="respuestas[e.pareja_id].avance"
            :etiqueta-id="`av-${e.pareja_id}`"
            :ancla-min="itemAvance?.ancla_min ?? ''"
            :ancla-max="itemAvance?.ancla_max ?? ''"
            compacta
          />
          <template v-if="itemSiguiente">
            <p :id="`sp-${e.pareja_id}`" class="text-sm font-medium text-surface-800 mt-5 mb-2">
              {{ itemSiguiente.texto }} <span class="texto-suave font-normal">(opcional)</span>
            </p>
            <EscalaTactil
              v-model="respuestas[e.pareja_id].siguiente_paso"
              :etiqueta-id="`sp-${e.pareja_id}`"
              :ancla-min="itemSiguiente.ancla_min"
              :ancla-max="itemSiguiente.ancla_max"
              compacta
            />
          </template>
        </li>
      </ul>

      <div class="sticky bottom-0 -mx-4 px-4 py-4 mt-6 bg-surface-50/95 backdrop-blur border-t border-surface-200 lg:static lg:mx-0 lg:px-0 lg:bg-transparent lg:border-0">
        <button type="submit" class="btn-primary w-full py-3.5" :disabled="faltan > 0 || enviando">
          <template v-if="enviando">Enviando...</template>
          <template v-else>{{ yaRespondido ? 'Guardar cambios' : 'Enviar todo' }}</template>
        </button>
        <p class="text-sm texto-suave text-center mt-2" aria-live="polite">
          {{ respondidos }} de {{ estudiantes.length }} estudiantes
        </p>
      </div>
    </form>
  </div>
</template>
