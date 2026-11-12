<script setup lang="ts">
// Inicio del estudiante: estado de la semana, agenda y apoyo.
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useSesion } from '@/stores/sesion'
import { llamar, mensajeDeError } from '@/lib/api'
import { hastaCierre } from '@/lib/fechas'
import type { AgendaSemana, CheckinEstudiante } from '@/lib/tipos-checkin'
import AppIcon from '@/components/comun/AppIcon.vue'
import AvisoError from '@/components/comun/AvisoError.vue'
import EstadoCarga from '@/components/comun/EstadoCarga.vue'
import EstadoCalendario from '@/components/checkin/EstadoCalendario.vue'
import TarjetaAgenda from '@/components/agenda/TarjetaAgenda.vue'

const sesion = useSesion()
const datos = ref<CheckinEstudiante | null>(null)
const agenda = ref<AgendaSemana | null>(null)
const cuestionarios = ref<{ clave: string; titulo: string; abierto: boolean; completado: boolean }[]>([])
const cuestionarioPendiente = computed(() => cuestionarios.value.find((c) => c.abierto && !c.completado))
const cargando = ref(true)
const error = ref('')

const nombre = computed(() => sesion.perfil?.nombre?.split(' ')[0] ?? '')

onMounted(async () => {
  try {
    const [d, a, c] = await Promise.all([
      llamar<CheckinEstudiante>('mi_checkin'),
      llamar<AgendaSemana | null>('mi_agenda'),
      llamar<typeof cuestionarios.value>('mis_cuestionarios'),
    ])
    datos.value = d
    agenda.value = a
    cuestionarios.value = c
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="fade-in max-w-2xl">
    <h1 class="titulo-pagina">Hola, {{ nombre }}</h1>
    <p class="texto-suave mt-1 mb-8">Tu check-in semanal te llevará alrededor de un minuto.</p>

    <EstadoCarga v-if="cargando" />
    <AvisoError v-else-if="error" :mensaje="error" />
    <template v-else-if="datos">
      <section v-if="cuestionarioPendiente" class="card p-5 sm:p-6 mb-4 flex flex-col sm:flex-row sm:items-center gap-4 bg-brand-50 border-brand-200" aria-labelledby="t-cuest">
        <div class="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0">
          <AppIcon name="document" :size="24" class="text-surface-900" />
        </div>
        <div class="flex-1">
          <h2 id="t-cuest" class="font-semibold text-surface-900">{{ cuestionarioPendiente.titulo }}</h2>
          <p class="text-sm texto-suave mt-0.5">Unas pocas preguntas para el estudio. Solo hay que responderlo una vez.</p>
        </div>
        <RouterLink :to="`/estudiante/cuestionario/${cuestionarioPendiente.clave}`" class="btn-primary">Responder</RouterLink>
      </section>

      <EstadoCalendario v-if="datos.calendario.estado !== 'abierta'" :calendario="datos.calendario" />

      <section v-else class="card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4" aria-labelledby="t-semana">
        <div
          class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          :class="datos.respuesta ? 'bg-brand-100 text-surface-900' : 'bg-surface-900 text-white'"
        >
          <AppIcon :name="datos.respuesta ? 'check' : 'checkin'" :size="24" />
        </div>
        <div class="flex-1">
          <h2 id="t-semana" class="font-semibold text-surface-900">
            {{ datos.respuesta ? `Ya has hecho el check-in de la semana ${datos.calendario.semana}` : `Semana ${datos.calendario.semana} de ${datos.calendario.semanas}` }}
          </h2>
          <p class="text-sm texto-suave mt-0.5">
            {{ datos.respuesta ? 'Puedes cambiarlo' : 'Tienes' }} hasta el {{ hastaCierre(datos.calendario.cierra!) }}.
          </p>
        </div>
        <RouterLink to="/estudiante/checkin" :class="datos.respuesta ? 'btn-secondary' : 'btn-primary'">
          {{ datos.respuesta ? 'Revisar' : 'Hacer el check-in' }}
        </RouterLink>
      </section>

      <TarjetaAgenda class="mt-4" :agenda="agenda" otra-persona="Tu tutor/a" />

      <div class="grid sm:grid-cols-2 gap-4 mt-4">
        <RouterLink to="/estudiante/historial" class="card p-5 hover:shadow-elevated no-underline">
          <AppIcon name="history" :size="22" class="text-surface-900 mb-2" />
          <p class="font-semibold text-surface-900">Mi histórico</p>
          <p class="text-sm texto-suave mt-0.5">Tus respuestas de semanas anteriores.</p>
        </RouterLink>
        <RouterLink to="/estudiante/apoyo" class="card p-5 hover:shadow-elevated no-underline">
          <AppIcon name="heart" :size="22" class="text-surface-900 mb-2" />
          <p class="font-semibold text-surface-900">Necesito apoyo</p>
          <p class="text-sm texto-suave mt-0.5">Avisar a la dirección del máster, solo si tú quieres.</p>
        </RouterLink>
      </div>
    </template>
  </div>
</template>
