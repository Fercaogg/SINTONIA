<script setup lang="ts">
// Gráfico semanal sencillo en SVG (barras para una serie, líneas para una o
// dos). Las semanas sin dato (cifras suprimidas por tener menos de 5
// personas) quedan en blanco y la ventana emergente lo explica.
// Especificaciones: líneas de 2 px, marcadores de 8 px con anillo del color de
// fondo, barras de 24 px como máximo con el extremo redondeado, cuadrícula
// de 1 px discreta. Colores validados (ver DISENO.md).
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export interface Serie {
  nombre: string
  color: string
  valores: (number | null)[]
}

const props = withDefaults(
  defineProps<{
    titulo: string
    descripcion?: string
    semanas: number[]
    series: Serie[]
    tipo?: 'barras' | 'lineas'
    min?: number
    max: number
    marcas: number[]
    formato?: (v: number) => string
  }>(),
  { descripcion: '', tipo: 'lineas', min: 0, formato: (v: number) => String(v) },
)

// Se dibuja al ancho real del contenedor, para que el texto mantenga su
// tamaño (12 px) en el móvil y en el escritorio.
const contenedor = ref<HTMLElement | null>(null)
const ANCHO = ref(600)
const ALTO = 220
const M = { izq: 44, der: 52, arr: 24, aba: 28 }
const anchoUtil = computed(() => ANCHO.value - M.izq - M.der)
const altoUtil = ALTO - M.arr - M.aba
let observador: ResizeObserver | null = null
onMounted(() => {
  if (!contenedor.value) return
  const medir = () => { ANCHO.value = Math.max(280, Math.round(contenedor.value!.clientWidth)) }
  medir()
  observador = new ResizeObserver(medir)
  observador.observe(contenedor.value)
})
onBeforeUnmount(() => observador?.disconnect())

const banda = computed(() => anchoUtil.value / Math.max(props.semanas.length, 1))
const x = (i: number) => M.izq + banda.value * (i + 0.5)
const y = (v: number) => M.arr + altoUtil * (1 - (v - props.min) / (props.max - props.min))

const anchoBarra = computed(() => Math.min(24, banda.value * 0.6))

/** Tramos de línea entre valores seguidos (se corta donde falta el dato). */
function tramos(valores: (number | null)[]): string[] {
  const resultado: string[] = []
  let actual: string[] = []
  valores.forEach((v, i) => {
    if (v === null) {
      if (actual.length > 1) resultado.push(actual.join(' '))
      actual = []
    } else actual.push(`${x(i)},${y(v)}`)
  })
  if (actual.length > 1) resultado.push(actual.join(' '))
  return resultado
}

/** Barra con el extremo superior redondeado (4 px) y la base recta. */
function barra(i: number, v: number): string {
  const x0 = x(i) - anchoBarra.value / 2
  const x1 = x0 + anchoBarra.value
  const yb = y(props.min)
  const yt = y(v)
  const r = Math.min(4, (yb - yt) / 2, anchoBarra.value / 2)
  return `M${x0},${yb} V${yt + r} Q${x0},${yt} ${x0 + r},${yt} H${x1 - r} Q${x1},${yt} ${x1},${yt + r} V${yb} Z`
}

/** Última semana con dato de cada serie (para la etiqueta directa). */
const finales = computed(() =>
  props.series.map((s) => {
    for (let i = s.valores.length - 1; i >= 0; i--) if (s.valores[i] !== null) return { i, v: s.valores[i] as number }
    return null
  }),
)

const activa = ref<number | null>(null)
const hayDatos = computed(() => props.series.some((s) => s.valores.some((v) => v !== null)))
const haySuprimidos = computed(() => props.series.some((s) => s.valores.some((v) => v === null)))

const resumenAccesible = computed(() =>
  props.series
    .map((s) => `${s.nombre}: ${s.valores.map((v, i) => `semana ${props.semanas[i]}, ${v === null ? 'sin dato' : props.formato(v)}`).join('; ')}`)
    .join('. '),
)
</script>

