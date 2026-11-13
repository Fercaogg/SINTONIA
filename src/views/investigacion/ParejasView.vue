<script setup lang="ts">
// Investigación: tutores de cada pareja. Aquí se reflejan las decisiones de la
// comisión académica: cotutoría (hasta dos cotutores además del principal) y
// cambio de tutor. Todo queda en la auditoría y las respuestas anteriores se
// conservan. El investigador no ve nombres: solo códigos y etiquetas.
import { computed, onMounted, ref, watch } from 'vue'
import { llamar, mensajeDeError } from '@/lib/api'
import AppIcon from '@/components/comun/AppIcon.vue'
import AvisoError from '@/components/comun/AvisoError.vue'
import EstadoCarga from '@/components/comun/EstadoCarga.vue'
import EstadoVacio from '@/components/comun/EstadoVacio.vue'

interface TutorRef { user_id: string; seudonimo: string; etiqueta: string | null }
interface Pareja {
  pareja_id: string
  pareja: string
  estudiante: string
  estudiante_retirado: boolean
  tutor: TutorRef | null
  cotutores: TutorRef[]
  cambios: number
}

const masters = ref<{ id: string; nombre: string }[]>([])
const master = ref('')
const parejas = ref<Pareja[]>([])
const tutores = ref<TutorRef[]>([])
const cargando = ref(true)
const error = ref('')
const aviso = ref('')
const nuevoPrincipal = ref<Record<string, string>>({})
const nuevoCotutor = ref<Record<string, string>>({})

const nombreTutor = (t: TutorRef | null) => (t ? `${t.etiqueta || 'Sin etiqueta'} (${t.seudonimo})` : 'Sin tutor/a')
const disponibles = (p: Pareja) =>
  tutores.value.filter((t) => t.user_id !== p.tutor?.user_id && !p.cotutores.some((c) => c.user_id === t.user_id))
const conCotutoria = computed(() => parejas.value.filter((p) => p.cotutores.length).length)

async function cargarParejas() {
  if (!master.value) return
  const [p, t] = await Promise.all([
    llamar<Pareja[]>('listar_parejas', { p_master_id: master.value }),
    llamar<TutorRef[]>('listar_tutores', { p_master_id: master.value }),
  ])
  parejas.value = p
  tutores.value = t
}

onMounted(async () => {
  try {
    masters.value = await llamar('listar_masters')
    master.value = masters.value[0]?.id ?? ''
    await cargarParejas()
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    cargando.value = false
  }
})

watch(master, () => cargarParejas().catch((e) => (error.value = mensajeDeError(e))))

async function accion(funcion: string, args: Record<string, unknown>, mensaje: string) {
  error.value = ''
  aviso.value = ''
  try {
    await llamar(funcion, args)
    await cargarParejas()
    aviso.value = mensaje
  } catch (e) {
    error.value = mensajeDeError(e)
  }
}
</script>

