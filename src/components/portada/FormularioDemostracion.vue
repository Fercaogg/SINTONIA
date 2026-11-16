<script setup lang="ts">
// "Solicitar una demostración" (/instituciones). Usa la función de contacto
// del servidor (api/contacto, tipo "demostracion"): campo trampa contra los
// programas automáticos y límite de envíos. Si el servidor no puede enviar
// correos, se ofrece escribir directamente con el mensaje ya preparado.
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { enviarAlServidor, errorEnIngles } from '@/lib/servidor'
import { useIdioma } from '@/lib/idioma'
import AvisoError from '@/components/comun/AvisoError.vue'
import CampoTrampa from '@/components/comun/CampoTrampa.vue'
import EscribirPorCorreo from '@/components/comun/EscribirPorCorreo.vue'

const { t, idioma } = useIdioma()
const nombre = ref('')
const email = ref('')
const institucion = ref('')
const cargo = ref('')
const mensaje = ref('')
const sitio = ref('')
const enviando = ref(false)
const enviado = ref(false)
const error = ref('')
const sinCorreo = ref(false)

async function enviar() {
  error.value = ''
  sinCorreo.value = false
  enviando.value = true
  const r = await enviarAlServidor('contacto', {
    tipo: 'demostracion',
    nombre: nombre.value,
    email: email.value,
    institucion: institucion.value,
    cargo: cargo.value,
    mensaje: mensaje.value,
    sitio: sitio.value,
  })
  enviando.value = false
  if (!r.ok) {
    if (r.status === 503) sinCorreo.value = true
    else error.value = idioma.value === 'en' ? errorEnIngles(r.status) : (r.error ?? 'No hemos podido enviar la solicitud.')
    return
  }
  enviado.value = true
}

const cuerpoCorreo = computed(
  () =>
    idioma.value === 'en'
      ? `Hello,\n\nI would like to see a demo of SINTONÍA.\n\nInstitution: ${institucion.value}\nRole: ${cargo.value || 'Not given'}\n\n${mensaje.value}\n\n${nombre.value}`
      : `Hola:\n\nMe gustaría ver una demostración de SINTONÍA.\n\nInstitución: ${institucion.value}\nCargo: ${cargo.value || 'No indicado'}\n\n${mensaje.value}\n\n${nombre.value}`,
)
</script>

<template>
  <div>
    <p v-if="enviado" class="aviso-exito" role="status">
      {{ t('Solicitud enviada. Te escribiremos a', 'Request sent. We will write to') }} {{ email.trim() }} {{ t('para buscar un momento que os venga bien.', 'to find a time that suits you.') }}
    </p>
    <form v-else class="space-y-4" @submit.prevent="enviar">
      <AvisoError v-if="error" :mensaje="error" />
      <EscribirPorCorreo v-if="sinCorreo" :asunto="t('SINTONÍA: solicitud de demostración', 'SINTONÍA: demo request')" :cuerpo="cuerpoCorreo" />
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="d-nombre" class="label">{{ t('Nombre', 'Name') }}</label>
          <input id="d-nombre" v-model="nombre" required maxlength="120" autocomplete="name" class="input-field" />
        </div>
        <div>
          <label for="d-email" class="label">{{ t('Correo', 'Email') }}</label>
          <input id="d-email" v-model="email" type="email" required maxlength="254" autocomplete="email" class="input-field" />
        </div>
        <div>
          <label for="d-inst" class="label">{{ t('Máster, programa o institución', 'Programme or institution') }}</label>
          <input id="d-inst" v-model="institucion" required minlength="2" maxlength="200" autocomplete="organization" class="input-field" />
        </div>
        <div>
          <label for="d-cargo" class="label">{{ t('Cargo', 'Role') }} <span class="font-normal texto-suave">{{ t('(opcional)', '(optional)') }}</span></label>
          <input id="d-cargo" v-model="cargo" maxlength="120" autocomplete="organization-title" class="input-field" />
        </div>
      </div>
      <div>
        <label for="d-mensaje" class="label">{{ t('Qué te gustaría ver', 'What you would like to see') }} <span class="font-normal texto-suave">{{ t('(opcional)', '(optional)') }}</span></label>
        <textarea id="d-mensaje" v-model="mensaje" maxlength="3000" rows="4" class="input-field" />
      </div>
      <CampoTrampa v-model="sitio" />
      <p class="text-sm texto-suave">
        {{ t('Usaremos estos datos solo para organizar la demostración y responderte. Llegan por correo electrónico y no se guardan en SINTONÍA; solo queda, durante 24 horas, una huella cifrada del correo para frenar los envíos masivos. Más información en la', 'We will only use this data to organise the demo and reply to you. It arrives by email and is not stored in SINTONÍA; only an encrypted fingerprint of the email is kept for 24 hours to stop mass sending. More information in the') }}
        <RouterLink to="/privacidad" class="enlace">{{ t('política de privacidad', 'privacy policy (in Spanish)') }}</RouterLink>.
      </p>
      <button type="submit" class="btn-primary" :disabled="enviando">{{ enviando ? t('Enviando...', 'Sending...') : t('Solicitar una demostración', 'Request a demo') }}</button>
    </form>
  </div>
</template>
