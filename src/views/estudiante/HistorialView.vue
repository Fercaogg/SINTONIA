<script setup lang="ts">
import { RouterLink } from 'vue-router'
// Histórico del propio estudiante. Sin colores de semáforo ni valoraciones.
import { onMounted, ref } from 'vue'
import { llamar, mensajeDeError } from '@/lib/api'
import { fechaCorta } from '@/lib/fechas'
import AppIcon from '@/components/comun/AppIcon.vue'
import AvisoError from '@/components/comun/AvisoError.vue'
import EstadoCarga from '@/components/comun/EstadoCarga.vue'
import EstadoVacio from '@/components/comun/EstadoVacio.vue'

interface Semana { semana: number; avance: number; siguiente_paso: number; apoyo: number; bienestar: number | null; actualizado_at: string }

const semanas = ref<Semana[]>([])
const cargando = ref(true)
const error = ref('')

const columnas: { clave: keyof Semana; texto: string; privado?: boolean }[] = [
  { clave: 'avance', texto: 'Avance' },
  { clave: 'siguiente_paso', texto: 'Siguiente paso' },
  { clave: 'apoyo', texto: 'Apoyo' },
  { clave: 'bienestar', texto: 'Bienestar', privado: true },
]

onMounted(async () => {
  try {
    semanas.value = await llamar('mi_historial')
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="fade-in max-w-2xl">
    <h1 class="titulo-pagina">Mi histórico</h1>
    <p class="texto-suave mt-1 mb-8">Tus respuestas de cada semana, de 1 a 5. Solo las ves tú.</p>

    <EstadoCarga v-if="cargando" />
    <AvisoError v-else-if="error" :mensaje="error" />
    <EstadoVacio v-else-if="!semanas.length" icono="history" titulo="Aún no hay semanas" texto="Haz tu primer check-in para empezar a ver tu histórico." />
    <ul v-else class="space-y-3">
      <li v-for="s in semanas" :key="s.semana" class="card p-4 sm:p-5">
        <div class="flex items-baseline justify-between mb-3">
          <h2 class="font-semibold text-surface-900">Semana {{ s.semana }}</h2>
          <span class="text-xs texto-suave">{{ fechaCorta(s.actualizado_at) }}</span>
        </div>
        <dl class="grid grid-cols-4 gap-2">
          <div v-for="c in columnas" :key="c.clave" class="text-center min-w-0">
            <dt class="text-xs texto-suave mb-1 flex items-center justify-center gap-1">
              <AppIcon v-if="c.privado" name="lock" :size="12" />
              <span class="truncate">{{ c.texto }}</span>
            </dt>
            <dd class="font-semibold text-surface-900 tabular-nums">{{ s[c.clave] ?? '' }}</dd>
          </div>
        </dl>
      </li>
    </ul>
    <p v-if="!cargando && !error" class="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
      <RouterLink to="/estudiante/checkin" class="enlace inline-flex items-center min-h-tactil">Cambiar las respuestas de esta semana</RouterLink>
      <RouterLink to="/como-funciona" class="enlace inline-flex items-center min-h-tactil">Quién ve tus respuestas</RouterLink>
    </p>
  </div>
</template>
