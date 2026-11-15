<script setup lang="ts">
// /demo/recorrido: demostración guiada de unos 60 segundos, en 4 pasos.
//   1. El visitante hace el check-in como estudiante (las mismas preguntas y
//      la misma escala que el check-in real).
//   2. Ve la pantalla del tutor/a y responde por una persona ficticia.
//   3. Ve si hay desajuste (misma regla pública) y las 3 preguntas.
//   4. Ve lo que ve la dirección: solo cifras agregadas, inventadas para la
//      demostración y marcadas como tales.
// Todo ocurre en el navegador: no se llama a ninguna API ni se guarda nada.
import { computed, nextTick, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AppLogo from '@/components/comun/AppLogo.vue'
import AppIcon from '@/components/comun/AppIcon.vue'
import EscalaTactil from '@/components/checkin/EscalaTactil.vue'
import OndasSintonia from '@/components/portada/OndasSintonia.vue'
import { compararMiradas } from '@/lib/demo-portada'

// Textos de las preguntas: los mismos que el check-in real
// (supabase/migrations/20261112000400_datos_iniciales.sql).
const PREGUNTAS_ESTUDIANTE = [
  { clave: 'avance', texto: '¿Cuánto has avanzado en tu trabajo esta semana?', min: 'Nada', max: 'Mucho' },
  { clave: 'siguiente', texto: '¿Tienes claro tu siguiente paso?', min: 'Nada claro', max: 'Muy claro' },
  { clave: 'apoyo', texto: '¿Te sientes apoyado/a por tu tutor/a?', min: 'Nada', max: 'Mucho' },
  { clave: 'bienestar', texto: '¿Cómo estás tú esta semana?', min: 'Mal', max: 'Muy bien', privada: true },
] as const
type ClaveEst = (typeof PREGUNTAS_ESTUDIANTE)[number]['clave']

const PASOS = ['Tu check-in', 'El tutor/a', 'Dos miradas', 'La dirección'] as const

// Cifras de la dirección: inventadas para la demostración (no son datos reales).
const CIFRAS_DIRECCION = [
  { titulo: 'Tasa de respuesta', valor: '86 %', texto: 'Check-ins enviados esta semana.' },
  { titulo: 'Avance medio', valor: '3,4', texto: 'De 1 a 5, de todo el máster.' },
  { titulo: 'Desajuste medio', valor: '0,9', texto: 'Diferencia media entre las dos miradas, de 0 a 4.' },
  { titulo: 'Agendas generadas', valor: '3', texto: 'Parejas que recibieron las 3 preguntas.' },
]

const paso = ref(0)
const est = ref<Record<ClaveEst, number | null>>({ avance: null, siguiente: null, apoyo: null, bienestar: null })
const tutor = ref<number | null>(null)
const tutorSiguiente = ref<number | null>(null)

const estudianteListo = computed(() => Object.values(est.value).every((v) => v !== null))
const puedeSeguir = computed(() => (paso.value === 0 ? estudianteListo.value : paso.value === 1 ? tutor.value !== null : true))
const resultado = computed(() => compararMiradas(est.value.avance ?? 3, tutor.value ?? 3))
const desfase = computed(() => resultado.value.diferencia / 4)

// Si no hay desajuste, se puede ver qué pasaría con una mirada distinta.
function verConDesajuste() {
  const e = est.value.avance ?? 3
  tutor.value = e >= 3 ? e - 2 : e + 2
}

const titulo = ref<HTMLElement | null>(null)
// Cada paso empieza arriba, con el foco en su título (teclado y lectores de
// pantalla). El foco se pone cuando el paso nuevo ya ha entrado.
watch(paso, () => window.scrollTo({ top: 0 }))
async function enfocarTitulo() {
  await nextTick()
  titulo.value?.focus({ preventScroll: true })
}
function siguiente() {
  if (puedeSeguir.value && paso.value < PASOS.length) paso.value++
}
function anterior() {
  if (paso.value > 0) paso.value--
}
function empezarDeNuevo() {
  est.value = { avance: null, siguiente: null, apoyo: null, bienestar: null }
  tutor.value = null
  tutorSiguiente.value = null
  paso.value = 0
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <p class="sticky top-0 z-30 bg-amber-100 text-amber-900 text-sm font-semibold text-center px-4 py-2 border-b border-amber-200" role="note">
      Demostración: datos ficticios. No se guarda nada.
    </p>
    <header class="border-b border-surface-200 bg-papel">
      <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <RouterLink to="/" class="text-xl" aria-label="SINTONÍA, inicio"><AppLogo /></RouterLink>
        <RouterLink to="/demo" class="btn-secondary text-sm"><AppIcon name="back" :size="16" /> Demostración</RouterLink>
      </div>
    </header>

    <main id="contenido" class="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <!-- Pasos -->
      <nav v-if="paso < PASOS.length" aria-label="Pasos del recorrido" class="mb-8">
        <ol class="grid grid-cols-4 gap-2">
          <li v-for="(p, i) in PASOS" :key="p" :aria-current="i === paso ? 'step' : undefined">
            <span class="block h-1.5 rounded-full transition-colors duration-300" :class="i <= paso ? 'bg-brand-800' : 'bg-surface-200'" aria-hidden="true" />
            <span class="mt-2 block text-xs font-medium" :class="i === paso ? 'text-surface-900' : 'texto-suave'">
              <span class="sr-only">Paso {{ i + 1 }} de {{ PASOS.length }}: </span>{{ p }}
            </span>
          </li>
        </ol>
      </nav>

      <Transition name="paso" mode="out-in" @after-enter="enfocarTitulo">
        <!-- 1. Check-in del estudiante -->
        <section v-if="paso === 0" key="0" aria-labelledby="t-paso">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-900">Paso 1 de 4 · Eres estudiante</p>
          <h1 id="t-paso" ref="titulo" tabindex="-1" class="titulo-pagina mt-2 outline-none">Haz tu check-in de la semana</h1>
          <p class="texto-suave mt-2">Cuatro preguntas de 1 a 5. En el real tardas unos 60 segundos.</p>
          <div class="card p-5 sm:p-6 mt-6 space-y-7">
            <div v-for="q in PREGUNTAS_ESTUDIANTE" :key="q.clave">
              <div class="flex items-start justify-between gap-3 mb-3">
                <h2 :id="`r-${q.clave}`" class="font-semibold text-surface-900">{{ q.texto }}</h2>
                <span v-if="'privada' in q" class="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-brand-900"><AppIcon name="lock" :size="13" />Solo tú</span>
              </div>
              <EscalaTactil v-model="est[q.clave]" :etiqueta-id="`r-${q.clave}`" :ancla-min="q.min" :ancla-max="q.max" />
            </div>
          </div>
        </section>

        <!-- 2. El tutor/a -->
        <section v-else-if="paso === 1" key="1" aria-labelledby="t-paso">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-900">Paso 2 de 4 · Ahora eres su tutor/a</p>
          <h1 id="t-paso" ref="titulo" tabindex="-1" class="titulo-pagina mt-2 outline-none">Responde por Alex</h1>
          <p class="texto-suave mt-2">
            Alex es el estudiante que acabas de ser (el nombre es inventado). Como tutor/a no ves sus respuestas ni su bienestar: solo dices cómo lo ves tú. Unos
            30 segundos para todos tus estudiantes.
          </p>
          <div class="card p-5 sm:p-6 mt-6 space-y-7">
            <p class="flex items-center gap-2 font-semibold text-surface-900"><AppIcon name="person" :size="18" class="text-brand-900" />Alex (ficticio)</p>
            <div>
              <h2 id="t-tutor-avance" class="font-semibold text-surface-900 mb-3">¿Cuánto ha avanzado esta semana?</h2>
              <EscalaTactil v-model="tutor" etiqueta-id="t-tutor-avance" ancla-min="Nada" ancla-max="Mucho" />
            </div>
            <div>
              <h2 id="t-tutor-sig" class="font-semibold text-surface-900 mb-3">¿Tiene claro su siguiente paso? <span class="font-normal texto-suave">(opcional)</span></h2>
              <EscalaTactil v-model="tutorSiguiente" etiqueta-id="t-tutor-sig" ancla-min="Nada claro" ancla-max="Muy claro" />
            </div>
          </div>
        </section>

        <!-- 3. Las dos miradas -->
        <section v-else-if="paso === 2" key="2" aria-labelledby="t-paso">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-900">Paso 3 de 4 · Lo que hace SINTONÍA</p>
          <h1 id="t-paso" ref="titulo" tabindex="-1" class="titulo-pagina mt-2 outline-none">Dos miradas sobre el avance</h1>
          <div class="card p-5 sm:p-6 mt-6">
            <OndasSintonia :desfase="desfase" :alto="90" etiquetas />
            <div class="mt-5 grid grid-cols-2 gap-3 text-center">
              <div class="rounded-xl bg-surface-100 p-3">
                <p class="text-sm texto-suave">Tú, como estudiante</p>
                <p class="font-display text-3xl font-bold text-surface-900">{{ est.avance }}</p>
              </div>
              <div class="rounded-xl bg-surface-100 p-3">
                <p class="text-sm texto-suave">Tú, como tutor/a</p>
                <p class="font-display text-3xl font-bold text-surface-900">{{ tutor }}</p>
              </div>
            </div>
            <div class="mt-5 rounded-xl p-4" :class="resultado.desajuste ? 'bg-brand-50 border border-brand-200' : 'bg-surface-100'" aria-live="polite">
              <template v-if="resultado.desajuste">
                <p class="font-semibold text-surface-900">{{ resultado.diferencia }} puntos de diferencia: hay desajuste. Nadie tiene razón: son dos miradas.</p>
                <p class="mt-2 text-sm texto-suave">Si esa semana les toca en el sorteo, los dos reciben las mismas tres preguntas neutras para la tutoría:</p>
                <ol class="mt-3 space-y-2 list-decimal pl-5 text-surface-900">
                  <li v-for="q in resultado.preguntas" :key="q">{{ q }}</li>
                </ol>
              </template>
              <template v-else>
                <p class="font-semibold text-surface-900">
                  {{ resultado.diferencia === 0 ? 'Veis el avance igual.' : 'Solo 1 punto de diferencia.' }} Esta semana no hace falta agenda: estáis en sintonía.
                </p>
                <button type="button" class="btn-secondary mt-3 text-sm" @click="verConDesajuste">Ver qué pasa si el tutor/a lo ve distinto</button>
              </template>
            </div>
            <p class="mt-4 text-sm texto-suave">
              La regla es pública: hay desajuste con 2 puntos de diferencia o más, o con 1 punto en el mismo sentido dos semanas seguidas. El sorteo (probabilidad
              0,5) es parte del estudio.
            </p>
          </div>
        </section>

        <!-- 4. La dirección -->
        <section v-else-if="paso === 3" key="3" aria-labelledby="t-paso">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-900">Paso 4 de 4 · Eres la dirección del máster</p>
          <h1 id="t-paso" ref="titulo" tabindex="-1" class="titulo-pagina mt-2 outline-none">Solo cifras de todo el máster</h1>
          <p class="texto-suave mt-2">
            La dirección no ve las respuestas de Alex ni el bienestar de nadie. Solo cifras calculadas sobre 5 personas o más. Estas son inventadas para la demostración.
          </p>
          <ul class="mt-6 grid gap-3 sm:grid-cols-2">
            <li v-for="c in CIFRAS_DIRECCION" :key="c.titulo" class="card p-4">
              <p class="text-sm font-medium texto-suave">{{ c.titulo }}</p>
              <p class="font-display text-3xl font-bold text-surface-900 mt-1">{{ c.valor }}</p>
              <p class="text-sm texto-suave mt-1">{{ c.texto }}</p>
            </li>
          </ul>
          <div class="card mt-3 p-4 flex items-start gap-3">
            <AppIcon name="lock" :size="20" class="mt-0.5 shrink-0 text-surface-900" />
            <div>
              <p class="font-semibold text-surface-900">Grupo con 3 estudiantes: datos insuficientes</p>
              <p class="text-sm texto-suave">Con menos de 5 personas no se calcula ninguna cifra, para que nadie pueda ser reconocido.</p>
            </div>
          </div>
        </section>

        <!-- Final -->
        <section v-else key="fin" aria-labelledby="t-paso" class="text-center py-6">
          <div class="max-w-md mx-auto"><OndasSintonia :desfase="0" :alto="70" /></div>
          <h1 id="t-paso" ref="titulo" tabindex="-1" class="titulo-pagina mt-6 outline-none">Eso es SINTONÍA</h1>
          <p class="texto-suave mt-3 max-w-lg mx-auto">
            Un minuto a la semana, dos miradas y tres preguntas cuando no coinciden. Sin notas, sin rankings y sin que nadie vea lo que no le toca.
          </p>
          <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <RouterLink to="/demo" class="btn-primary px-6 py-3">Entrar en la demostración completa</RouterLink>
            <button type="button" class="btn-secondary px-6 py-3" @click="empezarDeNuevo">Empezar de nuevo</button>
          </div>
        </section>
      </Transition>

      <!-- Navegación -->
      <div v-if="paso < PASOS.length" class="mt-8 flex items-center justify-between gap-3">
        <button v-if="paso > 0" type="button" class="btn-secondary" @click="anterior"><AppIcon name="back" :size="16" /> Atrás</button>
        <span v-else />
        <div class="flex items-center gap-3">
          <p v-if="!puedeSeguir" class="text-sm texto-suave hidden sm:block">{{ paso === 0 ? 'Responde las cuatro preguntas para seguir.' : 'Responde la primera pregunta para seguir.' }}</p>
          <button type="button" class="btn-primary" :disabled="!puedeSeguir" @click="siguiente">
            {{ paso === PASOS.length - 1 ? 'Terminar' : 'Siguiente' }}
          </button>
        </div>
      </div>
      <p v-if="paso < PASOS.length && !puedeSeguir" class="mt-3 text-sm texto-suave sm:hidden">
        {{ paso === 0 ? 'Responde las cuatro preguntas para seguir.' : 'Responde la primera pregunta para seguir.' }}
      </p>
    </main>
  </div>
</template>

<style scoped>
/* Cambio de paso: corto, de lado y sin rebote (Emil). */
.paso-enter-active,
.paso-leave-active {
  transition: opacity 220ms var(--ease-out), transform 220ms var(--ease-out);
}
.paso-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.paso-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
@media (prefers-reduced-motion: reduce) {
  .paso-enter-active,
  .paso-leave-active {
    transition: none;
  }
}
</style>
