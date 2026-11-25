<script setup lang="ts">
// Recorrido del producto en el inicio: un móvil que enseña, paso a paso, lo
// que pasa cada semana (responde el estudiante, responde el tutor/a, se
// comparan las dos miradas y llega la agenda), con una guía de pasos al lado.
//
// Cómo se mueve (skills de Emil y ui-ux-pro-max):
//   - Todo con transform y opacity, en animaciones CSS. La barra de cada paso
//     marca el tiempo y, al terminar, pasa al siguiente: pausar es congelar
//     las animaciones (animation-play-state), sin temporizadores sueltos.
//   - Se para solo cuando no se ve (fuera de pantalla o pestaña oculta) y
//     tiene botón de pausa (WCAG 2.2.2).
//   - Los pasos son botones: se puede ir a cualquiera con ratón o teclado.
//   - Con "reducir movimiento": no avanza solo; cada paso se ve en su estado
//     final y se cambia pulsando.
// Valores de ejemplo; las preguntas de la agenda salen del banco real.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { compararMiradas } from '@/lib/demo-portada'
import { useIdioma } from '@/lib/idioma'
import { prefiereMenosMovimiento } from '@/lib/movimiento'
import AppIcon from '@/components/comun/AppIcon.vue'
import OndasSintonia from './OndasSintonia.vue'

const { t, idioma } = useIdioma()
const PASOS = computed(() => [
  { titulo: t('Responde el estudiante', 'The student answers'), texto: t('Cuatro preguntas de 1 a 5. Unos 60 segundos.', 'Four questions from 1 to 5. About 60 seconds.'), duracion: 5200 },
  { titulo: t('Responde el tutor/a', 'The supervisor answers'), texto: t('Una o dos por estudiante. Unos 30 segundos para todos.', 'One or two per student. About 30 seconds for all.'), duracion: 4600 },
  { titulo: t('Se comparan las dos miradas', 'The two perspectives are compared'), texto: t('Con reglas sencillas y públicas. Sin notas.', 'With simple, public rules. No marks.'), duracion: 4400 },
  { titulo: t('Llega la agenda de la tutoría', 'The meeting agenda arrives'), texto: t('Las mismas tres preguntas neutras para los dos.', 'The same three neutral questions for both.'), duracion: 5200 },
])

const PREGUNTAS = computed(() => [
  { texto: t('Avance', 'Progress'), valor: 4 },
  { texto: t('Siguiente paso', 'Next step'), valor: 3 },
  { texto: t('Apoyo percibido', 'Perceived support'), valor: 4 },
  { texto: t('Bienestar', 'Wellbeing'), valor: 3, privada: true },
])
const ESTUDIANTES = computed(() => [1, 2, 3].map((n, i) => ({ nombre: `${t('Estudiante', 'Student')} ${n}`, valor: [2, 4, 3][i] })))
const agenda = computed(() => compararMiradas(4, 2, idioma.value).preguntas)

const quieto = prefiereMenosMovimiento()
const paso = ref(0)
const pausadoUsuario = ref(false)
const fueraDeVista = ref(false)
const pestanaOculta = ref(false)
const pausado = computed(() => pausadoUsuario.value || fueraDeVista.value || pestanaOculta.value)

// Paso 3: las ondas empiezan muy separadas y se acercan hasta su desfase real.
const desfaseOndas = ref(quieto ? 0.5 : 1)
let temporizador = 0
watch(
  paso,
  (p) => {
    window.clearTimeout(temporizador)
    if (p !== 2 || quieto) return
    desfaseOndas.value = 1
    temporizador = window.setTimeout(() => (desfaseOndas.value = 0.5), 450)
  },
  { flush: 'post' },
)

function siguiente() {
  paso.value = (paso.value + 1) % PASOS.value.length
}
function ir(i: number) {
  paso.value = i
}

const raiz = ref<HTMLElement | null>(null)
let observador: IntersectionObserver | null = null
const alCambiarVisibilidad = () => (pestanaOculta.value = document.hidden)
onMounted(() => {
  observador = new IntersectionObserver(([e]) => (fueraDeVista.value = !e.isIntersecting), { threshold: 0.25 })
  if (raiz.value) observador.observe(raiz.value)
  document.addEventListener('visibilitychange', alCambiarVisibilidad)
})
onBeforeUnmount(() => {
  observador?.disconnect()
  document.removeEventListener('visibilitychange', alCambiarVisibilidad)
  window.clearTimeout(temporizador)
})
// Estilos en línea siempre aplicados desde código (la CSP no admite atributos style).
const retraso = (ms: number) => ({ animationDelay: `${ms}ms` })
const estilo = (e: Record<string, string>) => e
</script>

