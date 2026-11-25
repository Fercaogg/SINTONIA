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
import { useSesion } from '@/stores/sesion'
import { INICIO_ROL } from '@/lib/tipos'
import { modoDemo } from '@/lib/supabase'
import { useVisibleUnaVez } from '@/lib/movimiento'
import { hayDemostracion } from '@/lib/demo'
import { DIRECCION, REFERENCIAS } from '@/contenido/portada'
import { PUENTE as PUENTE_EN } from '@/contenido/en'
import { useIdioma } from '@/lib/idioma'
import { useContenido } from '@/lib/contenido'
import AppLogo from '@/components/comun/AppLogo.vue'
import AppIcon from '@/components/comun/AppIcon.vue'
import BandaEntorno from '@/components/comun/BandaEntorno.vue'
import AccesosDemo from '@/components/comun/AccesosDemo.vue'
import PiePublico from '@/components/layout/PiePublico.vue'
import CabeceraSeccion from '@/components/portada/CabeceraSeccion.vue'
import SelectorIdioma from '@/components/comun/SelectorIdioma.vue'
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
import FraseLuz from '@/components/portada/FraseLuz.vue'
import TarjetaDireccion from '@/components/portada/TarjetaDireccion.vue'
import PreguntasFrecuentes from '@/components/portada/PreguntasFrecuentes.vue'
import FormularioContacto from '@/components/portada/FormularioContacto.vue'

// Efecto del fondo del inicio (WebGL), cargado aparte para no retrasar la página.
const CampoSintonia = defineAsyncComponent(() => import('@/components/portada/CampoSintonia.vue'))

const sesion = useSesion()
const route = useRoute()
const menuAbierto = ref(false)
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
const AUTOR = computed(() => contenido.value.AUTOR)
const ANTECEDENTE = computed(() => contenido.value.ANTECEDENTE)

const SECCIONES = computed(() => [
  { id: 'como-funciona', texto: t('Cómo funciona', 'How it works') },
  { id: 'privacidad', texto: t('Privacidad', 'Privacy') },
  { id: 'perfiles', texto: t('Perfiles', 'Profiles') },
  { id: 'puente', texto: t('Puente', 'Bridge') },
  { id: 'direccion', texto: t('Dirección', 'Team') },
  { id: 'preguntas', texto: t('Preguntas', 'FAQ') },
  { id: 'contacto', texto: t('Contacto', 'Contact') },
])

const PUENTE_LARGO = 3

