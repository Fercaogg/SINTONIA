<script setup lang="ts">
import AppLogo from '@/components/comun/AppLogo.vue'
// Dosier de una página (A4), solo para generar el PDF descargable
// (scripts/generar-pdf.mjs → public/dosier/sintonia-dosier.pdf).
// Qué es, cómo funciona, garantías éticas, estado del proyecto, dirección
// (Luis y Ana en igualdad, en orden alfabético) y contacto.
import OndasSintonia from '@/components/portada/OndasSintonia.vue'
import { AUTOR, DIRECCION, PASOS } from '@/contenido/portada'
import { CORREO_CONTACTO, URL_SITIO, VERSION } from '@/lib/publico'

const GARANTIAS = [
  'Acompañar sin vigilar: no pide subir el trabajo, no pone notas, no hace rankings y no deduce emociones.',
  'El bienestar solo lo ve el propio estudiante, y se guarda cifrado.',
  'El tutor/a no ve las respuestas del estudiante. La dirección solo ve cifras de 5 personas o más.',
  'Datos en la Unión Europea (Fráncfort). Retirada y borrado cuando la persona quiera.',
]
</script>

<template>
  <main class="dosier mx-auto max-w-[48rem] bg-white px-10 py-9 text-[13px] leading-snug text-surface-900">
    <header class="flex items-start justify-between gap-6">
      <div>
        <p class="text-2xl"><AppLogo /></p>
        <h1 class="mt-2 font-display text-[1.65rem] font-medium leading-tight text-[#111111]">Acompañar el trabajo académico, sin vigilar</h1>
        <p class="mt-1.5 text-[14px]">Un registro semanal muy breve de estudiante y tutor/a para que las tutorías empiecen por lo que importa.</p>
      </div>
      <div class="w-40 shrink-0 pt-2"><OndasSintonia :desfase="0" :alto="56" :grosor="3" /></div>
    </header>

    <section class="mt-5">
      <h2 class="titulo">Cómo funciona</h2>
      <ol class="mt-2 grid grid-cols-3 gap-3">
        <li v-for="(p, i) in PASOS" :key="p.titulo" class="rounded-lg border border-surface-200 p-3">
          <p class="font-display font-semibold text-[#111111]">{{ i + 1 }}. {{ p.titulo }}</p>
          <p class="mt-1">{{ p.texto }}</p>
        </li>
      </ol>
      <p class="mt-2">Unos 60 segundos a la semana para el estudiante y 30 para el tutor/a, con todos sus estudiantes.</p>
    </section>

    <section class="mt-4">
      <h2 class="titulo">Garantías éticas</h2>
      <ul class="mt-2 grid grid-cols-2 gap-x-5 gap-y-1.5 list-disc pl-4">
        <li v-for="g in GARANTIAS" :key="g">{{ g }}</li>
      </ul>
    </section>

    <section class="mt-4">
      <h2 class="titulo">Estado del proyecto</h2>
      <p class="mt-2">
        Prototipo del Trabajo Fin de Máster (Máster en Estudios de la Ciencia, la Tecnología y la Innovación, Universidad de Salamanca). Piloto previsto de
        febrero a abril de 2027 en dos másteres de la Universidad, con 30 a 50 parejas. El estudio está pendiente de revisión por el Comité de Ética de la
        Universidad de Salamanca. Versión {{ VERSION }}.
      </p>
    </section>

    <section class="mt-4">
      <h2 class="titulo">Dirección</h2>
      <ul class="mt-2 grid grid-cols-2 gap-3">
        <li v-for="m in DIRECCION" :key="m.nombre" class="rounded-lg border border-surface-200 p-3">
          <p class="font-display font-semibold text-[#111111]">{{ m.nombre }}</p>
          <p>{{ m.categoria }}</p>
          <p class="text-surface-800">{{ m.departamento }}</p>
        </li>
      </ul>
      <p class="mt-2">{{ AUTOR }}</p>
    </section>

    <section class="mt-4">
      <h2 class="titulo">Verla por dentro</h2>
      <ul class="mt-2 grid grid-cols-3 gap-3">
        <li class="rounded-lg bg-surface-100 p-3"><p class="font-semibold">Demostración guiada</p><p>{{ URL_SITIO.replace('https://', '') }}/demo/recorrido</p></li>
        <li class="rounded-lg bg-surface-100 p-3"><p class="font-semibold">Para instituciones</p><p>{{ URL_SITIO.replace('https://', '') }}/instituciones</p></li>
        <li class="rounded-lg bg-surface-100 p-3"><p class="font-semibold">La investigación</p><p>{{ URL_SITIO.replace('https://', '') }}/investigacion</p></li>
      </ul>
    </section>

    <footer class="mt-5 flex items-center justify-between gap-4 rounded-lg bg-[#1b1b1b] px-4 py-3 text-white">
      <p><span class="font-semibold">Contacto:</span> {{ CORREO_CONTACTO }}</p>
      <p>{{ URL_SITIO.replace('https://', '') }}</p>
    </footer>
  </main>
</template>

<style scoped>
.titulo {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #b83a0e;
}
@page {
  size: A4;
  margin: 10mm;
}
@media print {
  :global(html),
  :global(body) {
    background: #fff !important;
  }
  .dosier {
    max-width: none;
    padding: 0;
  }
}
</style>
