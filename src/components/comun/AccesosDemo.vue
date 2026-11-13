<script setup lang="ts">
// Accesos rápidos de la demostración: entrar con un clic como cada perfil.
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { ACCESOS_DEMO, CONTRASENA_DEMO, accesosDisponibles, comprobarModoServidor } from '@/lib/demo'
import { useSesion } from '@/stores/sesion'
import { INICIO_ROL } from '@/lib/tipos'
import AppIcon from './AppIcon.vue'
import AvisoError from './AvisoError.vue'

const ICONOS = { estudiante: 'person', tutor: 'users', direccion: 'chart', investigador: 'flask' } as const

const router = useRouter()
const sesion = useSesion()
const listo = ref(false)
const entrando = ref('')
const error = ref('')

onMounted(async () => {
  await comprobarModoServidor()
  listo.value = true
})

async function entrar(email: string) {
  entrando.value = email
  error.value = ''
  await supabase.auth.signOut()
  const { error: e } = await supabase.auth.signInWithPassword({ email, password: CONTRASENA_DEMO })
  entrando.value = ''
  if (e) {
    error.value = 'No se ha podido entrar en la demostración. Puede que haya que volver a generarla.'
    return
  }
  await sesion.cargar(true)
  router.push(sesion.rol ? INICIO_ROL[sesion.rol] : '/')
}
</script>

<template>
  <section v-if="listo && accesosDisponibles()" class="card p-5 sm:p-6" aria-labelledby="t-demo">
    <h2 id="t-demo" class="font-semibold text-surface-900">Entrar en la demostración</h2>
    <p class="text-sm texto-suave mt-1 mb-4">Elige un perfil. Todos los datos y nombres son ficticios.</p>
    <AvisoError v-if="error" :mensaje="error" class="mb-4" />
    <ul class="grid gap-3 sm:grid-cols-2">
      <li v-for="a in ACCESOS_DEMO" :key="a.rol">
        <button
          type="button"
          class="w-full text-left p-4 rounded-xl border-2 border-surface-200 hover:border-brand-900 hover:bg-brand-50 transition-all flex items-start gap-3 min-h-tactil"
          :disabled="!!entrando"
          @click="entrar(a.email)"
        >
          <AppIcon :name="ICONOS[a.rol]" :size="22" class="text-surface-900 shrink-0 mt-0.5" />
          <span>
            <span class="block font-semibold text-surface-900">{{ entrando === a.email ? 'Entrando...' : a.etiqueta }}</span>
            <span class="block text-sm texto-suave">{{ a.descripcion }}</span>
          </span>
        </button>
      </li>
    </ul>
  </section>
</template>
