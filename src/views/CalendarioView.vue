<script setup lang="ts">
// Calendario compartido: mes, día elegido y próximas fechas.
// Cada persona anota tutorías, entregas, congresos... y decide quién lo ve.
import { computed, onMounted, ref, watch } from 'vue'
import { llamar, mensajeDeError } from '@/lib/api'
import {
  DIAS_CORTOS, DIAS_SEMANA, TIPOS, delDia, entradas, hoy, inicioMes, nombreDia, nombreMes, proximas,
  semanasDelMes, sumarDias, sumarMeses, type Calendario, type Entrada, type Evento, type TipoCalendario,
} from '@/lib/calendario'
import { useTerminos } from '@/lib/terminos'
import AppIcon from '@/components/comun/AppIcon.vue'
import AvisoError from '@/components/comun/AvisoError.vue'
import EstadoCarga from '@/components/comun/EstadoCarga.vue'
import EntradaCalendario from '@/components/calendario/EntradaCalendario.vue'
import FormularioEvento from '@/components/calendario/FormularioEvento.vue'

const { t } = useTerminos()
const HOY = hoy()

const mes = ref(inicioMes(HOY))
const diaElegido = ref(HOY)
const datosMes = ref<Calendario | null>(null)
const datosProximos = ref<Calendario | null>(null)
const cargando = ref(true)
const error = ref('')
const aviso = ref('')
const formulario = ref<{ evento: Evento | null } | null>(null)

const semanas = computed(() => semanasDelMes(mes.value))
const opciones = computed(() => datosMes.value?.opciones ?? null)

// Filtros de tipo (arriba). Todos visibles al empezar.
const TODOS = Object.keys(TIPOS) as TipoCalendario[]
const visibles = ref<Set<TipoCalendario>>(new Set(TODOS))
function alternar(tipo: TipoCalendario) {
  const s = new Set(visibles.value)
  if (s.has(tipo)) s.delete(tipo)
  else s.add(tipo)
  visibles.value = s
}
const filtrar = (lista: Entrada[]) => lista.filter((e) => visibles.value.has(e.tipo))

const delMes = computed(() => (datosMes.value ? filtrar(entradas(datosMes.value)) : []))
const listaDia = computed(() => delDia(delMes.value, diaElegido.value))
const listaProximas = computed(() => (datosProximos.value ? proximas(filtrar(entradas(datosProximos.value)), HOY, 8) : []))

async function cargarMes() {
  const s = semanas.value
  datosMes.value = await llamar<Calendario>('mi_calendario', { p_desde: s[0][0].fecha, p_hasta: s.at(-1)!.at(-1)!.fecha })
}
async function cargarProximos() {
  datosProximos.value = await llamar<Calendario>('mi_calendario', { p_desde: HOY, p_hasta: sumarDias(HOY, 90) })
}

async function cargarTodo() {
  error.value = ''
  try {
    await Promise.all([cargarMes(), cargarProximos()])
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    cargando.value = false
  }
}

onMounted(cargarTodo)
watch(mes, async () => {
  try {
    await cargarMes()
  } catch (e) {
    error.value = mensajeDeError(e)
  }
})

function irAMes(delta: number) {
  mes.value = sumarMeses(mes.value, delta)
  diaElegido.value = mes.value === inicioMes(HOY) ? HOY : mes.value
}
function irAHoy() {
  mes.value = inicioMes(HOY)
  diaElegido.value = HOY
}
function elegir(fecha: string) {
  diaElegido.value = fecha
  if (inicioMes(fecha) !== mes.value) mes.value = inicioMes(fecha)
}

function puntos(fecha: string) {
  return delDia(delMes.value, fecha)
}
// Nombre accesible del día: "miércoles 10 de febrero, hoy, 2 fechas". El
// número visible forma parte del nombre (WCAG 2.5.3).
function etiquetaDia(fecha: string) {
  const n = puntos(fecha).length
  const [antes, despues] = nombreDia(fecha).split(` ${Number(fecha.slice(8))} `)
  const extra = (fecha === HOY ? ', hoy' : '') + (n ? `, ${n} ${n === 1 ? 'fecha' : 'fechas'}` : '')
  return { antes: `${antes} `, despues: ` ${despues}${extra}` }
}