<template>
  <figure class="card p-5 sm:p-6">
    <figcaption class="mb-3">
      <span class="block font-semibold text-surface-900">{{ titulo }}</span>
      <span v-if="descripcion" class="block text-sm texto-suave mt-0.5">{{ descripcion }}</span>
    </figcaption>

    <ul v-if="series.length > 1" class="flex flex-wrap gap-x-5 gap-y-1 mb-2 text-sm text-surface-800" aria-hidden="true">
      <li v-for="s in series" :key="s.nombre" class="flex items-center gap-2">
        <span class="inline-block w-3 h-3 rounded-full" :style="{ background: s.color }" />{{ s.nombre }}
      </li>
    </ul>

    <p v-if="!hayDatos" class="text-sm text-surface-800 py-6" data-suprimido="true">Datos insuficientes para garantizar el anonimato.</p>

    <div v-else ref="contenedor" class="relative">
      <svg :viewBox="`0 0 ${ANCHO} ${ALTO}`" class="w-full h-auto" role="img" :aria-label="`${titulo}. ${resumenAccesible}`" @mouseleave="activa = null">
        <!-- Cuadrícula y eje -->
        <g>
          <template v-for="m in marcas" :key="m">
            <line :x1="M.izq" :x2="ANCHO - M.der" :y1="y(m)" :y2="y(m)" stroke="#E3EAEA" stroke-width="1" />
            <text :x="M.izq - 8" :y="y(m) + 4" text-anchor="end" font-size="12" fill="#5A6B75">{{ formato(m) }}</text>
          </template>
          <text v-for="(s, i) in semanas" :key="s" :x="x(i)" :y="ALTO - 8" text-anchor="middle" font-size="12" fill="#5A6B75">S{{ s }}</text>
        </g>

        <!-- Columna resaltada al pasar el ratón -->
        <rect v-if="activa !== null" :x="x(activa) - banda / 2" :y="M.arr" :width="banda" :height="altoUtil" fill="#F0F4F3" />

        <!-- Barras -->
        <g v-if="tipo === 'barras'">
          <template v-for="(v, i) in series[0].valores" :key="i">
            <path v-if="v !== null && v > min" :d="barra(i, v)" :fill="series[0].color" />
          </template>
        </g>

        <!-- Líneas y marcadores -->
        <g v-else>
          <g v-for="s in series" :key="s.nombre">
            <polyline v-for="(t, k) in tramos(s.valores)" :key="k" :points="t" fill="none" :stroke="s.color" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
            <template v-for="(v, i) in s.valores" :key="i">
              <circle v-if="v !== null" :cx="x(i)" :cy="y(v)" r="4" :fill="s.color" stroke="#FFFFFF" stroke-width="2" />
            </template>
          </g>
        </g>

        <!-- Etiqueta directa: el último valor de cada serie -->
        <template v-for="(f, k) in finales" :key="k">
          <text
            v-if="f"
            :x="tipo === 'barras' ? x(f.i) : x(f.i) + 10"
            :y="tipo === 'barras' ? y(f.v) - 8 : y(f.v) + 4 + (series.length > 1 && k === 1 && finales[0] && Math.abs(y(finales[0].v) - y(f.v)) < 14 ? 14 : 0)"
            :text-anchor="tipo === 'barras' ? 'middle' : 'start'"
            font-size="12"
            font-weight="600"
            fill="#0A4A6C"
          >{{ formato(f.v) }}</text>
        </template>

        <!-- Zonas para la ventana emergente (más grandes que las marcas) -->
        <rect
          v-for="(s, i) in semanas"
          :key="`h${s}`"
          :x="x(i) - banda / 2"
          :y="M.arr"
          :width="banda"
          :height="altoUtil"
          fill="transparent"
          @mouseenter="activa = i"
        />
      </svg>

      <div
        v-if="activa !== null"
        class="absolute top-0 pointer-events-none bg-white border border-surface-200 shadow-card rounded-md px-3 py-2 text-xs text-surface-900 whitespace-nowrap"
        :style="{ left: `${(x(activa) / ANCHO) * 100}%`, transform: activa > semanas.length / 2 ? 'translateX(-105%)' : 'translateX(5%)' }"
        role="presentation"
      >
        <p class="font-semibold mb-1">Semana {{ semanas[activa] }}</p>
        <p v-for="s in series" :key="s.nombre" class="flex items-center gap-2">
          <span class="inline-block w-2 h-2 rounded-full" :style="{ background: s.color }" />
          <span>{{ s.nombre }}: {{ s.valores[activa] === null ? 'datos insuficientes' : formato(s.valores[activa] as number) }}</span>
        </p>
      </div>
    </div>

    <p v-if="hayDatos && haySuprimidos" class="text-xs texto-suave mt-2">
      Las semanas en blanco tienen datos insuficientes para garantizar el anonimato.
    </p>
  </figure>
</template>
