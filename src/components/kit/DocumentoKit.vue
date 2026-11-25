<script setup lang="ts">
// Un documento del kit para participantes, igual en la web y en el PDF.
// Arriba lleva siempre el aviso de borrador pendiente del Comité de Ética.
import { DOCUMENTOS, HOJA_INFORMATIVA, KIT_VERSION, type ClaveDocumento } from '@/contenido/participantes'
import { PREGUNTAS } from '@/contenido/portada'
import { EN_ELABORACION } from '@/lib/publico'

const props = defineProps<{ doc: ClaveDocumento; nivel?: 1 | 2 }>()
const info = DOCUMENTOS.find((d) => d.clave === props.doc)!
</script>

<template>
  <article class="documento-kit">
    <p class="aviso-borrador rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
      {{ EN_ELABORACION }} {{ KIT_VERSION }}.
    </p>
    <component :is="nivel === 2 ? 'h2' : 'h1'" class="mt-6 font-display text-3xl font-medium tracking-tight text-surface-900">{{ info.titulo }}</component>
    <p class="mt-1 texto-suave">SINTONÍA · Piloto en la Universidad de Salamanca, febrero a abril de 2027</p>

    <!-- Hoja informativa -->
    <template v-if="doc === 'hoja-informativa'">
      <section v-for="a in HOJA_INFORMATIVA" :key="a.titulo" class="mt-6 bloque">
        <component :is="nivel === 2 ? 'h3' : 'h2'" class="font-display text-lg font-semibold text-surface-900">{{ a.titulo }}</component>
        <template v-if="a.parrafos">
          <p v-for="p in a.parrafos" :key="p" class="mt-2 leading-relaxed">{{ p }}</p>
        </template>
        <p v-else class="mt-2 italic texto-suave">{{ EN_ELABORACION }}</p>
      </section>
    </template>

    <!-- Consentimiento: el texto legal es del Comité de Ética -->
    <template v-else-if="doc === 'consentimiento'">
      <section class="mt-6 bloque">
        <component :is="nivel === 2 ? 'h3' : 'h2'" class="font-display text-lg font-semibold text-surface-900">Estudio</component>
        <p class="mt-2 leading-relaxed">
          SINTONÍA, prototipo del Trabajo Fin de Máster de Fernando Martín Vaquero (Universidad de Salamanca), dirigido por el Dr. Luis Eduardo Andrade Silva
          y la Dra. Ana María Pinto Llorente.
        </p>
      </section>
      <section class="mt-6 bloque">
        <component :is="nivel === 2 ? 'h3' : 'h2'" class="font-display text-lg font-semibold text-surface-900">Texto del consentimiento</component>
        <p class="mt-2 italic texto-suave">{{ EN_ELABORACION }}</p>
      </section>
      <section class="mt-6 bloque">
        <component :is="nivel === 2 ? 'h3' : 'h2'" class="font-display text-lg font-semibold text-surface-900">Lo que ya puedes saber</component>
        <ul class="mt-2 list-disc pl-5 space-y-1.5 leading-relaxed">
          <li>Participar es voluntario.</li>
          <li>Puedes retirarte y borrar todos tus datos cuando quieras, desde Mi cuenta, sin dar explicaciones.</li>
          <li>Tu tutor/a no ve tus respuestas ni tu bienestar, y la dirección solo ve cifras de 5 personas o más.</li>
          <li>Más detalle en la hoja informativa.</li>
        </ul>
      </section>
      <section class="mt-8 bloque firma grid gap-6 sm:grid-cols-3">
        <p v-for="c in ['Nombre y apellidos', 'Firma', 'Fecha']" :key="c" class="border-t border-surface-300 pt-2 text-sm texto-suave">{{ c }}</p>
      </section>
      <p class="mt-6 text-sm texto-suave">En SINTONÍA, el consentimiento se acepta dentro de la aplicación al crear la cuenta.</p>
    </template>

    <!-- Preguntas frecuentes -->
    <template v-else>
      <dl class="mt-6 space-y-5">
        <div v-for="p in PREGUNTAS" :key="p.pregunta" class="bloque">
          <dt class="font-display text-lg font-semibold text-surface-900">{{ p.pregunta }}</dt>
          <dd class="mt-1 leading-relaxed">
            {{ p.respuesta }}
            <span v-if="'pendiente' in p && p.pendiente" class="block mt-1 italic texto-suave">{{ EN_ELABORACION }}</span>
          </dd>
        </div>
      </dl>
    </template>

    <p class="mt-10 border-t border-surface-200 pt-4 text-sm texto-suave">Contacto: ferca@usal.es · {{ KIT_VERSION }}</p>
  </article>
</template>

<style scoped>
@media print {
  .bloque {
    break-inside: avoid;
  }
}
</style>
