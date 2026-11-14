<script setup lang="ts">
// /investigacion: la investigación del TFM, para el público.
// Lo que Fernando todavía no ha facilitado (pregunta CTS, hipótesis, enlace de
// OSF) aparece como "En elaboración" y está en PENDIENTES.md.
import { RouterLink } from 'vue-router'
import { REFERENCIAS } from '@/contenido/portada'
import { EN_ELABORACION, EN_ELABORACION_PROYECTO } from '@/lib/publico'
import LayoutPublico from '@/components/layout/LayoutPublico.vue'
import SeccionLegal from '@/components/comun/SeccionLegal.vue'

const HIPOTESIS = [
  { clave: 'H1', tema: null },
  { clave: 'H2', tema: null },
  { clave: 'H3', tema: 'Relacionada con Puente al doctorado y la orientación sobre el doctorado.' },
]

const CALENDARIO = [
  { cuando: 'Enero de 2027', que: null },
  { cuando: 'Febrero a abril de 2027', que: 'Piloto en dos másteres de la Universidad de Salamanca, con 30 a 50 parejas.' },
  { cuando: 'Mayo y junio de 2027', que: null },
]
</script>

<template>
  <LayoutPublico>
    <h1 class="titulo-pagina mb-2">La investigación</h1>
    <p class="texto-suave mb-10">
      SINTONÍA es el prototipo del Trabajo Fin de Máster de Fernando Martín Vaquero (Máster en Estudios de la Ciencia, la Tecnología y la
      Innovación, Universidad de Salamanca, curso 2026/27), dirigido por el Dr. Luis Eduardo Andrade Silva y la Dra. Ana María Pinto Llorente.
    </p>

    <SeccionLegal id="pregunta" titulo="Pregunta de investigación">
      <p class="italic texto-suave">{{ EN_ELABORACION_PROYECTO }}</p>
    </SeccionLegal>

    <SeccionLegal id="hipotesis" titulo="Hipótesis">
      <dl class="space-y-3">
        <div v-for="h in HIPOTESIS" :key="h.clave" class="grid grid-cols-[3rem_1fr] gap-2">
          <dt class="font-display font-semibold text-surface-900">{{ h.clave }}</dt>
          <dd>
            <p v-if="h.tema">{{ h.tema }}</p>
            <p class="italic texto-suave">{{ EN_ELABORACION_PROYECTO }}</p>
          </dd>
        </div>
      </dl>
    </SeccionLegal>

    <SeccionLegal id="diseno" titulo="Diseño">
      <ul class="list-disc pl-5 space-y-1.5">
        <li>Mixto y longitudinal, durante 10 semanas.</li>
        <li>Un microensayo aleatorizado: cada semana, un sorteo con probabilidad 0,5 decide qué parejas reciben las tres preguntas de la agenda. Así se puede comparar qué pasa con y sin ellas en la misma pareja a lo largo del tiempo (Qian et al., 2022).</li>
        <li>Un cuestionario al principio (pretest) y otro al final (postest).</li>
        <li>Entre 8 y 10 entrevistas.</li>
        <li>Diseñado para poder ampliarse a TFG y tesis doctorales.</li>
      </ul>
    </SeccionLegal>

    <SeccionLegal id="garantias" titulo="Garantías">
      <ul class="list-disc pl-5 space-y-1.5">
        <li>Comité de Ética de la Universidad de Salamanca: <span class="italic texto-suave">{{ EN_ELABORACION }}</span></li>
        <li>Preregistro en OSF: <span class="italic texto-suave">{{ EN_ELABORACION_PROYECTO }}</span></li>
        <li>Principio rector: acompañar sin vigilar. El programa de redacción no recibe datos personales; no lee trabajos, no califica y no infiere emociones (artículo 5.1.f del Reglamento (UE) 2024/1689).</li>
        <li>Quién ve cada dato: <RouterLink to="/como-funciona" class="enlace">Cómo funciona y tus datos</RouterLink>.</li>
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
