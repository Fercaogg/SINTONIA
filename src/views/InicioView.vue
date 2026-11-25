<script setup lang="ts">
import SaltarContenido from '@/components/layout/SaltarContenido.vue'
// Portada (rediseño del 14/11/2026, DISENO.md apartado 12).
// Orden por importancia: qué es y probarlo; para quién; por qué; cómo
// funciona; las cifras con la demostración; privacidad; cada perfil;
// Puente; quién lo dirige; dudas y contacto. Retícula de 12 columnas y
// todos los apartados empiezan con la misma cabecera (CabeceraSeccion).
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { alAvanzar, desfasarOndas, sinMovimiento, vCursor, vRevelar } from '@/lib/efectos'
import { RouterLink, useRoute } from 'vue-router'
import { modoDemo } from '@/lib/supabase'
import { useVisibleUnaVez } from '@/lib/movimiento'
import { hayDemostracion } from '@/lib/demo'
import { REFERENCIAS } from '@/contenido/portada'
import { PUENTE as PUENTE_EN } from '@/contenido/en'
import { useIdioma } from '@/lib/idioma'
import { useContenido } from '@/lib/contenido'
import AppIcon from '@/components/comun/AppIcon.vue'
import BandaEntorno from '@/components/comun/BandaEntorno.vue'
import AccesosDemo from '@/components/comun/AccesosDemo.vue'
import PiePublico from '@/components/layout/PiePublico.vue'
import CabeceraPublica from '@/components/layout/CabeceraPublica.vue'
import CabeceraSeccion from '@/components/portada/CabeceraSeccion.vue'
import CalculadoraTiempo from '@/components/portada/CalculadoraTiempo.vue'
import ComparativaHonesta from '@/components/portada/ComparativaHonesta.vue'
import RecorridoProducto from '@/components/portada/RecorridoProducto.vue'
import IlustracionPaso from '@/components/portada/IlustracionPaso.vue'
import DemoSintonia from '@/components/portada/DemoSintonia.vue'
import CifraAnimada from '@/components/portada/CifraAnimada.vue'
import QuienVeBienestar from '@/components/portada/QuienVeBienestar.vue'
import TarjetasPerfiles from '@/components/portada/TarjetasPerfiles.vue'
import OndasSintonia from '@/components/portada/OndasSintonia.vue'
import TituloEnSintonia from '@/components/portada/TituloEnSintonia.vue'
import ApartadoRespaldo from '@/components/portada/ApartadoRespaldo.vue'
import AplicacionPorDentro from '@/components/portada/AplicacionPorDentro.vue'
import PreguntasFrecuentes from '@/components/portada/PreguntasFrecuentes.vue'
import FormularioContacto from '@/components/portada/FormularioContacto.vue'

// Efecto del fondo del inicio (WebGL), cargado aparte para no retrasar la página.
const CampoSintonia = defineAsyncComponent(() => import('@/components/portada/CampoSintonia.vue'))

const route = useRoute()
// Cierre: las ondas se juntan la primera vez que se ve.
const cierre = ref<HTMLElement | null>(null)
const cierreVisto = useVisibleUnaVez(cierre)
const CITADAS = REFERENCIAS.filter((r) => ['colomo2025', 'dekleijn2012', 'winner1980', 'slade2013'].includes(r.clave))

// Idioma de la página (la portada también se sirve en inglés en /en).
const { t, ruta, idioma } = useIdioma()
const contenido = useContenido()
const DATOS_CLAVE = computed(() => contenido.value.DATOS_CLAVE)
const PARA_QUIEN = computed(() => contenido.value.PARA_QUIEN)
const PASOS = computed(() => contenido.value.PASOS)


const PUENTE_LARGO = 3