<template>
  <div class="fade-in max-w-4xl">
    <h1 class="titulo-pagina">Parejas y tutores</h1>
    <p class="texto-suave mt-1 mb-8">
      Refleja aquí lo que decida la comisión académica: cambio de tutor/a y cotutoría (hasta dos cotutores además del tutor principal).
      Los cambios quedan registrados y las respuestas anteriores se conservan.
    </p>

    <EstadoCarga v-if="cargando" />
    <template v-else>
      <AvisoError v-if="error" :mensaje="error" class="mb-6" />
      <p v-if="aviso" class="aviso-exito mb-6" role="status">{{ aviso }}</p>

      <div v-if="masters.length > 1" class="mb-6 max-w-sm">
        <label for="p-master" class="label">Máster</label>
        <select id="p-master" v-model="master" class="input-field">
          <option v-for="m in masters" :key="m.id" :value="m.id">{{ m.nombre }}</option>
        </select>
      </div>

      <EstadoVacio v-if="!parejas.length" icono="users" titulo="Aún no hay parejas" texto="Aparecerán cuando los estudiantes se registren con sus códigos." />
      <template v-else>
        <p class="text-sm texto-suave mb-4">{{ parejas.length }} parejas · {{ conCotutoria }} con cotutoría</p>
        <ul class="space-y-4">
          <li v-for="p in parejas" :key="p.pareja_id" class="card p-5">
            <div class="flex flex-wrap items-baseline justify-between gap-2 mb-4">
              <h2 class="font-semibold text-surface-900 font-mono tracking-wide">{{ p.pareja }}</h2>
              <span class="text-sm texto-suave">
                Estudiante {{ p.estudiante }}<template v-if="p.estudiante_retirado"> · retirado/a</template>
                <template v-if="p.cambios"> · {{ p.cambios }} {{ p.cambios === 1 ? 'cambio de tutor' : 'cambios de tutor' }}</template>
              </span>
            </div>

            <dl class="grid gap-4 sm:grid-cols-2">
              <div>
                <dt class="label">Tutor/a principal</dt>
                <dd class="text-surface-900">
                  {{ nombreTutor(p.tutor) }}
                <form class="flex gap-2 mt-2" @submit.prevent="accion('cambiar_tutor', { p_pareja_id: p.pareja_id, p_tutor_id: nuevoPrincipal[p.pareja_id] }, `Tutor principal de ${p.pareja} cambiado.`)">
                  <label :for="`np-${p.pareja_id}`" class="sr-only">Nuevo tutor/a principal de {{ p.pareja }}</label>
                  <select :id="`np-${p.pareja_id}`" v-model="nuevoPrincipal[p.pareja_id]" class="input-field" required>
                    <option value="" disabled selected>Cambiar por...</option>
                    <option v-for="t in tutores.filter((x) => x.user_id !== p.tutor?.user_id)" :key="t.user_id" :value="t.user_id">{{ nombreTutor(t) }}</option>
                  </select>
                  <button type="submit" class="btn-secondary shrink-0" :disabled="!nuevoPrincipal[p.pareja_id]">Cambiar</button>
                </form>
                </dd>
              </div>
              <div>
                <dt class="label">Cotutores</dt>
                <dd>
                  <p v-if="!p.cotutores.length" class="texto-suave text-sm">Ninguno</p>
                  <ul v-else class="space-y-2">
                    <li v-for="c in p.cotutores" :key="c.user_id" class="flex items-center justify-between gap-2">
                      <span class="text-surface-900">{{ nombreTutor(c) }}</span>
                      <button
                        type="button"
                        class="btn-secondary text-sm"
                        :aria-label="`Quitar a ${nombreTutor(c)} como cotutor de ${p.pareja}`"
                        @click="accion('quitar_cotutor', { p_pareja_id: p.pareja_id, p_tutor_id: c.user_id }, `Cotutor quitado de ${p.pareja}.`)"
                      >
                        <AppIcon name="close" :size="14" /> Quitar
                      </button>
                    </li>
                  </ul>
                <form
                  v-if="p.cotutores.length < 2"
                  class="flex gap-2 mt-2"
                  @submit.prevent="accion('asignar_cotutor', { p_pareja_id: p.pareja_id, p_tutor_id: nuevoCotutor[p.pareja_id] }, `Cotutor añadido a ${p.pareja}.`)"
                >
                  <label :for="`nc-${p.pareja_id}`" class="sr-only">Añadir cotutor a {{ p.pareja }}</label>
                  <select :id="`nc-${p.pareja_id}`" v-model="nuevoCotutor[p.pareja_id]" class="input-field" required>
                    <option value="" disabled selected>Añadir cotutor/a...</option>
                    <option v-for="t in disponibles(p)" :key="t.user_id" :value="t.user_id">{{ nombreTutor(t) }}</option>
                  </select>
                  <button type="submit" class="btn-secondary shrink-0" :disabled="!nuevoCotutor[p.pareja_id]">Añadir</button>
                </form>
                </dd>
              </div>
            </dl>
          </li>
        </ul>
      </template>
    </template>
  </div>
</template>
