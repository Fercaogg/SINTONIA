<script setup lang="ts">
import AppIcon from '@/components/comun/AppIcon.vue'
// Resumen del máster para la dirección: solo datos agregados y anónimos.
// La base de datos ya ha suprimido toda cifra calculada sobre menos de 5
// personas: aquí aparecen como "Datos insuficientes para garantizar el anonimato".
// Sin rankings, sin semáforos, sin datos por tutor y sin bienestar.
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { llamar } from '@/lib/api'
import { useCarga } from '@/lib/usar-carga'
import AvisoError from '@/components/comun/AvisoError.vue'
import EstadoCarga from '@/components/comun/EstadoCarga.vue'
import EstadoVacio from '@/components/comun/EstadoVacio.vue'
import GraficoSemanal from '@/components/graficos/GraficoSemanal.vue'

interface Cifra { valor: number | null; suprimida: boolean }
interface Semana {
  semana: number
  estudiantes: Cifra
  tasa_estudiantes: Cifra
  tasa_tutores: Cifra
  avance_estudiantes: Cifra
  avance_tutores: Cifra
  desajuste_medio: Cifra
  agendas: Cifra
}

// Colores de la marca validados para gráficos (ver DISENO.md).
// (Variables de tokens.css: en modo oscuro se aclaran.)
const COLOR_ESTUDIANTES = 'rgb(var(--rgb-s900))'
const COLOR_TUTORES = 'var(--color-graf-tutores)'
const SUPRIMIDA = 'Datos insuficientes para garantizar el anonimato'

const datos = ref<{ master: string; minimo: number; semanas: Semana[] } | null>(null)

const { cargando, error, cargar } = useCarga(async () => {
  datos.value = await llamar('resumen_direccion')
})

const semanas = computed(() => datos.value?.semanas ?? [])
const numeros = computed(() => semanas.value.map((s) => s.semana))
const serie = (clave: keyof Omit<Semana, 'semana'>) => semanas.value.map((s) => s[clave].valor)
const ultima = computed(() => semanas.value.at(-1))

const porcentaje = (v: number) => `${Math.round(v * 100)} %`
const decimal = (v: number) => v.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const entero = (v: number) => String(Math.round(v))
const maxAgendas = computed(() => Math.max(4, ...serie('agendas').map((v) => v ?? 0)))
// Marcas enteras del eje que siempre llegan al valor más alto.
const marcasAgendas = computed(() => {
  const paso = Math.max(1, Math.ceil(maxAgendas.value / 4))
  return Array.from({ length: Math.ceil(maxAgendas.value / paso) + 1 }, (_, i) => i * paso)
})

function mostrar(c: Cifra, formato: (v: number) => string) {
  return c.suprimida || c.valor === null ? SUPRIMIDA : formato(c.valor)
}

const filasTabla = computed(() =>
  semanas.value.map((s) => ({
    semana: s.semana,
    celdas: [
      mostrar(s.estudiantes, entero),
      mostrar(s.tasa_estudiantes, porcentaje),
      mostrar(s.tasa_tutores, porcentaje),
      mostrar(s.avance_estudiantes, decimal),
      mostrar(s.avance_tutores, decimal),
      mostrar(s.desajuste_medio, decimal),
      mostrar(s.agendas, entero),
    ],
  })),
)
</script>

