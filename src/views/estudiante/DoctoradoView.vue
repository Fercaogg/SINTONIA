<script setup lang="ts">
// Apartado «Doctorado» del panel del estudiante: orientación para seguir
// investigando después del TFM. Siete secciones, cada una con su dirección
// (/estudiante/doctorado/<sección>). El contenido sale de fuentes oficiales
// (src/contenido/doctorado.ts); lo que aún no está comprobado se ve como
// «En elaboración», con el enlace oficial para consultarlo mientras tanto.
// «Plazos y ayudas» incluye lo que antes era Puente al doctorado.
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppIcon from '@/components/comun/AppIcon.vue'
import Pendiente from '@/components/comun/Pendiente.vue'
import PuenteView from './PuenteView.vue'
import { AYUDAS, ESTADO, FUENTES, GRUPOS_CONOCIDOS, PASOS_ACCESO, PREGUNTAS_TUTORIA, SECCIONES, type Seccion } from '@/contenido/doctorado'

const route = useRoute()
const actual = computed<Seccion>(() => SECCIONES.find((s) => s.clave === route.params.seccion) ?? SECCIONES[0])
const estado = computed(() => ESTADO[actual.value.clave])
const fuentes = computed(() => FUENTES[actual.value.clave])
const esEnlace = (t: string) => /^https?:\/\//.test(t)
</script>

