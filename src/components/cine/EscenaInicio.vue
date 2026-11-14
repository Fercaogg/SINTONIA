<script setup lang="ts">
// ESCENA 1. Dos miradas (docs/GUION-PORTADA.md). El contenido es el inicio de
// siempre; solo cambia cómo se mueve con el scroll.
//   0 a 0,35   el titular se abre: la primera línea se aleja hacia arriba y
//              "sin vigilar" viaja al centro y crece; el resto se retira en
//              una sola ola (Emil: un protagonista, el resto acompaña).
//   0,35 a 0,6 el fondo pasa al azul marino; "sin vigilar" se vuelve clara.
//   0,55 a 0,8 "sin vigilar" se desdobla en dos copias: las dos miradas.
//   0,82 a 1   las copias se recogen y dan paso a las cifras (sin corte).
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { modoDemo } from '@/lib/supabase'
import { hayDemostracion } from '@/lib/demo'
import { altoCabecera, enMedio, esMovil, haciaPunto, limitar, mezclar, registrarEscena, quitarEscena, salida, tramo, type Escena } from '@/lib/cine'
import AccesosDemo from '@/components/comun/AccesosDemo.vue'
import DemoSintonia from '@/components/portada/DemoSintonia.vue'

const CampoSintonia = defineAsyncComponent(() => import('@/components/portada/CampoSintonia.vue'))
const props = defineProps<{ cine: boolean }>()

const raiz = ref<HTMLElement | null>(null)
const escenario = ref<HTMLElement | null>(null)
const previa = ref<HTMLElement | null>(null)
const linea1 = ref<HTMLElement | null>(null)
const linea2 = ref<HTMLElement | null>(null)
const real = ref<HTMLElement | null>(null)
const clara = ref<HTMLElement | null>(null)
const copiaVerde = ref<HTMLElement | null>(null)
const copiaBlanca = ref<HTMLElement | null>(null)
const resto = ref<HTMLElement | null>(null)
const demo = ref<HTMLElement | null>(null)
const campo = ref<HTMLElement | null>(null)

// Medidas de "sin vigilar" en reposo: cuánto hay que moverla y crecerla para
// que llene el centro de la pantalla.
let dx = 0
let dy = 0
let escala = 2.4

function estilo(el: HTMLElement | null, transform: string, opacidad: number) {
  if (!el) return
  el.style.transform = transform
  el.style.opacity = String(limitar(opacidad))
}

let escena: Escena | null = null

onMounted(() => {
  if (!props.cine || !raiz.value || !escenario.value) return
  escena = {
    raiz: raiz.value,
    escenario: escenario.value,
    reposo: 0,
    extra: () => window.innerHeight * (esMovil() ? 1.2 : 1.8),
    medir() {
      const d = haciaPunto(escenario.value!, linea2.value!, window.innerWidth / 2, (window.innerHeight + altoCabecera()) / 2)
      dx = d.dx
      dy = d.dy
      escala = Math.min(esMovil() ? 2.2 : 2.6, (window.innerWidth * 0.86) / d.ancho)
    },
    // Fundido corto: sin quedarse en un gris intermedio.
    fondo: (p) => salida(tramo(p, 0.38, 0.5)),
    dibujar(p) {
      const vh = window.innerHeight
      const a = salida(tramo(p, 0, 0.35))
      estilo(previa.value, `translateY(${-a * 40}px)`, 1 - tramo(p, 0, 0.2))
      estilo(linea1.value, `translateY(${-a * vh * 0.18}px) scale(${1 - 0.22 * a})`, 1 - tramo(p, 0.04, 0.3))
      estilo(resto.value, `translateY(${-a * 30}px) scale(${1 - 0.05 * a})`, 1 - tramo(p, 0, 0.22))
      estilo(demo.value, `translateY(${a * 50}px) scale(${1 - 0.12 * a})`, 1 - tramo(p, 0.02, 0.28))
      estilo(campo.value, 'none', 1 - tramo(p, 0.2, 0.45))

      // "sin vigilar": viaja al centro y crece; luego se recoge.
      const g = enMedio(tramo(p, 0.05, 0.45))
      const fuera = enMedio(tramo(p, 0.82, 1))
      const s = mezclar(1, escala, g) * (1 - 0.55 * fuera)
      estilo(linea2.value, `translate(${dx * g}px, ${dy * g}px) scale(${s})`, 1 - fuera)

      // Sobre el azul, la versión clara sustituye a la verde oscura.
      const m = tramo(p, 0.38, 0.48)
      const separar = enMedio(tramo(p, 0.55, 0.8))
      estilo(real.value, 'none', 1 - m)
      estilo(clara.value, 'none', m * (1 - separar))
      // Las dos miradas: una sube y otra baja, claramente separadas.
      estilo(copiaVerde.value, `translate(${-separar * 4}%, ${-separar * 62}%)`, separar)
      estilo(copiaBlanca.value, `translate(${separar * 4}%, ${separar * 62}%)`, separar * 0.92)
    },
  }
  registrarEscena(escena)
})

