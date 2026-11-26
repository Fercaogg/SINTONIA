<script setup lang="ts">
// /investigacion: la investigación del TFM, para el público. El contenido
// está en src/contenido/investigacion.ts: lo que todavía no existe (pregunta
// CTS, hipótesis, Comité, OSF) aparece con el texto digno y está en
// PENDIENTES.md. El enlace de OSF solo aparece cuando existe, y
// "Publicaciones y difusión" solo cuando hay alguna.
import { RouterLink } from 'vue-router'
import { REFERENCIAS } from '@/contenido/portada'
import { CALENDARIO, COMITE_ETICA, DISENO, HIPOTESIS, PREGUNTA, PREREGISTRO_OSF, PUBLICACIONES } from '@/contenido/investigacion'
import { computed } from 'vue'
import { EN_ELABORACION, EN_ELABORACION_EN, EN_ELABORACION_PROYECTO, EN_ELABORACION_PROYECTO_EN } from '@/lib/publico'
import { CALENDARIO_EN, DISENO as DISENO_EN, TEMA_HIPOTESIS_EN } from '@/contenido/en'
import { useIdioma } from '@/lib/idioma'
import LayoutPublico from '@/components/layout/LayoutPublico.vue'
import SeccionLegal from '@/components/comun/SeccionLegal.vue'
import CitarSintonia from '@/components/portada/CitarSintonia.vue'

const { t, idioma, ruta } = useIdioma()
const EN_PROY = computed(() => t(EN_ELABORACION_PROYECTO, EN_ELABORACION_PROYECTO_EN))
const EN_COMITE = computed(() => t(EN_ELABORACION, EN_ELABORACION_EN))
const DISENO_L = computed(() => (idioma.value === 'en' ? DISENO_EN : DISENO))
const tema = (x: string) => (idioma.value === 'en' ? (TEMA_HIPOTESIS_EN[x] ?? x) : x)
const cal = (x: string) => (idioma.value === 'en' ? (CALENDARIO_EN[x] ?? x) : x)
const INDICE = computed(() => [
  { id: 'pregunta', texto: t('Pregunta', 'Question') },
  { id: 'hipotesis', texto: t('Hipótesis', 'Hypotheses') },
  { id: 'diseno', texto: t('Diseño', 'Design') },
  { id: 'garantias', texto: t('Garantías', 'Safeguards') },
  { id: 'calendario', texto: t('Calendario', 'Timeline') },
  { id: 'participar', texto: t('Participar', 'Take part') },
  ...(PUBLICACIONES.length ? [{ id: 'publicaciones', texto: t('Publicaciones', 'Publications') }] : []),
  { id: 'citar', texto: t('Cómo citar', 'How to cite') },
  { id: 'referencias', texto: t('Referencias', 'References') },
])
</script>