function nueva() {
  aviso.value = ''
  formulario.value = { evento: null }
}
function editar(e: Entrada) {
  aviso.value = ''
  if (e.evento) formulario.value = { evento: e.evento }
}
async function guardado(mensaje: string) {
  formulario.value = null
  aviso.value = mensaje
  await cargarTodo()
}

const textoIntro = computed(() => {
  switch (opciones.value?.rol) {
    case 'estudiante':
      return t('Anota tus tutorías, entregas y otras fechas. Tú decides si las ve tu tutor/a o solo tú. Aquí también salen los eventos del máster y los plazos de las convocatorias.')
    case 'tutor':
      return t('Anota tutorías y entregas con tus estudiantes, o fechas solo para ti. Aquí también salen los eventos del máster y los plazos de las convocatorias.')
    default:
      return 'Publica congresos, seminarios y plazos para todo el máster. Las anotaciones de estudiantes y tutores no se ven aquí.'
  }
})
</script>

<template>
  <div class="fade-in max-w-6xl">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="max-w-2xl">
        <h1 class="titulo-pagina">Calendario</h1>
        <p class="texto-suave mt-1">{{ textoIntro }}</p>
      </div>
      <button v-if="opciones && !formulario" type="button" class="btn-primary" @click="nueva">
        <AppIcon name="plus" :size="18" /> Añadir fecha
      </button>
    </div>

    <EstadoCarga v-if="cargando" />
    <template v-else>
      <AvisoError v-if="error" :mensaje="error" class="mt-6" />
      <p v-if="aviso" class="aviso-exito mt-6" role="status">{{ aviso }}</p>

      <FormularioEvento
        v-if="formulario && opciones"
        :key="formulario.evento?.id ?? 'nuevo'"
        class="mt-6 max-w-2xl"
        :opciones="opciones"
        :evento="formulario.evento"
        :fecha="diaElegido"
        @guardado="guardado"
        @cancelar="formulario = null"
      />

      <fieldset class="mt-6">
        <legend class="label">Mostrar</legend>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tipo in TODOS"
            :key="tipo"
            type="button"
            class="inline-flex items-center gap-2 px-3 min-h-tactil rounded-full border text-sm font-medium"
            :class="visibles.has(tipo) ? 'bg-papel border-surface-800 text-surface-900' : 'bg-surface-100 border-surface-200 text-surface-600 line-through'"
            :aria-pressed="visibles.has(tipo)"
            @click="alternar(tipo)"
          >
            <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: visibles.has(tipo) ? TIPOS[tipo].color : '#A6A6A0' }" aria-hidden="true" />
            {{ TIPOS[tipo].etiqueta }}
          </button>
        </div>
      </fieldset>

      <div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section class="card p-2 sm:p-5 min-w-0" aria-labelledby="t-mes">
          <div class="flex items-center justify-between gap-2 mb-3">
            <h2 id="t-mes" class="font-display text-lg sm:text-xl font-semibold text-surface-900 first-letter:uppercase" aria-live="polite">
              {{ nombreMes(mes) }}
            </h2>
            <div class="flex items-center gap-1">
              <button type="button" class="btn-secondary !px-3" @click="irAHoy">Hoy</button>
              <button type="button" class="min-w-tactil min-h-tactil inline-flex items-center justify-center rounded-md text-surface-900 hover:bg-surface-100" @click="irAMes(-1)">
                <AppIcon name="back" :size="18" etiqueta="Mes anterior" />
              </button>
              <button type="button" class="min-w-tactil min-h-tactil inline-flex items-center justify-center rounded-md text-surface-900 hover:bg-surface-100" @click="irAMes(1)">
                <AppIcon name="back" :size="18" etiqueta="Mes siguiente" class="rotate-180" />
              </button>
            </div>
          </div>

          <table class="w-full table-fixed border-collapse">
            <caption class="sr-only">{{ nombreMes(mes) }}. Elige un día para ver sus fechas.</caption>
            <thead>
              <tr>
                <th v-for="(d, i) in DIAS_CORTOS" :key="d" scope="col" class="pb-1 text-xs font-medium text-surface-800">
                  <abbr :title="DIAS_SEMANA[i]" class="no-underline">{{ d }}</abbr>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(semana, s) in semanas" :key="s">
                <td v-for="dia in semana" :key="dia.fecha" class="p-0 sm:p-0.5 align-top">
                  <button
                    type="button"
                    class="w-full min-h-[52px] sm:min-h-[72px] rounded-md flex flex-col items-center sm:items-start p-1 sm:p-2 text-sm border transition-colors"
                    :class="[
                      dia.fecha === diaElegido ? 'border-marino bg-brand-50' : 'border-transparent hover:bg-surface-100',
                      dia.delMes ? 'text-surface-900' : 'text-surface-600',
                    ]"
                    :aria-pressed="dia.fecha === diaElegido"
                    @click="elegir(dia.fecha)"
                  >
                    <span
                      class="inline-flex items-center justify-center w-7 h-7 rounded-full tabular-nums"
                      :class="dia.fecha === HOY ? 'bg-marino text-white font-semibold' : ''"
                    ><span class="sr-only">{{ etiquetaDia(dia.fecha).antes }}</span>{{ Number(dia.fecha.slice(8)) }}<span class="sr-only">{{ etiquetaDia(dia.fecha).despues }}</span></span>
                    <span class="flex flex-wrap gap-0.5 mt-1 sm:hidden" aria-hidden="true">
                      <span v-for="e in puntos(dia.fecha).slice(0, 3)" :key="e.id" class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: TIPOS[e.tipo].color }" />
                    </span>
                    <span class="hidden sm:flex flex-col gap-0.5 mt-1 w-full" aria-hidden="true">
                      <span
                        v-for="e in puntos(dia.fecha).slice(0, 2)"
                        :key="e.id"
                        class="block truncate text-left text-xs leading-tight pl-1.5 border-l-2"
                        :style="{ borderColor: TIPOS[e.tipo].color }"
                      >{{ e.titulo }}</span>
                      <span v-if="puntos(dia.fecha).length > 2" class="text-xs texto-suave">+{{ puntos(dia.fecha).length - 2 }}</span>
                    </span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <div class="space-y-6 min-w-0">
          <section class="card p-5" aria-labelledby="t-dia">
            <h2 id="t-dia" class="font-display text-lg font-semibold text-surface-900 first-letter:uppercase">
              {{ nombreDia(diaElegido) }}{{ diaElegido === HOY ? ' (hoy)' : '' }}
            </h2>
            <ul v-if="listaDia.length" class="divide-y divide-surface-200">
              <li v-for="e in listaDia" :key="e.id">
                <EntradaCalendario :entrada="e" @editar="editar(e)" />
              </li>
            </ul>
            <p v-else class="text-sm texto-suave mt-2">Nada anotado este día.</p>
          </section>

          <section class="card p-5" aria-labelledby="t-proximas">
            <h2 id="t-proximas" class="font-display text-lg font-semibold text-surface-900">Próximas fechas</h2>
            <ul v-if="listaProximas.length" class="divide-y divide-surface-200">
              <li v-for="e in listaProximas" :key="e.id">
                <EntradaCalendario :entrada="e" con-dia @editar="editar(e)" />
              </li>
            </ul>
            <p v-else class="text-sm texto-suave mt-2">No hay nada anotado en los próximos tres meses.</p>
          </section>
        </div>
      </div>
    </template>
  </div>
</template>
