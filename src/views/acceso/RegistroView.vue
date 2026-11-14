<script setup lang="ts">
// Registro con el código que da el tutor/a o la coordinación. Pasa por el
// servidor de SINTONÍA, que limita los intentos y no revela si un código
// existe (ver servidor/acceso-publico.ts).
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { enviarAlServidor } from '@/lib/servidor'
import { useTerminos } from '@/lib/terminos'
import LayoutAcceso from '@/components/layout/LayoutAcceso.vue'
import AppIcon from '@/components/comun/AppIcon.vue'
import AvisoError from '@/components/comun/AvisoError.vue'
import CampoTrampa from '@/components/comun/CampoTrampa.vue'

const { t } = useTerminos()
const codigo = ref('')
const nombre = ref('')
const email = ref('')
const sitio = ref('')
const enviando = ref(false)
const enviado = ref(false)
const error = ref('')

async function registrarse() {
  error.value = ''
  enviando.value = true
  const r = await enviarAlServidor('registro', {
    codigo: codigo.value,
    nombre: nombre.value,
    email: email.value,
    sitio: sitio.value,
  })
  enviando.value = false
  if (!r.ok) {
    error.value = r.error ?? 'No hemos podido completar el registro.'
    return
  }
  enviado.value = true
}
</script>

<template>
  <LayoutAcceso>
    <template v-if="!enviado">
      <h1 class="titulo-pagina mb-2">Crear tu cuenta</h1>
      <p class="texto-suave mb-8">Necesitas el código que te ha dado tu tutor/a o la coordinación del máster.</p>

      <AvisoError v-if="error" :mensaje="error" class="mb-6" />

      <form class="space-y-5" @submit.prevent="registrarse">
        <div>
          <label for="codigo" class="label">Código de acceso</label>
          <input
            id="codigo"
            v-model="codigo"
            type="text"
            required
            autocomplete="off"
            autocapitalize="characters"
            spellcheck="false"
            maxlength="16"
            class="input-field uppercase tracking-widest font-medium"
            placeholder="Por ejemplo, K7QM2XRAP4TN"
          />
        </div>
        <div>
          <label for="nombre" class="label">Tu nombre</label>
          <input id="nombre" v-model="nombre" type="text" required maxlength="120" autocomplete="name" class="input-field" />
          <p class="text-xs texto-suave mt-1.5">{{ t('Solo lo verá tu tutor/a, para saber a quién responde.') }}</p>
        </div>
        <div>
          <label for="email" class="label">Correo institucional</label>
          <input id="email" v-model="email" type="email" required autocomplete="email" class="input-field" placeholder="nombre@usal.es" aria-describedby="ayuda-email" />
          <p id="ayuda-email" class="text-xs texto-suave mt-1.5">Usa tu correo de la Universidad. Te enviaremos un enlace para terminar.</p>
        </div>
        <CampoTrampa v-model="sitio" />
        <button type="submit" :disabled="enviando" class="btn-primary w-full py-3.5">
          {{ enviando ? 'Comprobando...' : 'Continuar' }}
        </button>
      </form>

      <p class="mt-8 text-center text-sm texto-suave">
        ¿Ya tienes cuenta?
        <RouterLink to="/acceso" class="enlace">Inicia sesión</RouterLink>
      </p>
    </template>

    <div v-else class="text-center" role="status">
      <div class="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4 slide-up">
        <AppIcon name="mail" :size="30" class="text-surface-900" />
      </div>
      <h1 class="titulo-pagina mb-2">Revisa tu correo</h1>
      <p class="texto-suave">
        Te hemos enviado un enlace a <strong class="text-surface-900">{{ email.trim().toLowerCase() }}</strong> para terminar el registro.
        Caduca en poco tiempo y solo sirve una vez.
      </p>
    </div>

    <RouterLink to="/" class="block mt-8 text-center text-sm enlace">Volver al inicio</RouterLink>
  </LayoutAcceso>
</template>
