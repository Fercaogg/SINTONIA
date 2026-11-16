<script setup lang="ts">
// CAMPO DE SINTONÍA: el efecto del inicio (uno solo por página, skill de Taste).
//
// Decenas de hilos de luz en dos familias, verde (estudiante) y azul o claro
// (tutor/a). Cuando las dos miradas de la demostración se separan, las
// familias se desfasan, se cruzan y vibran; cuando coinciden, se ordenan en
// una sola corriente tranquila. El puntero (ratón o dedo) deja una onda suave
// al pasar. El movimiento cuenta la idea de SINTONÍA: no es un adorno.
//
// Cuidados (skills de Emil Kowalski y Taste, WCAG):
//   - WebGL en un único lienzo, solo mientras se ve; se para al salir de la
//     pantalla o al cambiar de pestaña.
//   - Botón para pausarlo (WCAG 2.2.2) y, con "reducir movimiento", un solo
//     fotograma quieto.
//   - Sin WebGL, no se dibuja nada y la portada sigue igual.
//   - Los valores se suavizan con un "muelle" para que nada salte.
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { desfasePortada } from '@/lib/sintonia-estado'
import { prefiereMenosMovimiento } from '@/lib/movimiento'
import AppIcon from '@/components/comun/AppIcon.vue'

const lienzo = ref<HTMLCanvasElement | null>(null)
const disponible = ref(false)
const pausado = ref(false)
const quieto = ref(false)

const VERTICES = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`

// Cada píxel suma el brillo de los hilos cercanos de las dos familias.
const FRAGMENTOS = `
precision mediump float;
uniform vec2 u_res;
uniform float u_t;
uniform float u_desfase;
uniform vec2 u_puntero;
uniform float u_fuerza;
uniform vec3 u_verde;
uniform vec3 u_tutor;
uniform vec3 u_fondo;
uniform float u_calma;
const int HILOS = 22;

