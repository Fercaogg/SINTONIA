<script setup lang="ts">
// "Perspective Tunnel Hero" (21st.dev), adaptado a SINTONÍA (Vue 3, sin React
// ni framer-motion). Tarjetas que vuelan por un pasillo 3D hacia quien mira,
// con el titular en el centro y la cámara que sigue al ratón.
//
// Cambios respecto al original (DECISIONES.md, 14/11/2026):
//   - El original captura la rueda del ratón y no deja bajar la página.
//     Aquí el avance sale del scroll normal de la página: el inicio se va
//     yendo hacia arriba mientras las tarjetas pasan (nada se bloquea; el
//     teclado, la barra y el dedo funcionan como siempre).
//   - En vez de fotos de archivo (que además la CSP no permite cargar de
//     otros dominios), cada tarjeta es un fragmento del propio producto.
//   - Colores de la marca (nada de índigo), textos en español y modo oscuro
//     con los tokens de la web.
//   - Muelles propios en requestAnimationFrame (como framer-motion), solo
//     transform y opacity; se para cuando todo está quieto.
//   - Con "reducir movimiento": tarjetas quietas a media distancia.
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from '@/components/comun/AppIcon.vue'
import OndasSintonia from '@/components/portada/OndasSintonia.vue'

type Tipo = 'checkin' | 'ondas' | 'agenda' | 'cifra' | 'privado' | 'puente' | 'sinNotas' | 'grupo' | 'sintonia'
const TARJETAS: { tipo: Tipo; titulo: string }[] = [
  { tipo: 'checkin', titulo: 'Registro semanal' },
  { tipo: 'ondas', titulo: 'Dos miradas' },
  { tipo: 'agenda', titulo: 'Agenda de la tutoría' },
  { tipo: 'cifra', titulo: 'Unos 60 segundos' },
  { tipo: 'privado', titulo: 'Solo lo ves tú' },
  { tipo: 'puente', titulo: 'Puente al doctorado' },
  { tipo: 'sinNotas', titulo: 'Sin notas ni rankings' },
  { tipo: 'grupo', titulo: '5 personas o más' },
  { tipo: 'sintonia', titulo: 'En sintonía' },
]

const OSCURAS: Tipo[] = ['ondas', 'cifra', 'puente', 'grupo']
// Estilos en línea aplicados desde código (la CSP no admite atributos style).
const estilo = (e: Record<string, string>) => e

// Colocación en espiral (ángulo áureo), como en el original.
const CARTAS = TARJETAS.map((t, i) => {
  const angulo = i * 137.5 * (Math.PI / 180)
  return {
    ...t,
    cos: Math.cos(angulo),
    sin: Math.sin(angulo),
    radioX: 0.28 + (i % 3) * 0.08,
    radioY: 0.26 + (i % 2) * 0.09,
    giro: (i % 2 === 0 ? 1 : -1) * (3 + (i % 5) * 2),
    oscura: OSCURAS.includes(t.tipo),
  }
})

const raiz = ref<HTMLElement | null>(null)
const escenario = ref<HTMLElement | null>(null)
const titular = ref<HTMLElement | null>(null)
const aviso = ref<HTMLElement | null>(null)
const cartas = ref<HTMLElement[]>([])

const limitar = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
// Interpolación por tramos, como useTransform.
function mapa(v: number, entrada: number[], salida: number[]) {
  if (v <= entrada[0]) return salida[0]
  for (let i = 1; i < entrada.length; i++) {
    if (v <= entrada[i]) {
      const t = (v - entrada[i - 1]) / (entrada[i] - entrada[i - 1])
      return salida[i - 1] + (salida[i] - salida[i - 1]) * t
    }
  }
  return salida[salida.length - 1]
}

let ancho = 1440
let alto = 900
let movil = false
let avance = 0 // suavizado
let objetivo = 0
let ratonX = 0
let ratonY = 0
let objRatonX = 0
let objRatonY = 0
let marco = 0
const quieto = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function medir() {
  ancho = window.innerWidth
  alto = window.innerHeight
  movil = ancho < 768
  const w = movil ? limitar(ancho * 0.38, 130, 180) : limitar(ancho * 0.16, 170, 250)
  cartas.value.forEach((el) => (el.style.width = `${w}px`))
  if (escenario.value) escenario.value.style.perspective = movil ? '900px' : '1200px'
}

function leerScroll() {
  const el = raiz.value
  if (!el) return
  // 0 arriba del todo; 1 cuando el inicio ha subido casi entero.
  objetivo = limitar(window.scrollY / Math.max(1, el.offsetHeight * 0.85))
}

