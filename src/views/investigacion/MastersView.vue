<script setup lang="ts">
// Investigación: másteres y códigos de acceso.
// El investigador no ve nombres: los tutores aparecen por su seudónimo y por
// la etiqueta que se puso a su código.
import { computed, ref, watch } from 'vue'
import { llamar, mensajeDeError } from '@/lib/api'
import { useCarga } from '@/lib/usar-carga'
import type { Rol, TipoTrabajo } from '@/lib/tipos'
import { NOMBRE_ROL } from '@/lib/tipos'
import { fechaCorta } from '@/lib/fechas'
import AppIcon from '@/components/comun/AppIcon.vue'
import EstadoCarga from '@/components/comun/EstadoCarga.vue'
import EstadoVacio from '@/components/comun/EstadoVacio.vue'
import AvisoError from '@/components/comun/AvisoError.vue'

interface Master { id: string; nombre: string; tipo_trabajo: TipoTrabajo; tutores: number; estudiantes: number; direccion: number }
interface Tutor { user_id: string; seudonimo: string; etiqueta: string | null; estudiantes: number }
interface Codigo {
  codigo: string; rol: Rol; etiqueta: string | null; tutor: string | null; usado: boolean; created_at: string
  usos: number; usos_max: number; caduca_at: string | null; caducado: boolean; revocado: boolean; disponible: boolean
}

const masters = ref<Master[]>([])
const seleccionado = ref<string>('')
const tutores = ref<Tutor[]>([])
const codigos = ref<Codigo[]>([])
const aviso = ref('')

const nuevoMaster = ref({ nombre: '', tipo: 'TFM' as TipoTrabajo })
const nuevosCodigos = ref({ rol: 'tutor' as Exclude<Rol, 'investigador'>, cantidad: 1, tutor: '', etiqueta: '', dias: 30, usos: 1 })
const ultimosCodigos = ref<string[]>([])

function plural(n: number, uno: string, varios: string) {
  return `${n} ${n === 1 ? uno : varios}`
}

const master = computed(() => masters.value.find((m) => m.id === seleccionado.value))

async function cargarMasters() {
  masters.value = await llamar('listar_masters')
  if (!seleccionado.value && masters.value.length) seleccionado.value = masters.value[0].id
}

async function cargarMaster() {
  if (!seleccionado.value) return
  const [t, c] = await Promise.all([
    llamar<Tutor[]>('listar_tutores', { p_master_id: seleccionado.value }),
    llamar<Codigo[]>('listar_codigos', { p_master_id: seleccionado.value }),
  ])
  tutores.value = t
  codigos.value = c
}

const { cargando, error, falloCarga, cargar } = useCarga(async () => {
  await cargarMasters()
  await cargarMaster()
}, { alVolver: false })

watch(seleccionado, () => {
  ultimosCodigos.value = []
  cargarMaster().catch((e) => (error.value = mensajeDeError(e)))
})

async function crearMaster() {
  error.value = ''
  try {
    const { id } = await llamar<{ id: string }>('crear_master', { p_nombre: nuevoMaster.value.nombre, p_tipo_trabajo: nuevoMaster.value.tipo })
    nuevoMaster.value.nombre = ''
    await cargarMasters()
    seleccionado.value = id
    aviso.value = 'Máster creado.'
  } catch (e) {
    error.value = mensajeDeError(e)
  }
}

async function crearCodigos() {
  error.value = ''
  try {
    const n = nuevosCodigos.value
    ultimosCodigos.value = await llamar<string[]>('crear_codigos', {
      p_master_id: seleccionado.value,
      p_rol: n.rol,
      p_cantidad: n.cantidad,
      p_tutor_id: n.rol === 'estudiante' ? n.tutor || null : null,
      p_etiqueta: n.etiqueta || null,
      p_dias_validez: n.dias,
      p_usos_max: n.usos,
    })
    n.etiqueta = ''
    await Promise.all([cargarMaster(), cargarMasters()])
  } catch (e) {
    error.value = mensajeDeError(e)
  }
}

function estado(c: Codigo): { texto: string; clase: string } {
  if (c.revocado) return { texto: 'Anulado', clase: 'badge-amber' }
  if (c.usado) return { texto: c.usos_max > 1 ? `Agotado (${c.usos}/${c.usos_max})` : 'Usado', clase: 'badge-green' }
  if (c.caducado) return { texto: 'Caducado', clase: 'badge-amber' }
  return { texto: c.usos_max > 1 ? `Libre (${c.usos}/${c.usos_max})` : 'Libre', clase: 'badge-sky' }
}

