<script setup lang="ts">
// «La aplicación por dentro», como en LUMBRA360: pantallas reales del panel
// (modo demostración, datos ficticios) dentro de un portátil, y una lista de
// capítulos. Mientras el apartado se ve, los capítulos avanzan solos con una
// barra de progreso; al elegir uno a mano, se detiene. Con «reducir
// movimiento» no avanza solo. Pantallas: npm run pantallas.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useIdioma } from '@/lib/idioma'
import { prefiereMenosMovimiento } from '@/lib/movimiento'

const { t } = useIdioma()
const DURACION = 6000

const CAPITULOS = computed(() => [
  {
    imagen: '/portada/app-estudiante.webp',
    titulo: t('El inicio del estudiante', "The student's home"),
    texto: t(
      'La semana en curso, el check-in pendiente y la agenda de la próxima tutoría, en una sola pantalla.',
      'The current week, the pending check-in and the agenda for the next meeting, on one screen.',
    ),
    alt: t(
      'Pantalla de inicio del estudiante: tarjeta de la semana 7 de 10 y agenda con tres preguntas para la tutoría.',
      "Student's home screen: week 7 of 10 card and an agenda with three questions for the meeting.",
    ),
  },
  {
    imagen: '/portada/app-checkin.webp',
    titulo: t('El check-in en un minuto', 'The check-in in one minute'),
    texto: t('Cuatro preguntas de 1 a 5 con botones grandes. Se puede cambiar hasta el domingo.', 'Four questions from 1 to 5 with large buttons. Answers can be changed until Sunday.'),
    alt: t('Pantalla del check-in semanal con preguntas de 1 a 5 y una barra de progreso.', 'Weekly check-in screen with questions from 1 to 5 and a progress bar.'),
  },
  {
    imagen: '/portada/app-tutor.webp',
    titulo: t('Las agendas del tutor/a', "The supervisor's agendas"),
    texto: t(
      'Cuando las dos miradas no coinciden, la tutora recibe las mismas tres preguntas que su estudiante.',
      'When the two perspectives differ, the supervisor receives the same three questions as their student.',
    ),
    alt: t('Panel del tutor/a con las agendas de la tutoría de cada estudiante.', "Supervisor's dashboard with the meeting agenda for each student."),
  },
  {
    imagen: '/portada/app-direccion.webp',
    titulo: t('El resumen de la dirección', "The programme directors' summary"),
    texto: t(
      'Solo cifras agregadas del máster, nunca de menos de 5 personas, ni por tutor/a, ni de bienestar.',
      'Only aggregated figures for the programme, never for fewer than 5 people, per supervisor or about wellbeing.',
    ),
    alt: t(
      'Resumen del máster para la dirección: tasa de respuesta, avance medio y agendas generadas.',
      'Programme summary for directors: response rate, average progress and agendas generated.',
    ),
  },
])

const activo = ref(0)
const automatico = ref(!prefiereMenosMovimiento())
const visible = ref(false)
const raiz = ref<HTMLElement | null>(null)
let temporizador = 0
let observador: IntersectionObserver | null = null

function programar() {
  window.clearTimeout(temporizador)
  if (!automatico.value || !visible.value) return
  temporizador = window.setTimeout(() => {
    activo.value = (activo.value + 1) % CAPITULOS.value.length
    programar()
  }, DURACION)
}
function elegir(i: number) {
  activo.value = i
  automatico.value = false
  window.clearTimeout(temporizador)
}

onMounted(() => {
  if (!raiz.value) return
  observador = new IntersectionObserver(
    ([e]) => {
      visible.value = e.isIntersecting
      programar()
    },
    { threshold: 0.35 },
  )
  observador.observe(raiz.value)
})
onBeforeUnmount(() => {
  observador?.disconnect()
  window.clearTimeout(temporizador)
})
const corriendo = computed(() => automatico.value && visible.value)
</script>