function pintar() {
  marco = 0
  avance += (objetivo - avance) * 0.09
  ratonX += (objRatonX - ratonX) * 0.07
  ratonY += (objRatonY - ratonY) * 0.07
  // Al cargar ya hay tarjetas a medio camino: el túnel arranca en 0,3.
  const t = 0.3 + avance * 0.7
  const total = CARTAS.length
  const lejos = movil ? -1200 : -1700
  const cerca = movil ? 350 : 500
  const empuje = movil ? 20 : 45
  cartas.value.forEach((el, i) => {
    const c = CARTAS[i]
    const inicio = (i / total) * 0.45
    const local = limitar((t - inicio) / 0.55)
    const z = lejos + (cerca - lejos) * local
    const x = c.cos * ancho * c.radioX - ratonX * empuje
    const y = c.sin * alto * c.radioY - ratonY * empuje
    el.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px), ${z.toFixed(1)}px) rotateZ(${c.giro}deg)`
    el.style.opacity = mapa(local, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0]).toFixed(3)
  })
  if (titular.value) {
    titular.value.style.transform = `translateZ(0) scale(${mapa(avance, [0, 1], [1, 1.25]).toFixed(4)})`
    titular.value.style.opacity = mapa(avance, [0, 0.55, 0.85], [1, 1, 0]).toFixed(3)
  }
  if (aviso.value) aviso.value.style.opacity = mapa(avance, [0, 0.12], [1, 0]).toFixed(3)
  // El escenario baja algo más despacio que la página (parallax, sin fijarlo).
  if (escenario.value) escenario.value.style.transform = `translate3d(0, ${(window.scrollY * 0.45).toFixed(1)}px, 0)`
  const moviendo = Math.abs(objetivo - avance) > 0.0005 || Math.abs(objRatonX - ratonX) > 0.001 || Math.abs(objRatonY - ratonY) > 0.001
  if (moviendo) marco = requestAnimationFrame(pintar)
}
const pedir = () => {
  if (!marco) marco = requestAnimationFrame(pintar)
}
const alScroll = () => {
  leerScroll()
  pedir()
}
const alRaton = (e: PointerEvent) => {
  objRatonX = (e.clientX / window.innerWidth - 0.5) * 2
  objRatonY = (e.clientY / window.innerHeight - 0.5) * 2
  pedir()
}
const alCambiarTamano = () => {
  medir()
  alScroll()
}

onMounted(() => {
  medir()
  if (quieto) {
    // Quietas, a media distancia, sin muelles.
    avance = objetivo = 0.35
    pintar()
    return
  }
  leerScroll()
  avance = objetivo
  pintar()
  window.addEventListener('scroll', alScroll, { passive: true })
  window.addEventListener('resize', alCambiarTamano, { passive: true })
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) window.addEventListener('pointermove', alRaton, { passive: true })
})
onBeforeUnmount(() => {
  cancelAnimationFrame(marco)
  window.removeEventListener('scroll', alScroll)
  window.removeEventListener('resize', alCambiarTamano)
  window.removeEventListener('pointermove', alRaton)
})
</script>

<template>
  <section ref="raiz" class="tunel relative h-[calc(100svh-4.5rem)] min-h-[34rem] w-full overflow-hidden" aria-labelledby="t-inicio">
    <div ref="escenario" class="absolute inset-0 flex items-center justify-center will-change-transform" :style="estilo({ perspective: '1200px', transformStyle: 'preserve-3d' })">
      <!-- Fondo: rejilla de puntos y luz verde de la marca -->
      <div class="pointer-events-none absolute inset-0 rejilla opacity-70" aria-hidden="true" />
      <div class="pointer-events-none absolute inset-0 luz" aria-hidden="true" />
      <!-- Anillos de profundidad -->
      <div class="pointer-events-none absolute h-[48vmin] w-[48vmin] rounded-full border border-brand-500/20" aria-hidden="true" />
      <div class="pointer-events-none absolute h-[76vmin] w-[76vmin] rounded-full border border-dashed border-surface-300/60" aria-hidden="true" />

      <!-- Aviso para bajar -->
      <div ref="aviso" class="pointer-events-none absolute bottom-6 z-20 flex flex-col items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-surface-800" aria-hidden="true">
        <span>Baja para recorrerlo</span>
        <span class="h-6 w-px bg-gradient-to-b from-brand-500 to-transparent" />
      </div>

      <!-- Plano 3D: titular y tarjetas en el mismo espacio, así las tarjetas lejanas
           pasan por detrás del texto y solo las que se acercan, por delante -->
      <div class="pointer-events-none absolute inset-0 flex items-center justify-center" :style="estilo({ transformStyle: 'preserve-3d' })">
        <!-- Titular en el centro -->
        <div ref="titular" class="pointer-events-auto relative flex max-w-2xl flex-col items-center px-6 text-center will-change-transform">
          <!-- Halo del color del fondo: el texto se lee aunque pase una tarjeta por detrás -->
          <span class="halo pointer-events-none absolute -inset-x-24 -inset-y-20 -z-10" aria-hidden="true" />
          <p class="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-papel/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-900">
            <span class="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />Tutoría de TFM, TFG y tesis
          </p>
          <h1 id="t-inicio" class="mt-6 font-display text-5xl font-bold leading-[0.98] tracking-tight text-surface-900 sm:text-7xl md:text-[5.25rem] text-balance">
            Acompañar el trabajo académico, <span class="text-brand-900">sin vigilar</span>
          </h1>
          <p class="mt-6 max-w-[38ch] text-lg leading-relaxed texto-suave sm:text-xl">
            Un registro semanal muy breve de estudiante y tutor/a para que las tutorías empiecen por lo que importa.
          </p>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <slot name="botones" />
          </div>
        </div>

      <!-- Tarjetas (decorativas: todo lo que dicen está en la página) -->
      <div class="pointer-events-none absolute inset-0" :style="estilo({ transformStyle: 'preserve-3d' })" aria-hidden="true">
        <div
          v-for="(c, i) in CARTAS"
          :key="c.titulo"
          ref="cartas"
          class="carta absolute left-1/2 top-1/2 aspect-[4/5] will-change-transform select-none"
          :style="{ zIndex: i + 1, opacity: 0 }"
        >
          <div
            class="relative flex h-full w-full flex-col overflow-hidden rounded-2xl p-4 shadow-2xl ring-1"
            :class="c.oscura ? 'bg-marino text-white ring-white/15 shadow-black/30' : 'bg-papel text-surface-900 ring-surface-200 shadow-[rgba(10,74,108,0.25)]'"
          >
            <div class="flex flex-1 items-center justify-center">
              <!-- Registro semanal -->
              <div v-if="c.tipo === 'checkin'" class="w-full space-y-2">
                <div v-for="(v, f) in [4, 3, 4, 3]" :key="f" class="grid grid-cols-5 gap-1">
                  <span v-for="n in 5" :key="n" class="h-3 rounded-sm" :class="n === v ? 'bg-brand-800' : 'bg-surface-100'" />
                </div>
              </div>
              <!-- Dos miradas -->
              <div v-else-if="c.tipo === 'ondas'" class="w-full"><OndasSintonia :desfase="0.7" :alto="70" :grosor="3" sobre-oscuro /></div>
              <!-- Agenda -->
              <ol v-else-if="c.tipo === 'agenda'" class="w-full space-y-2">
                <li v-for="n in 3" :key="n" class="flex items-center gap-2">
                  <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-marino text-[0.6rem] font-semibold text-white">{{ n }}</span>
                  <span class="h-2 flex-1 rounded-full bg-surface-100" />
                </li>
              </ol>
              <!-- 60 segundos -->
              <p v-else-if="c.tipo === 'cifra'" class="font-display text-6xl font-bold tracking-tight">60<span class="text-2xl">s</span></p>
              <!-- Privado -->
              <span v-else-if="c.tipo === 'privado'" class="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-900"><AppIcon name="lock" :size="32" /></span>
              <!-- Puente -->
              <div v-else-if="c.tipo === 'puente'" class="flex w-full flex-col items-start gap-3 pl-3">
                <span v-for="n in 3" :key="n" class="flex items-center gap-2">
                  <span class="h-4 w-4 rounded-full" :class="n === 3 ? 'bg-brand-500' : 'bg-white/80'" />
                  <span class="h-1.5 rounded-full bg-white/40" :class="n === 2 ? 'w-16' : 'w-12'" />
                </span>
              </div>
              <!-- Sin notas -->
              <span v-else-if="c.tipo === 'sinNotas'" class="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100 text-surface-900"><AppIcon name="shield" :size="32" /></span>
              <!-- 5 personas -->
              <div v-else-if="c.tipo === 'grupo'" class="flex gap-1.5">
                <span v-for="n in 5" :key="n" class="flex h-8 w-8 items-center justify-center rounded-full bg-surface-100 text-surface-900"><AppIcon name="person" :size="16" /></span>
              </div>
              <!-- En sintonía -->
              <div v-else class="w-full"><OndasSintonia :desfase="0" :alto="70" :grosor="3" /></div>
            </div>
            <!-- El rótulo va como contenido CSS: es decoración (ya está en la página) y las tarjetas se funden al pasar -->
            <p class="rotulo mt-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em]" :class="c.oscura ? 'text-brand-400' : 'text-brand-900'" :data-rotulo="c.titulo" />
          </div>
        </div>
      </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rejilla {
  background-image: radial-gradient(rgb(var(--rgb-s300) / 0.55) 1px, transparent 1px);
  background-size: 28px 28px;
  -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, #000 60%, transparent 100%);
  mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, #000 60%, transparent 100%);
}
.rotulo::before {
  content: attr(data-rotulo);
}
.halo {
  background: radial-gradient(ellipse at center, rgb(var(--rgb-s50)) 42%, rgb(var(--rgb-s50) / 0.85) 55%, transparent 72%);
}
.luz {
  background: radial-gradient(circle at center, rgba(52, 198, 163, 0.16) 0%, transparent 70%);
}
</style>
