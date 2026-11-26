<script setup lang="ts">
// Guía del doctorado en la USAL para Puente al doctorado: programas, acceso y
// plazos, grupos de investigación, ayudas predoctorales y contacto de la
// Escuela. Contenido estático y comprobado en src/contenido/doctorado.ts.
import { computed } from 'vue'
import Pendiente from '@/components/comun/Pendiente.vue'
import { fechaCorta } from '@/lib/fechas'
import {
  AFINES,
  AYUDAS,
  CONSULTA_DOCTORADO,
  CONTACTO_ESCUELA,
  GRUPOS_CERCANOS,
  GRUPOS_PENDIENTE,
  PASOS_ACCESO,
  PLAZOS_2026_27,
  PLAZOS_2027_28,
  RAMAS,
  TASAS,
  URL_GRUPOS,
  URL_OFERTA,
} from '@/contenido/doctorado'

const total = RAMAS.reduce((n, r) => n + r.programas.length, 0)
const afines = computed(() => RAMAS.flatMap((r) => r.programas).filter((p) => AFINES.includes(p.nombre)))
const consulta = fechaCorta(CONSULTA_DOCTORADO)
const SIN_BASES = '[PENDIENTE: sin bases comprobadas]'
const telefono = (t: string) => t.replace(/,? ?ext\..*$/, '').replace(/\s/g, '')
</script>

