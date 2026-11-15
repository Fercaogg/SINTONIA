<script setup lang="ts">
// Comparativa honesta en tres columnas, sin nombrar marcas ni productos:
// la tutoría sin seguimiento, SINTONÍA y las herramientas que vigilan.
// Incluye también los límites de SINTONÍA.
const COLUMNAS = ['Tutoría sin seguimiento', 'SINTONÍA', 'Herramientas que vigilan'] as const

const FILAS: { aspecto: string; valores: [string, string, string] }[] = [
  {
    aspecto: 'Qué se recoge',
    valores: [
      'Nada de forma regular: lo que surja en la tutoría.',
      'Cuatro respuestas de 1 a 5 del estudiante y una o dos del tutor/a, una vez a la semana.',
      'Actividad en segundo plano: conexiones, tiempo, clics o entregas.',
    ],
  },
  {
    aspecto: 'Tiempo que pide',
    valores: ['Ninguno añadido.', 'Unos 60 segundos al estudiante y 30 al tutor/a, a la semana.', 'Ninguno a la vista: se registra sin preguntar.'],
  },
  {
    aspecto: 'Quién ve qué',
    valores: [
      'Solo lo que cada uno cuenta.',
      'Cada persona, lo suyo. La dirección, solo cifras de 5 personas o más.',
      'Quien supervisa suele ver los datos de cada persona.',
    ],
  },
  {
    aspecto: 'El bienestar',
    valores: ['No se pregunta.', 'Se pregunta, y solo lo ve el propio estudiante.', 'A veces se deduce de la actividad.'],
  },
  {
    aspecto: 'Notas, rankings y alertas',
    valores: ['No.', 'No.', 'Suelen dar puntuaciones, rankings o alertas de riesgo.'],
  },
  {
    aspecto: 'Cuándo se nota un desajuste',
    valores: [
      'Cuando ya ha crecido, si alguien lo dice.',
      'Cada semana, con reglas públicas, y con tres preguntas para hablarlo.',
      'Según indicadores que no siempre se explican.',
    ],
  },
  {
    aspecto: 'Límites',
    valores: [
      'Depende de la memoria y de que alguien saque el tema.',
      'No sustituye la tutoría ni mide la calidad del trabajo. Funciona si las dos personas responden.',
      'Mide actividad, no cómo va el trabajo.',
    ],
  },
]
</script>

<template>
  <!-- Escritorio: tabla de tres columnas -->
  <div class="hidden md:block card overflow-hidden">
    <table class="w-full text-left text-[0.95rem]">
      <caption class="sr-only">Comparación entre la tutoría sin seguimiento, SINTONÍA y las herramientas que vigilan</caption>
      <thead>
        <tr class="border-b border-surface-200">
          <th scope="col" class="w-[19%] p-4"><span class="sr-only">Aspecto</span></th>
          <th
            v-for="(c, i) in COLUMNAS"
            :key="c"
            scope="col"
            class="p-4 font-display text-lg font-semibold"
            :class="i === 1 ? 'bg-marino text-white' : 'text-surface-900'"
          >
            {{ c }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="f in FILAS" :key="f.aspecto" class="border-b border-surface-200 last:border-b-0 align-top">
          <th scope="row" class="p-4 text-sm font-semibold text-surface-900">{{ f.aspecto }}</th>
          <td v-for="(v, i) in f.valores" :key="i" class="p-4 leading-relaxed" :class="i === 1 ? 'bg-brand-50 text-surface-900 font-medium' : 'texto-suave'">
            {{ v }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Móvil: una tarjeta por aspecto, con las tres respuestas -->
  <ul class="md:hidden space-y-4">
    <li v-for="f in FILAS" :key="f.aspecto" class="card p-5">
      <h3 class="font-display text-lg font-semibold text-surface-900">{{ f.aspecto }}</h3>
      <dl class="mt-3 space-y-3">
        <div v-for="(v, i) in f.valores" :key="i" :class="i === 1 ? 'rounded-lg bg-brand-50 border border-brand-200 p-3 -mx-1' : ''">
          <dt class="text-xs font-semibold uppercase tracking-[0.12em]" :class="i === 1 ? 'text-brand-900' : 'text-surface-800'">{{ COLUMNAS[i] }}</dt>
          <dd class="mt-0.5 leading-relaxed" :class="i === 1 ? 'text-surface-900 font-medium' : 'texto-suave'">{{ v }}</dd>
        </div>
      </dl>
    </li>
  </ul>
</template>