<template>
  <div class="fade-in">
    <h1 class="titulo-pagina">Resumen del máster</h1>
    <p class="texto-suave mt-1 mb-8 max-w-3xl">
      {{ datos?.master }}. Solo datos agregados y anónimos de las semanas ya cerradas. Ninguna cifra se calcula sobre menos de
      {{ datos?.minimo ?? 5 }} personas, y nunca se muestran datos por tutor/a ni de bienestar.
    </p>

    <EstadoCarga v-if="cargando" />
    <AvisoError v-else-if="error" :mensaje="error" :reintentar="cargar" />
    <EstadoVacio v-else-if="!semanas.length" icono="chart" titulo="Todavía no hay datos" texto="Los resúmenes aparecerán cuando se cierre la primera semana del estudio." />

    <template v-else>
      <section v-if="ultima" class="grid gap-4 sm:grid-cols-3 mb-6" aria-label="Última semana cerrada">
        <div class="stat-card">
          <p class="stat-label">Semana {{ ultima.semana }}: estudiantes que respondieron</p>
          <p v-if="!ultima.tasa_estudiantes.suprimida" class="stat-value">{{ porcentaje(ultima.tasa_estudiantes.valor!) }}</p>
          <p v-else class="text-sm text-surface-800 flex gap-2 mt-2" data-suprimido="true"><AppIcon name="lock" :size="16" class="shrink-0 mt-0.5" />{{ SUPRIMIDA }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Semana {{ ultima.semana }}: tutores que respondieron</p>
          <p v-if="!ultima.tasa_tutores.suprimida" class="stat-value">{{ porcentaje(ultima.tasa_tutores.valor!) }}</p>
          <p v-else class="text-sm text-surface-800 flex gap-2 mt-2" data-suprimido="true"><AppIcon name="lock" :size="16" class="shrink-0 mt-0.5" />{{ SUPRIMIDA }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Semana {{ ultima.semana }}: agendas generadas</p>
          <p v-if="!ultima.agendas.suprimida" class="stat-value">{{ ultima.agendas.valor }}</p>
          <p v-else class="text-sm text-surface-800 flex gap-2 mt-2" data-suprimido="true"><AppIcon name="lock" :size="16" class="shrink-0 mt-0.5" />{{ SUPRIMIDA }}</p>
        </div>
      </section>

      <div class="grid gap-6 lg:grid-cols-2">
        <GraficoSemanal
          titulo="Tasa de respuesta"
          descripcion="Proporción de personas que hicieron su check-in cada semana."
          :semanas="numeros"
          :series="[
            { nombre: 'Estudiantes', color: COLOR_ESTUDIANTES, valores: serie('tasa_estudiantes') },
            { nombre: 'Tutores', color: COLOR_TUTORES, valores: serie('tasa_tutores') },
          ]"
          :max="1"
          :marcas="[0, 0.25, 0.5, 0.75, 1]"
          :formato="porcentaje"
        />
        <GraficoSemanal
          titulo="Avance medio"
          descripcion="Media de las respuestas sobre el avance (de 1 a 5)."
          :semanas="numeros"
          :series="[
            { nombre: 'Según los estudiantes', color: COLOR_ESTUDIANTES, valores: serie('avance_estudiantes') },
            { nombre: 'Según los tutores', color: COLOR_TUTORES, valores: serie('avance_tutores') },
          ]"
          :min="1"
          :max="5"
          :marcas="[1, 2, 3, 4, 5]"
          :formato="decimal"
        />
        <GraficoSemanal
          titulo="Desajuste medio en el avance"
          descripcion="Media de la diferencia, sin signo, entre las dos miradas de cada pareja (de 0 a 4)."
          :semanas="numeros"
          :series="[{ nombre: 'Desajuste medio', color: COLOR_TUTORES, valores: serie('desajuste_medio') }]"
          :max="4"
          :marcas="[0, 1, 2, 3, 4]"
          :formato="decimal"
        />
        <GraficoSemanal
          titulo="Agendas generadas"
          descripcion="Número de parejas que recibieron agenda para la tutoría."
          tipo="barras"
          :semanas="numeros"
          :series="[{ nombre: 'Agendas', color: COLOR_TUTORES, valores: serie('agendas') }]"
          :max="marcasAgendas.at(-1)!"
          :marcas="marcasAgendas"
          :formato="entero"
        />
      </div>

      <section class="card p-5 sm:p-6 mt-6" aria-labelledby="t-tabla">
        <h2 id="t-tabla" class="font-semibold text-surface-900 mb-4">Todos los datos</h2>
        <div class="overflow-x-auto" tabindex="0" role="region" aria-label="Tabla de datos del máster (se puede desplazar)">
          <table class="w-full text-sm text-left tabular-nums">
            <caption class="sr-only">Datos agregados por semana</caption>
            <thead class="text-surface-800">
              <tr class="border-b border-surface-200">
                <th scope="col" class="py-2 pr-3 font-semibold">Semana</th>
                <th scope="col" class="py-2 pr-3 font-semibold">Estudiantes</th>
                <th scope="col" class="py-2 pr-3 font-semibold">Respuesta estudiantes</th>
                <th scope="col" class="py-2 pr-3 font-semibold">Respuesta tutores</th>
                <th scope="col" class="py-2 pr-3 font-semibold">Avance (estudiantes)</th>
                <th scope="col" class="py-2 pr-3 font-semibold">Avance (tutores)</th>
                <th scope="col" class="py-2 pr-3 font-semibold">Desajuste medio</th>
                <th scope="col" class="py-2 font-semibold">Agendas</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in filasTabla" :key="f.semana" class="border-b border-surface-200 last:border-0 align-top">
                <th scope="row" class="py-2 pr-3 font-medium">{{ f.semana }}</th>
                <td v-for="(c, i) in f.celdas" :key="i" class="py-2 pr-3" :class="{ 'texto-suave text-xs': c === SUPRIMIDA }">{{ c }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p class="text-sm texto-suave mt-6">
        Los avisos de "Necesito apoyo" están en <RouterLink to="/direccion/avisos" class="enlace">Avisos de apoyo</RouterLink>.
      </p>
    </template>
  </div>
</template>