<template>
  <div class="mt-10 space-y-10">
    <p class="text-sm texto-suave">
      Información pública de las páginas oficiales, consultadas el {{ consulta }}. Si algo cambia, manda la página oficial.
    </p>

    <!-- Programas de doctorado -->
    <section aria-labelledby="t-programas">
      <h2 id="t-programas" class="font-display text-xl font-semibold text-surface-900 mb-2">Programas de doctorado de la USAL</h2>
      <p class="texto-suave mb-4 leading-relaxed">
        La Escuela de Doctorado ofrece {{ total }} programas en {{ RAMAS.length }} ramas. Cada ficha explica sus líneas de investigación y sus
        criterios de admisión.
      </p>

      <div class="card p-5 mb-4">
        <h3 class="font-semibold text-surface-900">Afines al TFM por su nombre</h3>
        <p class="text-sm texto-suave mt-1">Comprueba en cada ficha si alguna línea encaja con tu trabajo.</p>
        <ul class="mt-3 space-y-2">
          <li v-for="p in afines" :key="p.url">
            <a :href="p.url" target="_blank" rel="noopener" class="enlace">
              {{ p.nombre }} <span class="sr-only">(ficha oficial, se abre en otra pestaña)</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="card divide-y divide-surface-200">
        <details v-for="r in RAMAS" :key="r.rama" class="group">
          <summary class="flex items-center justify-between gap-4 px-5 py-4 min-h-tactil cursor-pointer list-none font-medium text-surface-900">
            <span>{{ r.rama }} <span class="texto-suave font-normal">({{ r.programas.length }})</span></span>
            <span class="shrink-0 transition-transform group-open:rotate-45 text-xl leading-none" aria-hidden="true">+</span>
          </summary>
          <ul class="px-5 pb-5 space-y-2">
            <li v-for="p in r.programas" :key="p.url">
              <a :href="p.url" target="_blank" rel="noopener" class="enlace">
                {{ p.nombre }} <span class="sr-only">(ficha oficial, se abre en otra pestaña)</span>
              </a>
            </li>
          </ul>
        </details>
      </div>
      <p class="text-sm mt-3">
        <a :href="URL_OFERTA" target="_blank" rel="noopener" class="enlace">
          Oferta completa en la web de la Escuela <span class="sr-only">(se abre en otra pestaña)</span>
        </a>
      </p>
    </section>

    <!-- Acceso y plazos -->
    <section aria-labelledby="t-acceso">
      <h2 id="t-acceso" class="font-display text-xl font-semibold text-surface-900 mb-4">Cómo acceder y plazos</h2>
      <ol class="space-y-3">
        <li v-for="(paso, i) in PASOS_ACCESO" :key="paso.titulo" class="card p-5 flex gap-4">
          <span class="font-mono text-sm text-brand-900 shrink-0 mt-0.5" aria-hidden="true">{{ i + 1 }}</span>
          <div class="min-w-0">
            <h3 class="font-semibold text-surface-900">{{ paso.titulo }}</h3>
            <p class="text-sm leading-relaxed mt-1">{{ paso.texto }}</p>
            <p v-if="paso.enlace" class="text-sm mt-2">
              <a :href="paso.enlace.url" target="_blank" rel="noopener" class="enlace">
                {{ paso.enlace.texto }} <span class="sr-only">(se abre en otra pestaña)</span>
              </a>
            </p>
          </div>
        </li>
      </ol>

      <div class="card p-5 mt-4">
        <h3 class="font-semibold text-surface-900">Si terminas el máster en 2027 (curso 2027/28)</h3>
        <p class="text-sm mt-2 leading-relaxed"><Pendiente :texto="PLAZOS_2027_28" /></p>
      </div>

      <div class="card p-5 mt-4">
        <h3 class="font-semibold text-surface-900">Plazos del curso 2026/27, como referencia</h3>
        <p class="text-sm texto-suave mt-1">Ya han pasado. Sirven para hacerse una idea del calendario.</p>
        <dl class="mt-3 divide-y divide-surface-200">
          <div v-for="pl in PLAZOS_2026_27" :key="pl.que" class="py-2 sm:flex sm:gap-4">
            <dt class="text-sm font-medium text-surface-900 sm:w-1/2">{{ pl.que }}</dt>
            <dd class="text-sm sm:w-1/2">{{ pl.cuando }}</dd>
          </div>
        </dl>
      </div>

      <div class="card p-5 mt-4">
        <h3 class="font-semibold text-surface-900">Tasas</h3>
        <p class="text-sm mt-2 leading-relaxed">{{ TASAS.norma }}.</p>
        <p class="text-sm mt-2"><Pendiente :texto="TASAS.importes" /></p>
        <p class="text-sm mt-2">
          <a :href="TASAS.url" target="_blank" rel="noopener" class="enlace">
            Precios públicos <span class="sr-only">(se abre en otra pestaña)</span>
          </a>
        </p>
      </div>
    </section>

    <!-- Grupos de investigación -->
    <section aria-labelledby="t-grupos">
      <h2 id="t-grupos" class="font-display text-xl font-semibold text-surface-900 mb-2">Grupos de investigación</h2>
      <p class="texto-suave mb-4 leading-relaxed">
        Un grupo cercano a tu tema es buen sitio para buscar dirección de tesis y para las ayudas ligadas a proyectos.
      </p>
      <div class="card p-5">
        <ul v-if="GRUPOS_CERCANOS.length" class="space-y-2">
          <li v-for="g in GRUPOS_CERCANOS" :key="g.url">
            <a :href="g.url" target="_blank" rel="noopener" class="enlace">
              {{ g.nombre }} <span class="sr-only">(se abre en otra pestaña)</span>
            </a>
          </li>
        </ul>
        <p v-else class="text-sm"><Pendiente :texto="GRUPOS_PENDIENTE" /></p>
        <p class="text-sm mt-3">
          <a :href="URL_GRUPOS" target="_blank" rel="noopener" class="enlace">
            Grupos de investigación de la USAL <span class="sr-only">(portal oficial, se abre en otra pestaña)</span>
          </a>
        </p>
      </div>
    </section>

    <!-- Ayudas predoctorales -->
    <section aria-labelledby="t-ayudas">
      <h2 id="t-ayudas" class="font-display text-xl font-semibold text-surface-900 mb-2">Ayudas para hacer el doctorado</h2>
      <p class="texto-suave mb-4 leading-relaxed">
        Comparativa a partir de las bases oficiales. Las ventajas y desventajas salen de lo que dicen las bases, no de opiniones.
        Las de 2027 todavía no se han publicado.
      </p>

      <!-- Escritorio: resumen en tabla (en móvil, solo las tarjetas de abajo) -->
      <div class="hidden md:block card overflow-hidden mb-4">
        <table class="w-full table-fixed text-sm text-left [overflow-wrap:break-word]">
          <caption class="sr-only">Resumen de las ayudas predoctorales: cuantía, duración y plazos</caption>
          <thead>
            <tr class="border-b border-surface-200">
              <th scope="col" class="p-3 font-semibold text-surface-900 w-[28%]">Ayuda</th>
              <th scope="col" class="p-3 font-semibold text-surface-900">Cuantía</th>
              <th scope="col" class="p-3 font-semibold text-surface-900 w-[20%]">Duración</th>
              <th scope="col" class="p-3 font-semibold text-surface-900 w-[24%]">Plazos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in AYUDAS" :key="a.id" class="border-b border-surface-200 last:border-b-0 align-top">
              <th scope="row" class="p-3 font-semibold text-surface-900">{{ a.nombre }}</th>
              <td class="p-3 leading-relaxed"><Pendiente :texto="a.cuantia" /></td>
              <td class="p-3 leading-relaxed"><Pendiente :texto="a.duracion" /></td>
              <td class="p-3 leading-relaxed"><Pendiente :texto="a.plazos" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Detalle de cada ayuda, plegable (en móvil, también hace de tabla) -->
      <h3 class="sr-only">Detalle de cada ayuda</h3>
      <div class="card divide-y divide-surface-200">
        <details v-for="a in AYUDAS" :key="a.id" class="group">
          <summary class="flex items-center justify-between gap-4 px-5 py-4 min-h-tactil cursor-pointer list-none">
            <span>
              <span class="font-medium text-surface-900">{{ a.nombre }}</span>
              <span class="block text-sm texto-suave mt-0.5">{{ a.organismo }}</span>
            </span>
            <span class="shrink-0 transition-transform group-open:rotate-45 text-xl leading-none" aria-hidden="true">+</span>
          </summary>
          <dl class="px-5 pb-5 space-y-3 text-sm">
            <div class="md:hidden">
              <dt class="antetitulo">Cuantía</dt>
              <dd class="mt-0.5 leading-relaxed"><Pendiente :texto="a.cuantia" /></dd>
            </div>
            <div class="md:hidden">
              <dt class="antetitulo">Duración</dt>
              <dd class="mt-0.5 leading-relaxed"><Pendiente :texto="a.duracion" /></dd>
            </div>
            <div class="md:hidden">
              <dt class="antetitulo">Plazos</dt>
              <dd class="mt-0.5 leading-relaxed"><Pendiente :texto="a.plazos" /></dd>
            </div>
            <div>
              <dt class="antetitulo">Requisitos</dt>
              <dd class="mt-0.5 leading-relaxed"><Pendiente :texto="a.requisitos" /></dd>
            </div>
            <div>
              <dt class="antetitulo">Ventajas</dt>
              <dd class="mt-0.5 leading-relaxed">
                <ul v-if="a.ventajas.length" class="list-disc pl-4 space-y-1"><li v-for="v in a.ventajas" :key="v">{{ v }}</li></ul>
                <Pendiente v-else :texto="SIN_BASES" />
              </dd>
            </div>
            <div>
              <dt class="antetitulo">Desventajas</dt>
              <dd class="mt-0.5 leading-relaxed">
                <ul v-if="a.desventajas.length" class="list-disc pl-4 space-y-1"><li v-for="v in a.desventajas" :key="v">{{ v }}</li></ul>
                <Pendiente v-else :texto="SIN_BASES" />
              </dd>
            </div>
            <div v-if="a.url">
              <a :href="a.url" target="_blank" rel="noopener" class="enlace">
                Bases oficiales <span class="sr-only">de {{ a.nombre }} (se abre en otra pestaña)</span>
              </a>
            </div>
          </dl>
        </details>
      </div>
    </section>

    <!-- Contacto -->
    <section aria-labelledby="t-contacto">
      <h2 id="t-contacto" class="font-display text-xl font-semibold text-surface-900 mb-4">Contacto de la Escuela de Doctorado</h2>
      <div class="card p-5 space-y-4">
        <div>
          <h3 class="font-semibold text-surface-900">{{ CONTACTO_ESCUELA.nombre }}</h3>
          <p class="text-sm mt-1">{{ CONTACTO_ESCUELA.direccion }}</p>
        </div>
        <dl class="divide-y divide-surface-200">
          <div v-for="l in CONTACTO_ESCUELA.lineas" :key="l.que" class="py-2 sm:flex sm:gap-4">
            <dt class="text-sm font-medium text-surface-900 sm:w-1/3">{{ l.que }}</dt>
            <dd class="text-sm sm:w-2/3">
              <a :href="`tel:${telefono(l.telefono)}`" class="enlace">{{ l.telefono }}</a>
              <span aria-hidden="true"> · </span>
              <a :href="`mailto:${l.correo}`" class="enlace break-all">{{ l.correo }}</a>
            </dd>
          </div>
        </dl>
        <p class="text-sm"><span class="texto-suave">Horario: </span><Pendiente :texto="CONTACTO_ESCUELA.horario" /></p>
        <p class="text-sm leading-relaxed">
          <span class="texto-suave">{{ CONTACTO_ESCUELA.agi.que }}: </span>
          {{ CONTACTO_ESCUELA.agi.telefono }} ·
          <a :href="`mailto:${CONTACTO_ESCUELA.agi.correo}`" class="enlace">{{ CONTACTO_ESCUELA.agi.correo }}</a>
        </p>
        <p class="text-sm">
          <a :href="CONTACTO_ESCUELA.web" target="_blank" rel="noopener" class="enlace">
            Web de la Escuela de Doctorado <span class="sr-only">(se abre en otra pestaña)</span>
          </a>
        </p>
      </div>
    </section>
  </div>
</template>
