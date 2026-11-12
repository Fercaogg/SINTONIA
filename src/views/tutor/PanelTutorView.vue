<script setup lang="ts">
// Inicio del tutor/a: lista de estudiantes. El check-in llega en la siguiente fase.
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { llamar, mensajeDeError } from '@/lib/api'
import { useSesion } from '@/stores/sesion'
import EstadoCarga from '@/components/comun/EstadoCarga.vue'
import EstadoVacio from '@/components/comun/EstadoVacio.vue'
import AvisoError from '@/components/comun/AvisoError.vue'

const sesion = useSesion()
const estudiantes = ref<{ pareja_id: string; nombre: string }[]>([])
const cargando = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    estudiantes.value = await llamar('mis_estudiantes')
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="fade-in max-w-2xl">
    <h1 class="titulo-pagina">Hola, {{ sesion.perfil?.nombre?.split(' ')[0] }}</h1>
    <p class="texto-suave mt-1 mb-8">Cada semana responderás sobre todos tus estudiantes en una sola pantalla.</p>

    <EstadoCarga v-if="cargando" />
    <AvisoError v-else-if="error" :mensaje="error" />
    <EstadoVacio
      v-else-if="estudiantes.length === 0"
      icono="users"
      titulo="Aún no hay estudiantes contigo"
      texto="Dale a cada estudiante uno de tus códigos para que se registre."
    >
      <RouterLink to="/tutor/codigos" class="btn-primary mt-6">Ver mis códigos</RouterLink>
    </EstadoVacio>
    <section v-else class="card p-5" aria-labelledby="mis-est">
      <h2 id="mis-est" class="font-semibold text-surface-900 mb-3">Tus estudiantes</h2>
      <ul class="divide-y divide-surface-200">
        <li v-for="e in estudiantes" :key="e.pareja_id" class="py-3 text-surface-900">{{ e.nombre }}</li>
      </ul>
    </section>
  </div>
</template>