<template>
  <div
    ref="raiz"
    class="recorrido grid gap-8 sm:grid-cols-[17.5rem_1fr] sm:items-center"
    :class="{ pausado, quieto }"
    role="group"
    :aria-roledescription="t('recorrido', 'walkthrough')"
    :aria-label="t('Así funciona SINTONÍA, paso a paso (ejemplo)', 'How SINTONÍA works, step by step (example)')"
  >
    <!-- El móvil -->
    <div class="mx-auto w-[17.5rem] rounded-[2.6rem] bg-marino p-2.5 shadow-[0_40px_80px_-40px_rgb(17_17_17/0.45)]" aria-hidden="true">
      <div class="relative h-[31.5rem] rounded-[2.1rem] bg-papel overflow-hidden">
        <div class="flex items-center justify-between px-6 pt-3 text-[0.65rem] font-semibold text-surface-900">
          <span>SINTONÍA</span>
          <span class="h-5 w-16 rounded-full bg-marino" />
          <span class="rounded-full bg-surface-100 px-2 py-0.5 font-medium text-surface-800">{{ t('Ejemplo', 'Example') }}</span>
        </div>

        <Transition name="pantalla" mode="out-in">
          <!-- 1. El estudiante responde -->
          <div v-if="paso === 0" key="0" class="pantalla px-5 pt-5">
            <p class="text-[0.68rem] font-mono font-normal uppercase tracking-[0.14em] text-surface-600">{{ t('Esta semana', 'This week') }}</p>
            <p class="mt-1 font-display text-lg font-semibold leading-tight text-surface-900">{{ t('¿Cómo va el trabajo?', 'How is the work going?') }}</p>
            <ul class="mt-4 space-y-3.5">
              <li v-for="(q, i) in PREGUNTAS" :key="q.texto">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-medium text-surface-900">{{ q.texto }}</span>
                  <span v-if="q.privada" class="inline-flex items-center gap-1 text-brand-900"><AppIcon name="lock" :size="12" />{{ t('Solo tú', 'Only you') }}</span>
                </div>
                <div class="mt-1.5 grid grid-cols-5 gap-1.5">
                  <span v-for="n in 5" :key="n" class="relative h-7 rounded-md bg-surface-100 text-[0.7rem] font-semibold text-surface-800 flex items-center justify-center">
                    {{ n }}
                    <span
                      v-if="n === q.valor"
                      class="marca absolute inset-0 rounded-md bg-brand-800 text-white flex items-center justify-center"
                      :style="{ animationDelay: `${500 + i * 650}ms` }"
                    >{{ n }}</span>
                  </span>
                </div>
              </li>
            </ul>
            <div class="relative mt-5 h-10 rounded-lg bg-marino text-white text-sm font-semibold overflow-hidden">
              <span class="boton-texto absolute inset-0 flex items-center justify-center" :style="retraso(3500)">{{ t('Enviar', 'Send') }}</span>
              <span class="boton-hecho absolute inset-0 flex items-center justify-center gap-1.5 bg-brand-800" :style="retraso(3500)">
                <AppIcon name="check" :size="16" />{{ t('Enviado', 'Sent') }}
              </span>
            </div>
          </div>

          <!-- 2. El tutor/a responde -->
          <div v-else-if="paso === 1" key="1" class="pantalla px-5 pt-5">
            <p class="text-[0.68rem] font-mono font-normal uppercase tracking-[0.14em] text-surface-600">{{ t('Tus estudiantes', 'Your students') }}</p>
            <p class="mt-1 font-display text-lg font-semibold leading-tight text-surface-900">{{ t('¿Cómo ves el avance?', 'How do you see the progress?') }}</p>
            <ul class="mt-4 space-y-3">
              <li v-for="(e, i) in ESTUDIANTES" :key="e.nombre" class="entra rounded-xl border border-surface-200 p-3" :style="{ animationDelay: `${150 + i * 120}ms` }">
                <p class="text-xs font-semibold text-surface-900 flex items-center gap-1.5"><AppIcon name="person" :size="13" />{{ e.nombre }}</p>
                <div class="mt-2 grid grid-cols-5 gap-1.5">
                  <span v-for="n in 5" :key="n" class="relative h-6 rounded-md bg-surface-100 text-[0.65rem] font-semibold text-surface-800 flex items-center justify-center">
                    {{ n }}
                    <span
                      v-if="n === e.valor"
                      class="marca absolute inset-0 rounded-md bg-marino text-white flex items-center justify-center"
                      :style="{ animationDelay: `${800 + i * 700}ms` }"
                    >{{ n }}</span>
                  </span>
                </div>
              </li>
            </ul>
            <p class="entra mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-brand-900" :style="retraso(3200)">
              <AppIcon name="clock" :size="14" />{{ t('Hecho en unos 30 segundos', 'Done in about 30 seconds') }}
            </p>
          </div>

          <!-- 3. Las dos miradas -->
          <div v-else-if="paso === 2" key="2" class="pantalla px-5 pt-5">
            <p class="text-[0.68rem] font-mono font-normal uppercase tracking-[0.14em] text-surface-600">{{ t('Estudiante 1', 'Student 1') }}</p>
            <p class="mt-1 font-display text-lg font-semibold leading-tight text-surface-900">{{ t('Dos miradas sobre el avance', 'Two perspectives on progress') }}</p>
            <div class="mt-6" :style="estilo({ '--ondas-duracion': '1600ms' })">
              <OndasSintonia :desfase="desfaseOndas" :alto="96" :grosor="3" />
            </div>
            <div class="mt-4 grid grid-cols-2 gap-2">
              <div class="entra rounded-xl bg-surface-100 p-3 text-center" :style="retraso(300)">
                <p class="text-[0.65rem] font-medium text-surface-800 flex items-center justify-center gap-1"><span class="h-1 w-3 rounded-full bg-brand-500" />{{ t('Estudiante', 'Student') }}</p>
                <p class="mt-1 font-display text-2xl font-medium text-surface-900">4</p>
              </div>
              <div class="entra rounded-xl bg-surface-100 p-3 text-center" :style="retraso(420)">
                <p class="text-[0.65rem] font-medium text-surface-800 flex items-center justify-center gap-1"><span class="h-1 w-3 rounded-full bg-surface-900" />{{ t('Tutor/a', 'Supervisor') }}</p>
                <p class="mt-1 font-display text-2xl font-medium text-surface-900">2</p>
              </div>
            </div>
            <p class="entra mt-4 rounded-xl border border-brand-200 bg-brand-50 p-3 text-xs font-medium leading-snug text-surface-900" :style="retraso(2000)">
              {{ t('2 puntos de diferencia: hay desajuste. Nadie tiene razón: son dos miradas.', '2 points of difference: there is a mismatch. Nobody is right: they are two perspectives.') }}
            </p>
          </div>

          <!-- 4. La agenda -->
          <div v-else key="3" class="pantalla px-5 pt-5">
            <p class="text-[0.68rem] font-mono font-normal uppercase tracking-[0.14em] text-surface-600">{{ t('Próxima tutoría', 'Next meeting') }}</p>
            <p class="mt-1 font-display text-lg font-semibold leading-tight text-surface-900">{{ t('Agenda para los dos', 'Agenda for both') }}</p>
            <ol class="mt-4 space-y-2.5">
              <li
                v-for="(q, i) in agenda"
                :key="q"
                class="entra flex gap-2.5 rounded-xl border border-surface-200 p-3"
                :style="{ animationDelay: `${400 + i * 700}ms` }"
              >
                <span class="h-5 w-5 shrink-0 rounded-full bg-marino text-white text-[0.65rem] font-semibold flex items-center justify-center">{{ i + 1 }}</span>
                <span class="text-xs leading-snug text-surface-900">{{ q }}</span>
              </li>
            </ol>
            <p class="entra mt-4 flex items-center gap-1.5 text-[0.7rem] texto-suave" :style="retraso(2800)">
              <AppIcon name="users" :size="14" class="shrink-0" />{{ t('Estudiante y tutor/a reciben las mismas preguntas.', 'Student and supervisor receive the same questions.') }}
            </p>
          </div>
        </Transition>
      </div>
    </div>

    <!-- La guía de pasos: altura fija (todos los textos siempre presentes), así nada salta al avanzar -->
    <div>
      <ol class="rounded-2xl border border-surface-200 bg-papel/90 p-2 backdrop-blur-sm">
        <li v-for="(p, i) in PASOS" :key="p.titulo">
          <button
            type="button"
            class="w-full rounded-xl px-3.5 py-3 text-left transition-colors duration-200"
            :class="paso === i ? 'bg-surface-100' : 'hover:bg-surface-100/60'"
            :aria-current="paso === i ? 'step' : undefined"
            @click="ir(i)"
          >
            <span class="grid grid-cols-[1.75rem_1fr] gap-x-3">
              <span
                class="h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors duration-200"
                :class="paso === i ? 'bg-marino text-white' : 'bg-surface-100 text-surface-800 ring-1 ring-surface-200'"
              >{{ i + 1 }}</span>
              <span class="pt-1">
                <span class="block font-semibold leading-snug text-surface-900">{{ p.titulo }}</span>
                <span class="mt-1 block text-sm leading-snug texto-suave">{{ p.texto }}</span>
                <span v-if="!quieto" class="mt-2.5 block h-1 rounded-full overflow-hidden" :class="paso === i ? 'bg-surface-200' : 'bg-transparent'" aria-hidden="true">
                  <span
                    v-if="paso === i"
                    :key="`barra-${i}`"
                    class="barra block h-full rounded-full bg-brand-800"
                    :style="{ animationDuration: `${p.duracion}ms` }"
                    @animationend="siguiente"
                  />
                </span>
              </span>
            </span>
          </button>
        </li>
      </ol>
      <button
        v-if="!quieto"
        type="button"
        class="mt-2 inline-flex items-center gap-2 rounded-md px-3 min-h-tactil text-sm font-medium text-surface-800 hover:bg-papel/70"
        @click="pausadoUsuario = !pausadoUsuario"
      >
        <AppIcon :name="pausadoUsuario ? 'reproducir' : 'pausa'" :size="16" />{{ pausadoUsuario ? t('Reanudar el recorrido', 'Resume the walkthrough') : t('Pausar el recorrido', 'Pause the walkthrough') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Cambio de pantalla dentro del móvil: corto, de lado y sin rebote. */
.pantalla-enter-active,
.pantalla-leave-active {
  transition: opacity 260ms var(--ease-out), transform 260ms var(--ease-out);
}
.pantalla-enter-from {
  opacity: 0;
  transform: translateX(18px);
}
.pantalla-leave-to {
  opacity: 0;
  transform: translateX(-18px);
}

/* Una respuesta que se marca. */
.marca {
  animation: marcar 320ms var(--ease-out) both;
}
@keyframes marcar {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
}
/* Algo que llega a la pantalla. */
.entra {
  animation: entrar 420ms var(--ease-out) both;
}
@keyframes entrar {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}
/* El botón "Enviar" pasa a "Enviado". */
.boton-texto {
  animation: salir-arriba 300ms var(--ease-out) both;
}
.boton-hecho {
  animation: entrar-abajo 300ms var(--ease-out) both;
}
@keyframes salir-arriba {
  to {
    opacity: 0;
    transform: translateY(-100%);
  }
}
@keyframes entrar-abajo {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
}
/* La barra del paso: su final hace pasar al siguiente. */
.barra {
  transform-origin: left;
  animation-name: llenar;
  animation-timing-function: linear;
  animation-fill-mode: both;
}
@keyframes llenar {
  from {
    transform: scaleX(0);
  }
}

/* Pausa: se congela todo a la vez. */
.pausado :deep(*),
.pausado * {
  animation-play-state: paused !important;
}

/* Reducir movimiento: cada pantalla en su estado final, sin transiciones. */
.quieto .marca,
.quieto .entra,
.quieto .boton-hecho {
  animation: none;
}
.quieto .boton-texto {
  animation: none;
  opacity: 0;
}
.quieto .pantalla-enter-active,
.quieto .pantalla-leave-active {
  transition: none;
}
@media (prefers-reduced-motion: reduce) {
  .marca,
  .entra,
  .boton-hecho,
  .barra {
    animation: none;
  }
  .boton-texto {
    animation: none;
    opacity: 0;
  }
}
</style>
