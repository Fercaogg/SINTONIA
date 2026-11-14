<script setup lang="ts">
// INICIO (docs/GUION-PORTADA.md). El contenido de siempre; al bajar, la
// página nunca se para: el titular se abre hacia los lados, "sin vigilar"
// crece y se desdobla en dos miradas, y la demostración se queda atrás
// (parallax). Todo con inercia y con la tipografía inclinándose según la
// velocidad. Arriba del todo (avance 0) es el estado de reposo.
import { defineAsyncComponent, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { modoDemo } from '@/lib/supabase'
import { hayDemostracion } from '@/lib/demo'
import { esMovil, inclinar, poner, salida, tramo } from '@/lib/cine'
import { cineActivo, usarPieza } from '@/lib/usar-cine'
import AccesosDemo from '@/components/comun/AccesosDemo.vue'
import DemoSintonia from '@/components/portada/DemoSintonia.vue'

const CampoSintonia = defineAsyncComponent(() => import('@/components/portada/CampoSintonia.vue'))
const cine = cineActivo()

const raiz = ref<HTMLElement | null>(null)
const titular = ref<HTMLElement | null>(null)
const previa = ref<HTMLElement | null>(null)
const linea1 = ref<HTMLElement | null>(null)
const linea2 = ref<HTMLElement | null>(null)
const copiaVerde = ref<HTMLElement | null>(null)
const copiaTutor = ref<HTMLElement | null>(null)
const resto = ref<HTMLElement | null>(null)
const demo = ref<HTMLElement | null>(null)
const campo = ref<HTMLElement | null>(null)

// Tres piezas: el titular sale con su propio avance (de arriba del todo a
// haber salido de la pantalla); el texto con los botones y la demostración
// se mueven según su propio paso. Los botones y accesos nunca se apagan:
// solo se desplazan, para que siempre se puedan leer y pulsar.
usarPieza(
  titular,
  (v, vel) => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const m = esMovil() ? 0.6 : 1
    const p = salida(v)
    const sk = inclinar(vel)
    poner(previa.value, { x: -p * 160 * m, o: 1 - v * 2.2 })
    poner(linea1.value, { x: -p * vw * 0.32 * m, sk, o: 1 - v * 1.5 })
    poner(linea2.value, { x: p * vw * 0.12 * m, y: -p * vh * 0.04, s: 1 + p * 0.85 * m, sk })
    // Las dos miradas: una copia verde sube y otra azul baja.
    poner(copiaVerde.value, { x: -p * 18, y: -p * 34, o: Math.min(1, v * 4) * 0.9 })
    poner(copiaTutor.value, { x: p * 18, y: p * 34, o: Math.min(1, v * 4) * 0.55 })
  },
  { muelle: 0.1, modo: 'inicio' },
)
usarPieza(raiz, (v) => poner(campo.value, { y: salida(v) * window.innerHeight * 0.25, o: 1 - v * 1.2 }), { modo: 'inicio' })
usarPieza(resto, (v) => {
  // Entra desde abajo (en móvil) y al salir sube más deprisa que el scroll.
  const entra = 1 - salida(tramo(v, 0, 0.3))
  const sale = tramo(v, 0.55, 1)
  poner(resto.value, { y: entra * 70 - sale * window.innerHeight * 0.18 })
})
usarPieza(demo, (v) => {
  const m = esMovil() ? 0.5 : 1
  const entra = 1 - salida(tramo(v, 0, 0.32))
  const sale = salida(tramo(v, 0.5, 1))
  poner(demo.value, {
    y: entra * 120 * m + sale * window.innerHeight * 0.3 * m,
    x: sale * 60 * m,
    r: (entra * -5 + sale * 7) * m,
    s: 1 - sale * 0.12,
    o: 1 - sale * 0.6,
  })
})
</script>

<template>
  <section ref="raiz" class="relative overflow-hidden" :class="{ 'escena-cine': cine }">
    <div class="relative flex items-center pt-12 pb-20 sm:pt-16 sm:pb-24 lg:min-h-[calc(100svh-4.5rem)]">
      <div ref="campo" class="absolute inset-0 cine-capa"><CampoSintonia /></div>
      <div class="relative z-10 max-w-[1180px] w-full mx-auto px-4 sm:px-6 grid gap-12 lg:grid-cols-[7fr_5fr] items-center">
        <div class="entrada">
          <div ref="titular">
          <p ref="previa" class="text-xs font-semibold uppercase tracking-[0.18em] text-brand-900 mb-5 cine-capa">Tutoría de TFM, TFG y tesis</p>
          <h1 class="font-display text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-7xl font-bold tracking-tight text-surface-900">
            <span ref="linea1" class="inline-block cine-capa origin-left">Acompañar el trabajo académico,</span>
            <span ref="linea2" class="relative block w-fit cine-capa origin-left">
              <span ref="copiaVerde" class="absolute inset-0 text-brand-500 opacity-0 cine-capa" aria-hidden="true">sin vigilar</span>
              <span ref="copiaTutor" class="absolute inset-0 text-surface-900 opacity-0 cine-capa" aria-hidden="true">sin vigilar</span>
              <span class="relative text-brand-900">sin vigilar</span>
            </span>
          </h1>
          </div>
          <div ref="resto" class="cine-capa">
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
        <div class="entrada entrada-2">
          <div ref="demo" class="cine-capa"><DemoSintonia /></div>
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
