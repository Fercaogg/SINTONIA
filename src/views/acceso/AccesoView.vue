<script setup lang="ts">
// Iniciar sesión con un enlace enviado al correo (sin contraseña).
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { supabase, entornoLocal, modoDemo } from '@/lib/supabase'
import { useSesion } from '@/stores/sesion'
import { INICIO_ROL } from '@/lib/tipos'
import LayoutAcceso from '@/components/layout/LayoutAcceso.vue'
import AppIcon from '@/components/comun/AppIcon.vue'
import AvisoError from '@/components/comun/AvisoError.vue'
import AccesosDemo from '@/components/comun/AccesosDemo.vue'

const router = useRouter()
const sesion = useSesion()

const email = ref('')
const enviando = ref(false)
const enviado = ref(false)
const error = ref('')

// Solo en el entorno local o en la demostración: acceso con contraseña.
const contrasena = ref('')
const usarContrasena = ref(false)

async function enviarEnlace() {
  error.value = ''
  enviando.value = true
  const { error: e } = await supabase.auth.signInWithOtp({
    email: email.value.trim(),
    options: { shouldCreateUser: false },
  })
  enviando.value = false
  if (e) {
    error.value = /signups not allowed|not found/i.test(e.message)
      ? 'No encontramos una cuenta con ese correo. Si es tu primera vez, regístrate con tu código.'
      : 'No hemos podido enviar el enlace. Inténtalo de nuevo en unos minutos.'
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
  router.push(sesion.rol ? INICIO_ROL[sesion.rol] : '/')
}
</script>

<template>
  <LayoutAcceso>
    <AccesosDemo v-if="modoDemo" class="mb-8" />
    <template v-if="!enviado">
      <h1 class="titulo-pagina mb-2">Iniciar sesión</h1>
      <p class="texto-suave mb-8">Te enviaremos un enlace a tu correo para entrar. No necesitas contraseña.</p>

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
        Te hemos enviado un enlace a <strong class="text-surface-900">{{ email }}</strong>.
        Ábrelo desde este dispositivo o desde cualquier otro.
      </p>
      <p class="text-sm texto-suave mt-6">
        ¿No llega? Mira en la carpeta de correo no deseado o
        <button type="button" class="enlace" @click="enviado = false">vuelve a intentarlo</button>.
      </p>
    </div>

    <RouterLink to="/" class="block mt-8 text-center text-sm enlace">Volver al inicio</RouterLink>
  </LayoutAcceso>
</template>
