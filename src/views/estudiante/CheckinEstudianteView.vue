<script setup lang="ts">
// Check-in semanal del estudiante: las 4 preguntas en una sola pantalla y un
// único botón de envío. Basado en el check-in de WORKWELL360.
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ErrorSintonia, llamar, mensajeDeError } from '@/lib/api'
import { useAlVolver, useCarga } from '@/lib/usar-carga'
import { avisoCambioSemana } from '@/lib/semana'
import { hastaCierre } from '@/lib/fechas'
import type { CheckinEstudiante } from '@/lib/tipos-checkin'
import AppIcon from '@/components/comun/AppIcon.vue'
import AvisoError from '@/components/comun/AvisoError.vue'
import EstadoCarga from '@/components/comun/EstadoCarga.vue'
import EscalaTactil from '@/components/checkin/EscalaTactil.vue'
import EstadoCalendario from '@/components/checkin/EstadoCalendario.vue'
import AvisoBienestar from '@/components/checkin/AvisoBienestar.vue'
import { useTerminos } from '@/lib/terminos'
import { useSesion } from '@/stores/sesion'
import { claveBorrador } from '@/lib/borrador'
import { useBorrador } from '@/lib/usar-borrador'

const datos = ref<CheckinEstudiante | null>(null)
type Respuestas = Record<string, number | null>
const VACIAS: Respuestas = { avance: null, siguiente_paso: null, apoyo: null, bienestar: null }
const respuestas = ref<Respuestas>({ ...VACIAS })
const enviando = ref(false)
const guardado = ref(false)

const abierta = computed(() => datos.value?.calendario.estado === 'abierta')
const items = computed(() => datos.value?.items ?? [])
const respondidas = computed(() => items.value.filter((i) => respuestas.value[i.clave] != null).length)
const faltan = computed(() => items.value.length - respondidas.value)
const bienestarBajo = computed(() => (respuestas.value.bienestar ?? 5) <= 2)
const yaRespondido = computed(() => !!datos.value?.respuesta)

// Borrador: lo marcado y aún no enviado se guarda en este navegador, salvo
// las preguntas privadas (el bienestar). Ver src/lib/borrador.ts.
const sesion = useSesion()
const enviadas = computed<Respuestas>(() => {
  const r = datos.value?.respuesta
  return r ? { avance: r.avance, siguiente_paso: r.siguiente_paso, apoyo: r.apoyo, bienestar: r.bienestar } : { ...VACIAS }
})
const privadas = computed(() => new Set(items.value.filter((i) => i.privado).map((i) => i.clave)))
const borrador = useBorrador(respuestas, {
  clave: computed(() => {
    const usuario = sesion.sesion?.user.id
    const c = datos.value?.calendario
    return usuario && c?.estado === 'abierta' && c.semana ? claveBorrador('estudiante', usuario, c.semana) : null
  }),
  caduca: computed(() => datos.value?.calendario.cierra),
  enviado: enviadas,
  guardable: (v) => Object.fromEntries(Object.entries(v).map(([k, n]) => [k, privadas.value.has(k) ? null : n])),
})
/** Se han recuperado respuestas sin enviar de una visita anterior. */
const recuperado = ref(false)
const faltaPrivada = computed(() => items.value.some((i) => i.privado && respuestas.value[i.clave] == null))

/** Pone en pantalla un check-in recién leído: lo enviado y, encima, el borrador. */
function aplicar(d: CheckinEstudiante) {
  datos.value = d
  respuestas.value = { ...enviadas.value }
  recuperado.value = false
  const b = borrador.recuperar()
  if (b) {
    for (const [k, n] of Object.entries(b)) {
      if (n != null && k in respuestas.value && !privadas.value.has(k)) respuestas.value[k] = n
    }
    recuperado.value = borrador.pendiente.value
  }
}

const { cargando, error, cargar } = useCarga(async () => aplicar(await llamar<CheckinEstudiante>('mi_checkin')), { alVolver: false })

// La semana puede cerrarse (o empezar otra) con la página abierta. Se
// comprueba al volver a la pestaña y justo antes de enviar, para que unas
// respuestas pensadas para una semana no acaben guardadas en otra.
const avisoSemana = ref('')
async function comprobarSemana(): Promise<boolean> {
  const actual = await llamar<CheckinEstudiante>('mi_checkin')
  const aviso = avisoCambioSemana(datos.value?.calendario, actual.calendario)
  if (!aviso) return true
  guardado.value = false
  aplicar(actual)
  avisoSemana.value = aviso
  window.scrollTo({ top: 0 })
  return false
}
useAlVolver(() => {
  if (datos.value && !enviando.value) comprobarSemana().catch(() => {})
})

async function enviar() {
  if (faltan.value > 0) return
  enviando.value = true
  error.value = ''
  avisoSemana.value = ''
  try {
    if (!(await comprobarSemana())) return
    await llamar('guardar_checkin_estudiante', {
      p_avance: respuestas.value.avance,
      p_siguiente_paso: respuestas.value.siguiente_paso,
      p_apoyo: respuestas.value.apoyo,
      p_bienestar: respuestas.value.bienestar,
    })
    borrador.descartar()
    datos.value = await llamar<CheckinEstudiante>('mi_checkin')
    respuestas.value = { ...enviadas.value }
    recuperado.value = false
    guardado.value = true
    window.scrollTo({ top: 0 })
  } catch (e) {
    // Se ha cerrado entre la comprobación y el envío: se explica igual.
    if (e instanceof ErrorSintonia && e.codigo === 'SEMANA_CERRADA' && !(await comprobarSemana().catch(() => true))) return
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
    <AvisoError v-else-if="!datos" :mensaje="error" :reintentar="cargar" />
    <template v-else-if="!abierta">
      <h1 class="titulo-pagina mb-6">Check-in semanal</h1>
      <p v-if="avisoSemana" class="p-4 mb-6 text-sm rounded-xl border bg-brand-50 border-brand-200 text-surface-900" role="status">{{ avisoSemana }}</p>
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
          <div class="barra-avance h-full w-full bg-brand-500 rounded-full" :style="{ transform: `scaleX(${respondidas / items.length})` }" />
        </div>
      </div>

      <p v-if="avisoSemana" class="p-4 mb-6 text-sm rounded-xl border bg-brand-50 border-brand-200 text-surface-900" role="status">{{ avisoSemana }}</p>
      <div v-if="recuperado" class="p-4 mb-6 text-sm flex items-start gap-3 rounded-xl border bg-brand-50 border-brand-200 text-surface-900" role="status">
        <AppIcon name="history" :size="18" class="flex-shrink-0 mt-0.5" />
        <span>
          Hemos recuperado lo que marcaste y no llegaste a enviar. Revísalo y pulsa «{{ yaRespondido ? 'Guardar cambios' : 'Enviar' }}».
          <template v-if="faltaPrivada"> La pregunta sobre tu bienestar no se guarda en este dispositivo: respóndela de nuevo.</template>
        </span>
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

<style scoped>
/* La barra crece con transform (no con width): sin recalcular la maquetación. */
.barra-avance {
  transform-origin: left center;
  transition: transform 360ms var(--ease-out);
}
@media (prefers-reduced-motion: reduce) {
  .barra-avance {
    transition: none;
  }
}
</style>