<template>
  <div class="fade-in max-w-4xl">
    <p class="antetitulo">Después del TFM</p>
    <h1 class="titulo-pagina mt-2">Doctorado</h1>
    <p class="texto-suave mt-2 mb-8 max-w-2xl">
      Qué es, cómo se accede, qué ayudas hay y con quién hablarlo. Con enlaces a las fuentes oficiales de la Universidad de Salamanca.
    </p>

    <!-- Secciones: en el móvil se deslizan en horizontal -->
    <nav aria-label="Secciones del doctorado" class="-mx-4 mb-8 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
      <ul class="flex gap-2 pb-1 sm:flex-wrap">
        <li v-for="s in SECCIONES" :key="s.clave" class="shrink-0">
          <RouterLink
            :to="`/estudiante/doctorado/${s.clave}`"
            class="pestana inline-flex min-h-tactil items-center gap-2 rounded-full border px-4 text-sm font-medium"
            :class="s.clave === actual.clave ? 'border-brand-900 bg-brand-900 text-papel' : 'border-surface-300 text-surface-900 hover:border-surface-900'"
            :aria-current="s.clave === actual.clave ? 'page' : undefined"
          >
            <AppIcon :name="s.icono" :size="16" />{{ s.titulo }}
          </RouterLink>
        </li>
      </ul>
    </nav>

    <section :aria-labelledby="`t-${actual.clave}`">
      <h2 :id="`t-${actual.clave}`" class="font-display text-2xl font-medium tracking-tight text-surface-900">{{ actual.titulo }}</h2>
      <p class="texto-suave mt-1">{{ actual.resumen }}</p>

      <!-- Aviso de sección en elaboración -->
      <div v-if="estado.estado === 'pendiente'" class="aviso-pendiente mt-5" data-pendiente="true">
        <p><span class="font-semibold">En elaboración.</span> {{ estado.falta }} Mientras tanto, consulta la fuente oficial.</p>
      </div>
      <p v-else-if="estado.consultado" class="mt-3 text-xs texto-suave">Consultado en las fuentes oficiales el {{ estado.consultado }}.</p>

      <!-- Cómo acceder: los pasos en orden -->
      <ol v-if="actual.clave === 'acceso'" class="relative mt-8">
        <span class="absolute left-5 top-5 bottom-5 w-px bg-surface-300" aria-hidden="true" />
        <li v-for="(p, i) in PASOS_ACCESO" :key="p.titulo" class="relative grid grid-cols-[2.5rem_1fr] gap-x-4 pb-6 last:pb-0">
          <span class="relative z-10 grid h-10 w-10 place-items-center rounded-full bg-brand-900 font-mono text-xs text-papel" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
          <div class="pt-2">
            <h3 class="font-semibold text-surface-900">{{ p.titulo }}</h3>
            <p class="mt-1 text-sm"><Pendiente :texto="p.detalle" /></p>
          </div>
        </li>
      </ol>

      <!-- Plazos y ayudas: avisos en la agenda, convocatorias y comparación -->
      <template v-else-if="actual.clave === 'plazos'">
        <div class="mt-8"><PuenteView incrustado /></div>

        <h3 class="mt-10 font-display text-xl font-medium tracking-tight text-surface-900">Comparación de ayudas</h3>
        <p class="texto-suave mt-1 text-sm">Lo que dicen las bases oficiales de cada ayuda. Desliza la tabla en el móvil.</p>
        <div class="card mt-4 overflow-x-auto">
          <table class="w-full min-w-[56rem] text-sm">
            <caption class="sr-only">Comparación de ayudas para hacer el doctorado</caption>
            <thead>
              <tr class="text-left">
                <th scope="col" class="antetitulo px-4 py-3 font-normal">Ayuda</th>
                <th scope="col" class="antetitulo px-4 py-3 font-normal">Última convocatoria</th>
                <th scope="col" class="antetitulo px-4 py-3 font-normal">Duración</th>
                <th scope="col" class="antetitulo px-4 py-3 font-normal">Cuantía</th>
                <th scope="col" class="antetitulo px-4 py-3 font-normal">Requisitos</th>
                <th scope="col" class="antetitulo px-4 py-3 font-normal">Ventajas</th>
                <th scope="col" class="antetitulo px-4 py-3 font-normal">Desventajas</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-200 align-top">
              <tr v-for="a in AYUDAS" :key="a.nombre">
                <th scope="row" class="px-4 py-3 text-left font-semibold text-surface-900">
                  {{ a.nombre }}
                  <span class="block text-xs font-normal texto-suave">{{ a.organismo }}</span>
                  <a v-if="esEnlace(a.url)" :href="a.url" target="_blank" rel="noopener noreferrer" class="enlace mt-1 inline-flex min-h-tactil items-center text-xs font-normal">
                    Bases oficiales<span class="sr-only"> de {{ a.nombre }} (se abre en otra pestaña)</span>
                  </a>
                  <span v-else class="mt-1 block text-xs font-normal"><Pendiente :texto="a.url" /></span>
                </th>
                <td class="px-4 py-3"><Pendiente :texto="a.ultimaConvocatoria" /></td>
                <td class="px-4 py-3"><Pendiente :texto="a.duracion" /></td>
                <td class="px-4 py-3"><Pendiente :texto="a.cuantia" /></td>
                <td class="px-4 py-3"><Pendiente :texto="a.requisitos" /></td>
                <td class="px-4 py-3"><ul class="space-y-1"><li v-for="v in a.ventajas" :key="v"><Pendiente :texto="v" /></li></ul></td>
                <td class="px-4 py-3"><ul class="space-y-1"><li v-for="d in a.desventajas" :key="d"><Pendiente :texto="d" /></li></ul></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- Grupos: los ya comprobados -->
      <template v-else-if="actual.clave === 'grupos'">
        <h3 class="mt-8 font-semibold text-surface-900">Grupos del equipo de SINTONÍA</h3>
        <ul class="mt-3 grid gap-3 sm:grid-cols-2">
          <li v-for="g in GRUPOS_CONOCIDOS" :key="g.nombre" class="card p-4">
            <p class="antetitulo">{{ g.area }}</p>
            <p class="mt-1 font-semibold text-surface-900">{{ g.nombre }}</p>
          </li>
        </ul>
      </template>

      <!-- Orientación: temas para la tutoría -->
      <template v-else-if="actual.clave === 'orientacion'">
        <div class="card mt-8 p-5 sm:p-6">
          <h3 class="font-semibold text-surface-900">Para hablarlo en la tutoría</h3>
          <p class="texto-suave mt-1 text-sm">Algunas preguntas para empezar la conversación con tu tutor/a.</p>
          <ul class="mt-4 space-y-2">
            <li v-for="p in PREGUNTAS_TUTORIA" :key="p" class="flex gap-3">
              <AppIcon name="chat" :size="18" class="mt-0.5 shrink-0 text-lumbre-texto" />{{ p }}
            </li>
          </ul>
          <p class="mt-5 text-sm">
            Si activas los avisos en <RouterLink to="/estudiante/doctorado/plazos" class="enlace">Plazos y ayudas</RouterLink>, los plazos que se acerquen aparecerán en la agenda de la tutoría.
          </p>
        </div>
      </template>

      <!-- Fuentes oficiales de la sección -->
      <div class="mt-10 border-t border-surface-200 pt-6">
        <h3 class="antetitulo">Fuentes oficiales</h3>
        <ul class="mt-3 space-y-1">
          <li v-for="f in fuentes" :key="f.url">
            <a :href="f.url" target="_blank" rel="noopener noreferrer" class="enlace inline-flex min-h-tactil items-center">
              {{ f.titulo }}<span class="sr-only"> (se abre en otra pestaña)</span>
            </a>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
.pestana {
  transition: background-color var(--dur-micro) var(--ease-out), border-color var(--dur-micro) var(--ease-out), color var(--dur-micro) var(--ease-out);
}
</style>