<template>
  <div ref="raiz" class="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
    <ol class="order-2 flex flex-col lg:order-none lg:col-span-4" :aria-label="t('Capítulos', 'Chapters')">
      <li v-for="(c, i) in CAPITULOS" :key="c.imagen" class="capitulo border-t border-surface-200 first:border-t-0" :data-activo="i === activo">
        <button type="button" class="flex w-full flex-col py-4 text-left" :aria-pressed="i === activo" @click="elegir(i)">
          <span class="flex items-center gap-4">
            <span class="capitulo-numero grid h-9 w-9 shrink-0 place-items-center rounded-full font-mono text-xs">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="capitulo-titulo font-display text-lg font-semibold leading-snug">{{ c.titulo }}</span>
          </span>
          <span class="capitulo-cuerpo">
            <span class="block overflow-hidden">
              <span class="block pl-[3.25rem] pt-2 text-pretty texto-suave">{{ c.texto }}</span>
              <span aria-hidden="true" class="relative ml-[3.25rem] mt-3 block h-0.5 overflow-hidden rounded-full bg-surface-200">
                <span
                  v-if="i === activo"
                  :key="`${activo}-${corriendo}`"
                  class="capitulo-barra absolute inset-0 origin-left bg-brand-500"
                  :class="corriendo ? 'en-marcha' : ''"
                />
              </span>
            </span>
          </span>
        </button>
      </li>
    </ol>

    <div class="order-1 lg:order-none lg:col-span-8">
      <div class="portatil mx-auto w-full" aria-live="polite">
        <div class="portatil-tapa">
          <div class="portatil-pantalla relative overflow-hidden">
            <img
              v-for="(c, i) in CAPITULOS"
              :key="c.imagen"
              :src="c.imagen"
              :alt="i === activo ? c.alt : ''"
              :aria-hidden="i !== activo"
              width="1600"
              height="1000"
              loading="lazy"
              decoding="async"
              class="absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-500"
              :class="i === activo ? 'opacity-100' : 'opacity-0'"
            />
          </div>
        </div>
        <div class="portatil-base" aria-hidden="true"><span /></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Capítulos: solo el activo se despliega y su número se enciende (LUMBRA360). */
.capitulo-numero {
  border: 1px solid rgb(var(--rgb-s300));
  color: rgb(var(--rgb-s600));
  transition: background-color 400ms var(--ease-out), color 400ms var(--ease-out), border-color 400ms var(--ease-out), box-shadow 400ms var(--ease-out);
}
.capitulo-titulo {
  color: rgb(var(--rgb-s600));
  transition: color 400ms var(--ease-out);
}
.capitulo-cuerpo {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows 500ms var(--ease-out), opacity 400ms var(--ease-out);
}
.capitulo[data-activo='true'] .capitulo-numero {
  background: rgb(var(--rgb-b500));
  border-color: rgb(var(--rgb-b500));
  color: #111111;
  box-shadow: 0 0 0 6px color-mix(in srgb, rgb(var(--rgb-b500)) 18%, transparent);
}
.capitulo[data-activo='true'] .capitulo-titulo {
  color: rgb(var(--rgb-s900));
}
.capitulo[data-activo='true'] .capitulo-cuerpo {
  grid-template-rows: 1fr;
  opacity: 1;
}
.capitulo-barra {
  transform: scaleX(1);
}
.capitulo-barra.en-marcha {
  animation: llenar 6000ms linear both;
}
@keyframes llenar {
  from {
    transform: scaleX(0);
  }
}

/* Portátil: marco de tinta, pantalla 16:10 y base. */
.portatil {
  max-width: 52rem;
}
.portatil-tapa {
  width: 92%;
  margin: 0 auto;
  padding: 1.4% 1.4% 2%;
  border-radius: 18px 18px 0 0;
  background: #1b1b1b;
  box-shadow: 0 40px 80px -40px rgb(17 17 17 / 0.45);
}
.portatil-pantalla {
  aspect-ratio: 16 / 10;
  border-radius: 6px;
  background: #ffffff;
}
.portatil-base {
  position: relative;
  height: 14px;
  border-radius: 0 0 14px 14px;
  background: linear-gradient(to bottom, #e3e3df, #a6a6a0);
}
.portatil-base span {
  position: absolute;
  left: 50%;
  top: 0;
  width: 14%;
  height: 5px;
  translate: -50% 0;
  border-radius: 0 0 6px 6px;
  background: #a6a6a0;
}
@media (prefers-reduced-motion: reduce) {
  .capitulo-cuerpo,
  .capitulo-numero,
  .capitulo-titulo {
    transition: none;
  }
}
</style>
