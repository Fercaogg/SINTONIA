<script setup lang="ts">
// Formulario para anotar o cambiar una fecha del calendario.
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { llamar, mensajeDeError } from '@/lib/api'
import { TIPOS, TIPOS_ANOTABLES, type Ambito, type Calendario, type Evento, type TipoEvento } from '@/lib/calendario'
import { useTerminos } from '@/lib/terminos'
import AppIcon from '@/components/comun/AppIcon.vue'
import AvisoError from '@/components/comun/AvisoError.vue'

const props = defineProps<{ opciones: Calendario['opciones']; evento?: Evento | null; fecha: string }>()
const emit = defineEmits<{ guardado: [mensaje: string]; cancelar: [] }>()

const { t } = useTerminos()
const titulo = ref<HTMLElement | null>(null)
const error = ref('')
const enviando = ref(false)

const rol = computed(() => props.opciones.rol)
const ambitosPosibles = computed<{ valor: Ambito; texto: string; ayuda: string }[]>(() => {
  const lista: { valor: Ambito; texto: string; ayuda: string }[] = [
    { valor: 'privado', texto: 'Solo yo', ayuda: 'Nadie más lo ve.' },
  ]
  if (rol.value === 'estudiante' && props.opciones.parejas.length) {
    lista.push({ valor: 'pareja', texto: t('Mi tutor/a y yo'), ayuda: t('Lo ven tu tutor/a y, si los hay, tus cotutores.') })
  }
  if (rol.value === 'tutor' && props.opciones.parejas.length) {
    lista.push({ valor: 'pareja', texto: t('Un estudiante y yo'), ayuda: t('Lo ven ese estudiante y sus otros tutores.') })
  }
  if (rol.value === 'direccion' || rol.value === 'investigador') {
    lista.push({ valor: 'master', texto: 'Todo el máster', ayuda: t('Lo ven todos los estudiantes, tutores y la dirección del máster.') })
  }
  return lista
})

const e = props.evento
const f = reactive({
  tipo: (e?.tipo ?? (rol.value === 'direccion' || rol.value === 'investigador' ? 'evento' : 'tutoria')) as TipoEvento,
  titulo: e?.titulo ?? '',
  fecha: e?.fecha ?? props.fecha,
  fecha_fin: e?.fecha_fin ?? '',
  variosDias: !!e?.fecha_fin,
  hora_inicio: e?.hora_inicio ?? '',
  hora_fin: e?.hora_fin ?? '',
  lugar: e?.lugar ?? '',
  descripcion: e?.descripcion ?? '',
  ambito: (e?.ambito ?? (rol.value === 'direccion' || rol.value === 'investigador' ? 'master' : props.opciones.parejas.length ? 'pareja' : 'privado')) as Ambito,
  pareja_id: e?.pareja_id ?? (props.opciones.parejas.length === 1 ? props.opciones.parejas[0].pareja_id : ''),
  master_id: e?.master_id ?? (props.opciones.masters.length === 1 ? props.opciones.masters[0].id : ''),
})

// Si no es quien lo anotó (evento del máster corregido por otra persona), no puede cambiar quién lo ve.
const puedeCambiarAmbito = computed(() => !e || e.mio)

const ejemplos: Record<TipoEvento, string> = {
  tutoria: t('Por ejemplo, tutoría para revisar el marco teórico'),
  entrega: 'Por ejemplo, entrega del primer borrador',
  congreso: 'Por ejemplo, nombre del congreso',
  evento: 'Por ejemplo, seminario de metodología',
  plazo: 'Por ejemplo, plazo de depósito',
  otro: '',
}

onMounted(async () => {
  await nextTick()
  titulo.value?.focus()
})

async function guardar() {
  error.value = ''
  enviando.value = true
  try {
    await llamar('guardar_evento', {
      p_evento: {
        id: e?.id ?? null,
        tipo: f.tipo,
        titulo: f.titulo,
        fecha: f.fecha,
        fecha_fin: f.variosDias ? f.fecha_fin : null,
        hora_inicio: f.hora_inicio || null,
        hora_fin: f.hora_inicio ? f.hora_fin || null : null,
        lugar: f.lugar,
        descripcion: f.descripcion,
        ambito: f.ambito,
        pareja_id: f.ambito === 'pareja' ? f.pareja_id || null : null,
        master_id: f.ambito === 'master' ? f.master_id || null : null,
      },
    })
    emit('guardado', e ? 'Cambios guardados.' : 'Anotado en el calendario.')
  } catch (err) {
    error.value = mensajeDeError(err)
  } finally {
    enviando.value = false
  }
}

async function borrar() {
  if (!e || !window.confirm(`¿Borrar "${e.titulo}"? No se puede deshacer.`)) return
  error.value = ''
  try {
    await llamar('borrar_evento', { p_id: e.id })
    emit('guardado', 'Anotación borrada.')
  } catch (err) {
    error.value = mensajeDeError(err)
  }
}
</script>

