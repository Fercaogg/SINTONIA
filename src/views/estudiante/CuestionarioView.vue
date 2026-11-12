<script setup lang="ts">
// Cuestionario inicial (pretest) o final (postest). Todas las respuestas se
// envían con un único botón y se pueden cambiar mientras esté abierto.
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { llamar, mensajeDeError } from '@/lib/api'
import AppIcon from '@/components/comun/AppIcon.vue'
import AvisoError from '@/components/comun/AvisoError.vue'
import EstadoCarga from '@/components/comun/EstadoCarga.vue'
import EstadoVacio from '@/components/comun/EstadoVacio.vue'
import Pendiente from '@/components/comun/Pendiente.vue'
import EscalaTactil from '@/components/checkin/EscalaTactil.vue'

interface ItemCuestionario {
  id: number
  bloque: string
  texto: string
  tipo: 'escala' | 'si_no' | 'opcion'
  minimo: number | null
  maximo: number | null
  ancla_min: string | null
  ancla_max: string | null
  opciones: string[] | null
  obligatorio: boolean
  pendiente: boolean
  respuesta: number | boolean | string | null
}

interface Cuestionario {
  clave: string
  titulo: string
  instrucciones: string
  abierto: boolean
  items: ItemCuestionario[]
}

const route = useRoute()
const datos = ref<Cuestionario | null>(null)
const respuestas = ref<Record<number, number | boolean | string | null>>({})
const cargando = ref(true)
const enviando = ref(false)
const guardado = ref(false)
const error = ref('')

const bloques = computed(() => {
  const mapa = new Map<string, ItemCuestionario[]>()
  for (const i of datos.value?.items ?? []) mapa.set(i.bloque, [...(mapa.get(i.bloque) ?? []), i])
  return [...mapa.entries()]
})
const faltan = computed(() => (datos.value?.items ?? []).filter((i) => i.obligatorio && respuestas.value[i.id] == null).length)

onMounted(async () => {
  try {
    datos.value = await llamar<Cuestionario>('ver_cuestionario', { p_clave: String(route.params.clave) })
    for (const i of datos.value.items) respuestas.value[i.id] = i.respuesta
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    cargando.value = false
  }
})

async function enviar() {
  if (!datos.value || faltan.value > 0) return
  enviando.value = true
  error.value = ''
  try {
    await llamar('responder_cuestionario', { p_clave: datos.value.clave, p_respuestas: respuestas.value })
    guardado.value = true
    window.scrollTo({ top: 0 })
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto fade-in">
    <EstadoCarga v-if="cargando" />
    <AvisoError v-else-if="!datos" :mensaje="error" />
    <EstadoVacio
      v-else-if="!datos.abierto"
      icono="document"
      :titulo="`${datos.titulo}: no está abierto`"
      texto="Te avisaremos cuando puedas responderlo."
    />

    <div v-else-if="guardado" class="text-center pt-8">
      <div class="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4 slide-up">
        <AppIcon name="check" :size="32" class="text-surface-900" />
      </div>
      <h1 class="titulo-pagina mb-2">Respuestas guardadas</h1>
      <p class="texto-suave">Gracias. Puedes cambiarlas mientras el cuestionario esté abierto.</p>
      <RouterLink to="/estudiante" class="btn-primary mt-8">Volver al inicio</RouterLink>
    </div>

    <form v-else novalidate @submit.prevent="enviar">
      <h1 class="titulo-pagina">{{ datos.titulo }}</h1>
      <p class="texto-suave mt-2 mb-6 text-sm leading-relaxed"><Pendiente :texto="datos.instrucciones" /></p>

      <AvisoError v-if="error" :mensaje="error" class="mb-6" />

      <div v-for="[bloque, items] in bloques" :key="bloque" class="mb-6">
        <h2 class="text-xs font-medium uppercase tracking-wider texto-suave mb-3">{{ bloque }}</h2>
        <div class="space-y-4">
          <section v-for="item in items" :key="item.id" class="card p-5">
            <p :id="`c-${item.id}`" class="font-display text-lg font-semibold text-surface-900 leading-snug mb-4">
              <Pendiente :texto="item.texto" />
            </p>

            <EscalaTactil
              v-if="item.tipo === 'escala'"
              v-model="respuestas[item.id] as number | null"
              :etiqueta-id="`c-${item.id}`"
              :ancla-min="item.ancla_min ?? ''"
              :ancla-max="item.ancla_max ?? ''"
            />

            <div v-else-if="item.tipo === 'si_no'" role="radiogroup" :aria-labelledby="`c-${item.id}`" class="flex gap-3">
              <button
                v-for="op in [{ v: true, t: 'Sí' }, { v: false, t: 'No' }]"
                :key="op.t"
                type="button"
                role="radio"
                :aria-checked="respuestas[item.id] === op.v"
                class="flex-1 min-h-tactil rounded-2xl border-2 font-semibold transition-all"
                :class="respuestas[item.id] === op.v ? 'border-brand-900 bg-brand-50 text-surface-900' : 'border-surface-300 bg-white text-surface-800'"
                @click="respuestas[item.id] = op.v"
              >
                {{ op.t }}
              </button>
            </div>

            <fieldset v-else class="space-y-2">
              <legend class="sr-only"><Pendiente :texto="item.texto" /></legend>
              <label
                v-for="op in item.opciones ?? []"
                :key="op"
                class="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer min-h-tactil"
                :class="respuestas[item.id] === op ? 'border-brand-900 bg-brand-50' : 'border-surface-200'"
              >
                <input v-model="respuestas[item.id]" type="radio" :name="`c-${item.id}`" :value="op" class="h-5 w-5 accent-brand-900" />
                <span class="text-surface-900"><Pendiente :texto="op" /></span>
              </label>
            </fieldset>
          </section>
        </div>
      </div>

      <div class="mb-10">
        <button type="submit" class="btn-primary w-full py-3.5" :disabled="faltan > 0 || enviando">
          {{ enviando ? 'Enviando...' : 'Enviar' }}
        </button>
        <p v-if="faltan > 0" class="text-sm texto-suave text-center mt-2" aria-live="polite">
          {{ faltan === 1 ? 'Falta 1 pregunta' : `Faltan ${faltan} preguntas` }}
        </p>
      </div>
    </form>
  </div>
</template>
