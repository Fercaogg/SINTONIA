<script setup lang="ts">
// Inicio del tutor/a: estado de la semana y acceso al check-in.
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { llamar } from '@/lib/api'
import { useCarga } from '@/lib/usar-carga'
import { hastaCierre } from '@/lib/fechas'
import { useSesion } from '@/stores/sesion'
import type { AgendaSemana, CheckinTutor } from '@/lib/tipos-checkin'
import AppIcon from '@/components/comun/AppIcon.vue'
import EstadoCarga from '@/components/comun/EstadoCarga.vue'
import EstadoVacio from '@/components/comun/EstadoVacio.vue'
import AvisoError from '@/components/comun/AvisoError.vue'
import EstadoCalendario from '@/components/checkin/EstadoCalendario.vue'
import TarjetaAgenda from '@/components/agenda/TarjetaAgenda.vue'
import ProximasFechas from '@/components/calendario/ProximasFechas.vue'
import TarjetaSemana from '@/components/comun/TarjetaSemana.vue'
import { useTerminos } from '@/lib/terminos'

const sesion = useSesion()
const datos = ref<CheckinTutor | null>(null)
const agendas = ref<{ pareja_id: string; nombre: string; cotutor?: boolean; agenda: AgendaSemana | null }[]>([])

const respondidos = computed(() => datos.value?.estudiantes.filter((e) => e.avance != null).length ?? 0)

const { cargando, error, cargar } = useCarga(async () => {
  const [d, a] = await Promise.all([llamar<CheckinTutor>('checkin_tutor'), llamar<typeof agendas.value>('agendas_tutor')])
  datos.value = d
  agendas.value = a
})

const { t } = useTerminos()
</script>

<template>
  <div class="fade-in max-w-2xl">
    <h1 class="titulo-pagina">Hola, {{ sesion.perfil?.nombre?.split(' ')[0] }}</h1>
    <p class="texto-suave mt-1 mb-8">{{ t('Cada semana respondes sobre todos tus estudiantes en una sola pantalla.') }}</p>

    <EstadoCarga v-if="cargando" />
    <AvisoError v-else-if="error" :mensaje="error" :reintentar="cargar" />
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
        <TarjetaSemana
          v-else
          :etiqueta="`Semana ${datos.calendario.semana} de ${datos.calendario.semanas}`"
          :cifra="`${respondidos} de ${datos.estudiantes.length}`"
          :titulo="respondidos === datos.estudiantes.length ? t('Has respondido sobre todos tus estudiantes') : t('estudiantes respondidos esta semana')"
          :texto="`Hasta el ${hastaCierre(datos.calendario.cierra!)}. Unos 30 segundos para todos.`"
          :accion="{ to: '/tutor/checkin', texto: respondidos ? 'Revisar el check-in' : 'Hacer el check-in' }"
          :progreso="datos.estudiantes.length ? respondidos / datos.estudiantes.length : 0"
          :texto-anillo="`${respondidos}/${datos.estudiantes.length}`"
          :descripcion-anillo="t(`${respondidos} de ${datos.estudiantes.length} estudiantes respondidos`)"
          :hecho="respondidos === datos.estudiantes.length"
        />

        <ProximasFechas class="mt-4" />

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
