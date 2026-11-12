<script setup lang="ts">
// Investigación: calendario del estudio (zona horaria Europe/Madrid).
import { onMounted, ref } from 'vue'
import { llamar, mensajeDeError } from '@/lib/api'
import { desdeApertura, hastaCierre } from '@/lib/fechas'
import type { Calendario } from '@/lib/tipos-checkin'
import AvisoError from '@/components/comun/AvisoError.vue'
import EstadoCarga from '@/components/comun/EstadoCarga.vue'

interface Estudio {
  fecha_inicio: string | null
  semanas: number
  dia_apertura: number
  dia_cierre: number
  zona_horaria: string
  estado: Calendario
  ventanas: { semana: number; abre: string; cierra: string }[]
}

const DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']

const estudio = ref<Estudio | null>(null)
const form = ref({ fecha_inicio: '', semanas: 10, dia_apertura: 1, dia_cierre: 7 })
const cargando = ref(true)
const guardando = ref(false)
const error = ref('')
const aviso = ref('')

function rellenar(e: Estudio) {
  estudio.value = e
  form.value = { fecha_inicio: e.fecha_inicio ?? '', semanas: e.semanas, dia_apertura: e.dia_apertura, dia_cierre: e.dia_cierre }
}

onMounted(async () => {
  try {
    rellenar(await llamar<Estudio>('ver_estudio'))
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    cargando.value = false
  }
})

async function guardar() {
  guardando.value = true
  error.value = ''
  aviso.value = ''
  try {
    rellenar(await llamar<Estudio>('configurar_estudio', {
      p_fecha_inicio: form.value.fecha_inicio || null,
      p_semanas: form.value.semanas,
      p_dia_apertura: form.value.dia_apertura,
      p_dia_cierre: form.value.dia_cierre,
    }))
    aviso.value = 'Calendario guardado.'
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <div class="fade-in max-w-3xl">
    <h1 class="titulo-pagina">Calendario del estudio</h1>
    <p class="texto-suave mt-1 mb-8">Las fechas y horas son de Madrid. El check-in de cada semana abre a las 00:00 del día de apertura y cierra a las 23:59 del día de cierre.</p>

    <EstadoCarga v-if="cargando" />
    <template v-else>
      <AvisoError v-if="error" :mensaje="error" class="mb-6" />
      <p v-if="aviso" class="aviso-exito mb-6" role="status">{{ aviso }}</p>

      <form class="card p-5 sm:p-6 grid gap-4 sm:grid-cols-2" @submit.prevent="guardar">
        <div>
          <label for="f-inicio" class="label">Inicio de la semana 1</label>
          <input id="f-inicio" v-model="form.fecha_inicio" type="date" class="input-field" />
          <p class="text-xs texto-suave mt-1.5">Déjalo vacío mientras no esté decidido.</p>
        </div>
        <div>
          <label for="f-semanas" class="label">Duración (semanas)</label>
          <input id="f-semanas" v-model.number="form.semanas" type="number" min="1" max="52" class="input-field" />
        </div>
        <div>
          <label for="f-abre" class="label">Día de apertura</label>
          <select id="f-abre" v-model.number="form.dia_apertura" class="input-field">
            <option v-for="(d, i) in DIAS" :key="d" :value="i + 1">{{ d }}</option>
          </select>
        </div>
        <div>
          <label for="f-cierra" class="label">Día de cierre</label>
          <select id="f-cierra" v-model.number="form.dia_cierre" class="input-field">
            <option v-for="(d, i) in DIAS" :key="d" :value="i + 1">{{ d }}</option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <button type="submit" class="btn-primary" :disabled="guardando">{{ guardando ? 'Guardando...' : 'Guardar calendario' }}</button>
        </div>
      </form>

      <section v-if="estudio?.ventanas.length" class="card p-5 sm:p-6 mt-6" aria-labelledby="t-vent">
        <h2 id="t-vent" class="font-semibold text-surface-900 mb-4">Semanas</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <caption class="sr-only">Apertura y cierre de cada semana</caption>
            <thead class="text-surface-800">
              <tr class="border-b border-surface-200">
                <th scope="col" class="py-2 pr-3 font-semibold">Semana</th>
                <th scope="col" class="py-2 pr-3 font-semibold">Abre</th>
                <th scope="col" class="py-2 font-semibold">Cierra</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="v in estudio.ventanas"
                :key="v.semana"
                class="border-b border-surface-200 last:border-0"
                :class="{ 'bg-brand-50 font-medium': estudio.estado.estado === 'abierta' && estudio.estado.semana === v.semana }"
              >
                <td class="py-2 pr-3">{{ v.semana }}</td>
                <td class="py-2 pr-3">{{ desdeApertura(v.abre) }}</td>
                <td class="py-2">{{ hastaCierre(v.cierra) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>