async function anular(c: Codigo) {
  if (!window.confirm(`¿Anular el código ${c.codigo}? Nadie más podrá registrarse con él.`)) return
  error.value = ''
  try {
    await llamar('revocar_codigo', { p_codigo: c.codigo })
    aviso.value = `Código ${c.codigo} anulado.`
    await cargarMaster()
  } catch (e) {
    error.value = mensajeDeError(e)
  }
}
</script>

<template>
  <div class="fade-in">
    <h1 class="titulo-pagina">Másteres y códigos</h1>
    <p class="texto-suave mt-1 mb-8">Crea los másteres del estudio y los códigos con los que se registran tutores, dirección y estudiantes.</p>

    <EstadoCarga v-if="cargando" />
    <template v-else>
      <AvisoError v-if="error" :mensaje="error" :reintentar="falloCarga ? cargar : undefined" class="mb-6" />
      <p v-if="aviso" class="aviso-exito mb-6" role="status">{{ aviso }}</p>

      <div class="grid gap-6 lg:grid-cols-3">
        <section class="card p-5 lg:col-span-1 min-w-0" aria-labelledby="t-masters">
          <h2 id="t-masters" class="font-semibold text-surface-900 mb-4">Másteres</h2>
          <ul v-if="masters.length" class="space-y-2 mb-6">
            <li v-for="m in masters" :key="m.id">
              <button
                type="button"
                class="w-full text-left p-3 rounded-xl border transition-colors min-h-tactil"
                :class="m.id === seleccionado ? 'border-brand-900 bg-brand-50 ring-1 ring-brand-900' : 'border-surface-200 hover:border-surface-900'"
                :aria-pressed="m.id === seleccionado"
                @click="seleccionado = m.id"
              >
                <span class="block font-medium text-surface-900">{{ m.nombre }}</span>
                <span class="block text-xs texto-suave mt-0.5">{{ m.tipo_trabajo }} · {{ plural(m.tutores, 'tutor/a', 'tutores') }} · {{ plural(m.estudiantes, 'estudiante', 'estudiantes') }} · {{ plural(m.direccion, 'persona de dirección', 'personas de dirección') }}</span>
              </button>
            </li>
          </ul>
          <p v-else class="text-sm texto-suave mb-6">Todavía no hay másteres.</p>

          <form class="space-y-3 border-t border-surface-200 pt-4" @submit.prevent="crearMaster">
            <h3 class="text-sm font-semibold text-surface-900">Nuevo máster</h3>
            <div>
              <label for="m-nombre" class="label">Nombre</label>
              <input id="m-nombre" v-model="nuevoMaster.nombre" required class="input-field" />
            </div>
            <div>
              <label for="m-tipo" class="label">Tipo de trabajo</label>
              <select id="m-tipo" v-model="nuevoMaster.tipo" class="input-field">
                <option value="TFG">TFG</option>
                <option value="TFM">TFM</option>
                <option value="TESIS">Tesis doctoral</option>
              </select>
            </div>
            <button type="submit" class="btn-primary w-full"><AppIcon name="plus" :size="16" /> Crear máster</button>
          </form>
        </section>

        <div v-if="master" class="lg:col-span-2 space-y-6 min-w-0">
          <section class="card p-5" aria-labelledby="t-codigos">
            <h2 id="t-codigos" class="font-semibold text-surface-900 mb-4">Crear códigos para {{ master.nombre }}</h2>
            <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="crearCodigos">
              <div>
                <label for="c-rol" class="label">Para</label>
                <select id="c-rol" v-model="nuevosCodigos.rol" class="input-field">
                  <option value="tutor">Tutor/a</option>
                  <option value="direccion">Dirección del máster</option>
                  <option value="estudiante">Estudiante (código de pareja)</option>
                </select>
              </div>
              <div>
                <label for="c-cant" class="label">Cantidad</label>
                <input id="c-cant" v-model.number="nuevosCodigos.cantidad" type="number" min="1" max="100" class="input-field" />
              </div>
              <div v-if="nuevosCodigos.rol === 'estudiante'" class="sm:col-span-2">
                <label for="c-tutor" class="label">Tutor/a de la pareja</label>
                <select id="c-tutor" v-model="nuevosCodigos.tutor" class="input-field" required>
                  <option value="" disabled>Elige un tutor/a</option>
                  <option v-for="t in tutores" :key="t.user_id" :value="t.user_id">
                    {{ t.etiqueta || 'Sin etiqueta' }} ({{ t.seudonimo }})
                  </option>
                </select>
                <p v-if="!tutores.length" class="text-xs texto-suave mt-1.5">Primero tiene que registrarse algún tutor/a con su código.</p>
              </div>
              <div>
                <label for="c-dias" class="label">Válido durante (días)</label>
                <input id="c-dias" v-model.number="nuevosCodigos.dias" type="number" min="1" max="365" required class="input-field" />
              </div>
              <div>
                <label for="c-usos" class="label">Personas que pueden usar cada código</label>
                <input id="c-usos" v-model.number="nuevosCodigos.usos" type="number" min="1" max="500" required class="input-field" />
              </div>
              <div class="sm:col-span-2">
                <label for="c-etiqueta" class="label">Etiqueta interna (opcional)</label>
                <input id="c-etiqueta" v-model="nuevosCodigos.etiqueta" maxlength="60" class="input-field" placeholder="Por ejemplo, Tutor 3" />
                <p class="text-xs texto-suave mt-1.5">Te ayuda a reconocer el código. No escribas nombres reales.</p>
              </div>
              <div class="sm:col-span-2">
                <button type="submit" class="btn-primary"><AppIcon name="key" :size="16" /> Crear códigos</button>
              </div>
            </form>
            <div v-if="ultimosCodigos.length" class="aviso-exito mt-4" role="status">
              <div>
                <p class="font-medium mb-1">Códigos creados:</p>
                <p class="tracking-widest tabular-nums">{{ ultimosCodigos.join(' · ') }}</p>
              </div>
            </div>
          </section>

          <section class="card p-5" aria-labelledby="t-lista">
            <h2 id="t-lista" class="font-semibold text-surface-900 mb-4">Códigos de este máster</h2>
            <EstadoVacio v-if="!codigos.length" icono="key" titulo="Todavía no hay códigos" texto="Cuando quieras, crea el primero con el formulario de arriba." />
            <div v-else class="relative overflow-x-auto" tabindex="0" role="region" aria-label="Tabla (se puede desplazar)">
              <table class="w-full text-sm text-left">
                <caption class="sr-only">Códigos de acceso del máster</caption>
                <thead class="text-surface-800">
                  <tr class="border-b border-surface-200">
                    <th scope="col" class="py-2 pr-3 font-semibold">Código</th>
                    <th scope="col" class="py-2 pr-3 font-semibold">Para</th>
                    <th scope="col" class="py-2 pr-3 font-semibold">Etiqueta</th>
                    <th scope="col" class="py-2 pr-3 font-semibold">Tutor/a</th>
                    <th scope="col" class="py-2 pr-3 font-semibold">Caduca</th>
                    <th scope="col" class="py-2 pr-3 font-semibold">Estado</th>
                    <th scope="col" class="py-2 font-semibold"><span class="sr-only">Acciones</span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="c in codigos" :key="c.codigo" class="border-b border-surface-200 last:border-0">
                    <td class="py-2 pr-3 tracking-wider tabular-nums">{{ c.codigo }}</td>
                    <td class="py-2 pr-3">{{ NOMBRE_ROL[c.rol] }}</td>
                    <td class="py-2 pr-3">{{ c.etiqueta || '' }}</td>
                    <td class="py-2 pr-3">{{ c.tutor || '' }}</td>
                    <td class="py-2 pr-3 whitespace-nowrap">{{ c.caduca_at ? fechaCorta(c.caduca_at) : 'Sin caducidad' }}</td>
                    <td class="py-2 pr-3">
                      <span class="badge" :class="estado(c).clase">{{ estado(c).texto }}</span>
                    </td>
                    <td class="py-1">
                      <button v-if="c.disponible" type="button" class="btn-secondary !px-3 !py-1.5 text-sm" @click="anular(c)">
                        Anular<span class="sr-only"> el código {{ c.codigo }}</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </template>
  </div>
</template>
