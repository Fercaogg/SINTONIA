<script setup lang="ts">
// Registro con el código que da el tutor/a o la coordinación.
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { llamar, mensajeDeError } from '@/lib/api'
import { NOMBRE_ROL, type Rol } from '@/lib/tipos'
import LayoutAcceso from '@/components/layout/LayoutAcceso.vue'
import AppIcon from '@/components/comun/AppIcon.vue'
import AvisoError from '@/components/comun/AvisoError.vue'

const codigo = ref('')
const nombre = ref('')
const email = ref('')
const enviando = ref(false)
const enviado = ref(false)
const error = ref('')
const rolDelCodigo = ref<Rol | null>(null)

const codigoLimpio = computed(() => codigo.value.trim().toUpperCase())

const MOTIVOS: Record<string, string> = {
  CODIGO_NO_VALIDO: 'El código no es válido o ya se ha usado. Revísalo o pide uno nuevo a tu tutor/a o a la coordinación.',
  DOMINIO_NO_PERMITIDO: 'Usa tu correo institucional de la Universidad.',
}

async function registrarse() {
  error.value = ''
  enviando.value = true
  try {
    const comprobacion = await llamar<{ valido: boolean; motivo?: string; rol?: Rol }>('comprobar_codigo', {
      p_codigo: codigoLimpio.value,
      p_email: email.value.trim(),
    })
    if (!comprobacion.valido) {
      error.value = MOTIVOS[comprobacion.motivo ?? ''] ?? MOTIVOS.CODIGO_NO_VALIDO
      return
    }
    rolDelCodigo.value = comprobacion.rol ?? null
    const { error: e } = await supabase.auth.signInWithOtp({
      email: email.value.trim(),
      options: {
        shouldCreateUser: true,
        data: { codigo: codigoLimpio.value, nombre: nombre.value.trim() },
      },
    })
    if (e) {
      error.value = 'No hemos podido completar el registro. Si ya tienes cuenta, inicia sesión.'
      return
    }
    enviado.value = true
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    enviando.value = false
  }
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
            maxlength="12"
            class="input-field uppercase tracking-widest font-medium"
            placeholder="Por ejemplo, K7QM2XRA"
          />
        </div>
        <div>
          <label for="nombre" class="label">Tu nombre</label>
          <input id="nombre" v-model="nombre" type="text" required maxlength="120" autocomplete="name" class="input-field" />
          <p class="text-xs texto-suave mt-1.5">Solo lo verá tu tutor/a, para saber a quién responde.</p>
        </div>
        <div>
          <label for="email" class="label">Correo institucional</label>
          <input id="email" v-model="email" type="email" required autocomplete="email" class="input-field" placeholder="nombre@usal.es" />
        </div>
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
        Te hemos enviado un enlace a <strong class="text-surface-900">{{ email }}</strong> para terminar el registro
        <template v-if="rolDelCodigo"> como {{ NOMBRE_ROL[rolDelCodigo].toLowerCase() }}</template>.
      </p>
    </div>

    <RouterLink to="/" class="block mt-8 text-center text-sm enlace">Volver al inicio</RouterLink>
  </LayoutAcceso>
</template>
