<script setup lang="ts">
// Consentimiento informado, versionado. Hay que aceptarlo antes de participar.
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { llamar, mensajeDeError } from '@/lib/api'
import { useSesion } from '@/stores/sesion'
import { INICIO_ROL } from '@/lib/tipos'
import LayoutAcceso from '@/components/layout/LayoutAcceso.vue'
import EstadoCarga from '@/components/comun/EstadoCarga.vue'
import AvisoError from '@/components/comun/AvisoError.vue'
import Pendiente from '@/components/comun/Pendiente.vue'

const router = useRouter()
const sesion = useSesion()

const consentimiento = ref<{ version: number; texto: string } | null>(null)
const cargando = ref(true)
const marcado = ref(false)
const enviando = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    consentimiento.value = await llamar('consentimiento_vigente')
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    cargando.value = false
  }
})

async function aceptar() {
  if (!consentimiento.value) return
  enviando.value = true
  error.value = ''
  try {
    await llamar('aceptar_consentimiento', { p_version: consentimiento.value.version })
    await sesion.cargar(true)
    router.replace(sesion.rol ? INICIO_ROL[sesion.rol] : '/')
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <LayoutAcceso>
    <h1 class="titulo-pagina mb-2">Consentimiento informado</h1>
    <p class="texto-suave mb-6">
      SINTONÍA forma parte de un estudio de la Universidad de Salamanca. Antes de empezar, lee el texto y decide si quieres participar.
    </p>

    <EstadoCarga v-if="cargando" />
    <template v-else>
      <AvisoError v-if="error" :mensaje="error" class="mb-6" />

      <div v-if="consentimiento" class="card p-5 mb-6 max-h-80 overflow-y-auto" tabindex="0" aria-label="Texto del consentimiento">
        <p class="text-xs texto-suave mb-3">Versión {{ consentimiento.version }}</p>
        <div class="text-sm leading-relaxed whitespace-pre-line"><Pendiente :texto="consentimiento.texto" /></div>
      </div>

      <form @submit.prevent="aceptar">
        <label class="flex items-start gap-3 mb-6 cursor-pointer">
          <input v-model="marcado" type="checkbox" class="mt-1 h-5 w-5 accent-brand-900" required />
          <span class="text-sm">He leído el texto y acepto participar. Sé que puedo retirarme cuando quiera y pedir que se borren mis datos.</span>
        </label>
        <button type="submit" class="btn-primary w-full py-3.5" :disabled="!marcado || enviando">
          {{ enviando ? 'Guardando...' : 'Aceptar y continuar' }}
        </button>
      </form>

      <p class="mt-6 text-sm texto-suave text-center">
        <RouterLink to="/como-funciona" class="enlace">Cómo funciona SINTONÍA y qué pasa con tus datos</RouterLink>
      </p>
    </template>
  </LayoutAcceso>
</template>
