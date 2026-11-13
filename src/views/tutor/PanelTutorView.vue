<script setup lang="ts">
// Inicio del tutor/a: estado de la semana y acceso al check-in.
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { llamar, mensajeDeError } from '@/lib/api'
import { hastaCierre } from '@/lib/fechas'
import { useSesion } from '@/stores/sesion'
import type { AgendaSemana, CheckinTutor } from '@/lib/tipos-checkin'
import AppIcon from '@/components/comun/AppIcon.vue'
import EstadoCarga from '@/components/comun/EstadoCarga.vue'
import EstadoVacio from '@/components/comun/EstadoVacio.vue'
import AvisoError from '@/components/comun/AvisoError.vue'
import EstadoCalendario from '@/components/checkin/EstadoCalendario.vue'
import TarjetaAgenda from '@/components/agenda/TarjetaAgenda.vue'
import { useTerminos } from '@/lib/terminos'

const sesion = useSesion()
const datos = ref<CheckinTutor | null>(null)
const agendas = ref<{ pareja_id: string; nombre: string; cotutor?: boolean; agenda: AgendaSemana | null }[]>([])
const cargando = ref(true)
const error = ref('')

const respondidos = computed(() => datos.value?.estudiantes.filter((e) => e.avance != null).length ?? 0)

onMounted(async () => {
  try {
    const [d, a] = await Promise.all([llamar<CheckinTutor>('checkin_tutor'), llamar<typeof agendas.value>('agendas_tutor')])
    datos.value = d
    agendas.value = a
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    cargando.value = false
  }
})

const { t } = useTerminos()
</script>

<template>
  <div class="fade-in max-w-2xl">
    <h1 class="titulo-pagina">Hola, {{ sesion.perfil?.nombre?.split(' ')[0] }}</h1>
    <p class="texto-suave mt-1 mb-8">{{ t('Cada semana respondes sobre todos tus estudiantes en una sola pantalla.') }}</p>

    <EstadoCarga v-if="cargando" />
    <AvisoError v-else-if="error" :mensaje="error" />
    <template v-else-if="datos">
      <EstadoVacio
        v-if="!datos.estudiantes.length"
        icono="users"
        :titulo="t('Aún no hay estudiantes contigo')"
        :texto="t('Dale a cada estudiante uno de tus códigos para que se registre.')"
      >
        <RouterLink to="/tutor/codigos" class="btn-primary mt-6">Ver mis códigos</RouterLink>
      </EstadoVacio>
      <template v-else>
        <EstadoCalendario v-if="datos.calendario.estado !== 'abierta'" :calendario="datos.calendario" />
        <section v-else class="card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4" aria-labelledby="t-semana">
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            :class="respondidos === datos.estudiantes.length ? 'bg-brand-100 text-surface-900' : 'bg-surface-900 text-white'"
          >
            <AppIcon :name="respondidos === datos.estudiantes.length ? 'check' : 'checkin'" :size="24" />
          </div>
          <div class="flex-1">
            <h2 id="t-semana" class="font-semibold text-surface-900">
              Semana {{ datos.calendario.semana }}: {{ respondidos }} de {{ datos.estudiantes.length }} {{ t('estudiantes') }} respondidos
            </h2>
            <p class="text-sm texto-suave mt-0.5">Hasta el {{ hastaCierre(datos.calendario.cierra!) }}.</p>
          </div>
          <RouterLink to="/tutor/checkin" :class="respondidos ? 'btn-secondary' : 'btn-primary'">
            {{ respondidos ? 'Revisar' : 'Hacer el check-in' }}
          </RouterLink>
        </section>

        <h2 class="font-display text-xl font-semibold text-surface-900 mt-8 mb-3">Agendas para las tutorías</h2>
        <div class="space-y-4">
          <TarjetaAgenda
            v-for="(a, i) in agendas"
            :key="a.pareja_id"
            :agenda="a.agenda"
            :titulo="a.cotutor ? `${a.nombre} (${t('cotutoría')})` : a.nombre"
            :id-titulo="`t-agenda-${i}`"
            :otra-persona="t('Tu estudiante')"
          />
        </div>

      </template>
    </template>
  </div>
</template>