// ---------- Movimiento ligado al desplazamiento (DISENO.md 12.1) ----------
const limitar = (v: number) => Math.min(1, Math.max(0, v))
const tramo = (v: number, a: number, b: number) => limitar((v - a) / (b - a))
const ondasProblema = ref<HTMLElement | null>(null)
const ondasBanda = ref<HTMLElement | null>(null)
const banda = ref<HTMLElement | null>(null)
const puenteLista = ref<HTMLElement | null>(null)
const puenteRelleno = ref<HTMLElement | null>(null)
const puenteActivo = ref(sinMovimiento() ? PUENTE_LARGO : 0)
const ondasCierre = ref<HTMLElement | null>(null)
const quitar: (() => void)[] = []
onMounted(() => {
  if (sinMovimiento()) return
  // El problema: las dos miradas se acercan algo al leer, sin llegar a coincidir.
  if (ondasProblema.value) {
    const el = ondasProblema.value
    quitar.push(alAvanzar(el, (v) => desfasarOndas(el, 1 - 0.65 * tramo(v, 0.15, 0.6))))
  }
  // Banda azul: unas ondas grandes de fondo que se deslizan con el scroll.
  if (banda.value && ondasBanda.value) {
    const fondo = ondasBanda.value
    quitar.push(alAvanzar(banda.value, (v) => (fondo.style.transform = `translate3d(${((0.5 - v) * 260).toFixed(1)}px, 0, 0)`)))
  }
  // Puente: la línea se dibuja con el scroll y cada paso se enciende al llegar.
  if (puenteLista.value) {
    quitar.push(
      alAvanzar(puenteLista.value, (v) => {
        const l = tramo(v, 0.18, 0.55)
        if (puenteRelleno.value) puenteRelleno.value.style.transform = `scaleY(${l.toFixed(4)})`
        puenteActivo.value = l >= 0.98 ? PUENTE_LARGO : l >= 0.48 ? 2 : l > 0.02 ? 1 : 0
      }),
    )
  }
  // Cierre: las ondas coinciden por fin, al ritmo del scroll.
  if (ondasCierre.value) {
    const el = ondasCierre.value
    quitar.push(alAvanzar(el, (v) => desfasarOndas(el, 1 - tramo(v, 0.1, 0.45))))
  }
})
onBeforeUnmount(() => {
  quitar.forEach((q) => q())
})

const ICONOS_PARA_QUIEN = ['graduation', 'flask', 'document', 'building'] as const

