<script setup lang="ts">
// Investigación: calendario de convocatorias de Puente al doctorado.
// Las fechas y enlaces se rellenan a partir de las convocatorias oficiales.
import { onMounted, ref } from 'vue'
import { llamar, mensajeDeError } from '@/lib/api'
import AppIcon from '@/components/comun/AppIcon.vue'
import AvisoError from '@/components/comun/AvisoError.vue'
import EstadoCarga from '@/components/comun/EstadoCarga.vue'

interface Convocatoria {
  id?: number
  nombre: string
  organismo: string
  fecha_apertura: string | null
  fecha_cierre: string | null
  enlace: string
  estado: string
  activa: boolean
}

const lista = ref<Convocatoria[]>([])
const cargando = ref(true)
const error = ref('')
const aviso = ref('')

async function cargar() {
  lista.value = await llamar('listar_convocatorias')
}

onMounted(async () => {
  try {
    await cargar()
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    cargando.value = false
  }
})

function nueva() {
  lista.value.push({ nombre: '', organismo: '', fecha_apertura: null, fecha_cierre: null, enlace: '', estado: '', activa: true })
}

async function guardar(c: Convocatoria) {
  error.value = ''
  aviso.value = ''
  try {
    await llamar('guardar_convocatoria', { p_convocatoria: c })
    await cargar()
    aviso.value = `Convocatoria "${c.nombre}" guardada.`
  } catch (e) {
    error.value = mensajeDeError(e)
  }
}
</script>

<template>
  <div class="fade-in max-w-3xl">
    <h1 class="titulo-pagina">Convocatorias</h1>
    <p class="texto-suave mt-1 mb-8">
      Calendario de Puente al doctorado. Si una convocatoria abre o cierra en las próximas 4 semanas, la agenda de quienes
      tengan Puente activado incluirá una línea para comentarlo. Las convocatorias sin fechas no generan avisos.
    </p>

    <EstadoCarga v-if="cargando" />
    <template v-else>
      <AvisoError v-if="error" :mensaje="error" class="mb-6" />
      <p v-if="aviso" class="aviso-exito mb-6" role="status">{{ aviso }}</p>

      <ul class="space-y-4">
        <li v-for="(c, i) in lista" :key="c.id ?? `nueva-${i}`">
          <form class="card p-5 grid gap-4 sm:grid-cols-2" :aria-label="c.nombre || 'Nueva convocatoria'" @submit.prevent="guardar(c)">
            <div class="sm:col-span-2">
              <label :for="`n-${i}`" class="label">Nombre</label>
              <input :id="`n-${i}`" v-model="c.nombre" required class="input-field" />
            </div>
            <div class="sm:col-span-2">
              <label :for="`o-${i}`" class="label">Organismo</label>
              <input :id="`o-${i}`" v-model="c.organismo" class="input-field" />
            </div>
            <div>
              <label :for="`a-${i}`" class="label">Fecha de apertura</label>
              <input :id="`a-${i}`" v-model="c.fecha_apertura" type="date" class="input-field" />
            </div>
            <div>
              <label :for="`c-${i}`" class="label">Fecha de cierre</label>
              <input :id="`c-${i}`" v-model="c.fecha_cierre" type="date" class="input-field" />
            </div>
            <div class="sm:col-span-2">
              <label :for="`e-${i}`" class="label">Enlace oficial</label>
              <input :id="`e-${i}`" v-model="c.enlace" class="input-field" placeholder="https://..." />
            </div>
            <div>
              <label :for="`s-${i}`" class="label">Estado</label>
              <input :id="`s-${i}`" v-model="c.estado" class="input-field" placeholder="Por ejemplo, abierta" />
            </div>
            <label class="flex items-center gap-3 self-end min-h-tactil cursor-pointer">
              <input v-model="c.activa" type="checkbox" class="h-5 w-5 accent-brand-900" />
              <span class="text-sm text-surface-900">Visible para los estudiantes</span>
            </label>
            <div class="sm:col-span-2">
              <button type="submit" class="btn-primary">Guardar</button>
            </div>
          </form>
        </li>
      </ul>
      <button type="button" class="btn-secondary mt-4" @click="nueva"><AppIcon name="plus" :size="16" /> Añadir convocatoria</button>
    </template>
  </div>
</template>
