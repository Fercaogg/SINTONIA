<script setup lang="ts">
// Portada (rediseño del 14/11/2026, DISENO.md apartado 12).
// Orden por importancia: qué es y probarlo; para quién; por qué; cómo
// funciona; las cifras con la demostración; privacidad; cada perfil;
// Puente; quién lo dirige; dudas y contacto. Retícula de 12 columnas y
// todos los apartados empiezan con la misma cabecera (CabeceraSeccion).
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { alAvanzar, desfasarOndas, sinMovimiento, vCursor, vRevelar } from '@/lib/efectos'
import { RouterLink, useRoute } from 'vue-router'
import { useSesion } from '@/stores/sesion'
import { INICIO_ROL } from '@/lib/tipos'
import { modoDemo } from '@/lib/supabase'
import { useVisibleUnaVez } from '@/lib/movimiento'
import { hayDemostracion } from '@/lib/demo'
import { ANTECEDENTE, AUTOR, DATOS_CLAVE, DIRECCION, PARA_QUIEN, PASOS, REFERENCIAS } from '@/contenido/portada'
import AppLogo from '@/components/comun/AppLogo.vue'
import AppIcon from '@/components/comun/AppIcon.vue'
import BandaEntorno from '@/components/comun/BandaEntorno.vue'
import AccesosDemo from '@/components/comun/AccesosDemo.vue'
import PiePublico from '@/components/layout/PiePublico.vue'
import CabeceraSeccion from '@/components/portada/CabeceraSeccion.vue'
import RecorridoProducto from '@/components/portada/RecorridoProducto.vue'
import IlustracionPaso from '@/components/portada/IlustracionPaso.vue'
import DemoSintonia from '@/components/portada/DemoSintonia.vue'
import CifraAnimada from '@/components/portada/CifraAnimada.vue'
import QuienVeBienestar from '@/components/portada/QuienVeBienestar.vue'
import TarjetasPerfiles from '@/components/portada/TarjetasPerfiles.vue'
import OndasSintonia from '@/components/portada/OndasSintonia.vue'
import TituloEnSintonia from '@/components/portada/TituloEnSintonia.vue'
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

const SECCIONES = [
  { id: 'como-funciona', texto: 'Cómo funciona' },
  { id: 'privacidad', texto: 'Privacidad' },
  { id: 'perfiles', texto: 'Perfiles' },
  { id: 'puente', texto: 'Puente' },
  { id: 'direccion', texto: 'Dirección' },
  { id: 'preguntas', texto: 'Preguntas' },
  { id: 'contacto', texto: 'Contacto' },
]

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

