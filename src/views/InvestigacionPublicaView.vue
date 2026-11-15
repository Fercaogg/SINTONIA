<script setup lang="ts">
// /investigacion: la investigación del TFM, para el público. El contenido
// está en src/contenido/investigacion.ts: lo que todavía no existe (pregunta
// CTS, hipótesis, Comité, OSF) aparece con el texto digno y está en
// PENDIENTES.md. El enlace de OSF solo aparece cuando existe, y
// "Publicaciones y difusión" solo cuando hay alguna.
import { RouterLink } from 'vue-router'
import { REFERENCIAS } from '@/contenido/portada'
import { CALENDARIO, COMITE_ETICA, DISENO, HIPOTESIS, PREGUNTA, PREREGISTRO_OSF, PUBLICACIONES } from '@/contenido/investigacion'
import { EN_ELABORACION, EN_ELABORACION_PROYECTO } from '@/lib/publico'
import LayoutPublico from '@/components/layout/LayoutPublico.vue'
import SeccionLegal from '@/components/comun/SeccionLegal.vue'
import CitarSintonia from '@/components/portada/CitarSintonia.vue'

const INDICE = [
  { id: 'pregunta', texto: 'Pregunta' },
  { id: 'hipotesis', texto: 'Hipótesis' },
  { id: 'diseno', texto: 'Diseño' },
  { id: 'garantias', texto: 'Garantías' },
  { id: 'calendario', texto: 'Calendario' },
  { id: 'participar', texto: 'Participar' },
  ...(PUBLICACIONES.length ? [{ id: 'publicaciones', texto: 'Publicaciones' }] : []),
  { id: 'citar', texto: 'Cómo citar' },
  { id: 'referencias', texto: 'Referencias' },
]
</script>

<template>
  <LayoutPublico>
    <h1 class="titulo-pagina mb-2">La investigación</h1>
    <p class="texto-suave mb-8">
      SINTONÍA es el prototipo del Trabajo Fin de Máster de Fernando Martín Vaquero (Máster en Estudios de la Ciencia, la Tecnología y la
      Innovación, Universidad de Salamanca, curso 2026/27), dirigido por el Dr. Luis Eduardo Andrade Silva y la Dra. Ana María Pinto Llorente.
    </p>

    <nav aria-label="En esta página" class="mb-10 rounded-xl border border-surface-200 bg-papel p-4">
      <p class="text-xs font-semibold uppercase tracking-[0.14em] text-surface-800 mb-2">En esta página</p>
      <ul class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <li v-for="i in INDICE" :key="i.id"><a :href="`#${i.id}`" class="enlace inline-flex items-center min-h-tactil">{{ i.texto }}</a></li>
      </ul>
    </nav>

    <SeccionLegal id="pregunta" titulo="Pregunta de investigación">
      <p v-if="PREGUNTA" class="font-display text-xl leading-snug text-surface-900">{{ PREGUNTA }}</p>
      <p v-else class="italic texto-suave">{{ EN_ELABORACION_PROYECTO }}</p>
    </SeccionLegal>

    <SeccionLegal id="hipotesis" titulo="Hipótesis">
      <dl class="space-y-3">
        <div v-for="h in HIPOTESIS" :key="h.clave" class="grid grid-cols-[3rem_1fr] gap-2">
          <dt class="font-display font-semibold text-surface-900">{{ h.clave }}</dt>
          <dd>
            <p v-if="h.texto">{{ h.texto }}</p>
            <template v-else>
              <p v-if="h.tema">{{ h.tema }}</p>
              <p class="italic texto-suave">{{ EN_ELABORACION_PROYECTO }}</p>
            </template>
          </dd>
        </div>
      </dl>
    </SeccionLegal>

    <SeccionLegal id="diseno" titulo="Diseño">
      <ul class="list-disc pl-5 space-y-1.5">
        <li v-for="d in DISENO" :key="d">{{ d }}</li>
      </ul>
    </SeccionLegal>

    <SeccionLegal id="garantias" titulo="Garantías">
      <ul class="list-disc pl-5 space-y-1.5">
        <li>
          Comité de Ética de la Universidad de Salamanca:
          <template v-if="COMITE_ETICA">{{ COMITE_ETICA.estado }}<template v-if="COMITE_ETICA.referencia"> (referencia {{ COMITE_ETICA.referencia }})</template>.</template>
          <span v-else class="italic texto-suave">{{ EN_ELABORACION }}</span>
        </li>
        <li>
          Preregistro en OSF:
          <a v-if="PREREGISTRO_OSF" :href="PREREGISTRO_OSF" target="_blank" rel="noopener noreferrer" class="enlace break-all">{{ PREREGISTRO_OSF }}<span class="sr-only"> (se abre en otra pestaña)</span></a>
          <span v-else class="italic texto-suave">{{ EN_ELABORACION_PROYECTO }}</span>
        </li>
        <li>Principio rector: acompañar sin vigilar. El programa de redacción no recibe datos personales; no lee trabajos, no califica y no infiere emociones (artículo 5.1.f del Reglamento (UE) 2024/1689).</li>
        <li>Quién ve cada dato: <RouterLink to="/como-funciona#quien" class="enlace">Cómo funciona y tus datos</RouterLink>. Cómo se protegen: <RouterLink to="/seguridad" class="enlace">Seguridad</RouterLink>.</li>
      </ul>
    </SeccionLegal>

    <SeccionLegal id="calendario" titulo="Calendario">
      <ol class="space-y-3">
        <li v-for="c in CALENDARIO" :key="c.cuando" class="grid sm:grid-cols-[14rem_1fr] gap-1">
          <span class="font-semibold text-surface-900">{{ c.cuando }}</span>
          <span :class="c.que ? '' : 'italic texto-suave'">{{ c.que ?? EN_ELABORACION_PROYECTO }}</span>
        </li>
      </ol>
    </SeccionLegal>

    <SeccionLegal id="participar" titulo="Participar en el piloto">
      <p>Si vas a participar, aquí tienes la hoja informativa, el consentimiento y las preguntas frecuentes, para leerlos con calma o descargarlos en PDF.</p>
      <p><RouterLink to="/participantes" class="btn-secondary">Ver el kit para participantes</RouterLink></p>
    </SeccionLegal>

    <SeccionLegal v-if="PUBLICACIONES.length" id="publicaciones" titulo="Publicaciones y difusión">
      <ul class="space-y-3">
        <li v-for="p in PUBLICACIONES" :key="p.cita" class="pl-6 -indent-6">
          {{ p.cita }}
          <a v-if="p.enlace" :href="p.enlace" target="_blank" rel="noopener noreferrer" class="enlace break-all">{{ p.enlace }}<span class="sr-only"> (se abre en otra pestaña)</span></a>
        </li>
      </ul>
    </SeccionLegal>

    <SeccionLegal id="citar" titulo="Cómo citar SINTONÍA">
      <p>En APA 7, con la versión actual:</p>
      <CitarSintonia />
    </SeccionLegal>

    <SeccionLegal id="referencias" titulo="Referencias">
      <ul class="space-y-3 text-sm">
        <li v-for="r in REFERENCIAS" :key="r.clave" class="pl-6 -indent-6">
          {{ r.texto }}
          <a v-if="r.enlace" :href="r.enlace" target="_blank" rel="noopener noreferrer" class="enlace break-all">{{ r.enlace }}<span class="sr-only"> (se abre en otra pestaña)</span></a>
        </li>
      </ul>
    </SeccionLegal>
  </LayoutPublico>
</template>