<template>
  <section class="card p-5 sm:p-6" aria-labelledby="t-form-evento">
    <h2 id="t-form-evento" ref="titulo" tabindex="-1" class="font-display text-xl font-semibold text-surface-900 outline-none">
      {{ e ? 'Editar anotación' : 'Nueva anotación' }}
    </h2>
    <AvisoError v-if="error" :mensaje="error" class="mt-4" />

    <form class="mt-4 space-y-5" @submit.prevent="guardar">
      <fieldset>
        <legend class="label">Tipo</legend>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="clave in TIPOS_ANOTABLES"
            :key="clave"
            class="inline-flex items-center gap-2 px-3 min-h-tactil rounded-full border cursor-pointer text-sm font-medium has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-900"
            :class="f.tipo === clave ? 'bg-surface-900 text-white border-surface-900' : 'bg-white text-surface-800 border-surface-200'"
          >
            <input v-model="f.tipo" type="radio" name="tipo" :value="clave" class="sr-only" />
            <AppIcon :name="TIPOS[clave].icono" :size="16" />
            {{ TIPOS[clave].etiqueta }}
          </label>
        </div>
      </fieldset>

      <div>
        <label for="ev-titulo" class="label">Título</label>
        <input id="ev-titulo" v-model="f.titulo" required maxlength="120" class="input-field" :placeholder="ejemplos[f.tipo]" />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="ev-fecha" class="label">{{ f.variosDias ? 'Desde' : 'Fecha' }}</label>
          <input id="ev-fecha" v-model="f.fecha" type="date" required class="input-field" />
        </div>
        <div v-if="f.variosDias">
          <label for="ev-fecha-fin" class="label">Hasta</label>
          <input id="ev-fecha-fin" v-model="f.fecha_fin" type="date" required :min="f.fecha" class="input-field" />
        </div>
      </div>
      <label class="flex items-center gap-3 min-h-tactil cursor-pointer w-fit">
        <input v-model="f.variosDias" type="checkbox" class="h-5 w-5 accent-brand-900" />
        <span class="text-sm text-surface-900">Dura varios días</span>
      </label>

      <div class="grid gap-4 grid-cols-2">
        <div>
          <label for="ev-hora" class="label">Hora de inicio <span class="font-normal texto-suave">(opcional)</span></label>
          <input id="ev-hora" v-model="f.hora_inicio" type="time" class="input-field" />
        </div>
        <div>
          <label for="ev-hora-fin" class="label">Hora de fin <span class="font-normal texto-suave">(opcional)</span></label>
          <input id="ev-hora-fin" v-model="f.hora_fin" type="time" :disabled="!f.hora_inicio" class="input-field disabled:opacity-50" />
        </div>
      </div>

      <div>
        <label for="ev-lugar" class="label">Lugar o enlace <span class="font-normal texto-suave">(opcional)</span></label>
        <input id="ev-lugar" v-model="f.lugar" maxlength="200" class="input-field" placeholder="Por ejemplo, despacho 12 o videollamada" />
      </div>

      <div>
        <label for="ev-nota" class="label">Nota <span class="font-normal texto-suave">(opcional)</span></label>
        <textarea id="ev-nota" v-model="f.descripcion" maxlength="1000" rows="3" class="input-field" />
      </div>

      <fieldset v-if="puedeCambiarAmbito">
        <legend class="label">¿Quién lo ve?</legend>
        <div class="space-y-1">
          <label v-for="a in ambitosPosibles" :key="a.valor" class="flex items-start gap-3 min-h-tactil py-2 cursor-pointer">
            <input v-model="f.ambito" type="radio" name="ambito" :value="a.valor" class="mt-0.5 h-5 w-5 accent-brand-900" />
            <span>
              <span class="block text-sm font-medium text-surface-900">{{ a.texto }}</span>
              <span class="block text-sm texto-suave">{{ a.ayuda }}</span>
            </span>
          </label>
        </div>
      </fieldset>

      <div v-if="f.ambito === 'pareja' && rol === 'tutor'">
        <label for="ev-pareja" class="label">{{ t('¿Con qué estudiante?') }}</label>
        <select id="ev-pareja" v-model="f.pareja_id" required class="input-field">
          <option value="" disabled>{{ t('Elige estudiante') }}</option>
          <option v-for="p in opciones.parejas" :key="p.pareja_id" :value="p.pareja_id">{{ p.nombre }}</option>
        </select>
      </div>

      <div v-if="f.ambito === 'master' && rol === 'investigador' && puedeCambiarAmbito">
        <label for="ev-master" class="label">Máster</label>
        <select id="ev-master" v-model="f.master_id" required class="input-field">
          <option value="" disabled>Elige un máster</option>
          <option v-for="m in opciones.masters" :key="m.id" :value="m.id">{{ m.nombre }}</option>
        </select>
      </div>

      <p v-if="rol === 'estudiante' || rol === 'tutor'" class="text-sm texto-suave">
        El calendario no forma parte de los datos del estudio: no se exporta, y ni la dirección del máster ni el equipo de investigación ven lo que anotas aquí.
      </p>

      <div class="flex flex-wrap gap-3">
        <button type="submit" class="btn-primary" :disabled="enviando">{{ e ? 'Guardar cambios' : 'Anotar' }}</button>
        <button type="button" class="btn-secondary" @click="emit('cancelar')">Cancelar</button>
        <button v-if="e" type="button" class="btn-danger sm:ml-auto" @click="borrar"><AppIcon name="trash" :size="16" /> Borrar</button>
      </div>
    </form>
  </section>
</template>
