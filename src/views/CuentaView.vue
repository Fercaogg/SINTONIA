<script setup lang="ts">
// Mi cuenta: derechos de acceso, rectificación, retirada y borrado.
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { llamar, mensajeDeError } from '@/lib/api'
import { useSesion } from '@/stores/sesion'
import AppIcon from '@/components/comun/AppIcon.vue'
import AvisoError from '@/components/comun/AvisoError.vue'
import { useTerminos } from '@/lib/terminos'

const sesion = useSesion()
const router = useRouter()

const perfil = computed(() => sesion.perfil)
const participante = computed(() => perfil.value?.rol === 'estudiante' || perfil.value?.rol === 'tutor')

const nombre = ref(perfil.value?.nombre ?? '')
const aviso = ref('')
const error = ref('')
const confirmando = ref<null | 'retirar' | 'borrar'>(null)
const textoConfirmacion = ref('')
const trabajando = ref(false)

async function guardarNombre() {
  error.value = ''
  aviso.value = ''
  try {
    await llamar('actualizar_mi_nombre', { p_nombre: nombre.value })
    await sesion.cargar(true)
    aviso.value = 'Nombre actualizado.'
  } catch (e) {
    error.value = mensajeDeError(e)
  }
}

async function cambiarRecordatorios(ev: Event) {
  error.value = ''
  try {
    await llamar('cambiar_recordatorios', { p_activos: (ev.target as HTMLInputElement).checked })
    await sesion.cargar(true)
    aviso.value = 'Preferencia guardada.'
  } catch (e) {
    error.value = mensajeDeError(e)
  }
}

async function descargar() {
  error.value = ''
  try {
    const datos = await llamar('mis_datos')
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mis-datos-sintonia.json'
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    error.value = mensajeDeError(e)
  }
}

async function retirarme() {
  if (!confirmando.value) return
  trabajando.value = true
  error.value = ''
  try {
    const borrar = confirmando.value === 'borrar'
    await llamar('retirarme', { p_borrar: borrar })
    if (borrar) {
      await sesion.salir()
      router.replace({ path: '/', query: { borrado: '1' } })
    } else {
      await sesion.cargar(true)
      confirmando.value = null
      aviso.value = 'Te has retirado del estudio.'
    }
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    trabajando.value = false
  }
}

const { t } = useTerminos()
</script>

<template>
  <div class="fade-in max-w-2xl">
    <h1 class="titulo-pagina">Mi cuenta</h1>
    <p class="texto-suave mt-1 mb-8">Tus datos y tus derechos.</p>

    <div v-if="perfil?.retirado" class="aviso-exito mb-6" role="status">
      <AppIcon name="info" :size="18" class="shrink-0 mt-0.5" />
      <span>Te has retirado del estudio. Ya no recibirás correos ni podrás hacer check-ins. Si quieres, también puedes borrar todos tus datos.</span>
    </div>
    <p v-else-if="aviso" class="aviso-exito mb-6" role="status">{{ aviso }}</p>
    <AvisoError v-if="error" :mensaje="error" class="mb-6" />

    <section class="card p-5 sm:p-6 mb-4" aria-labelledby="t-datos">
      <h2 id="t-datos" class="font-semibold text-surface-900 mb-4">Tus datos</h2>
      <form class="space-y-4" @submit.prevent="guardarNombre">
        <div>
          <label for="c-nombre" class="label">Nombre</label>
          <div class="flex gap-2">
            <input id="c-nombre" v-model="nombre" required maxlength="120" class="input-field" :disabled="perfil?.retirado" />
            <button type="submit" class="btn-secondary shrink-0" :disabled="perfil?.retirado || nombre === perfil?.nombre">Guardar</button>
          </div>
        </div>
        <div>
          <p class="label">Correo</p>
          <p class="text-surface-900">{{ perfil?.email }}</p>
        </div>
      </form>
      <label v-if="participante && !perfil?.retirado" class="flex items-start gap-3 mt-5 cursor-pointer">
        <input type="checkbox" class="mt-1 h-5 w-5 accent-brand-900" :checked="perfil?.recordatorios" @change="cambiarRecordatorios" />
        <span>
          <span class="font-medium text-surface-900">Recibir recordatorios por correo</span>
          <span class="block text-sm texto-suave">Uno al abrirse el check-in y otro 48 horas antes del cierre si aún no has respondido.</span>
        </span>
      </label>
    </section>

    <section class="card p-5 sm:p-6 mb-4" aria-labelledby="t-desc">
      <h2 id="t-desc" class="font-semibold text-surface-900 mb-1">Descargar mis datos</h2>
      <p class="text-sm texto-suave mb-4">Un archivo con todo lo que SINTONÍA guarda sobre ti.</p>
      <button type="button" class="btn-secondary" @click="descargar"><AppIcon name="download" :size="16" /> Descargar</button>
    </section>

    <section v-if="participante" class="card p-5 sm:p-6" aria-labelledby="t-ret">
      <h2 id="t-ret" class="font-semibold text-surface-900 mb-1">Dejar el estudio</h2>
      <p class="text-sm texto-suave mb-4">Puedes hacerlo cuando quieras, sin dar explicaciones.</p>

      <div v-if="!confirmando" class="flex flex-col gap-3">
        <button v-if="!perfil?.retirado" type="button" class="btn-secondary justify-start text-left" @click="confirmando = 'retirar'">
          Retirarme del estudio y conservar mis respuestas anteriores (sin mi nombre)
        </button>
        <button type="button" class="btn-secondary justify-start text-left !text-red-700 !border-red-700" @click="confirmando = 'borrar'">
          Retirarme y borrar todos mis datos y mi cuenta
        </button>
      </div>

      <form v-else class="p-4 rounded-xl border border-red-200 bg-red-50" @submit.prevent="retirarme">
        <p class="text-sm text-surface-900 mb-3">
          <template v-if="confirmando === 'borrar'">
            Se borrarán tu cuenta, tus respuestas<template v-if="perfil?.rol === 'estudiante'">, tu bienestar y lo que {{ t('tu tutor/a') }} respondió sobre ti</template>.
            No se puede deshacer. Escribe <strong>BORRAR</strong> para confirmarlo.
          </template>
          <template v-else>
            Dejarás de participar y de recibir correos. Las respuestas que ya diste se conservarán para el estudio, sin tu nombre.
            Escribe <strong>RETIRARME</strong> para confirmarlo.
          </template>
        </p>
        <label for="c-conf" class="sr-only">Confirmación</label>
        <input id="c-conf" v-model="textoConfirmacion" class="input-field mb-3" autocomplete="off" />
        <div class="flex gap-3">
          <button
            type="submit"
            class="btn-danger"
            :disabled="trabajando || textoConfirmacion.trim().toUpperCase() !== (confirmando === 'borrar' ? 'BORRAR' : 'RETIRARME')"
          >
            {{ trabajando ? 'Un momento...' : 'Confirmar' }}
          </button>
          <button type="button" class="btn-secondary" @click="confirmando = null; textoConfirmacion = ''">Cancelar</button>
        </div>
      </form>
    </section>
  </div>
</template>
