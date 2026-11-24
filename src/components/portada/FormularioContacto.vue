<script setup lang="ts">
// Formulario de contacto. Protección antispam no invasiva: campo trampa,
// tiempo mínimo de rellenado, límite de enlaces y
// límite de envíos en el servidor (api/contacto). Sin capturas ni rompecabezas.
import { ref } from 'vue'
import { enviarAlServidor, errorEnIngles } from '@/lib/servidor'
import { useIdioma } from '@/lib/idioma'
import { CORREO_CONTACTO } from '@/lib/publico'
import AvisoError from '@/components/comun/AvisoError.vue'
import CampoTrampa from '@/components/comun/CampoTrampa.vue'
import EscribirPorCorreo from '@/components/comun/EscribirPorCorreo.vue'

const { t, idioma } = useIdioma()
const nombre = ref('')
const email = ref('')
const mensaje = ref('')
const sitio = ref('')
// Momento en que se mostró el formulario: un envío en menos de 3 s es de un programa.
const mostrado = Date.now()
const enviando = ref(false)
const enviado = ref(false)
const error = ref('')
const sinCorreo = ref(false)

async function enviar() {
  error.value = ''
  sinCorreo.value = false
  enviando.value = true
  const r = await enviarAlServidor('contacto', { nombre: nombre.value, email: email.value, mensaje: mensaje.value, sitio: sitio.value, tiempo: Date.now() - mostrado })
  enviando.value = false
  if (!r.ok) {
    if (r.status === 503) sinCorreo.value = true
    else error.value = idioma.value === 'en' ? errorEnIngles(r.status) : (r.error ?? 'No hemos podido enviar el mensaje.')
    return
  }
  enviado.value = true
}
</script>

<template>
  <div>
    <p v-if="enviado" class="aviso-exito" role="status">{{ t('Mensaje enviado. Te responderemos a', 'Message sent. We will reply to') }} {{ email.trim() }}.</p>
    <form v-else class="space-y-4" @submit.prevent="enviar">
      <AvisoError v-if="error" :mensaje="error" />
      <EscribirPorCorreo v-if="sinCorreo" :asunto="t('SINTONÍA: mensaje desde la web', 'SINTONÍA: message from the website')" :cuerpo="`${mensaje}\n\n${nombre}`" />
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="c-nombre" class="label">{{ t('Nombre', 'Name') }}</label>
          <input id="c-nombre" v-model="nombre" required maxlength="120" autocomplete="name" class="input-field" />
        </div>
        <div>
          <label for="c-email" class="label">{{ t('Correo', 'Email') }}</label>
          <input id="c-email" v-model="email" type="email" required maxlength="254" autocomplete="email" class="input-field" />
        </div>
      </div>
      <div>
        <label for="c-mensaje" class="label">{{ t('Mensaje', 'Message') }}</label>
        <textarea id="c-mensaje" v-model="mensaje" required minlength="10" maxlength="3000" rows="5" class="input-field" />
      </div>
      <CampoTrampa v-model="sitio" />
      <p class="text-sm texto-suave">{{ t('Usaremos tu correo solo para responderte. El mensaje llega por correo electrónico y no se guarda en SINTONÍA; solo queda, durante 24 horas, una huella cifrada del correo para frenar los envíos masivos.', 'We will only use your email to reply. The message arrives by email and is not stored in SINTONÍA; only an encrypted fingerprint of the email is kept for 24 hours to stop mass sending.') }}</p>
      <button type="submit" class="btn-primary" :disabled="enviando">{{ enviando ? t('Enviando...', 'Sending...') : t('Enviar mensaje', 'Send message') }}</button>
    </form>
    <p class="mt-4 text-sm texto-suave">{{ t('También puedes escribir directamente a', 'You can also write directly to') }} <a :href="`mailto:${CORREO_CONTACTO}`" class="enlace">{{ CORREO_CONTACTO }}</a>.</p>
  </div>
</template>