const PUENTE = [
  { titulo: 'Lo activas tú', texto: 'El estudiante activa Puente en su panel cuando quiere, y lo desactiva igual de fácil.' },
  { titulo: 'Se acerca un plazo', texto: 'Cuando una convocatoria predoctoral o de admisión abre o cierra pronto, SINTONÍA lo tiene en cuenta.' },
  { titulo: 'Se habla en la tutoría', texto: 'La agenda incluye una línea para comentarlo. Es una conversación, no un aviso automático.' },
]
// Estilos en línea siempre aplicados desde código (la CSP no admite atributos style).
const retraso = (ms: number) => ({ animationDelay: `${ms}ms` })
const estilo = (e: Record<string, string>) => e
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <BandaEntorno />
    <header class="sticky top-0 z-30 bg-surface-50/95 backdrop-blur-md border-b border-surface-200">
      <div class="max-w-[1180px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <RouterLink to="/" class="text-xl" aria-label="SINTONÍA, inicio"><AppLogo /></RouterLink>
        <nav aria-label="Secciones" class="hidden lg:block">
          <ul class="flex items-center gap-1 text-sm">
            <li v-for="s in SECCIONES" :key="s.id">
              <a :href="`#${s.id}`" class="enlace-nav">{{ s.texto }}</a>
            </li>
          </ul>
        </nav>
        <div class="flex items-center gap-2">
          <RouterLink v-if="sesion.rol" :to="INICIO_ROL[sesion.rol]" class="btn-primary text-sm">Ir a mi panel</RouterLink>
          <RouterLink v-else to="/acceso" class="btn-secondary text-sm">Iniciar sesión</RouterLink>
          <a v-if="modoDemo && !sesion.rol" href="#entrar" class="btn-primary text-sm hidden sm:inline-flex">Probar</a>
          <button
            type="button"
            class="lg:hidden min-w-tactil min-h-tactil inline-flex items-center justify-center rounded-md text-surface-900 hover:bg-surface-100"
            :aria-expanded="menuAbierto"
            aria-controls="menu-secciones"
            @click="menuAbierto = !menuAbierto"
          >
            <AppIcon :name="menuAbierto ? 'close' : 'menu'" :size="22" :etiqueta="menuAbierto ? 'Cerrar las secciones' : 'Abrir las secciones'" />
          </button>
        </div>
      </div>
      <nav v-show="menuAbierto" id="menu-secciones" aria-label="Secciones" class="lg:hidden border-t border-surface-200 bg-surface-50">
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

    <main id="contenido" class="flex-1">
      <p v-if="route.query.borrado" class="aviso-exito max-w-[900px] mx-4 sm:mx-auto mt-6" role="status">
        Hemos borrado tu cuenta y todos tus datos. Gracias por haber participado.
      </p>

      <!-- 1. Inicio: qué es, para qué y cómo probarlo; a la derecha, el producto -->
      <section class="relative overflow-hidden" aria-labelledby="t-inicio">
        <CampoSintonia />
        <div class="relative z-10 max-w-[1180px] mx-auto px-4 sm:px-6 pt-14 pb-16 sm:pt-20 sm:pb-24 grid gap-14 lg:grid-cols-12 lg:items-center">
          <div class="entrada lg:col-span-6">
            <p class="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-papel/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-900">
              <span class="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />Tutoría de TFM, TFG y tesis
            </p>
            <h1 id="t-inicio" class="mt-6 font-display text-[2.6rem] leading-[1.04] sm:text-6xl lg:text-[3.6rem] xl:text-[4rem] font-bold tracking-tight text-surface-900 text-balance">
              Acompañar el trabajo académico,
              <span class="text-brand-900">sin vigilar</span>
            </h1>
            <p class="mt-6 text-lg sm:text-xl leading-relaxed texto-suave max-w-xl">
              Un registro semanal muy breve de estudiante y tutor/a para que las tutorías empiecen por lo que importa.
            </p>
            <div class="mt-9 flex flex-col sm:flex-row gap-3">
              <a v-if="modoDemo" href="#entrar" class="btn-primary px-6 py-3">Entrar en la demostración</a>
              <RouterLink v-else to="/registro" class="btn-primary px-6 py-3">Tengo un código</RouterLink>
              <a v-if="modoDemo" href="#como-funciona" class="btn-secondary px-6 py-3">Ver cómo funciona</a>
              <RouterLink v-else-if="hayDemostracion" to="/demo" class="btn-secondary px-6 py-3">Ver la demostración</RouterLink>
              <a v-else href="#demostracion" class="btn-secondary px-6 py-3">Ver la demostración</a>
            </div>
            <ul class="mt-10 grid gap-4 sm:grid-cols-3 border-t border-surface-200 pt-6 text-sm">
              <li class="flex items-start gap-2.5"><AppIcon name="clock" :size="18" class="mt-0.5 shrink-0 text-brand-900" /><span class="text-surface-900 font-medium">Unos 60 segundos a la semana</span></li>
              <li class="flex items-start gap-2.5"><AppIcon name="shield" :size="18" class="mt-0.5 shrink-0 text-brand-900" /><span class="text-surface-900 font-medium">Sin notas, sin rankings</span></li>
              <li class="flex items-start gap-2.5"><AppIcon name="lock" :size="18" class="mt-0.5 shrink-0 text-brand-900" /><span class="text-surface-900 font-medium">Tu bienestar solo lo ves tú</span></li>
            </ul>
          </div>
          <div class="lg:col-span-6 lg:col-start-7">
            <RecorridoProducto />
          </div>
        </div>
      </section>

      <!-- 2. Para quién es: una franja, justo debajo del inicio -->
      <section id="para-quien" class="scroll-mt-20 bg-papel border-y border-surface-200" aria-labelledby="t-para">
        <div class="max-w-[1180px] mx-auto px-4 sm:px-6 py-10 sm:py-12 grid gap-8 lg:grid-cols-12 lg:items-start">
          <h2 id="t-para" class="lg:col-span-3 font-display text-2xl font-semibold tracking-tight text-surface-900">Para quién es</h2>
          <ul class="lg:col-span-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <li v-for="(p, i) in PARA_QUIEN" :key="p.titulo" v-revelar="i" class="flex gap-3 lg:block">
              <span class="h-10 w-10 shrink-0 rounded-lg bg-brand-100 text-brand-900 flex items-center justify-center"><AppIcon :name="ICONOS_PARA_QUIEN[i]" :size="20" /></span>
              <div class="lg:mt-3">
                <h3 class="font-semibold text-surface-900">{{ p.titulo }}</h3>
                <p class="mt-1 text-sm leading-relaxed texto-suave">{{ p.texto }}</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- 3. Probarla por dentro (solo en la demostración) -->
      <section v-if="modoDemo" id="entrar" class="scroll-mt-24 max-w-[1180px] mx-auto px-4 sm:px-6 pt-14 sm:pt-16" aria-label="Entrar en la demostración">
        <AccesosDemo ancho />
      </section>

      <!-- 4. El problema -->
      <section id="problema" class="scroll-mt-20 max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28" aria-labelledby="t-problema">
        <div class="grid gap-12 lg:grid-cols-12">
          <div v-revelar class="lg:col-span-6">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-900">01 · Por qué</p>
            <h2 id="t-problema" class="mt-3 font-display text-4xl sm:text-5xl font-semibold tracking-tight text-surface-900">El problema</h2>
            <p class="mt-8 font-display text-2xl sm:text-[1.75rem] leading-snug text-surface-900">
              Estudiante y tutor/a no siempre ven igual el mismo trabajo. En un estudio sobre la tutorización del TFM, el profesorado valoró la
              tutorización mejor que el alumnado (Colomo Magaña et al., 2025).
            </p>
          </div>
          <div class="lg:col-span-5 lg:col-start-8 lg:pt-14">
            <div ref="ondasProblema" v-revelar="1" v-cursor class="card p-6" aria-hidden="true">
              <OndasSintonia :desfase="0.7" :alto="80" :grosor="3" />
              <div class="mt-3 flex justify-between text-xs font-medium text-surface-800">
                <span class="inline-flex items-center gap-1.5"><span class="h-1 w-4 rounded-full bg-brand-500" />Una mirada</span>
                <span class="inline-flex items-center gap-1.5"><span class="h-1 w-4 rounded-full bg-surface-900" />Otra mirada</span>
              </div>
            </div>
            <div v-revelar="2" class="mt-8 space-y-5 text-lg leading-relaxed">
              <p>
                Y esa relación importa: cómo percibe el estudiante la relación con su tutor/a se ha relacionado con la nota final, con lo que cree
                que el tutor/a aporta a su aprendizaje y con su satisfacción (de Kleijn et al., 2012).
              </p>
              <p>
                ¿Llega a todo el mundo por igual la información sobre el doctorado? SINTONÍA se pregunta si acercarla a través de la tutoría
                ayuda a quien termina el máster.
              </p>
              <p><RouterLink to="/investigacion" class="enlace">Cómo lo vamos a estudiar y referencias</RouterLink></p>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. Cómo funciona: tres pasos ilustrados -->
      <section id="como-funciona" class="scroll-mt-20 bg-papel border-y border-surface-200" aria-labelledby="t-como">
        <div class="max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <CabeceraSeccion id="t-como" etiqueta="02 · Paso a paso" titulo="Cómo funciona">
            Tres pasos cada semana. Nadie sube su trabajo y nadie pone notas.
          </CabeceraSeccion>
          <ol class="grid gap-6 lg:grid-cols-3">
            <li v-for="(p, i) in PASOS" :key="p.titulo" v-revelar="i" v-cursor="'inclinar'" class="rounded-2xl border border-surface-200 bg-surface-50 p-5 sm:p-6 flex flex-col">
              <IlustracionPaso :paso="(i + 1) as 1 | 2 | 3" />
              <p class="mt-6 font-display text-sm font-semibold tabular-nums text-brand-900" aria-hidden="true">Paso {{ i + 1 }}</p>
              <h3 class="mt-1 font-display text-2xl font-semibold text-surface-900 flex items-center gap-2">
                <AppIcon :name="p.icono" :size="22" class="text-brand-900" />{{ p.titulo }}
              </h3>
              <p class="mt-3 text-lg leading-relaxed">{{ p.texto }}</p>
              <p class="mt-3 text-sm leading-relaxed texto-suave">{{ p.detalle }}</p>
            </li>
          </ol>
        </div>
      </section>

      <!-- 6. Pruébalo: la demostración interactiva y las cifras, sobre azul marino -->
      <section ref="banda" class="relative overflow-hidden bg-marino text-white" aria-labelledby="t-pruebalo">
        <div class="pointer-events-none absolute -inset-x-40 bottom-10 opacity-25" aria-hidden="true">
          <div ref="ondasBanda" class="will-change-transform"><OndasSintonia :desfase="0.6" :alto="160" :grosor="2" sobre-oscuro /></div>
        </div>
        <div class="relative max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28 grid gap-14 lg:grid-cols-12 lg:items-center">
          <div v-revelar class="lg:col-span-5">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-400">03 · Pruébalo</p>
            <h2 id="t-pruebalo" class="mt-3 font-display text-4xl sm:text-5xl font-semibold tracking-tight">Dos miradas, un minuto</h2>
            <p class="mt-5 text-lg leading-relaxed text-white/85">
              Mueve cómo ven el avance estudiante y tutor/a. Si la diferencia es de 2 puntos o más, aparecen las tres preguntas para la tutoría.
            </p>
            <div aria-label="SINTONÍA en cifras" role="group" class="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/20 pt-8">
              <CifraAnimada v-for="d in DATOS_CLAVE" :key="d.texto" :valor="Number(d.cifra)" :unidad="d.unidad" :texto="d.texto" />
            </div>
          </div>
          <div v-revelar="1" v-cursor class="lg:col-span-6 lg:col-start-7 text-surface-900 rounded-[var(--radius-md)]">
            <DemoSintonia />
          </div>
        </div>
      </section>

      <!-- 7. Privacidad y ética -->
      <section id="privacidad" class="scroll-mt-20 max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28" aria-labelledby="t-privacidad">
        <div class="grid gap-12 lg:grid-cols-12">
          <div v-revelar class="lg:col-span-6">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-900">04 · Tus datos</p>
            <h2 id="t-privacidad" class="mt-3 font-display text-4xl sm:text-5xl font-semibold tracking-tight text-surface-900">Privacidad y ética</h2>
            <p class="mt-8 font-display text-3xl sm:text-4xl leading-tight text-surface-900 text-balance">
              Tu bienestar solo lo ves tú. <span class="text-brand-900">La dirección, solo cifras de 5 personas o más.</span>
            </p>
            <ul class="mt-8 space-y-4 text-lg leading-relaxed">
              <li class="flex gap-3"><AppIcon name="lock" :size="22" class="mt-1 shrink-0 text-brand-900" />Tu tutor/a no ve tus respuestas ni tu bienestar.</li>
              <li class="flex gap-3"><AppIcon name="shield" :size="22" class="mt-1 shrink-0 text-brand-900" />Las reglas de quién ve qué están escritas en la propia base de datos.</li>
              <li class="flex gap-3"><AppIcon name="brain" :size="22" class="mt-1 shrink-0 text-brand-900" />No deduce emociones, no pone notas y no hace rankings.</li>
            </ul>
            <RouterLink to="/como-funciona" class="btn-secondary mt-9">Ver quién ve cada dato</RouterLink>
          </div>
          <div class="lg:col-span-5 lg:col-start-8 lg:pt-14">
            <div v-revelar="1" v-cursor class="rounded-[var(--radius-md)]"><QuienVeBienestar /></div>
            <p class="mt-6 texto-suave leading-relaxed">
              Las tecnologías no son neutrales: sus decisiones de diseño también deciden quién puede hacer qué (Winner, 1980). Y el uso de datos de
              estudiantes plantea dilemas éticos (Slade y Prinsloo, 2013). SINTONÍA los aborda en el propio diseño: cada dato tiene un destino definido.
            </p>
          </div>
        </div>
      </section>

      <!-- 8. Para cada perfil: las tres personas, una junto a otra -->
      <section id="perfiles" class="scroll-mt-20 bg-papel border-y border-surface-200" aria-labelledby="t-perfiles">
        <div class="max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <CabeceraSeccion id="t-perfiles" etiqueta="05 · Quién hace qué" titulo="Para cada perfil">
            Qué hace cada persona, cuánto tiempo le lleva, qué ve y qué no ve.
          </CabeceraSeccion>
          <TarjetasPerfiles />
        </div>
      </section>

      <!-- 9. Puente al doctorado: un recorrido de tres tramos -->
      <section id="puente" class="scroll-mt-20 max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28" aria-labelledby="t-puente">
        <div class="grid gap-12 lg:grid-cols-12">
          <div v-revelar class="lg:col-span-5">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-900">06 · Doctorado</p>
            <h2 id="t-puente" class="mt-3 font-display text-4xl sm:text-5xl font-semibold tracking-tight text-surface-900">Puente al doctorado</h2>
            <p class="mt-6 text-lg leading-relaxed">
              Si el estudiante lo activa, los plazos de las convocatorias predoctorales y de admisión al doctorado llegan a la tutoría.
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
      <section id="direccion" class="scroll-mt-20 bg-papel border-y border-surface-200" aria-labelledby="t-direccion">
        <div class="max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <CabeceraSeccion id="t-direccion" etiqueta="07 · Equipo" titulo="Dirección" />
          <ul class="grid gap-6 md:grid-cols-2 auto-rows-fr">
            <li v-for="(m, i) in DIRECCION" :key="m.nombre" v-revelar="i" v-cursor="'inclinar'" class="rounded-[var(--radius-md)]"><TarjetaDireccion :miembro="m" /></li>
          </ul>
          <div v-revelar class="mt-10 pt-8 border-t border-surface-200 space-y-1">
            <p class="text-base text-surface-900">{{ AUTOR }}</p>
            <p class="text-base texto-suave">Antecedente: {{ ANTECEDENTE }}</p>
          </div>
        </div>
      </section>

      <!-- 11. Preguntas frecuentes -->
      <section id="preguntas" class="scroll-mt-20 max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28" aria-labelledby="t-preguntas">
        <div class="grid gap-10 lg:grid-cols-12">
          <div v-revelar class="lg:col-span-4 lg:sticky lg:top-28 self-start">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-900">08 · Dudas</p>
            <h2 id="t-preguntas" class="mt-3 font-display text-4xl sm:text-5xl font-semibold tracking-tight text-surface-900">Preguntas frecuentes</h2>
            <p class="mt-4 texto-suave">Y si no está aquí, <a href="#contacto" class="enlace">escríbenos</a>.</p>
          </div>
          <div v-revelar="1" class="lg:col-span-7 lg:col-start-6"><PreguntasFrecuentes /></div>
        </div>
      </section>

      <!-- 12. Contacto -->
      <section id="contacto" class="scroll-mt-20 bg-papel border-y border-surface-200" aria-labelledby="t-contacto">
        <div class="max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28 grid gap-10 lg:grid-cols-12">
          <div v-revelar class="lg:col-span-4">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-900">09 · Escríbenos</p>
            <h2 id="t-contacto" class="mt-3 font-display text-4xl sm:text-5xl font-semibold tracking-tight text-surface-900">Contacto</h2>
            <p class="mt-4 text-lg leading-relaxed">Si te interesa SINTONÍA para tu máster, programa o escuela de doctorado, o tienes cualquier duda.</p>
          </div>
          <div v-revelar="1" class="lg:col-span-7 lg:col-start-6"><FormularioContacto /></div>
        </div>
      </section>

      <!-- Cierre: las dos ondas, por fin, en sintonía -->
      <section ref="cierre" aria-labelledby="t-cierre">
        <div class="max-w-[1180px] mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
          <div ref="ondasCierre" class="max-w-2xl mx-auto" :style="estilo({ '--ondas-duracion': '1100ms' })"><OndasSintonia :desfase="cierreVisto ? 0 : 1" :alto="80" /></div>
          <div class="mt-8 font-display text-4xl sm:text-6xl font-bold tracking-tight text-surface-900">
            <TituloEnSintonia id="t-cierre" texto="En sintonía." />
          </div>
          <p class="mt-4 text-lg texto-suave max-w-xl mx-auto">Acompañar el trabajo académico, sin vigilar.</p>
          <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a v-if="modoDemo" href="#entrar" class="btn-primary px-6 py-3">Entrar en la demostración</a>
            <RouterLink v-else to="/registro" class="btn-primary px-6 py-3">Tengo un código</RouterLink>
            <RouterLink to="/investigacion" class="btn-secondary px-6 py-3">Leer la investigación</RouterLink>
          </div>
        </div>
      </section>

      <!-- Referencias citadas en esta página -->
      <section class="max-w-[1180px] mx-auto px-4 sm:px-6 pb-12" aria-labelledby="t-refs">
        <div class="border-t border-surface-200 pt-8">
          <h2 id="t-refs" class="font-display text-base font-semibold text-surface-900 mb-3">Referencias citadas</h2>
          <ul class="space-y-2 text-sm texto-suave max-w-4xl">
            <li v-for="r in CITADAS" :key="r.clave" class="pl-6 -indent-6">
              {{ r.texto }} <a v-if="r.enlace" :href="r.enlace" target="_blank" rel="noopener noreferrer" class="enlace break-all">{{ r.enlace }}<span class="sr-only"> (se abre en otra pestaña)</span></a>
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
@keyframes entrada {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .entrada {
    animation: none;
  }
}
</style>