const PUENTE_ES = [
  { titulo: 'Lo activas tú', texto: 'El estudiante activa Puente en su panel cuando quiere, y lo desactiva igual de fácil.' },
  { titulo: 'Se acerca un plazo', texto: 'Cuando una convocatoria predoctoral o de admisión abre o cierra pronto, SINTONÍA lo tiene en cuenta.' },
  { titulo: 'Se habla en la tutoría', texto: 'La agenda incluye una línea para comentarlo. Es una conversación, no un aviso automático.' },
]
const PUENTE = computed(() => (idioma.value === 'en' ? PUENTE_EN : PUENTE_ES))
// Estilos en línea siempre aplicados desde código (la CSP no admite atributos style).
const retraso = (ms: number) => ({ animationDelay: `${ms}ms` })
const estilo = (e: Record<string, string>) => e
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <SaltarContenido />
    <BandaEntorno />
    <CabeceraPublica en-portada />

    <main id="contenido" tabindex="-1" class="outline-none flex-1 overflow-x-clip">
      <p v-if="route.query.borrado" class="aviso-exito max-w-[900px] mx-4 sm:mx-auto mt-6" role="status">
        {{ t('Hemos borrado tu cuenta y todos tus datos. Gracias por haber participado.', 'We have deleted your account and all your data. Thank you for taking part.') }}
      </p>

      <!-- 1. Inicio: titular centrado y, debajo, el producto (como el héroe de LUMBRA360) -->
      <section class="relative overflow-hidden" aria-labelledby="t-inicio">
        <CampoSintonia />
        <div class="relative z-10 max-w-[1264px] mx-auto px-6 sm:px-8 pt-14 pb-16 sm:pt-20 lg:pt-24">
          <div class="entrada mx-auto flex max-w-[52rem] flex-col items-center gap-6 text-center">
            <p class="font-mono text-xs uppercase tracking-[0.14em] text-surface-600">{{ t('Tutoría de TFM, TFG y tesis', 'Supervision of Master\'s theses, final projects and PhDs') }}</p>
            <h1 id="t-inicio" class="font-display text-[2.4rem] leading-[1.04] sm:text-5xl lg:text-[3.75rem] font-medium tracking-[-0.035em] text-surface-900 text-balance">
              {{ t('Acompañar el trabajo académico,', 'Supporting academic work,') }}
              {{ t('sin vigilar', 'without surveillance') }}
            </h1>
            <p class="max-w-[36rem] text-lg texto-suave text-pretty">
              {{ t('Un registro semanal muy breve de estudiante y tutor/a para que las tutorías empiecen por lo que importa.', 'A very short weekly check-in for student and supervisor, so that supervision meetings start with what matters.') }}
            </p>
            <div class="mt-2 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
              <a v-if="modoDemo" href="#entrar" class="btn-primary w-full sm:w-auto min-h-12 px-6 text-base">{{ t('Entrar en la demostración', 'Enter the demo') }}</a>
              <RouterLink v-else to="/registro" class="btn-primary w-full sm:w-auto min-h-12 px-6 text-base">{{ t('Tengo un código', 'I have a code') }}</RouterLink>
              <a v-if="modoDemo" href="#como-funciona" class="enlace-flecha">{{ t('Ver cómo funciona', 'See how it works') }} <span aria-hidden="true">↓</span></a>
              <RouterLink v-else-if="hayDemostracion" to="/demo" class="enlace-flecha">{{ t('Ver la demostración', 'See the demo') }} <span aria-hidden="true">→</span></RouterLink>
              <a v-else href="#demostracion" class="enlace-flecha">{{ t('Ver la demostración', 'See the demo') }} <span aria-hidden="true">↓</span></a>
            </div>
            <ul class="mt-2 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-surface-900">
              <li class="inline-flex items-center gap-2.5"><span class="h-2 w-2 rounded-full bg-brand-500" aria-hidden="true" />{{ t('Unos 60 segundos a la semana', 'About 60 seconds a week') }}</li>
              <li class="inline-flex items-center gap-2.5"><span class="h-2 w-2 rounded-full bg-brand-500" aria-hidden="true" />{{ t('Sin notas, sin rankings', 'No marks, no rankings') }}</li>
              <li class="inline-flex items-center gap-2.5"><span class="h-2 w-2 rounded-full bg-brand-500" aria-hidden="true" />{{ t('Tu bienestar solo lo ves tú', 'Only you see your wellbeing') }}</li>
            </ul>
          </div>
          <div class="mx-auto mt-14 max-w-[56rem] lg:mt-16">
            <RecorridoProducto />
          </div>
        </div>
      </section>

      <!-- 2. Para quién es -->
      <section id="para-quien" class="seccion bg-surface-100" aria-labelledby="t-para">
        <div class="contenedor">
          <CabeceraSeccion id="t-para" :etiqueta="t('Para quién', 'Who')" :titulo="t('Para quién es', 'Who it is for')" />
          <ul class="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            <li v-for="(p, i) in PARA_QUIEN" :key="p.titulo" v-revelar="i" class="flex flex-col gap-4 border-t border-surface-300 pt-6">
              <span class="h-11 w-11 shrink-0 rounded-xl bg-lumbre-suave text-lumbre-texto flex items-center justify-center"><AppIcon :name="ICONOS_PARA_QUIEN[i]" :size="20" /></span>
              <div>
                <h3 class="font-semibold text-surface-900">{{ p.titulo }}</h3>
                <p class="mt-1 text-[0.95rem] leading-relaxed texto-suave text-pretty">{{ p.texto }}</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- 3. Probarla por dentro (solo en la demostración) -->
      <section v-if="modoDemo" id="entrar" class="scroll-mt-24 max-w-[1264px] mx-auto px-6 sm:px-8 pt-14 sm:pt-16" aria-label="Entrar en la demostración" :lang="idioma === 'en' ? 'es' : undefined">
        <AccesosDemo ancho />
      </section>

      <!-- 4. El problema -->
      <section id="problema" class="seccion" aria-labelledby="t-problema">
        <div class="contenedor">
          <CabeceraSeccion id="t-problema" :etiqueta="t('Por qué', 'Why')" :titulo="t('El problema', 'The problem')" />
          <div class="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div class="lg:col-span-6 flex flex-col gap-8">
              <p v-revelar class="max-w-[34rem] text-pretty text-lg sm:text-xl lg:text-[1.375rem] leading-relaxed text-surface-900">
                {{ t('Estudiante y tutor/a no siempre ven igual el mismo trabajo. En un estudio sobre la tutorización del TFM, el profesorado valoró la tutorización mejor que el alumnado (Colomo Magaña et al., 2025).', "Student and supervisor do not always see the same work in the same way. In a study on Master's thesis supervision, teaching staff rated supervision more highly than students did (Colomo Magaña et al., 2025).") }}
              </p>
              <div v-revelar="1" class="max-w-[34rem] space-y-5 leading-relaxed texto-suave sm:text-lg">
                <p>
                  {{ t('Y esa relación importa: cómo percibe el estudiante la relación con su tutor/a se ha relacionado con la nota final, con lo que cree que el tutor/a aporta a su aprendizaje y con su satisfacción (de Kleijn et al., 2012).', "And that relationship matters: how students perceive their relationship with their supervisor has been related to their final grade, to what they believe the supervisor contributes to their learning and to their satisfaction (de Kleijn et al., 2012).") }}
                </p>
                <p>
                  {{ t('¿Llega a todo el mundo por igual la información sobre el doctorado? SINTONÍA se pregunta si acercarla a través de la tutoría ayuda a quien termina el máster.', "Does information about doing a PhD reach everyone equally? SINTONÍA asks whether bringing it closer through supervision helps those finishing their Master's.") }}
                </p>
                <p><RouterLink :to="ruta('/investigacion')" class="enlace">{{ t('Cómo lo vamos a estudiar y referencias', 'How we will study it, and references') }}</RouterLink></p>
              </div>
            </div>
            <div class="lg:col-span-5 lg:col-start-8">
              <div ref="ondasProblema" v-revelar="1" v-cursor class="rounded-[20px] border border-surface-200 bg-surface-50 p-6 sm:p-8" aria-hidden="true">
                <OndasSintonia :desfase="0.7" :alto="80" :grosor="3" />
                <div class="mt-3 flex justify-between text-xs font-medium text-surface-800">
                  <span class="inline-flex items-center gap-1.5"><span class="h-1 w-4 rounded-full bg-brand-500" />{{ t('Una mirada', 'One perspective') }}</span>
                  <span class="inline-flex items-center gap-1.5"><span class="h-1 w-4 rounded-full bg-surface-900" />{{ t('Otra mirada', 'Another perspective') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. Cómo funciona: tres pasos ilustrados, con el número y la línea de LUMBRA360 -->
      <section id="como-funciona" class="seccion bg-surface-100" aria-labelledby="t-como">
        <div class="contenedor">
          <CabeceraSeccion id="t-como" :etiqueta="t('Paso a paso', 'Step by step')" :titulo="t('Cómo funciona', 'How it works')">
            {{ t('Tres pasos cada semana. Nadie sube su trabajo y nadie pone notas.', 'Three steps every week. Nobody uploads their work and nobody gives marks.') }}
          </CabeceraSeccion>
          <ol class="grid gap-12 lg:grid-cols-3 lg:gap-8">
            <li v-for="(p, i) in PASOS" :key="p.titulo" v-revelar="i" class="flex flex-col gap-4">
              <div v-cursor="'inclinar'" class="rounded-[12px] border border-surface-200 bg-surface-50 p-4 shadow-soft"><IlustracionPaso :paso="(i + 1) as 1 | 2 | 3" /></div>
              <div class="flex items-center gap-3" aria-hidden="true">
                <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-900 font-mono text-xs text-papel">{{ i + 1 }}</span>
                <span class="relative hidden h-0.5 flex-1 overflow-hidden rounded-full bg-surface-200 lg:block" :class="i === PASOS.length - 1 ? 'lg:invisible' : ''">
                  <span class="absolute inset-0 bg-brand-500" />
                </span>
              </div>
              <h3 class="font-display text-lg font-semibold text-surface-900 flex items-center gap-2">
                <span class="sr-only">{{ t('Paso', 'Step') }} {{ i + 1 }}: </span>{{ p.titulo }}
              </h3>
              <p class="text-pretty leading-relaxed">{{ p.texto }}</p>
              <p class="text-sm leading-relaxed texto-suave text-pretty">{{ p.detalle }}</p>
            </li>
          </ol>
        </div>
      </section>

      <!-- 5b. La aplicación por dentro: pantallas reales en un portátil (como en LUMBRA360) -->
      <section id="aplicacion" class="seccion" aria-labelledby="t-aplicacion">
        <div class="contenedor">
          <CabeceraSeccion id="t-aplicacion" :etiqueta="t('La aplicación por dentro', 'Inside the app')" :titulo="t('Todo en un panel claro', 'Everything in one clear dashboard')">
            {{ t('Pantallas reales de la demostración, con datos ficticios.', 'Real screens from the demo, with fictitious data.') }}
          </CabeceraSeccion>
          <AplicacionPorDentro />
        </div>
      </section>

      <!-- 6. Pruébalo: la demostración interactiva y las cifras, sobre tinta con un resplandor de lumbre -->
      <section ref="banda" class="seccion relative overflow-hidden bg-[#111111] text-white" aria-labelledby="t-pruebalo">
        <div class="pointer-events-none absolute left-1/2 top-0 h-[36rem] w-[70rem] -translate-x-1/2 -translate-y-1/2 rounded-full resplandor blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -inset-x-40 bottom-10 opacity-25" aria-hidden="true">
          <div ref="ondasBanda" class="will-change-transform"><OndasSintonia :desfase="0.6" :alto="160" :grosor="2" sobre-oscuro /></div>
        </div>
        <div class="contenedor relative">
          <CabeceraSeccion id="t-pruebalo" claro :etiqueta="t('Pruébalo', 'Try it')" :titulo="t('Dos miradas, un minuto', 'Two perspectives, one minute')">
            {{ t('Mueve cómo ven el avance estudiante y tutor/a. Si la diferencia es de 2 puntos o más, aparecen las tres preguntas para la tutoría.', 'Move how student and supervisor see the progress. If the difference is 2 points or more, the three questions for the meeting appear.') }}
          </CabeceraSeccion>
          <div class="grid gap-14 lg:grid-cols-12 lg:items-center">
            <div v-revelar class="lg:col-span-5">
              <div :aria-label="t('SINTONÍA en cifras', 'SINTONÍA in figures')" role="group" class="grid grid-cols-2 gap-x-6 gap-y-8">
                <CifraAnimada v-for="d in DATOS_CLAVE" :key="d.texto" :valor="Number(d.cifra)" :unidad="d.unidad" :texto="d.texto" />
              </div>
              <RouterLink to="/demo/recorrido" :hreflang="idioma === 'en' ? 'es' : undefined" class="mt-10 inline-flex items-center gap-2 min-h-tactil font-medium text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
                {{ t('Haz el recorrido guiado, en unos 60 segundos', 'Take the guided tour, in about 60 seconds (in Spanish)') }} <span aria-hidden="true">→</span>
              </RouterLink>
            </div>
            <div v-revelar="1" v-cursor class="lg:col-span-6 lg:col-start-7 text-surface-900 rounded-[var(--radius-md)]">
              <DemoSintonia />
            </div>
          </div>
        </div>
      </section>

      <!-- 6b. Calculadora de tiempo -->
      <section id="tiempo" class="seccion" aria-labelledby="t-tiempo">
        <div class="contenedor">
          <CabeceraSeccion id="t-tiempo" :etiqueta="t('Tiempo', 'Time')" :titulo="t('¿Cuánto tiempo pide a un máster?', 'How much time does it take a programme?')">
            {{ t('Escribe cuántos estudiantes y tutores tiene el máster y mira los minutos de todos, cada semana.', 'Enter how many students and supervisors the programme has and see everyone\'s minutes, each week.') }}
          </CabeceraSeccion>
          <div v-revelar class="mx-auto max-w-[44rem]"><CalculadoraTiempo /></div>
        </div>
      </section>

      <!-- 7. Privacidad y ética -->
      <section id="privacidad" class="seccion bg-surface-100" aria-labelledby="t-privacidad">
        <div class="contenedor">
          <CabeceraSeccion id="t-privacidad" :etiqueta="t('Tus datos', 'Your data')" :titulo="t('Privacidad y ética', 'Privacy and ethics')" />
          <div class="grid gap-12 lg:grid-cols-12 lg:items-start">
            <div v-revelar class="lg:col-span-6">
              <p class="max-w-[34rem] font-display text-2xl sm:text-[1.75rem] font-medium leading-tight tracking-tight text-surface-900 text-balance">
                {{ t('Tu bienestar solo lo ves tú.', 'Only you see your wellbeing.') }} <span class="texto-suave">{{ t('La dirección, solo cifras de 5 personas o más.', 'Programme directors only see figures for 5 people or more.') }}</span>
              </p>
              <ul class="mt-8 flex max-w-[34rem] flex-col border-t border-surface-300">
                <li class="flex items-start gap-4 border-b border-surface-300 py-4"><span class="icono-lumbre"><AppIcon name="lock" :size="20" /></span><span class="pt-2.5">{{ t('Tu tutor/a no ve tus respuestas ni tu bienestar.', 'Your supervisor does not see your answers or your wellbeing.') }}</span></li>
                <li class="flex items-start gap-4 border-b border-surface-300 py-4"><span class="icono-lumbre"><AppIcon name="shield" :size="20" /></span><span class="pt-2.5">{{ t('Las reglas de quién ve qué están escritas en la propia base de datos.', 'The rules on who sees what are written into the database itself.') }}</span></li>
                <li class="flex items-start gap-4 border-b border-surface-300 py-4"><span class="icono-lumbre"><AppIcon name="brain" :size="20" /></span><span class="pt-2.5">{{ t('No deduce emociones, no pone notas y no hace rankings.', 'It does not infer emotions, give marks or make rankings.') }}</span></li>
              </ul>
              <RouterLink :to="ruta('/como-funciona')" class="btn-secondary mt-9">{{ t('Ver quién ve cada dato', 'See who sees each piece of data') }}</RouterLink>
            </div>
            <div class="lg:col-span-5 lg:col-start-8">
              <div v-revelar="1" v-cursor class="rounded-[var(--radius-md)]"><QuienVeBienestar /></div>
              <p class="mt-6 text-[0.95rem] texto-suave leading-relaxed text-pretty">
                {{ t('Las tecnologías no son neutrales: sus decisiones de diseño también deciden quién puede hacer qué (Winner, 1980). Y el uso de datos de estudiantes plantea dilemas éticos (Slade y Prinsloo, 2013). SINTONÍA los aborda en el propio diseño: cada dato tiene un destino definido.', 'Technologies are not neutral: their design decisions also decide who can do what (Winner, 1980). And the use of student data raises ethical dilemmas (Slade and Prinsloo, 2013). SINTONÍA addresses them in the design itself: every piece of data has a defined destination.') }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 7b. Comparativa honesta -->
      <section id="comparativa" class="seccion" aria-labelledby="t-comparativa">
        <div class="contenedor">
          <CabeceraSeccion id="t-comparativa" :etiqueta="t('Comparación', 'Comparison')" :titulo="t('Entre no saber nada y vigilarlo todo', 'Between knowing nothing and watching everything')">
            {{ t('Tres formas de acompañar un trabajo académico, comparadas con honestidad. Sin marcas.', 'Three ways of supporting academic work, compared honestly. No brands.') }}
          </CabeceraSeccion>
          <div v-revelar><ComparativaHonesta /></div>
        </div>
      </section>

      <!-- 8. Para cada perfil -->
      <section id="perfiles" class="seccion bg-surface-100" aria-labelledby="t-perfiles">
        <div class="contenedor">
          <CabeceraSeccion id="t-perfiles" :etiqueta="t('Quién hace qué', 'Who does what')" :titulo="t('Para cada perfil', 'For each profile')">
            {{ t('Qué hace cada persona, cuánto tiempo le lleva, qué ve y qué no ve.', 'What each person does, how long it takes them, what they see and what they do not.') }}
          </CabeceraSeccion>
          <TarjetasPerfiles />
        </div>
      </section>

      <!-- 9. Puente al doctorado: un recorrido de tres tramos -->
      <section id="puente" class="seccion" aria-labelledby="t-puente">
        <div class="contenedor">
          <CabeceraSeccion id="t-puente" :etiqueta="t('Doctorado', 'PhD')" :titulo="t('Puente al doctorado', 'Bridge to the PhD')">
            {{ t('Si el estudiante lo activa, los plazos de las convocatorias predoctorales y de admisión al doctorado llegan a la tutoría.', 'If the student turns it on, the deadlines of predoctoral and PhD admission calls reach the supervision meeting.') }}
          </CabeceraSeccion>
          <ol ref="puenteLista" class="relative mx-auto max-w-[40rem]">
            <!-- La línea: un carril gris y su relleno de lumbre, que se dibuja con el scroll -->
            <span class="absolute left-6 top-6 bottom-6 w-0.5 -translate-x-1/2 bg-surface-200" aria-hidden="true" />
            <span ref="puenteRelleno" class="absolute left-6 top-6 bottom-6 w-0.5 -translate-x-1/2 origin-top bg-brand-500" :style="{ transform: `scaleY(${puenteActivo === PUENTE_LARGO ? 1 : 0})` }" aria-hidden="true" />
            <li v-for="(p, i) in PUENTE" :key="p.titulo" class="relative grid grid-cols-[3rem_1fr] gap-x-5 pb-10 last:pb-0">
              <span
                class="paso-puente relative z-10 h-12 w-12 rounded-full flex items-center justify-center font-mono text-sm"
                :class="i < puenteActivo ? 'bg-brand-500 text-[#111111] encendido' : 'bg-papel text-surface-900 ring-1 ring-surface-300'"
                aria-hidden="true"
              >{{ String(i + 1).padStart(2, '0') }}</span>
              <div class="pt-2.5">
                <h3 class="font-display text-xl font-semibold text-surface-900">{{ p.titulo }}</h3>
                <p class="mt-2 leading-relaxed texto-suave">{{ p.texto }}</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <!-- 10. Respaldo: lo ya hecho, los avales y el equipo (como en LUMBRA360) -->
      <ApartadoRespaldo />

      <!-- 11. Preguntas frecuentes -->
      <section id="preguntas" class="seccion" aria-labelledby="t-preguntas">
        <div class="contenedor">
          <CabeceraSeccion id="t-preguntas" :etiqueta="t('Dudas', 'Questions')" :titulo="t('Preguntas frecuentes', 'Frequently asked questions')" />
          <div v-revelar="1" class="mx-auto max-w-[48rem]"><PreguntasFrecuentes /></div>
          <p class="mt-10 text-center texto-suave">{{ t('Y si no está aquí,', 'And if it is not here,') }} <a href="#contacto" class="enlace">{{ t('escríbenos', 'write to us') }}</a>.</p>
        </div>
      </section>

      <!-- 12. Contacto -->
      <section id="contacto" class="seccion bg-surface-100" aria-labelledby="t-contacto">
        <div class="contenedor">
          <CabeceraSeccion id="t-contacto" :etiqueta="t('Escríbenos', 'Write to us')" :titulo="t('Contacto', 'Contact')">
            {{ t('Si te interesa SINTONÍA para tu máster, programa o escuela de doctorado, o tienes cualquier duda.', 'If you are interested in SINTONÍA for your Master\'s programme, PhD programme or doctoral school, or have any questions.') }}
          </CabeceraSeccion>
          <div v-revelar="1" class="mx-auto max-w-[44rem]">
            <FormularioContacto />
            <p class="mt-6 text-center"><RouterLink :to="ruta('/instituciones')" class="enlace">{{ t('Información para instituciones y solicitud de demostración', 'Information for institutions and demo requests') }}</RouterLink></p>
          </div>
        </div>
      </section>

      <!-- Cierre: las dos ondas, por fin, en sintonía (como la llamada final de LUMBRA360) -->
      <section ref="cierre" class="seccion" aria-labelledby="t-cierre">
        <div class="contenedor text-center">
          <div ref="ondasCierre" class="max-w-2xl mx-auto" :style="estilo({ '--ondas-duracion': '1100ms' })"><OndasSintonia :desfase="cierreVisto ? 0 : 1" :alto="80" /></div>
          <div class="mt-8 font-display text-[2rem] lg:text-[2.5rem] font-medium leading-[1.1] tracking-tight text-surface-900">
            <TituloEnSintonia id="t-cierre" :texto="t('En sintonía.', 'In tune.')" />
          </div>
          <p class="mt-5 text-lg texto-suave max-w-xl mx-auto text-pretty">{{ t('Acompañar el trabajo académico, sin vigilar.', 'Supporting academic work, without surveillance.') }}</p>
          <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a v-if="modoDemo" href="#entrar" class="btn-primary min-h-12 px-6 text-base">{{ t('Entrar en la demostración', 'Enter the demo') }}</a>
            <RouterLink v-else to="/registro" class="btn-primary min-h-12 px-6 text-base">{{ t('Tengo un código', 'I have a code') }}</RouterLink>
            <RouterLink :to="ruta('/investigacion')" class="enlace-flecha">{{ t('Leer la investigación', 'Read about the research') }} <span aria-hidden="true">→</span></RouterLink>
          </div>
        </div>
      </section>

      <!-- Referencias citadas en esta página -->
      <section class="max-w-[1264px] mx-auto px-6 sm:px-8 pb-12 w-full" aria-labelledby="t-refs">
        <div class="border-t border-surface-200 pt-8">
          <h2 id="t-refs" class="font-mono text-xs font-normal uppercase tracking-[0.14em] text-surface-600 mb-4">{{ t('Referencias citadas', 'References cited') }}</h2>
          <ul class="space-y-2 text-sm texto-suave max-w-4xl">
            <li v-for="r in CITADAS" :key="r.clave" class="pl-6 -indent-6">
              {{ r.texto }} <a v-if="r.enlace" :href="r.enlace" target="_blank" rel="noopener noreferrer" class="enlace break-all">{{ r.enlace }}<span class="sr-only">{{ t(' (se abre en otra pestaña)', ' (opens in a new tab)') }}</span></a>
            </li>
          </ul>
        </div>
      </section>
    </main>

    <PiePublico />
  </div>
</template>

<style scoped>
/* Puente: cada paso se enciende con un pequeño pulso al llegar la línea. */
.paso-puente {
  transition: background-color 300ms ease, color 300ms ease, box-shadow 300ms ease;
}
.paso-puente.encendido {
  animation: encender 420ms var(--ease-out);
  box-shadow: 0 0 0 6px color-mix(in srgb, rgb(var(--rgb-b500)) 18%, transparent);
}
@keyframes encender {
  from {
    transform: scale(0.82);
  }
}
@media (prefers-reduced-motion: reduce) {
  .paso-puente.encendido {
    animation: none;
  }
}

/* Enlace secundario con flecha, subrayado fino (LUMBRA360). */
.enlace-flecha {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-height: 44px;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--rgb-s600));
  text-decoration: underline;
  text-decoration-color: rgb(var(--rgb-s300));
  text-underline-offset: 4px;
  transition: color var(--dur-micro) ease, text-decoration-color var(--dur-micro) ease;
}
.enlace-flecha:hover {
  color: rgb(var(--rgb-s900));
  text-decoration-color: currentColor;
}

/* Ritmo de los apartados de LUMBRA360: mucho aire y fondos que alternan. */
.seccion {
  scroll-margin-top: 5rem;
  padding-block: 4rem;
}
@media (min-width: 640px) {
  .seccion {
    padding-block: 6rem;
  }
}
@media (min-width: 1024px) {
  .seccion {
    padding-block: 10rem;
  }
}
.contenedor {
  max-width: 1264px;
  margin-inline: auto;
  padding-inline: 1.5rem;
}
@media (min-width: 640px) {
  .contenedor {
    padding-inline: 2rem;
  }
}

/* Iconos en cuadrado de lumbre suave (LUMBRA360). */
.icono-lumbre {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  background-color: var(--color-lumbre-suave);
  color: var(--color-lumbre-texto);
}

/* Resplandor de lumbre del apartado oscuro. */
.resplandor {
  background: radial-gradient(closest-side, color-mix(in srgb, rgb(var(--rgb-b500)) 22%, transparent), transparent);
}

/* Entrada del inicio, una sola vez al cargar (Taste: el inicio entra una vez;
   Emil: ease-out, corta y desde casi su sitio). */
.entrada {
  animation: entrada var(--dur-entrada) var(--ease-out) both;
}
.entrada-2 {
  animation-delay: 80ms;
}
/* Empieza casi transparente (no en 0) para que el navegador cuente el
   titular como pintado desde el primer momento y no retrase la carga. */
@keyframes entrada {
  from {
    opacity: 0.01;
    transform: translateY(10px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .entrada {
    animation: none;
  }
}
</style>