// ---------- Movimiento ligado al desplazamiento (DISENO.md 12.1) ----------
const limitar = (v: number) => Math.min(1, Math.max(0, v))
const tramo = (v: number, a: number, b: number) => limitar((v - a) / (b - a))
const progreso = ref<HTMLElement | null>(null)
const ondasProblema = ref<HTMLElement | null>(null)
const ondasBanda = ref<HTMLElement | null>(null)
const banda = ref<HTMLElement | null>(null)
const puenteLista = ref<HTMLElement | null>(null)
const puenteRelleno = ref<HTMLElement | null>(null)
const puenteActivo = ref(sinMovimiento() ? PUENTE_LARGO : 0)
const ondasCierre = ref<HTMLElement | null>(null)
// Inicio: el producto llega inclinado hacia atrás y se endereza al deslizar.
const escenaProducto = ref<HTMLElement | null>(null)
const objetoProducto = ref<HTMLElement | null>(null)
const quitar: (() => void)[] = []
let marcoProgreso = 0
function pintarProgreso() {
  marcoProgreso = 0
  const total = document.documentElement.scrollHeight - window.innerHeight
  if (progreso.value) progreso.value.style.transform = `scaleX(${limitar(window.scrollY / Math.max(1, total)).toFixed(4)})`
}
const pedirProgreso = () => {
  if (!marcoProgreso) marcoProgreso = requestAnimationFrame(pintarProgreso)
}
onMounted(() => {
  if (sinMovimiento()) return
  window.addEventListener('scroll', pedirProgreso, { passive: true })
  if (escenaProducto.value && objetoProducto.value) {
    const obj = objetoProducto.value
    quitar.push(alAvanzar(escenaProducto.value, (v) => obj.style.setProperty('--giro', (1 - tramo(v, 0.05, 0.42)).toFixed(4))))
  }
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
  window.removeEventListener('scroll', pedirProgreso)
  cancelAnimationFrame(marcoProgreso)
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
    <header class="cristal sticky top-0 z-30 border-b">
      <div class="max-w-[1180px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <RouterLink :to="ruta('/')" class="text-xl" :aria-label="t('SINTONÍA, inicio', 'SINTONÍA, home')"><AppLogo /></RouterLink>
        <nav :aria-label="t('Secciones', 'Sections')" class="hidden lg:block">
          <ul class="flex items-center gap-1 text-sm">
            <li v-for="s in SECCIONES" :key="s.id">
              <a :href="`#${s.id}`" class="enlace-nav">{{ s.texto }}</a>
            </li>
          </ul>
        </nav>
        <div class="flex items-center gap-2">
          <SelectorIdioma class="hidden sm:inline-flex" />
          <RouterLink v-if="sesion.rol" :to="INICIO_ROL[sesion.rol]" class="btn-primary text-sm">{{ t('Ir a mi panel', 'My dashboard') }}</RouterLink>
          <RouterLink v-else to="/acceso" class="btn-secondary text-sm" :lang="idioma === 'en' ? 'es' : undefined">{{ t('Iniciar sesión', 'Sign in') }}</RouterLink>
          <a v-if="modoDemo && !sesion.rol" href="#entrar" class="btn-primary text-sm hidden sm:inline-flex">{{ t('Probar', 'Try it') }}</a>
          <button
            type="button"
            class="lg:hidden min-w-tactil min-h-tactil inline-flex items-center justify-center rounded-md text-surface-900 hover:bg-surface-100"
            :aria-expanded="menuAbierto"
            aria-controls="menu-secciones"
            @click="menuAbierto = !menuAbierto"
          >
            <AppIcon :name="menuAbierto ? 'close' : 'menu'" :size="22" :etiqueta="menuAbierto ? t('Cerrar las secciones', 'Close sections') : t('Abrir las secciones', 'Open sections')" />
          </button>
        </div>
      </div>
      <nav v-show="menuAbierto" id="menu-secciones" :aria-label="t('Secciones', 'Sections')" class="lg:hidden border-t border-surface-200">
        <ul class="max-w-[1180px] mx-auto px-4 py-2 grid grid-cols-2 gap-1 text-sm">
          <li v-for="s in SECCIONES" :key="s.id">
            <a :href="`#${s.id}`" class="px-2 min-h-tactil flex items-center rounded-md text-surface-900 hover:bg-surface-100" @click="menuAbierto = false">{{ s.texto }}</a>
          </li>
        </ul>
      </nav>
      <div class="absolute inset-x-0 -bottom-px h-0.5 overflow-hidden" aria-hidden="true">
        <div ref="progreso" class="h-full origin-left bg-brand-500" :style="estilo({ transform: 'scaleX(0)' })" />
      </div>
    </header>

    <main id="contenido" tabindex="-1" class="outline-none flex-1">
      <p v-if="route.query.borrado" class="aviso-exito max-w-[900px] mx-4 sm:mx-auto mt-6" role="status">
        {{ t('Hemos borrado tu cuenta y todos tus datos. Gracias por haber participado.', 'We have deleted your account and all your data. Thank you for taking part.') }}
      </p>

      <!-- 1. Inicio: titular centrado y, debajo, el producto en 3D que se endereza al deslizar -->
      <section class="relative overflow-hidden" aria-labelledby="t-inicio">
        <div class="fondo-luz absolute inset-0 -z-0" aria-hidden="true" />
        <CampoSintonia />
        <div class="relative z-10 max-w-[1180px] mx-auto px-4 sm:px-6 pt-16 sm:pt-24 text-center">
          <div class="entrada">
            <p class="cristal inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium text-surface-900">
              <span class="h-2 w-2 rounded-full bg-brand-500" aria-hidden="true" />{{ t('Tutoría de TFM, TFG y tesis', 'Supervision of Master\'s theses, final projects and PhDs') }}
            </p>
            <h1 id="t-inicio" class="titular-xl mt-7 mx-auto max-w-5xl text-surface-900">
              {{ t('Acompañar el trabajo académico,', 'Supporting academic work,') }}
              <span class="texto-degradado">{{ t('sin vigilar', 'without surveillance') }}</span>
            </h1>
            <p class="entradilla mt-7 mx-auto max-w-2xl">
              {{ t('Un registro semanal muy breve de estudiante y tutor/a para que las tutorías empiecen por lo que importa.', 'A very short weekly check-in for student and supervisor, so that supervision meetings start with what matters.') }}
            </p>
            <!-- Una sola llamada a la acción: un botón; lo demás, enlaces de texto. -->
            <div class="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
              <a v-if="modoDemo" href="#entrar" class="btn-primary px-7 py-3 text-lg">{{ t('Entrar en la demostración', 'Enter the demo') }}</a>
              <RouterLink v-else to="/registro" class="btn-primary px-7 py-3 text-lg">{{ t('Tengo un código', 'I have a code') }}</RouterLink>
              <a v-if="modoDemo" href="#como-funciona" class="enlace-flecha">{{ t('Ver cómo funciona', 'See how it works') }} <span aria-hidden="true">›</span></a>
              <RouterLink v-else-if="hayDemostracion" to="/demo" class="enlace-flecha">{{ t('Ver la demostración', 'See the demo') }} <span aria-hidden="true">›</span></RouterLink>
              <a v-else href="#demostracion" class="enlace-flecha">{{ t('Ver la demostración', 'See the demo') }} <span aria-hidden="true">›</span></a>
            </div>
            <ul class="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[0.95rem]">
              <li class="flex items-center gap-2"><AppIcon name="clock" :size="18" class="shrink-0 text-brand-900" /><span class="text-surface-900 font-medium">{{ t('Unos 60 segundos a la semana', 'About 60 seconds a week') }}</span></li>
              <li class="flex items-center gap-2"><AppIcon name="shield" :size="18" class="shrink-0 text-brand-900" /><span class="text-surface-900 font-medium">{{ t('Sin notas, sin rankings', 'No marks, no rankings') }}</span></li>
              <li class="flex items-center gap-2"><AppIcon name="lock" :size="18" class="shrink-0 text-brand-900" /><span class="text-surface-900 font-medium">{{ t('Tu bienestar solo lo ves tú', 'Only you see your wellbeing') }}</span></li>
            </ul>
          </div>
          <div ref="escenaProducto" class="escena-3d mt-14 sm:mt-20 pb-16 sm:pb-24">
            <div ref="objetoProducto" class="objeto-3d baldosa cristal border mx-auto max-w-[980px] p-4 sm:p-8 text-left" :style="estilo({ '--giro': sinMovimiento() ? '0' : '1' })">
              <RecorridoProducto />
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Para quién es: una franja, justo debajo del inicio -->
      <section id="para-quien" class="scroll-mt-20 bg-papel" aria-labelledby="t-para">
        <div class="max-w-[1180px] mx-auto px-4 sm:px-6 py-16 sm:py-20 grid gap-8 lg:grid-cols-12 lg:items-start">
          <h2 id="t-para" class="lg:col-span-3 titular-m text-surface-900">{{ t('Para quién es', 'Who it is for') }}</h2>
          <ul class="lg:col-span-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <li v-for="(p, i) in PARA_QUIEN" :key="p.titulo" v-revelar="i" class="baldosa-suave p-5 flex gap-3 lg:block">
              <span class="h-11 w-11 shrink-0 rounded-2xl bg-papel text-brand-900 flex items-center justify-center shadow-soft"><AppIcon :name="ICONOS_PARA_QUIEN[i]" :size="20" /></span>
              <div class="lg:mt-3">
                <h3 class="font-semibold text-surface-900">{{ p.titulo }}</h3>
                <p class="mt-1 text-sm leading-relaxed texto-suave">{{ p.texto }}</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- 3. Probarla por dentro (solo en la demostración) -->
      <section v-if="modoDemo" id="entrar" class="scroll-mt-24 max-w-[1180px] mx-auto px-4 sm:px-6 pt-14 sm:pt-16" aria-label="Entrar en la demostración" :lang="idioma === 'en' ? 'es' : undefined">
        <AccesosDemo ancho />
      </section>

      <!-- 4. El problema -->
      <section id="problema" class="scroll-mt-20 max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28" aria-labelledby="t-problema">
        <div class="grid gap-12 lg:grid-cols-12">
          <div v-revelar class="lg:col-span-6">
            <p class="etiqueta-seccion">{{ t('Por qué', 'Why') }}</p>
            <h2 id="t-problema" class="titular-l mt-2 text-surface-900">{{ t('El problema', 'The problem') }}</h2>
            <FraseLuz
              class="mt-8 font-display text-[1.65rem] sm:text-[2.15rem] leading-[1.22] tracking-[-0.02em] font-semibold text-surface-900"
              :texto="t('Estudiante y tutor/a no siempre ven igual el mismo trabajo. En un estudio sobre la tutorización del TFM, el profesorado valoró la tutorización mejor que el alumnado (Colomo Magaña et al., 2025).', 'Student and supervisor do not always see the same work in the same way. In a study on Master\'s thesis supervision, teaching staff rated supervision more highly than students did (Colomo Magaña et al., 2025).')"
            />
          </div>
          <div class="lg:col-span-5 lg:col-start-8 lg:pt-14">
            <div ref="ondasProblema" v-revelar="1" v-cursor class="baldosa p-6 sm:p-8" aria-hidden="true">
              <OndasSintonia :desfase="0.7" :alto="80" :grosor="3" />
              <div class="mt-3 flex justify-between text-xs font-medium text-surface-800">
                <span class="inline-flex items-center gap-1.5"><span class="h-1 w-4 rounded-full bg-brand-500" />{{ t('Una mirada', 'One perspective') }}</span>
                <span class="inline-flex items-center gap-1.5"><span class="h-1 w-4 rounded-full bg-surface-900" />{{ t('Otra mirada', 'Another perspective') }}</span>
              </div>
            </div>
            <div v-revelar="2" class="mt-8 space-y-5 text-lg leading-relaxed">
              <p>
                {{ t('Y esa relación importa: cómo percibe el estudiante la relación con su tutor/a se ha relacionado con la nota final, con lo que cree que el tutor/a aporta a su aprendizaje y con su satisfacción (de Kleijn et al., 2012).', "And that relationship matters: how students perceive their relationship with their supervisor has been related to their final grade, to what they believe the supervisor contributes to their learning and to their satisfaction (de Kleijn et al., 2012).") }}
              </p>
              <p>
                {{ t('¿Llega a todo el mundo por igual la información sobre el doctorado? SINTONÍA se pregunta si acercarla a través de la tutoría ayuda a quien termina el máster.', "Does information about doing a PhD reach everyone equally? SINTONÍA asks whether bringing it closer through supervision helps those finishing their Master's.") }}
              </p>
              <p><RouterLink :to="ruta('/investigacion')" class="enlace">{{ t('Cómo lo vamos a estudiar y referencias', 'How we will study it, and references') }}</RouterLink></p>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. Cómo funciona: tres pasos ilustrados -->
      <section id="como-funciona" class="scroll-mt-20 bg-papel" aria-labelledby="t-como">
        <div class="max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <CabeceraSeccion id="t-como" :etiqueta="t('Paso a paso', 'Step by step')" :titulo="t('Cómo funciona', 'How it works')">
            {{ t('Tres pasos cada semana. Nadie sube su trabajo y nadie pone notas.', 'Three steps every week. Nobody uploads their work and nobody gives marks.') }}
          </CabeceraSeccion>
          <ol class="grid gap-5 lg:grid-cols-3">
            <li
              v-for="(p, i) in PASOS"
              :key="p.titulo"
              v-revelar="i"
              v-cursor="'inclinar'"
              class="baldosa-suave p-6 sm:p-8 flex flex-col"
              :class="i === 0 ? 'lg:col-span-2' : i === 2 ? 'lg:col-span-3 lg:grid lg:grid-cols-2 lg:gap-x-12 lg:content-center' : ''"
            >
              <IlustracionPaso :paso="(i + 1) as 1 | 2 | 3" :class="i === 2 ? 'lg:row-span-5 lg:self-center' : ''" />
              <p class="mt-6 font-display text-sm font-semibold tabular-nums text-brand-900" aria-hidden="true">{{ t('Paso', 'Step') }} {{ i + 1 }}</p>
              <h3 class="mt-1 titular-m !text-[1.75rem] text-surface-900 flex items-center gap-2">
                <AppIcon :name="p.icono" :size="22" class="text-brand-900" />{{ p.titulo }}
              </h3>
              <p class="mt-3 text-lg leading-relaxed">{{ p.texto }}</p>
              <p class="mt-3 text-sm leading-relaxed texto-suave">{{ p.detalle }}</p>
            </li>
          </ol>
        </div>
      </section>

      <!-- 6. Pruébalo: la demostración interactiva y las cifras, sobre azul marino -->
      <section ref="banda" class="banda-profunda relative overflow-hidden text-white" aria-labelledby="t-pruebalo">
        <div class="pointer-events-none absolute -inset-x-40 bottom-10 opacity-25" aria-hidden="true">
          <div ref="ondasBanda" class="will-change-transform"><OndasSintonia :desfase="0.6" :alto="160" :grosor="2" sobre-oscuro /></div>
        </div>
        <div class="relative max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28 grid gap-14 lg:grid-cols-12 lg:items-center">
          <div v-revelar class="lg:col-span-5">
            <p class="etiqueta-seccion !text-brand-400">{{ t('Pruébalo', 'Try it') }}</p>
            <h2 id="t-pruebalo" class="titular-l mt-2">{{ t('Dos miradas, un minuto', 'Two perspectives, one minute') }}</h2>
            <p class="mt-5 text-lg leading-relaxed text-white/85">
              {{ t('Mueve cómo ven el avance estudiante y tutor/a. Si la diferencia es de 2 puntos o más, aparecen las tres preguntas para la tutoría.', 'Move how student and supervisor see the progress. If the difference is 2 points or more, the three questions for the meeting appear.') }}
            </p>
            <RouterLink to="/demo/recorrido" :hreflang="idioma === 'en' ? 'es' : undefined" class="mt-6 inline-flex items-center gap-2 min-h-tactil font-semibold text-white underline decoration-brand-400 decoration-2 underline-offset-4 hover:decoration-white">
              {{ t('Haz el recorrido guiado, en unos 60 segundos', 'Take the guided tour, in about 60 seconds (in Spanish)') }} <span aria-hidden="true">→</span>
            </RouterLink>
            <div :aria-label="t('SINTONÍA en cifras', 'SINTONÍA in figures')" role="group" class="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/20 pt-8">
              <CifraAnimada v-for="d in DATOS_CLAVE" :key="d.texto" :valor="Number(d.cifra)" :unidad="d.unidad" :texto="d.texto" />
            </div>
          </div>
          <div v-revelar="1" v-cursor class="lg:col-span-6 lg:col-start-7 text-surface-900 rounded-[var(--radius-xl)] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6)]">
            <DemoSintonia />
          </div>
        </div>
      </section>

      <!-- 6b. Calculadora de tiempo -->
      <section id="tiempo" class="scroll-mt-20 bg-papel" aria-labelledby="t-tiempo">
        <div class="max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28 grid gap-12 lg:grid-cols-12 lg:items-center">
          <div v-revelar class="lg:col-span-5">
            <p class="etiqueta-seccion">{{ t('Tiempo', 'Time') }}</p>
            <h2 id="t-tiempo" class="titular-l mt-2 text-surface-900">{{ t('¿Cuánto tiempo pide a un máster?', 'How much time does it take a programme?') }}</h2>
            <p class="mt-6 text-lg leading-relaxed">{{ t('Escribe cuántos estudiantes y tutores tiene el máster y mira los minutos de todos, cada semana.', 'Enter how many students and supervisors the programme has and see everyone\'s minutes, each week.') }}</p>
          </div>
          <div v-revelar="1" class="lg:col-span-6 lg:col-start-7"><CalculadoraTiempo /></div>
        </div>
      </section>

      <!-- 7. Privacidad y ética -->
      <section id="privacidad" class="scroll-mt-20 max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28" aria-labelledby="t-privacidad">
        <div class="grid gap-12 lg:grid-cols-12">
          <div v-revelar class="lg:col-span-6">
            <p class="etiqueta-seccion">{{ t('Tus datos', 'Your data') }}</p>
            <h2 id="t-privacidad" class="titular-l mt-2 text-surface-900">{{ t('Privacidad y ética', 'Privacy and ethics') }}</h2>
            <p class="mt-8 font-display font-semibold text-3xl sm:text-[2.6rem] leading-[1.1] tracking-[-0.03em] text-surface-900 text-balance">
              {{ t('Tu bienestar solo lo ves tú.', 'Only you see your wellbeing.') }} <span class="texto-degradado">{{ t('La dirección, solo cifras de 5 personas o más.', 'Programme directors only see figures for 5 people or more.') }}</span>
            </p>
            <ul class="mt-8 space-y-4 text-lg leading-relaxed">
              <li class="flex gap-3"><AppIcon name="lock" :size="22" class="mt-1 shrink-0 text-brand-900" />{{ t('Tu tutor/a no ve tus respuestas ni tu bienestar.', 'Your supervisor does not see your answers or your wellbeing.') }}</li>
              <li class="flex gap-3"><AppIcon name="shield" :size="22" class="mt-1 shrink-0 text-brand-900" />{{ t('Las reglas de quién ve qué están escritas en la propia base de datos.', 'The rules on who sees what are written into the database itself.') }}</li>
              <li class="flex gap-3"><AppIcon name="brain" :size="22" class="mt-1 shrink-0 text-brand-900" />{{ t('No deduce emociones, no pone notas y no hace rankings.', 'It does not infer emotions, give marks or make rankings.') }}</li>
            </ul>
            <RouterLink :to="ruta('/como-funciona')" class="enlace mt-9 inline-flex items-center min-h-tactil">{{ t('Ver quién ve cada dato', 'See who sees each piece of data') }}</RouterLink>
          </div>
          <div class="lg:col-span-5 lg:col-start-8 lg:pt-14">
            <div v-revelar="1" v-cursor class="rounded-[var(--radius-xl)]"><QuienVeBienestar /></div>
            <p class="mt-6 texto-suave leading-relaxed">
              {{ t('Las tecnologías no son neutrales: sus decisiones de diseño también deciden quién puede hacer qué (Winner, 1980). Y el uso de datos de estudiantes plantea dilemas éticos (Slade y Prinsloo, 2013). SINTONÍA los aborda en el propio diseño: cada dato tiene un destino definido.', 'Technologies are not neutral: their design decisions also decide who can do what (Winner, 1980). And the use of student data raises ethical dilemmas (Slade and Prinsloo, 2013). SINTONÍA addresses them in the design itself: every piece of data has a defined destination.') }}
            </p>
          </div>
        </div>
      </section>

      <!-- 7b. Comparativa honesta -->
      <section id="comparativa" class="scroll-mt-20 max-w-[1180px] mx-auto px-4 sm:px-6 pb-20 sm:pb-28" aria-labelledby="t-comparativa">
        <CabeceraSeccion id="t-comparativa" :etiqueta="t('Comparación', 'Comparison')" :titulo="t('Entre no saber nada y vigilarlo todo', 'Between knowing nothing and watching everything')">
          {{ t('Tres formas de acompañar un trabajo académico, comparadas con honestidad. Sin marcas.', 'Three ways of supporting academic work, compared honestly. No brands.') }}
        </CabeceraSeccion>
        <div v-revelar><ComparativaHonesta /></div>
      </section>

      <!-- 8. Para cada perfil: las tres personas, una junto a otra -->
      <section id="perfiles" class="scroll-mt-20 bg-papel overflow-hidden" aria-labelledby="t-perfiles">
        <div class="py-20 sm:py-28">
          <div class="max-w-[1180px] mx-auto px-4 sm:px-6">
          <CabeceraSeccion id="t-perfiles" :etiqueta="t('Quién hace qué', 'Who does what')" :titulo="t('Para cada perfil', 'For each profile')">
            {{ t('Qué hace cada persona, cuánto tiempo le lleva, qué ve y qué no ve.', 'What each person does, how long it takes them, what they see and what they do not.') }}
          </CabeceraSeccion>
          </div>
          <TarjetasPerfiles />
        </div>
      </section>

      <!-- 9. Puente al doctorado: un recorrido de tres tramos -->
      <section id="puente" class="scroll-mt-20 max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28" aria-labelledby="t-puente">
        <div class="grid gap-12 lg:grid-cols-12">
          <div v-revelar class="lg:col-span-5">
            <p class="etiqueta-seccion">{{ t('Doctorado', 'PhD') }}</p>
            <h2 id="t-puente" class="titular-l mt-2 text-surface-900">{{ t('Puente al doctorado', 'Bridge to the PhD') }}</h2>
            <p class="mt-6 text-lg leading-relaxed">
              {{ t('Si el estudiante lo activa, los plazos de las convocatorias predoctorales y de admisión al doctorado llegan a la tutoría.', 'If the student turns it on, the deadlines of predoctoral and PhD admission calls reach the supervision meeting.') }}
            </p>
          </div>
          <ol ref="puenteLista" class="lg:col-span-6 lg:col-start-7 relative">
            <!-- La línea: un carril gris y su relleno, que se dibuja con el scroll -->
            <span class="absolute left-6 top-6 bottom-6 w-0.5 -translate-x-1/2 bg-surface-200" aria-hidden="true" />
            <span ref="puenteRelleno" class="absolute left-6 top-6 bottom-6 w-0.5 -translate-x-1/2 origin-top bg-brand-800" :style="{ transform: `scaleY(${puenteActivo === PUENTE_LARGO ? 1 : 0})` }" aria-hidden="true" />
            <li v-for="(p, i) in PUENTE" :key="p.titulo" class="relative grid grid-cols-[3rem_1fr] gap-x-5 pb-10 last:pb-0">
              <span
                class="paso-puente relative z-10 h-12 w-12 rounded-full flex items-center justify-center font-display text-lg font-semibold"
                :class="i < puenteActivo ? 'bg-brand-800 text-white encendido' : 'bg-papel text-surface-900 ring-2 ring-surface-200'"
                aria-hidden="true"
              >{{ i + 1 }}</span>
              <div class="pt-2.5">
                <h3 class="font-display text-xl font-semibold text-surface-900">{{ p.titulo }}</h3>
                <p class="mt-2 leading-relaxed">{{ p.texto }}</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <!-- 10. Dirección: dos tarjetas idénticas -->
      <section id="direccion" class="scroll-mt-20 bg-papel" aria-labelledby="t-direccion">
        <div class="max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <CabeceraSeccion id="t-direccion" :etiqueta="t('Equipo', 'Team')" :titulo="t('Dirección', 'Supervision')" />
          <ul class="grid gap-6 md:grid-cols-2 auto-rows-fr">
            <li v-for="(m, i) in DIRECCION" :key="m.nombre" v-revelar="i" v-cursor="'inclinar'" class="rounded-[var(--radius-xl)]"><TarjetaDireccion :miembro="m" /></li>
          </ul>
          <div v-revelar class="mt-10 pt-8 border-t border-surface-200 space-y-1">
            <p class="text-base text-surface-900">{{ AUTOR }}</p>
            <p class="text-base texto-suave">{{ t('Antecedente', 'Background') }}: {{ ANTECEDENTE }}</p>
          </div>
        </div>
      </section>

      <!-- 11. Preguntas frecuentes -->
      <section id="preguntas" class="scroll-mt-20 max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28" aria-labelledby="t-preguntas">
        <div class="grid gap-10 lg:grid-cols-12">
          <div v-revelar class="lg:col-span-4 lg:sticky lg:top-28 self-start">
            <p class="etiqueta-seccion">{{ t('Dudas', 'Questions') }}</p>
            <h2 id="t-preguntas" class="titular-l mt-2 text-surface-900">{{ t('Preguntas frecuentes', 'Frequently asked questions') }}</h2>
            <p class="mt-4 texto-suave">{{ t('Y si no está aquí,', 'And if it is not here,') }} <a href="#contacto" class="enlace">{{ t('escríbenos', 'write to us') }}</a>.</p>
          </div>
          <div v-revelar="1" class="lg:col-span-7 lg:col-start-6"><PreguntasFrecuentes /></div>
        </div>
      </section>

      <!-- 12. Contacto -->
      <section id="contacto" class="scroll-mt-20 bg-papel" aria-labelledby="t-contacto">
        <div class="max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28 grid gap-10 lg:grid-cols-12">
          <div v-revelar class="lg:col-span-4">
            <p class="etiqueta-seccion">{{ t('Escríbenos', 'Write to us') }}</p>
            <h2 id="t-contacto" class="titular-l mt-2 text-surface-900">{{ t('Contacto', 'Contact') }}</h2>
            <p class="mt-4 text-lg leading-relaxed">{{ t('Si te interesa SINTONÍA para tu máster, programa o escuela de doctorado, o tienes cualquier duda.', 'If you are interested in SINTONÍA for your Master\'s programme, PhD programme or doctoral school, or have any questions.') }}</p>
            <p class="mt-4"><RouterLink :to="ruta('/instituciones')" class="enlace">{{ t('Información para instituciones y solicitud de demostración', 'Information for institutions and demo requests') }}</RouterLink></p>
          </div>
          <div v-revelar="1" class="lg:col-span-7 lg:col-start-6"><FormularioContacto /></div>
        </div>
      </section>

      <!-- Cierre: las dos ondas, por fin, en sintonía -->
      <section ref="cierre" aria-labelledby="t-cierre">
        <div class="max-w-[1180px] mx-auto px-4 sm:px-6 pt-28 pb-20 sm:pt-36 sm:pb-28 text-center">
          <div ref="ondasCierre" class="max-w-2xl mx-auto" :style="estilo({ '--ondas-duracion': '1100ms' })"><OndasSintonia :desfase="cierreVisto ? 0 : 1" :alto="80" /></div>
          <div class="mt-8 titular-xl text-surface-900">
            <TituloEnSintonia id="t-cierre" :texto="t('En sintonía.', 'In tune.')" />
          </div>
          <p class="entradilla mt-5 max-w-xl mx-auto">{{ t('Acompañar el trabajo académico, sin vigilar.', 'Supporting academic work, without surveillance.') }}</p>
          <div class="mt-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 justify-center">
            <a v-if="modoDemo" href="#entrar" class="btn-primary px-6 py-3">{{ t('Entrar en la demostración', 'Enter the demo') }}</a>
            <RouterLink v-else to="/registro" class="btn-primary px-7 py-3 text-lg">{{ t('Tengo un código', 'I have a code') }}</RouterLink>
            <RouterLink :to="ruta('/investigacion')" class="enlace-flecha">{{ t('Leer la investigación', 'Read about the research') }} <span aria-hidden="true">›</span></RouterLink>
          </div>
        </div>
      </section>

      <!-- Referencias citadas en esta página -->
      <section class="max-w-[1180px] mx-auto px-4 sm:px-6 pb-12" aria-labelledby="t-refs">
        <div class="border-t border-surface-200 pt-8">
          <h2 id="t-refs" class="font-display text-base font-semibold text-surface-900 mb-3">{{ t('Referencias citadas', 'References cited') }}</h2>
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
  box-shadow: 0 0 0 6px rgba(52, 198, 163, 0.18);
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

.enlace-nav {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 0.65rem;
  border-radius: var(--radius-md);
  white-space: nowrap;
  color: rgb(var(--rgb-s800));
  transition: background-color var(--dur-micro) ease, color var(--dur-micro) ease;
}
.enlace-nav:hover {
  background-color: rgb(var(--rgb-s100));
  color: rgb(var(--rgb-s900));
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
