<script setup lang="ts">
// "Necesito apoyo": solo se avisa a la dirección si el estudiante lo pide.
// El nombre solo viaja si el estudiante lo autoriza en ese momento.
import { onMounted, ref } from 'vue'
import { llamar, mensajeDeError } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { fechaCorta } from '@/lib/fechas'
import AppIcon from '@/components/comun/AppIcon.vue'
import AvisoError from '@/components/comun/AvisoError.vue'

const compartirNombre = ref(false)
const enviando = ref(false)
const enviado = ref(false)
const error = ref('')
const anteriores = ref<{ created_at: string; nombre_compartido: boolean; atendido: boolean }[]>([])

async function cargar() {
  try {
    anteriores.value = await llamar('mis_avisos_apoyo')
  } catch {
    anteriores.value = []
  }
}

onMounted(cargar)

// Pide al servidor que avise ya por correo a la dirección. Si falla, el aviso
// se envía igualmente en la tarea diaria y siempre aparece en su panel.
async function avisarPorCorreo() {
  try {
    const { data } = await supabase.auth.getSession()
    await fetch('/api/notificar-apoyo', { method: 'POST', headers: { Authorization: `Bearer ${data.session?.access_token ?? ''}` } })
  } catch {
    // Sin consecuencias: queda pendiente para la tarea diaria.
  }
}

async function enviar() {
  enviando.value = true
  error.value = ''
  try {
    await llamar('pedir_apoyo', { p_compartir_nombre: compartirNombre.value })
    enviado.value = true
    avisarPorCorreo()
    await cargar()
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="fade-in max-w-2xl">
    <h1 class="titulo-pagina">Necesito apoyo</h1>
    <p class="texto-suave mt-1 mb-8">Puedes avisar a la dirección del máster de que necesitas apoyo. Solo se envía si pulsas el botón.</p>

    <div class="card p-6 mb-6 bg-brand-50 border-brand-200">
      <div class="flex items-start gap-4">
        <div class="w-11 h-11 rounded-xl bg-papel flex items-center justify-center flex-shrink-0">
          <AppIcon name="heart" :size="22" class="text-surface-900" />
        </div>
        <div>
          <h2 class="font-semibold text-surface-900">Pedir apoyo es una forma de cuidarte</h2>
          <p class="text-sm texto-suave mt-1 leading-relaxed">
            Este aviso no es un canal de emergencias. Ni tus respuestas del check-in ni tu bienestar se envían con él.
          </p>
        </div>
      </div>
    </div>

    <div v-if="enviado" class="aviso-exito mb-6" role="status">
      <AppIcon name="check" :size="18" class="shrink-0 mt-0.5" />
      <span>
        Aviso enviado a la dirección del máster.
        <template v-if="!compartirNombre">
          Como no has compartido tu nombre, no podrán escribirte directamente.
          <button type="button" class="enlace" :disabled="enviando" @click="compartirNombre = true; enviar()">Compartir también mi nombre</button>
        </template>
      </span>
    </div>

    <form v-else class="card p-6 mb-6" @submit.prevent="enviar">
      <AvisoError v-if="error" :mensaje="error" class="mb-4" />
      <label class="flex items-start gap-3 cursor-pointer mb-2">
        <input v-model="compartirNombre" type="checkbox" class="mt-1 h-5 w-5 accent-brand-900" />
        <span>
          <span class="font-medium text-surface-900">Compartir mi nombre con la dirección</span>
          <span class="block text-sm texto-suave mt-0.5">
            Si no lo marcas, sabrán que alguien de su máster pide apoyo, pero no quién.
          </span>
        </span>
      </label>
      <button type="submit" class="btn-primary mt-4" :disabled="enviando">
        {{ enviando ? 'Enviando...' : 'Enviar aviso a la dirección' }}
      </button>
    </form>

    <section v-if="anteriores.length" class="mb-6" aria-labelledby="t-ant">
      <h2 id="t-ant" class="font-semibold text-surface-900 mb-3">Tus avisos</h2>
      <ul class="space-y-2">
        <li v-for="a in anteriores" :key="a.created_at" class="card p-4 text-sm flex justify-between gap-3">
          <span>{{ fechaCorta(a.created_at) }} · {{ a.nombre_compartido ? 'con tu nombre' : 'sin tu nombre' }}</span>
          <span class="texto-suave">{{ a.atendido ? 'Atendido' : 'Pendiente' }}</span>
        </li>
      </ul>
    </section>

    <p class="text-sm texto-suave leading-relaxed">
      Si estás en una situación de crisis o de riesgo, llama al 024 (línea de atención a la conducta suicida, gratuita y disponible
      a cualquier hora) o al 112.
    </p>
  </div>
</template>
