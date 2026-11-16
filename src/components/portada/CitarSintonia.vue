<script setup lang="ts">
// "Cómo citar SINTONÍA" en APA 7 (software), con la versión y el año de la
// versión actual, y un botón para copiar la cita.
import { computed, ref } from 'vue'
import AppIcon from '@/components/comun/AppIcon.vue'
import { CITA } from '@/contenido/investigacion'
import { NOVEDADES } from '@/contenido/novedades'
import { URL_SITIO, VERSION } from '@/lib/publico'
import { useIdioma } from '@/lib/idioma'
const { t } = useIdioma()
// En inglés, la descripción y "Versión" van traducidas (APA 7: [Software prototype...]).
const descripcion = computed(() => t(CITA.descripcion, "Software prototype of a Master's thesis, Universidad de Salamanca"))
const palabraVersion = computed(() => t('Versión', 'Version'))

const anio = NOVEDADES[0].fecha.slice(0, 4)
const texto = computed(() => `${CITA.autoria} (${anio}). ${CITA.titulo} (${palabraVersion.value} ${VERSION}) [${descripcion.value}]. ${URL_SITIO}`)
const copiado = ref(false)

async function copiar() {
  try {
    await navigator.clipboard.writeText(texto.value)
  } catch {
    // Navegadores sin portapapeles: se selecciona el texto para copiarlo a mano.
    const sel = window.getSelection()
    const nodo = document.getElementById('cita-apa')
    if (sel && nodo) {
      const r = document.createRange()
      r.selectNodeContents(nodo)
      sel.removeAllRanges()
      sel.addRange(r)
    }
  }
  copiado.value = true
  window.setTimeout(() => (copiado.value = false), 2500)
}
</script>

<template>
  <div class="card p-5">
    <p id="cita-apa" class="pl-6 -indent-6 leading-relaxed text-surface-900">
      {{ CITA.autoria }} ({{ anio }}). <i>{{ CITA.titulo }}</i> ({{ palabraVersion }} {{ VERSION }}) [{{ descripcion }}]. {{ URL_SITIO }}
    </p>
    <div class="mt-4 flex items-center gap-3">
      <button type="button" class="btn-secondary text-sm" @click="copiar">
        <AppIcon :name="copiado ? 'check' : 'copy'" :size="16" />{{ copiado ? t('Copiada', 'Copied') : t('Copiar la cita', 'Copy the citation') }}
      </button>
      <span class="sr-only" aria-live="polite">{{ copiado ? t('Cita copiada al portapapeles.', 'Citation copied to the clipboard.') : '' }}</span>
    </div>
  </div>
</template>