<template>
  <LayoutPublico>
    <h1 class="titulo-pagina mb-2">{{ t('La investigación', 'The research') }}</h1>
    <p class="texto-suave mb-8">
      {{ t('SINTONÍA es el prototipo del Trabajo Fin de Máster de Fernando Martín Vaquero (Máster en Estudios de la Ciencia, la Tecnología y la Innovación, Universidad de Salamanca, curso 2026/27), dirigido por el Dr. Luis Eduardo Andrade Silva y la Dra. Ana María Pinto Llorente.', "SINTONÍA is the prototype of Fernando Martín Vaquero's Master's thesis (Máster en Estudios de la Ciencia, la Tecnología y la Innovación, Universidad de Salamanca, 2026/27), supervised by Dr Luis Eduardo Andrade Silva and Dr Ana María Pinto Llorente.") }}
    </p>

    <nav :aria-label="t('En esta página', 'On this page')" class="mb-10 rounded-xl border border-surface-200 bg-papel p-4">
      <p class="text-xs font-semibold uppercase tracking-[0.08em] text-surface-800 mb-2">{{ t('En esta página', 'On this page') }}</p>
      <ul class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <li v-for="i in INDICE" :key="i.id"><a :href="`#${i.id}`" class="enlace inline-flex items-center min-h-tactil">{{ i.texto }}</a></li>
      </ul>
    </nav>

    <SeccionLegal id="pregunta" :titulo="t('Pregunta de investigación', 'Research question')">
      <p v-if="PREGUNTA" class="font-display text-xl leading-snug text-surface-900">{{ PREGUNTA }}</p>
      <p v-else class="italic texto-suave">{{ EN_PROY }}</p>
    </SeccionLegal>

    <SeccionLegal id="hipotesis" :titulo="t('Hipótesis', 'Hypotheses')">
      <dl class="space-y-3">
        <div v-for="h in HIPOTESIS" :key="h.clave" class="grid grid-cols-[3rem_1fr] gap-2">
          <dt class="font-display font-semibold text-surface-900">{{ h.clave }}</dt>
          <dd>
            <p v-if="h.texto">{{ h.texto }}</p>
            <template v-else>
              <p v-if="h.tema">{{ tema(h.tema) }}</p>
              <p class="italic texto-suave">{{ EN_PROY }}</p>
            </template>
          </dd>
        </div>
      </dl>
    </SeccionLegal>

    <SeccionLegal id="diseno" :titulo="t('Diseño', 'Design')">
      <ul class="list-disc pl-5 space-y-1.5">
        <li v-for="d in DISENO_L" :key="d">{{ d }}</li>
      </ul>
    </SeccionLegal>

    <SeccionLegal id="garantias" :titulo="t('Garantías', 'Safeguards')">
      <ul class="list-disc pl-5 space-y-1.5">
        <li>
          {{ t('Comité de Ética de la Universidad de Salamanca', 'Research Ethics Committee of the Universidad de Salamanca') }}:
          <template v-if="COMITE_ETICA">{{ COMITE_ETICA.estado }}<template v-if="COMITE_ETICA.referencia"> ({{ t('referencia', 'reference') }} {{ COMITE_ETICA.referencia }})</template>.</template>
          <span v-else class="italic texto-suave">{{ EN_COMITE }}</span>
        </li>
        <li>
          {{ t('Preregistro en OSF', 'OSF preregistration') }}:
          <a v-if="PREREGISTRO_OSF" :href="PREREGISTRO_OSF" target="_blank" rel="noopener noreferrer" class="enlace break-all">{{ PREREGISTRO_OSF }}<span class="sr-only">{{ t(' (se abre en otra pestaña)', ' (opens in a new tab)') }}</span></a>
          <span v-else class="italic texto-suave">{{ EN_PROY }}</span>
        </li>
        <li>{{ t('Principio rector: acompañar sin vigilar. El programa de redacción no recibe datos personales; no lee trabajos, no califica y no infiere emociones (artículo 5.1.f del Reglamento (UE) 2024/1689).', 'Guiding principle: support without surveillance. The writing program receives no personal data; it does not read work, does not mark and does not infer emotions (Article 5.1.f of Regulation (EU) 2024/1689).') }}</li>
        <li>{{ t('Quién ve cada dato', 'Who sees each piece of data') }}: <RouterLink :to="ruta('/como-funciona#quien')" class="enlace">{{ t('Cómo funciona y tus datos', 'How it works and your data') }}</RouterLink>. {{ t('Cómo se protegen', 'How it is protected') }}: <RouterLink :to="ruta('/seguridad')" class="enlace">{{ t('Seguridad', 'Security') }}</RouterLink>.</li>
      </ul>
    </SeccionLegal>

    <SeccionLegal id="calendario" :titulo="t('Calendario', 'Timeline')">
      <ol class="space-y-3">
        <li v-for="c in CALENDARIO" :key="c.cuando" class="grid sm:grid-cols-[14rem_1fr] gap-1">
          <span class="font-semibold text-surface-900">{{ cal(c.cuando) }}</span>
          <span :class="c.que ? '' : 'italic texto-suave'">{{ c.que ? cal(c.que) : EN_PROY }}</span>
        </li>
      </ol>
    </SeccionLegal>

    <SeccionLegal id="participar" :titulo="t('Participar en el piloto', 'Taking part in the pilot')">
      <p>{{ t('Si vas a participar, aquí tienes la hoja informativa, el consentimiento y las preguntas frecuentes, para leerlos con calma o descargarlos en PDF.', 'If you are going to take part, here are the information sheet, the consent form and the FAQ, to read calmly or download as PDF. They are in Spanish, as the pilot takes place at the Universidad de Salamanca.') }}</p>
      <p><RouterLink to="/participantes" class="btn-secondary" :hreflang="idioma === 'en' ? 'es' : undefined">{{ t('Ver el kit para participantes', 'See the participants\' kit (in Spanish)') }}</RouterLink></p>
    </SeccionLegal>

    <SeccionLegal v-if="PUBLICACIONES.length" id="publicaciones" :titulo="t('Publicaciones y difusión', 'Publications and outreach')">
      <ul class="space-y-3">
        <li v-for="p in PUBLICACIONES" :key="p.cita" class="pl-6 -indent-6">
          {{ p.cita }}
          <a v-if="p.enlace" :href="p.enlace" target="_blank" rel="noopener noreferrer" class="enlace break-all">{{ p.enlace }}<span class="sr-only">{{ t(' (se abre en otra pestaña)', ' (opens in a new tab)') }}</span></a>
        </li>
      </ul>
    </SeccionLegal>

    <SeccionLegal id="citar" :titulo="t('Cómo citar SINTONÍA', 'How to cite SINTONÍA')">
      <p>{{ t('En APA 7, con la versión actual:', 'In APA 7, with the current version:') }}</p>
      <CitarSintonia />
    </SeccionLegal>

    <SeccionLegal id="referencias" :titulo="t('Referencias', 'References')">
      <ul class="space-y-3 text-sm">
        <li v-for="r in REFERENCIAS" :key="r.clave" class="pl-6 -indent-6">
          {{ r.texto }}
          <a v-if="r.enlace" :href="r.enlace" target="_blank" rel="noopener noreferrer" class="enlace break-all">{{ r.enlace }}<span class="sr-only">{{ t(' (se abre en otra pestaña)', ' (opens in a new tab)') }}</span></a>
        </li>
      </ul>
    </SeccionLegal>
  </LayoutPublico>
</template>
