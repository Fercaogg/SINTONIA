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
import { useTerminos } from '@/lib/terminos'
import { useSesion } from '@/stores/sesion'
import { claveBorrador } from '@/lib/borrador'
import { useBorrador } from '@/lib/usar-borrador'

const datos = ref<CheckinTutor | null>(null)
type Respuestas = Record<string, { avance: number | null; siguiente_paso: number | null }>
const respuestas = ref<Respuestas>({})
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

// Borrador: lo marcado y aún no enviado se guarda en este navegador (solo las
// cifras y el identificador de la pareja, sin nombres). Ver src/lib/borrador.ts.
const sesion = useSesion()
const enviadas = computed<Respuestas>(() =>
  Object.fromEntries(estudiantes.value.map((e) => [e.pareja_id, { avance: e.avance, siguiente_paso: e.siguiente_paso }])),
)
const borrador = useBorrador(respuestas, {
  clave: computed(() => {
    const usuario = sesion.sesion?.user.id
    const c = datos.value?.calendario
    return usuario && c?.estado === 'abierta' && c.semana ? claveBorrador('tutor', usuario, c.semana) : null
  }),
  caduca: computed(() => datos.value?.calendario.cierra),
  enviado: enviadas,
  guardable: (v) => v,
})
const recuperado = ref(false)

onMounted(async () => {
  try {
    datos.value = await llamar<CheckinTutor>('checkin_tutor')
    respuestas.value = structuredClone(enviadas.value)
    const b = borrador.recuperar()
    if (b) {
      // Solo las parejas que siguen existiendo.
      for (const [id, r] of Object.entries(b)) {
        const actual = respuestas.value[id]
        if (!actual || !r) continue
        if (r.avance != null) actual.avance = r.avance
        if (r.siguiente_paso != null) actual.siguiente_paso = r.siguiente_paso
      }
      recuperado.value = borrador.pendiente.value
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
    borrador.descartar()
    datos.value = await llamar<CheckinTutor>('checkin_tutor')
    respuestas.value = structuredClone(enviadas.value)
    recuperado.value = false
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
  <div class="max-w-2xl fade-in">
    <EstadoCarga v-if="cargando" />
    <AvisoError v-else-if="!datos" :mensaje="error" />
    <template v-else-if="datos.calendario.estado !== 'abierta'">
      <h1 class="titulo-pagina mb-6">Check-in semanal</h1>
      <EstadoCalendario :calendario="datos.calendario" />
    </template>
    <EstadoVacio v-else-if="!estudiantes.length" icono="users" :titulo="t('Aún no hay estudiantes contigo')" :texto="t('Dale a cada estudiante uno de tus códigos para que se registre.')">
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
        {{ t('Una respuesta por estudiante.') }}
        <template v-if="yaRespondido">Ya has respondido: puedes cambiarlo</template><template v-else>Tienes</template>
        hasta el {{ hastaCierre(datos.calendario.cierra!) }}.
      </p>

      <div v-if="recuperado" class="p-4 mb-6 text-sm flex items-start gap-3 rounded-xl border bg-brand-50 border-brand-200 text-surface-900" role="status">
        <AppIcon name="history" :size="18" class="flex-shrink-0 mt-0.5" />
        <span>Hemos recuperado lo que marcaste y no llegaste a enviar. Revísalo y pulsa «{{ yaRespondido ? 'Guardar cambios' : 'Enviar todo' }}».</span>
      </div>
      <AvisoError v-if="error" :mensaje="error" class="mb-6" />

      <ul class="space-y-4">
        <li v-for="e in estudiantes" :key="e.pareja_id" class="card p-5">
          <h2 class="font-display text-lg font-semibold text-surface-900 mb-3 flex flex-wrap items-center gap-2">
            {{ e.nombre }}
            <span v-if="e.cotutor" class="badge badge-sky">{{ t('Cotutoría') }}</span>
          </h2>
          <p :id="`av-${e.pareja_id}`" class="text-sm font-medium text-surface-800 mb-2">{{ t(itemAvance?.texto ?? '') }}</p>
          <EscalaTactil
            v-model="respuestas[e.pareja_id].avance"
            :etiqueta-id="`av-${e.pareja_id}`"
            :ancla-min="itemAvance?.ancla_min ?? ''"
            :ancla-max="itemAvance?.ancla_max ?? ''"
            compacta
          />
          <template v-if="itemSiguiente">
            <p :id="`sp-${e.pareja_id}`" class="text-sm font-medium text-surface-800 mt-5 mb-2">
              {{ t(itemSiguiente.texto) }} <span class="texto-suave font-normal">(opcional)</span>
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

      <div class="sticky bottom-0 -mx-4 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] mt-6 bg-surface-50/95 backdrop-blur border-t border-surface-200 lg:static lg:mx-0 lg:px-0 lg:bg-transparent lg:border-0">
        <button type="submit" class="btn-primary w-full py-3.5" :disabled="faltan > 0 || enviando">
          <template v-if="enviando">Enviando...</template>
          <template v-else>{{ yaRespondido ? 'Guardar cambios' : 'Enviar todo' }}</template>
        </button>
        <p class="text-sm texto-suave text-center mt-2" aria-live="polite">
          {{ respondidos }} de {{ estudiantes.length }} {{ t('estudiantes') }}
        </p>
      </div>
    </form>
  </div>
</template>
