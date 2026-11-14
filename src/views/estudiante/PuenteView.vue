<script setup lang="ts">
// Puente al doctorado: el estudiante lo activa o desactiva cuando quiere.
import { onMounted, ref } from 'vue'
import { llamar, mensajeDeError } from '@/lib/api'
import { fechaCorta } from '@/lib/fechas'
import AppIcon from '@/components/comun/AppIcon.vue'
import AvisoError from '@/components/comun/AvisoError.vue'
import EstadoCarga from '@/components/comun/EstadoCarga.vue'
import Pendiente from '@/components/comun/Pendiente.vue'
import { useTerminos } from '@/lib/terminos'

interface Convocatoria {
  id: number
  nombre: string
  organismo: string
  fecha_apertura: string | null
  fecha_cierre: string | null
  enlace: string
  estado: string
}

const activado = ref(false)
const convocatorias = ref<Convocatoria[]>([])
const normativa = ref<{ titulo: string; descripcion: string | null; url: string }[]>([])
const cargando = ref(true)
const guardando = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    const r = await llamar<{ activado: boolean; convocatorias: Convocatoria[]; normativa: typeof normativa.value }>('mi_puente')
    activado.value = r.activado
    convocatorias.value = r.convocatorias
    normativa.value = r.normativa ?? []
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    cargando.value = false
  }
})

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

const esEnlace = (t: string) => /^https?:\/\//.test(t)

const { t } = useTerminos()
</script>

<template>
  <div class="fade-in max-w-2xl">
    <h1 class="titulo-pagina">Puente al doctorado</h1>
    <p class="texto-suave mt-1 mb-8">
      Para que la información sobre las convocatorias del doctorado te llegue a tiempo.
    </p>

    <EstadoCarga v-if="cargando" />
    <template v-else>
      <AvisoError v-if="error" :mensaje="error" class="mb-6" />

      <section class="card p-5 sm:p-6 mb-6" aria-labelledby="t-activar">
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

      <h2 class="font-display text-xl font-semibold text-surface-900 mb-3">Convocatorias</h2>
      <ul class="space-y-3">
        <li v-for="c in convocatorias" :key="c.id" class="card p-5">
          <div class="flex items-start gap-3">
            <AppIcon name="graduation" :size="22" class="text-surface-900 shrink-0 mt-0.5" />
            <div class="flex-1 min-w-0 space-y-1.5">
              <h3 class="font-semibold text-surface-900">{{ c.nombre }}</h3>
              <p class="text-sm"><span class="texto-suave">Organismo: </span><Pendiente :texto="c.organismo" /></p>
              <p class="text-sm">
                <span class="texto-suave">Plazo: </span>
                <template v-if="c.fecha_apertura || c.fecha_cierre">
                  {{ c.fecha_apertura ? `del ${fechaCorta(c.fecha_apertura)}` : '' }}
                  {{ c.fecha_cierre ? `al ${fechaCorta(c.fecha_cierre)}` : '' }}
                </template>
                <Pendiente v-else texto="[PENDIENTE: fechas de la convocatoria]" />
              </p>
              <p class="text-sm"><span class="texto-suave">Estado: </span><Pendiente :texto="c.estado" /></p>
              <p class="text-sm">
                <a v-if="esEnlace(c.enlace)" :href="c.enlace" target="_blank" rel="noopener" class="enlace">
                  Información oficial <span class="sr-only">(se abre en otra pestaña)</span>
                </a>
                <Pendiente v-else :texto="c.enlace" />
              </p>
            </div>
          </div>
        </li>
      </ul>

      <section v-if="normativa.length" class="mt-8" aria-labelledby="t-norm">
        <h2 id="t-norm" class="font-display text-xl font-semibold text-surface-900 mb-3">Normativa del doctorado</h2>
        <ul class="card divide-y divide-surface-200">
          <li v-for="n in normativa" :key="n.url" class="p-4">
            <a :href="n.url" target="_blank" rel="noopener" class="enlace">
              {{ n.titulo }} <span class="sr-only">(documento oficial, se abre en otra pestaña)</span>
            </a>
            <p v-if="n.descripcion" class="text-sm texto-suave mt-1">{{ n.descripcion }}</p>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
