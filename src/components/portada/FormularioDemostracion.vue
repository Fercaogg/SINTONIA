<script setup lang="ts">
// "Solicitar una demostración" (/instituciones). Usa la función de contacto
// del servidor (api/contacto, tipo "demostracion"): campo trampa contra los
// programas automáticos y límite de envíos. Si el servidor no puede enviar
// correos, se ofrece escribir directamente con el mensaje ya preparado.
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { enviarAlServidor } from '@/lib/servidor'
import AvisoError from '@/components/comun/AvisoError.vue'
import CampoTrampa from '@/components/comun/CampoTrampa.vue'
import EscribirPorCorreo from '@/components/comun/EscribirPorCorreo.vue'

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
    else error.value = r.error ?? 'No hemos podido enviar la solicitud.'
    return
  }
  enviado.value = true
}

const cuerpoCorreo = computed(
  () => `Hola:\n\nMe gustaría ver una demostración de SINTONÍA.\n\nInstitución: ${institucion.value}\nCargo: ${cargo.value || 'No indicado'}\n\n${mensaje.value}\n\n${nombre.value}`,
)
</script>

<template>
  <div>
    <p v-if="enviado" class="aviso-exito" role="status">
      Solicitud enviada. Te escribiremos a {{ email.trim() }} para buscar un momento que os venga bien.
    </p>
    <form v-else class="space-y-4" @submit.prevent="enviar">
      <AvisoError v-if="error" :mensaje="error" />
      <EscribirPorCorreo v-if="sinCorreo" asunto="SINTONÍA: solicitud de demostración" :cuerpo="cuerpoCorreo" />
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="d-nombre" class="label">Nombre</label>
          <input id="d-nombre" v-model="nombre" required maxlength="120" autocomplete="name" class="input-field" />
        </div>
        <div>
          <label for="d-email" class="label">Correo</label>
          <input id="d-email" v-model="email" type="email" required maxlength="254" autocomplete="email" class="input-field" />
        </div>
        <div>
          <label for="d-inst" class="label">Máster, programa o institución</label>
          <input id="d-inst" v-model="institucion" required minlength="2" maxlength="200" autocomplete="organization" class="input-field" />
        </div>
        <div>
          <label for="d-cargo" class="label">Cargo <span class="font-normal texto-suave">(opcional)</span></label>
          <input id="d-cargo" v-model="cargo" maxlength="120" autocomplete="organization-title" class="input-field" />
        </div>
      </div>
      <div>
        <label for="d-mensaje" class="label">Qué te gustaría ver <span class="font-normal texto-suave">(opcional)</span></label>
        <textarea id="d-mensaje" v-model="mensaje" maxlength="3000" rows="4" class="input-field" />
      </div>
      <CampoTrampa v-model="sitio" />
      <p class="text-sm texto-suave">
        Usaremos estos datos solo para organizar la demostración y responderte. Llegan por correo electrónico y no se guardan en SINTONÍA; solo queda, durante 24 horas, una huella cifrada del correo para frenar los envíos masivos.
        Más información en la <RouterLink to="/privacidad" class="enlace">política de privacidad</RouterLink>.
      </p>
      <button type="submit" class="btn-primary" :disabled="enviando">{{ enviando ? 'Enviando...' : 'Solicitar una demostración' }}</button>
    </form>
  </div>
</template>
