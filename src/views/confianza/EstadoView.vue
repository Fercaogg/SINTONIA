<script setup lang="ts">
// /estado: si la plataforma funciona ahora mismo, a partir de una
// comprobación real del servidor y la base de datos (api/estado).
// Sin servicios externos. Se comprueba al abrir la página y al pulsar el botón.
import { computed, onMounted, ref } from 'vue'
import LayoutPublico from '@/components/layout/LayoutPublico.vue'
import AppIcon from '@/components/comun/AppIcon.vue'
import { CORREO_CONTACTO } from '@/lib/publico'
import { useIdioma } from '@/lib/idioma'
const { t, idioma } = useIdioma()

interface Estado {
  ok: boolean
  comprobadoEn: string
  servidor: 'ok' | 'error'
  baseDeDatos: 'ok' | 'error'
  acceso: 'ok' | 'error'
}

const estado = ref<Estado | null>(null)
const sinRespuesta = ref(false)
const comprobando = ref(false)

async function comprobar() {
  comprobando.value = true
  sinRespuesta.value = false
  try {
    const r = await fetch('/api/estado', { cache: 'no-store' })
    estado.value = (await r.json()) as Estado
  } catch {
    estado.value = null
    sinRespuesta.value = true
  } finally {
    comprobando.value = false
  }
}
onMounted(comprobar)

const PARTES = computed(() => [
  { clave: 'servidor', nombre: t('Servidor', 'Server'), texto: t('Las funciones que guardan los check-ins y envían los avisos.', 'The functions that save check-ins and send alerts.') },
  { clave: 'baseDeDatos', nombre: t('Base de datos', 'Database'), texto: t('Donde se guardan las respuestas.', 'Where the answers are stored.') },
  { clave: 'acceso', nombre: t('Acceso', 'Sign-in'), texto: t('El inicio de sesión con el enlace del correo.', 'Signing in with the email link.') },
] as const)

const resumen = computed(() => {
  if (sinRespuesta.value) return { ok: false, texto: t('El servidor no responde ahora mismo.', 'The server is not responding right now.') }
  if (!estado.value) return null
  return estado.value.ok ? { ok: true, texto: t('Todo funciona con normalidad.', 'Everything is working normally.') } : { ok: false, texto: t('Hay un problema en una parte de la plataforma.', 'There is a problem in part of the platform.') }
})

const hora = computed(() =>
  estado.value ? new Date(estado.value.comprobadoEn).toLocaleString(idioma.value === 'en' ? 'en-GB' : 'es-ES', { dateStyle: 'long', timeStyle: 'short' }) : '',
)
</script>

<template>
  <LayoutPublico>
    <h1 class="titulo-pagina mb-2">{{ t('Estado de la plataforma', 'Platform status') }}</h1>
    <p class="texto-suave mb-8">{{ t('Comprobación en directo de las partes de SINTONÍA.', 'Live check of the parts of SINTONÍA.') }}</p>

    <div aria-live="polite" class="mb-8">
      <div v-if="!resumen" class="card p-5 texto-suave">{{ t('Comprobando…', 'Checking…') }}</div>
      <div
        v-else
        class="card p-5 flex items-center gap-3"
        :class="resumen.ok ? 'border-brand-200 bg-brand-50' : 'border-amber-300 bg-amber-50 dark:bg-amber-950/30'"
      >
        <span
          class="h-10 w-10 shrink-0 rounded-full flex items-center justify-center"
          :class="resumen.ok ? 'bg-brand-800 text-white' : 'bg-amber-600 text-white'"
          aria-hidden="true"
        ><AppIcon :name="resumen.ok ? 'check' : 'warning'" :size="20" /></span>
        <div>
          <p class="font-display text-lg font-semibold text-surface-900">{{ resumen.texto }}</p>
          <p v-if="hora" class="text-sm texto-suave">{{ t('Comprobado el', 'Checked on') }} {{ hora }}.</p>
        </div>
      </div>
    </div>

    <ul v-if="estado" class="card divide-y divide-surface-200 mb-8">
      <li v-for="p in PARTES" :key="p.clave" class="p-4 flex items-center gap-4">
        <div class="min-w-0 flex-1">
          <p class="font-semibold text-surface-900">{{ p.nombre }}</p>
          <p class="text-sm texto-suave">{{ p.texto }}</p>
        </div>
        <span
          class="shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold"
          :class="estado[p.clave] === 'ok' ? 'bg-brand-100 text-surface-900' : 'bg-amber-100 text-amber-900'"
        >
          <AppIcon :name="estado[p.clave] === 'ok' ? 'check' : 'warning'" :size="14" />{{ estado[p.clave] === 'ok' ? t('Funciona', 'Working') : t('Con problemas', 'Having problems') }}
        </span>
      </li>
    </ul>

    <button type="button" class="btn-secondary" :disabled="comprobando" @click="comprobar">
      <AppIcon name="history" :size="16" />{{ comprobando ? t('Comprobando…', 'Checking…') : t('Volver a comprobar', 'Check again') }}
    </button>

    <p class="mt-10 text-sm texto-suave leading-relaxed">
      <template v-if="idioma === 'es'">
        Esta página consulta el servidor de SINTONÍA en el momento en que la abres; no usa ningún servicio externo. Si algo no funciona durante más
        de unos minutos, escríbenos a <a :href="`mailto:${CORREO_CONTACTO}`" class="enlace">{{ CORREO_CONTACTO }}</a>.
      </template>
      <template v-else>
        This page checks SINTONÍA's server at the moment you open it; it does not use any external service. If something is not working for more
        than a few minutes, write to <a :href="`mailto:${CORREO_CONTACTO}`" class="enlace">{{ CORREO_CONTACTO }}</a>.
      </template>
    </p>
  </LayoutPublico>
</template>
