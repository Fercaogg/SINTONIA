<script setup lang="ts">
// Iniciar sesión con un enlace enviado al correo (sin contraseña).
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { supabase, entornoLocal, modoDemo } from '@/lib/supabase'
import { useSesion } from '@/stores/sesion'
import { INICIO_ROL } from '@/lib/tipos'
import { destinoTrasEntrar } from '@/lib/volver'
import LayoutAcceso from '@/components/layout/LayoutAcceso.vue'
import AppIcon from '@/components/comun/AppIcon.vue'
import AvisoError from '@/components/comun/AvisoError.vue'
import AccesosDemo from '@/components/comun/AccesosDemo.vue'
import CampoTrampa from '@/components/comun/CampoTrampa.vue'
import { enviarAlServidor } from '@/lib/servidor'

const router = useRouter()
// Llega aquí porque su sesión ha caducado o se cerró en otro sitio (src/lib/vigilar-sesion.ts).
const sesionTerminada = useRoute().query.motivo === 'sesion'
const sesion = useSesion()

const email = ref('')
const enviando = ref(false)
const enviado = ref(false)
const error = ref('')

// Solo en el entorno local o en la demostración: acceso con contraseña.
const contrasena = ref('')
const usarContrasena = ref(false)

// Pasa por el servidor de SINTONÍA, que limita los intentos y responde igual
// exista o no una cuenta con ese correo.
const sitio = ref('')
async function enviarEnlace() {
  error.value = ''
  enviando.value = true
  const r = await enviarAlServidor('acceso', { email: email.value, sitio: sitio.value })
  enviando.value = false
  if (!r.ok) {
    error.value = r.error ?? 'No hemos podido enviar el enlace. Inténtalo de nuevo en unos minutos.'
    return
  }
  enviado.value = true
}

async function entrarConContrasena() {
  error.value = ''
  enviando.value = true
  const { error: e } = await supabase.auth.signInWithPassword({ email: email.value.trim(), password: contrasena.value })
  enviando.value = false
  if (e) {
    error.value = 'El correo o la contraseña no son correctos.'
    return
  }
  await sesion.cargar(true)
  router.push(destinoTrasEntrar(sesion.rol ? INICIO_ROL[sesion.rol] : null))
}
</script>

<template>
  <LayoutAcceso>
    <AccesosDemo v-if="modoDemo" class="mb-8" />
    <template v-if="!enviado">
      <h1 class="titulo-pagina mb-2">Iniciar sesión</h1>
      <p class="texto-suave mb-8">Te enviaremos un enlace a tu correo para entrar. No necesitas contraseña.</p>

      <div v-if="sesionTerminada" class="p-4 mb-6 text-sm flex items-start gap-3 rounded-xl border bg-brand-50 border-brand-200 text-surface-900" role="status">
        <AppIcon name="clock" :size="18" class="flex-shrink-0 mt-0.5" />
        <span>Tu sesión ha terminado. Vuelve a entrar y seguirás donde lo dejaste.</span>
      </div>
      <AvisoError v-if="error" :mensaje="error" class="mb-6" />

      <form class="space-y-5" @submit.prevent="usarContrasena ? entrarConContrasena() : enviarEnlace()">
        <div>
          <label for="email" class="label">Correo institucional</label>
          <input id="email" v-model="email" type="email" required autocomplete="email" class="input-field" placeholder="nombre@usal.es" />
        </div>
        <div v-if="usarContrasena">
          <label for="contrasena" class="label">Contraseña</label>
          <input id="contrasena" v-model="contrasena" type="password" required autocomplete="current-password" class="input-field" />
        </div>
        <CampoTrampa v-if="!usarContrasena" v-model="sitio" />
        <button type="submit" :disabled="enviando" class="btn-primary w-full py-3.5">
          <template v-if="enviando">Enviando...</template>
          <template v-else-if="usarContrasena">Entrar</template>
          <template v-else>Enviarme el enlace</template>
        </button>
      </form>

      <button
        v-if="entornoLocal || modoDemo"
        type="button"
        class="mt-4 text-sm enlace"
        @click="usarContrasena = !usarContrasena"
      >
        {{ usarContrasena ? 'Usar enlace por correo' : 'Entrar con contraseña (solo entorno de pruebas)' }}
      </button>

      <p v-if="!modoDemo" class="mt-8 text-center text-sm texto-suave">
        ¿Es tu primera vez?
        <RouterLink to="/registro" class="enlace">Regístrate con tu código</RouterLink>
      </p>
    </template>

    <div v-else class="text-center" role="status">
      <div class="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4 slide-up">
        <AppIcon name="mail" :size="30" class="text-surface-900" />
      </div>
      <h1 class="titulo-pagina mb-2">Revisa tu correo</h1>
      <p class="texto-suave">
        Si hay una cuenta con <strong class="text-surface-900">{{ email.trim().toLowerCase() }}</strong>, te llegará un enlace para entrar.
        Caduca en poco tiempo y solo sirve una vez. Puedes abrirlo desde este dispositivo o desde cualquier otro.
      </p>
      <p class="text-sm texto-suave mt-6">
        ¿No llega? Mira en la carpeta de correo no deseado o
        <button type="button" class="enlace" @click="enviado = false">vuelve a intentarlo</button>.
      </p>
    </div>

    <RouterLink to="/" class="block mt-8 text-center text-sm enlace">Volver al inicio</RouterLink>
  </LayoutAcceso>
</template>
