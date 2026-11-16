<script setup lang="ts">
// Códigos de pareja que el tutor/a puede dar a sus estudiantes.
import { onMounted, ref } from 'vue'
import { llamar, mensajeDeError } from '@/lib/api'
import AppIcon from '@/components/comun/AppIcon.vue'
import EstadoCarga from '@/components/comun/EstadoCarga.vue'
import EstadoVacio from '@/components/comun/EstadoVacio.vue'
import AvisoError from '@/components/comun/AvisoError.vue'
import { useTerminos } from '@/lib/terminos'
import { fechaCorta } from '@/lib/fechas'

const codigos = ref<{ codigo: string; caduca_at: string | null; usos: number; usos_max: number }[]>([])
const cargando = ref(true)
const error = ref('')
const copiado = ref('')

onMounted(async () => {
  try {
    codigos.value = await llamar('mis_codigos_pareja')
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    cargando.value = false
  }
})

async function copiar(codigo: string) {
  try {
    await navigator.clipboard.writeText(codigo)
    copiado.value = codigo
    setTimeout(() => { if (copiado.value === codigo) copiado.value = '' }, 2000)
  } catch {
    copiado.value = ''
  }
}

const { t } = useTerminos()
</script>

<template>
  <div class="fade-in max-w-2xl">
    <h1 class="titulo-pagina">{{ t('Códigos para tus estudiantes') }}</h1>
    <p class="texto-suave mt-1 mb-8">
      {{ t('Da un código a cada estudiante.') }} Al registrarse con él, quedaréis enlazados como pareja. Cada código sirve para una persona y caduca en la fecha indicada.
    </p>

    <EstadoCarga v-if="cargando" />
    <AvisoError v-else-if="error" :mensaje="error" />
    <EstadoVacio v-else-if="codigos.length === 0" icono="key" titulo="Ya has repartido todos tus códigos" texto="Si necesitas más, escribe a la persona responsable del estudio y te enviará otros." />
    <ul v-else class="grid gap-3 sm:grid-cols-2">
      <li v-for="c in codigos" :key="c.codigo" class="card p-4 flex items-center justify-between gap-3">
        <span class="min-w-0">
          <span class="block font-mono text-lg font-semibold tracking-wider text-surface-900 break-all">{{ c.codigo }}</span>
          <span v-if="c.caduca_at" class="block text-xs texto-suave">Caduca el {{ fechaCorta(c.caduca_at) }}</span>
        </span>
        <button type="button" class="btn-secondary text-sm px-3 shrink-0" :aria-label="`Copiar el código ${c.codigo}`" @click="copiar(c.codigo)">
          <AppIcon :name="copiado === c.codigo ? 'check' : 'copy'" :size="16" />
          {{ copiado === c.codigo ? 'Copiado' : 'Copiar' }}
        </button>
      </li>
    </ul>
    <p class="sr-only" aria-live="polite">{{ copiado ? `Código ${copiado} copiado` : '' }}</p>
  </div>
</template>