float hilo(float y, float centro, float grosor) {
  float d = abs(y - centro);
  return smoothstep(grosor, 0.0, d) + 0.35 * smoothstep(grosor * 6.0, 0.0, d);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspecto = u_res.x / u_res.y;
  vec2 q = vec2(uv.x * aspecto, uv.y);

  // Onda que deja el puntero.
  vec2 pp = vec2(u_puntero.x * aspecto, u_puntero.y);
  float dp = distance(q, pp);
  float onda = u_fuerza * 0.05 * exp(-dp * dp * 10.0) * sin(dp * 30.0 - u_t * 4.0);

  // Zona tranquila detrás del titular (izquierda), para que se lea bien.
  float calma = mix(1.0, 0.15, u_calma * smoothstep(0.62, 0.05, uv.x) * smoothstep(0.08, 0.35, uv.y));

  float luzV = 0.0;
  float luzT = 0.0;
  float grosor = 1.6 / u_res.y;
  for (int i = 0; i < HILOS; i++) {
    float fi = float(i);
    float base = (fi + 0.5) / float(HILOS);
    float k = 5.0 + mod(fi * 1.7, 3.0);
    float fase = fi * 0.45;
    float amp = 0.018 + 0.012 * sin(fi * 1.3);
    float yV = base + amp * sin(q.x * k + fase + u_t * 0.5) + onda;
    // La familia del tutor/a se desfasa, se inclina y vibra con el desajuste.
    float d = u_desfase;
    float yT = base
      + amp * (1.0 + d * 1.6) * sin(q.x * k + fase + u_t * 0.5 + d * 3.14159)
      + d * 0.03 * sin(q.x * 13.0 - u_t * 1.7 + fi)
      + d * 0.05 * (uv.x - 0.5)
      + onda;
    luzV += hilo(uv.y, yV, grosor);
    luzT += hilo(uv.y, yT, grosor);
  }
  // Cuando coinciden, las dos familias se funden en una sola luz verde.
  float juntas = (1.0 - u_desfase);
  vec3 color = u_fondo;
  color = mix(color, u_tutor, clamp(luzT * 0.32 * calma * (0.55 + 0.45 * u_desfase), 0.0, 1.0));
  color = mix(color, u_verde, clamp(luzV * (0.38 + 0.12 * juntas) * calma, 0.0, 1.0));
  // Desvanecido hacia abajo, para enlazar con la página.
  float borde = smoothstep(0.0, 0.25, uv.y);
  gl_FragColor = vec4(mix(u_fondo, color, borde), 1.0);
}
`

let gl: WebGLRenderingContext | null = null
let programa: WebGLProgram | null = null
let marco = 0
let visible = true
let inicio = 0
let tiempoPausado = 0
const u: Record<string, WebGLUniformLocation | null> = {}
const actual = { desfase: 1, x: 0.7, y: 0.5, fuerza: 0 }
const objetivo = { x: 0.7, y: 0.5, fuerza: 0 }
let observador: IntersectionObserver | null = null
let medidor: ResizeObserver | null = null
let esquema: MediaQueryList | null = null

function colorCss(nombre: string, porDefecto: [number, number, number]): [number, number, number] {
  const v = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim()
  const partes = v.split(/\s+/).map(Number)
  return partes.length === 3 && partes.every((n) => !Number.isNaN(n)) ? (partes.map((n) => n / 255) as [number, number, number]) : porDefecto
}

function aplicarColores() {
  if (!gl || !programa) return
  const oscuro = window.matchMedia('(prefers-color-scheme: dark)').matches
  gl.uniform3fv(u.u_fondo, colorCss('--rgb-s50', [0.96, 0.97, 0.965]))
  gl.uniform3f(u.u_verde, 52 / 255, 198 / 255, 163 / 255)
  // Tutor/a: azul marino sobre claro; azul claro sobre oscuro (para que se vea).
  if (oscuro) gl.uniform3f(u.u_tutor, 0.62, 0.8, 0.88)
  else gl.uniform3f(u.u_tutor, 10 / 255, 74 / 255, 108 / 255)
}

function compilar(tipo: number, fuente: string) {
  const s = gl!.createShader(tipo)!
  gl!.shaderSource(s, fuente)
  gl!.compileShader(s)
  return gl!.getShaderParameter(s, gl!.COMPILE_STATUS) ? s : null
}

function iniciar(): boolean {
  const c = lienzo.value
  if (!c) return false
  gl = c.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false, powerPreference: 'low-power' })
  if (!gl) return false
  const v = compilar(gl.VERTEX_SHADER, VERTICES)
  const f = compilar(gl.FRAGMENT_SHADER, FRAGMENTOS)
  if (!v || !f) return false
  programa = gl.createProgram()!
  gl.attachShader(programa, v)
  gl.attachShader(programa, f)
  gl.linkProgram(programa)
  if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) return false
  gl.useProgram(programa)
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const pos = gl.getAttribLocation(programa, 'p')
  gl.enableVertexAttribArray(pos)
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)
  for (const n of ['u_res', 'u_t', 'u_desfase', 'u_puntero', 'u_fuerza', 'u_verde', 'u_tutor', 'u_fondo', 'u_calma']) {
    u[n] = gl.getUniformLocation(programa, n)
  }
  aplicarColores()
  return true
}

// Sin tarjeta gráfica (WebGL por software), el efecto bloquearía la página:
// en ese caso se dibuja un solo fotograma.
function sinAceleracion(): boolean {
  if (!gl) return true
  const info = gl.getExtension('WEBGL_debug_renderer_info')
  const tarjeta = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
  return /swiftshader|llvmpipe|software|softpipe|basic render/i.test(tarjeta)
}

// Vigilante de fluidez: si los fotogramas van lentos, primero baja la
// resolución y, si sigue igual, deja el fondo quieto.
let reduccion = 1
let ultimo = 0
let lentos = 0
function vigilar(ahora: number) {
  if (ultimo) {
    const ms = ahora - ultimo
    lentos = ms > 34 ? lentos + 1 : Math.max(0, lentos - 1)
    if (lentos > 20) {
      lentos = 0
      if (reduccion > 0.5) reduccion = 0.5
      else {
        quieto.value = true
        parar()
      }
    }
  }
  ultimo = ahora
}

function ajustarTamano() {
  const c = lienzo.value
  if (!c || !gl) return
  // Resolución moderada: en móvil, 1x; en escritorio, hasta 1,5x.
  const escala = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1 : 1.5) * reduccion
  const ancho = Math.round(c.clientWidth * escala)
  const alto = Math.round(c.clientHeight * escala)
  if (c.width !== ancho || c.height !== alto) {
    c.width = ancho
    c.height = alto
    gl.viewport(0, 0, ancho, alto)
  }
}

function dibujar(t: number) {
  if (!gl) return
  ajustarTamano()
  // "Muelle": cada valor se acerca a su objetivo poco a poco.
  actual.desfase += (desfasePortada.value - actual.desfase) * 0.06
  actual.x += (objetivo.x - actual.x) * 0.08
  actual.y += (objetivo.y - actual.y) * 0.08
  actual.fuerza += (objetivo.fuerza - actual.fuerza) * 0.05
  objetivo.fuerza *= 0.985
  gl.uniform2f(u.u_res, lienzo.value!.width, lienzo.value!.height)
  gl.uniform1f(u.u_t, t / 1000)
  gl.uniform1f(u.u_desfase, actual.desfase)
  gl.uniform2f(u.u_puntero, actual.x, actual.y)
  gl.uniform1f(u.u_fuerza, actual.fuerza)
  gl.uniform1f(u.u_calma, window.innerWidth >= 1024 ? 1 : 0.6)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}

function bucle(ahora: number) {
  marco = 0
  if (pausado.value || quieto.value || !visible || document.hidden) return
  vigilar(ahora)
  dibujar(ahora - inicio)
  marco = requestAnimationFrame(bucle)
}

function arrancar() {
  if (marco || pausado.value || quieto.value || !gl) return
  inicio = performance.now() - tiempoPausado
  marco = requestAnimationFrame(bucle)
}

function parar() {
  if (marco) cancelAnimationFrame(marco)
  marco = 0
  ultimo = 0
  tiempoPausado = performance.now() - inicio
}

function alternarPausa() {
  pausado.value = !pausado.value
  if (pausado.value) parar()
  else arrancar()
}

function alMoverPuntero(e: PointerEvent) {
  const c = lienzo.value
  if (!c) return
  const r = c.getBoundingClientRect()
  objetivo.x = (e.clientX - r.left) / r.width
  objetivo.y = 1 - (e.clientY - r.top) / r.height
  objetivo.fuerza = 1
}

function alCambiarVisibilidad() {
  if (document.hidden) parar()
  else arrancar()
}

function alCambiarEsquema() {
  aplicarColores()
  if (quieto.value || pausado.value) dibujar(tiempoPausado)
}

// Quieto, el dibujo también refleja la demostración (sin animar).
watch(desfasePortada, (v) => {
  if (!quieto.value || !gl) return
  actual.desfase = v
  dibujar(4000)
})

onMounted(() => {
  if (!iniciar()) return
  disponible.value = true
  actual.desfase = Math.max(0.8, desfasePortada.value)
  // Si el lienzo cambia de tamaño estando quieto o en pausa, se vuelve a
  // dibujar (al cambiar de tamaño, el navegador lo borra).
  medidor = new ResizeObserver(() => {
    if (quieto.value || pausado.value) dibujar(quieto.value ? 4000 : tiempoPausado)
  })
  medidor.observe(lienzo.value!)
  if (prefiereMenosMovimiento() || sinAceleracion()) {
    // Un solo fotograma, ya con el desfase de la demostración.
    quieto.value = true
    actual.desfase = desfasePortada.value
    dibujar(4000)
    return
  }
  const seccion = lienzo.value!.parentElement!
  seccion.addEventListener('pointermove', alMoverPuntero, { passive: true })
  document.addEventListener('visibilitychange', alCambiarVisibilidad)
  esquema = window.matchMedia('(prefers-color-scheme: dark)')
  esquema.addEventListener('change', alCambiarEsquema)
  observador = new IntersectionObserver((e) => {
    visible = e.some((x) => x.isIntersecting)
    if (visible) arrancar()
    else parar()
  })
  observador.observe(lienzo.value!)
  arrancar()
})

onBeforeUnmount(() => {
  parar()
  observador?.disconnect()
  medidor?.disconnect()
  document.removeEventListener('visibilitychange', alCambiarVisibilidad)
  esquema?.removeEventListener('change', alCambiarEsquema)
  lienzo.value?.parentElement?.removeEventListener('pointermove', alMoverPuntero)
  gl?.getExtension('WEBGL_lose_context')?.loseContext()
})
import { useIdioma } from '@/lib/idioma'
const { t } = useIdioma()
</script>

<template>
  <canvas
    ref="lienzo"
    class="campo absolute inset-0 w-full h-full"
    :data-webgl="disponible"
    :data-estado="quieto ? 'quieto' : pausado ? 'pausado' : 'en-marcha'"
    aria-hidden="true"
  />
  <button
    v-if="disponible && !quieto"
    type="button"
    class="campo-pausa"
    :aria-pressed="pausado"
    @click="alternarPausa"
  >
    <AppIcon :name="pausado ? 'reproducir' : 'pausa'" :size="16" />
    {{ pausado ? t('Reanudar el fondo', 'Resume the background') : t('Pausar el fondo', 'Pause the background') }}
  </button>
</template>

<style scoped>
.campo {
  pointer-events: none;
  opacity: 0;
  animation: aparecer 900ms var(--ease-out) 120ms forwards;
}
.campo[data-webgl='false'] {
  display: none;
}
@keyframes aparecer {
  to {
    opacity: 1;
  }
}
.campo-pausa {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-height: 44px;
  padding: 0 0.875rem;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgb(var(--rgb-s800));
  background-color: rgb(var(--rgb-papel) / 0.85);
  border: 1px solid rgb(var(--rgb-s200));
  backdrop-filter: blur(6px);
  transition: transform var(--dur-micro) var(--ease-out), background-color var(--dur-micro) ease;
}
.campo-pausa:active {
  transform: scale(0.97);
}
@media (prefers-reduced-motion: reduce) {
  .campo {
    animation: none;
    opacity: 1;
  }
}
</style>
