<script setup lang="ts">
// ESCENA 2. Las cifras (docs/GUION-PORTADA.md), sobre azul marino.
// Cada dato del producto entra gigante desde el fondo, ocupa la pantalla y
// viaja a su hueco en la fila de cuatro. Al final, la banda de siempre.
// Coreografía (Emil): un solo protagonista cada vez; el viaje de uno se
// solapa con la llegada del siguiente, para que se lea como una ola.
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { DATOS_CLAVE } from '@/contenido/portada'
import { altoCabecera, enMedio, esMovil, haciaPunto, mezclar, registrarEscena, quitarEscena, salida, tramo, type Escena } from '@/lib/cine'
import CifraAnimada from '@/components/portada/CifraAnimada.vue'
import OndasSintonia from '@/components/portada/OndasSintonia.vue'

const props = defineProps<{ cine: boolean }>()
const raiz = ref<HTMLElement | null>(null)
const escenario = ref<HTMLElement | null>(null)
const items = ref<HTMLElement[]>([])
const ondas = ref<HTMLElement | null>(null)

// Para cada cifra: cuánto moverla al centro y cuánto crecerla.
let destino: { dx: number; dy: number; escala: number }[] = []
let escena: Escena | null = null

onMounted(() => {
  if (!props.cine || !raiz.value || !escenario.value) return
  escena = {
    raiz: raiz.value,
    escenario: escenario.value,
    reposo: 1,
    extra: () => window.innerHeight * (esMovil() ? 1.6 : 2.2),
    medir() {
      // El dato gigante ocupa el centro de la parte de arriba; la fila espera
      // abajo, así nunca se pisan.
      const cab = altoCabecera()
      const y = cab + (window.innerHeight - cab) * (esMovil() ? 0.27 : 0.34)
      destino = items.value.map((el) => {
        const d = haciaPunto(escenario.value!, el, window.innerWidth / 2, y)
        return { dx: d.dx, dy: d.dy, escala: Math.min(esMovil() ? 1.9 : 3.4, (window.innerWidth * (esMovil() ? 0.78 : 0.62)) / d.ancho) }
      })
    },
    // Vuelta al claro rápida, sin quedarse en gris.
    fondo: (p) => 1 - salida(tramo(p, 0.95, 1)),
    dibujar(p) {
      // Mientras un dato es protagonista, los que ya están en la fila se apagan un poco.
      const protagonista = items.value.findIndex((_, i) => {
        const inicio = 0.02 + i * 0.2
        return p >= inicio && p < inicio + 0.2
      })
      items.value.forEach((el, i) => {
        const d = destino[i]
        if (!d) return
        const inicio = 0.02 + i * 0.2
        const llega = salida(tramo(p, inicio, inicio + 0.1)) // aparece al frente, desde el fondo
        const viaja = enMedio(tramo(p, inicio + 0.12, inicio + 0.24)) // y va a su sitio
        const s = mezclar(mezclar(d.escala * 1.35, d.escala, llega), 1, viaja)
        const x = d.dx * (1 - viaja)
        const y = d.dy * (1 - viaja)
        el.style.transform = `translate(${x}px, ${y}px) scale(${s})`
        const apagado = protagonista >= 0 && protagonista !== i && viaja >= 1 ? (esMovil() ? 0.2 : 0.35) : 1
        el.style.opacity = String(llega * apagado)
        el.style.transition = 'opacity 200ms ease'
      })
      if (ondas.value) ondas.value.style.opacity = String(0.35 + 0.65 * tramo(p, 0.75, 0.95))
    },
  }
  registrarEscena(escena)
})

onBeforeUnmount(() => {
  if (escena) quitarEscena(escena)
})
</script>

<template>
  <section ref="raiz" aria-label="SINTONÍA en cifras" class="relative" :class="cine ? 'text-white' : 'bg-marino text-white'">
    <div ref="escenario" class="overflow-hidden" :class="cine ? 'sticky h-[calc(100svh-4.5rem)] flex flex-col justify-end pb-[14vh]' : 'relative'">
      <div class="relative z-10 max-w-[1180px] w-full mx-auto px-4 sm:px-6 py-14 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        <div v-for="d in DATOS_CLAVE" :key="d.texto" ref="items" class="cifra-cine origin-center">
          <CifraAnimada :valor="Number(d.cifra)" :unidad="d.unidad" :texto="d.texto" :contar="!cine" />
        </div>
      </div>
      <div v-if="cine" ref="ondas" class="absolute inset-x-0 bottom-6 opacity-40 pointer-events-none" aria-hidden="true">
        <OndasSintonia :desfase="0.85" :alto="90" :grosor="3" sobre-oscuro />
      </div>
    </div>
  </section>
</template>

<style scoped>
.cifra-cine {
  will-change: transform, opacity;
}
</style>
