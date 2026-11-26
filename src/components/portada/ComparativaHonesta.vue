<script setup lang="ts">
// Comparativa honesta en tres columnas, sin nombrar marcas ni productos:
// la tutoría sin seguimiento, SINTONÍA y las herramientas que vigilan.
// Incluye también los límites de SINTONÍA.
import { computed } from 'vue'
import { useIdioma } from '@/lib/idioma'
const { t } = useIdioma()
const COLUMNAS = computed(() => [t('Tutoría sin seguimiento', 'Supervision without follow-up'), t('SINTONÍA', 'SINTONÍA'), t('Herramientas que vigilan', 'Monitoring tools')] as const)

const FILAS = computed<{ aspecto: string; valores: [string, string, string] }[]>(() => [
  {
    aspecto: t('Qué se recoge', 'What is collected'),
    valores: [
      t('Nada de forma regular: lo que surja en la tutoría.', 'Nothing regular: whatever comes up in the meeting.'),
      t('Cuatro respuestas de 1 a 5 del estudiante y una o dos del tutor/a, una vez a la semana.', 'Four answers from 1 to 5 from the student and one or two from the supervisor, once a week.'),
      t('Actividad en segundo plano: conexiones, tiempo, clics o entregas.', 'Background activity: logins, time, clicks or submissions.'),
    ],
  },
  {
    aspecto: t('Tiempo que pide', 'Time it takes'),
    valores: [t('Ninguno añadido.', 'None added.'), t('Unos 60 segundos al estudiante y 30 al tutor/a, a la semana.', 'About 60 seconds for the student and 30 for the supervisor, each week.'), t('Ninguno a la vista: se registra sin preguntar.', 'None visible: it is recorded without asking.')],
  },
  {
    aspecto: t('Quién ve qué', 'Who sees what'),
    valores: [
      t('Solo lo que cada uno cuenta.', 'Only what each person shares.'),
      t('Cada persona, lo suyo. La dirección, solo cifras de 5 personas o más.', 'Each person, their own. Programme directors, only figures for 5 people or more.'),
      t('Quien supervisa suele ver los datos de cada persona.', 'Whoever oversees usually sees each person\'s data.'),
    ],
  },
  {
    aspecto: t('El bienestar', 'Wellbeing'),
    valores: [t('No se pregunta.', 'Not asked about.'), t('Se pregunta, y solo lo ve el propio estudiante.', 'Asked about, and only the student sees it.'), t('A veces se deduce de la actividad.', 'Sometimes inferred from activity.')],
  },
  {
    aspecto: t('Notas, rankings y alertas', 'Marks, rankings and alerts'),
    valores: [t('No.', 'No.'), t('No.', 'No.'), t('Suelen dar puntuaciones, rankings o alertas de riesgo.', 'They often give scores, rankings or risk alerts.')],
  },
  {
    aspecto: t('Cuándo se nota un desajuste', 'When a mismatch is noticed'),
    valores: [
      t('Cuando ya ha crecido, si alguien lo dice.', 'When it has already grown, if someone mentions it.'),
      t('Cada semana, con reglas públicas, y con tres preguntas para hablarlo.', 'Every week, with public rules, and with three questions to talk it through.'),
      t('Según indicadores que no siempre se explican.', 'According to indicators that are not always explained.'),
    ],
  },
  {
    aspecto: t('Límites', 'Limits'),
    valores: [
      t('Depende de la memoria y de que alguien saque el tema.', 'It depends on memory and on someone raising the topic.'),
      t('No sustituye la tutoría ni mide la calidad del trabajo. Funciona si las dos personas responden.', 'It does not replace supervision or measure the quality of the work. It works if both people answer.'),
      t('Mide actividad, no cómo va el trabajo.', 'It measures activity, not how the work is going.'),
    ],
  },
])
</script>

<template>
  <!-- Escritorio: tabla de tres columnas -->
  <div class="hidden md:block card overflow-hidden">
    <table class="w-full text-left text-[0.95rem]">
      <caption class="sr-only">{{ t('Comparación entre la tutoría sin seguimiento, SINTONÍA y las herramientas que vigilan', 'Comparison between supervision without follow-up, SINTONÍA and monitoring tools') }}</caption>
      <thead>
        <tr class="border-b border-surface-200">
          <th scope="col" class="w-[19%] p-4"><span class="sr-only">{{ t('Aspecto', 'Aspect') }}</span></th>
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
          <dt class="text-xs font-semibold uppercase tracking-[0.08em]" :class="i === 1 ? 'text-brand-900' : 'text-surface-800'">{{ COLUMNAS[i] }}</dt>
          <dd class="mt-0.5 leading-relaxed" :class="i === 1 ? 'text-surface-900 font-medium' : 'texto-suave'">{{ v }}</dd>
        </div>
      </dl>
    </li>
  </ul>
</template>