onBeforeUnmount(() => {
  if (escena) quitarEscena(escena)
})
</script>

<template>
  <section ref="raiz" class="relative" :class="{ 'escena-cine': cine }">
    <div
      ref="escenario"
      class="overflow-hidden flex items-center pt-12 pb-20 sm:pt-16 sm:pb-24"
      :class="cine ? 'sticky lg:min-h-[calc(100svh-4.5rem)]' : 'relative lg:min-h-[calc(100svh-4.5rem)]'"
    >
      <div ref="campo" class="absolute inset-0"><CampoSintonia /></div>
      <div class="relative z-10 max-w-[1180px] w-full mx-auto px-4 sm:px-6 grid gap-12 lg:grid-cols-[7fr_5fr] items-center">
        <div class="entrada">
          <p ref="previa" class="text-xs font-semibold uppercase tracking-[0.18em] text-brand-900 mb-5 cine-capa">Tutoría de TFM, TFG y tesis</p>
          <h1 class="font-display text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-7xl font-bold tracking-tight text-surface-900">
            <span ref="linea1" class="inline-block cine-capa origin-left">Acompañar el trabajo académico,</span>
            <span ref="linea2" class="relative block w-fit cine-capa">
              <span ref="real" class="text-brand-900">sin vigilar</span>
              <span ref="clara" class="absolute inset-0 text-brand-400 opacity-0" aria-hidden="true">sin vigilar</span>
              <span ref="copiaVerde" class="absolute inset-0 text-brand-500 opacity-0" aria-hidden="true">sin vigilar</span>
              <span ref="copiaBlanca" class="absolute inset-0 text-white opacity-0" aria-hidden="true">sin vigilar</span>
            </span>
          </h1>
          <div ref="resto" class="cine-capa origin-left">
            <p class="mt-7 text-lg sm:text-xl texto-suave max-w-xl">
              Un registro semanal muy breve de estudiante y tutor/a para que las tutorías empiecen por lo que importa.
            </p>
            <p class="mt-4 text-base text-surface-900 font-medium">Unos 60 segundos a la semana. Sin notas, sin rankings.</p>
            <AccesosDemo v-if="modoDemo" class="mt-8" />
            <div class="mt-8 flex flex-col sm:flex-row gap-3">
              <RouterLink v-if="!modoDemo" to="/registro" class="btn-primary px-6 py-3">Tengo un código</RouterLink>
              <RouterLink v-if="hayDemostracion" to="/demo" class="btn-secondary px-6 py-3">Ver la demostración</RouterLink>
              <a v-else href="#demostracion" class="btn-secondary px-6 py-3">Ver la demostración</a>
            </div>
          </div>
        </div>
        <div ref="demo" class="entrada entrada-2 cine-capa">
          <DemoSintonia />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.escena-cine .cine-capa {
  will-change: transform, opacity;
}
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
