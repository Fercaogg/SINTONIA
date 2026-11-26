<script setup lang="ts">
// Escena 3D de Puente al doctorado (solo CSS, sin librerías): el máster a la
// izquierda, seis tramos en arco (uno por puerta) y la puerta del doctorado,
// encendida, al final. Es decoración (aria-hidden): toda la información está
// en el texto y en las tarjetas.
//
// Movimiento (skills emil-design-eng y animate):
//   - Al entrar, los tramos suben a su sitio escalonados (pantalla poco
//     frecuente: se permite el detalle). Solo transform y opacity.
//   - Con ratón, la escena se inclina un poco hacia el puntero, con una
//     transición que hace de muelle. En táctil no.
//   - Con «reducir movimiento», todo aparece quieto.
import { computed, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{ activa?: number | null; tramos?: number; compacta?: boolean }>(), {
  activa: null,
  tramos: 6,
  compacta: false,
})

interface Caja { x: number; y: number; w: number; d: number; h: number; z: number; tipo: 'orilla' | 'tramo' | 'pilar'; i?: number }

const W = 40
const G = 6
const D = 64
const ALTURA = 70

const cajas = computed<Caja[]>(() => {
  const n = props.tramos
  const L = -(n * (W + G)) / 2
  const lista: Caja[] = [{ x: L - 96, y: -D / 2 - 20, w: 90, d: D + 40, h: 14, z: 0, tipo: 'orilla' }]
  for (let i = 0; i < n; i++) {
    const z = Math.round(ALTURA * Math.sin((Math.PI * (i + 0.5)) / n))
    lista.push({ x: L + i * (W + G) + W / 2 - 4, y: -4, w: 8, d: 8, h: z, z: 0, tipo: 'pilar', i })
    lista.push({ x: L + i * (W + G), y: -D / 2, w: W, d: D, h: 8, z, tipo: 'tramo', i })
  }
  lista.push({ x: L + n * (W + G) + 6, y: -D / 2 - 20, w: 90, d: D + 40, h: 14, z: 0, tipo: 'orilla' })
  return lista
})

const puertaX = computed(() => -(props.tramos * (W + G)) / 2 + props.tramos * (W + G) + 6 + 45 - 22)
const tuX = -(6 * (W + G)) / 2 - 96 + 38

const estilo = (c: Caja) => ({ '--x': c.x, '--y': c.y, '--w': c.w, '--d': c.d, '--h': c.h, '--z': c.z, '--i': c.i ?? 0 })

// Inclinación hacia el puntero (solo con ratón y sin «reducir movimiento»).
const giro = ref({ x: 0, y: 0 })
const conRaton = ref(false)
onMounted(() => {
  conRaton.value = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
})
function mover(e: PointerEvent) {
  if (!conRaton.value || e.pointerType !== 'mouse') return
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  giro.value = { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 }
}
const salir = () => { giro.value = { x: 0, y: 0 } }
const plano = computed(() => `rotateX(${62 - giro.value.y * 6}deg) rotateZ(${-22 + giro.value.x * 10}deg)`)
</script>

<template>
  <div class="escena" :class="{ compacta }" aria-hidden="true" @pointermove="mover" @pointerleave="salir">
    <div class="plano" :style="{ transform: plano }">
      <div class="rejilla" />
      <div
        v-for="(c, k) in cajas"
        :key="k"
        class="caja"
        :class="[c.tipo, { encendido: c.tipo === 'tramo' && activa === c.i }]"
        :style="estilo(c)"
      >
        <i class="sup" /><i class="fr" /><i class="la" />
      </div>
      <!-- Tú, en la orilla del máster. -->
      <div class="de-pie" :style="{ left: `${tuX}px`, top: '6px', '--z': 14 }"><span class="tu" /></div>
      <!-- La puerta del doctorado. -->
      <div class="de-pie" :style="{ left: `${puertaX}px`, top: '0px', '--z': 14 }"><span class="puerta" /></div>
    </div>
  </div>
</template>

<style scoped>
.escena {
  position: relative;
  width: 100%;
  height: 300px;
  perspective: 1400px;
  --tramo-sup: #3a3a38;
  --tramo-fr: #262625;
  --tramo-la: #2f2f2d;
  --lumbre: rgb(var(--rgb-b500));
}
.escena.compacta {
  height: 170px;
}
.compacta .plano {
  scale: 0.58;
}
@media (max-width: 639px) {
  .escena { height: 230px; }
  .plano { scale: 0.76; top: 58%; }
  .compacta .plano { scale: 0.5; }
}

.plano {
  position: absolute;
  left: 50%;
  top: 56%;
  width: 0;
  height: 0;
  transform-style: preserve-3d;
  /* Hace de muelle al seguir al puntero; se interrumpe sin saltos. */
  transition: transform 700ms var(--ease-out);
}

.rejilla {
  position: absolute;
  left: -420px;
  top: -300px;
  width: 840px;
  height: 600px;
  background-image:
    linear-gradient(rgb(255 255 255 / 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 0.06) 1px, transparent 1px);
  background-size: 28px 28px;
  mask: radial-gradient(closest-side, #000 30%, transparent);
}

.caja {
  position: absolute;
  transform-style: preserve-3d;
  left: calc(var(--x) * 1px);
  top: calc(var(--y) * 1px);
  width: calc(var(--w) * 1px);
  height: calc(var(--d) * 1px);
  transform: translateZ(calc(var(--z) * 1px));
  --c-sup: var(--tramo-sup);
  --c-fr: var(--tramo-fr);
  --c-la: var(--tramo-la);
}
.caja > i {
  position: absolute;
  display: block;
  transition: background-color 200ms ease;
}
.sup {
  inset: 0;
  transform: translateZ(calc(var(--h) * 1px));
  background: linear-gradient(135deg, rgb(255 255 255 / 0.06), transparent 60%), var(--c-sup);
}
.fr {
  left: 0;
  top: 100%;
  width: 100%;
  height: calc(var(--h) * 1px);
  transform-origin: top;
  transform: rotateX(90deg);
  background: var(--c-fr);
}
.la {
  left: 100%;
  top: 0;
  width: calc(var(--h) * 1px);
  height: 100%;
  transform-origin: left;
  transform: rotateY(-90deg);
  background: var(--c-la);
}
.pilar {
  --c-sup: #2a2a29;
  --c-fr: #20201f;
  --c-la: #232322;
}

/* El tramo de la puerta que señalas: se enciende y sube un poco. */
.tramo {
  transition: transform 260ms var(--ease-out);
}
.tramo.encendido {
  --c-sup: #f25a1f;
  --c-fr: #b83a0e;
  --c-la: #d9480f;
  transform: translateZ(calc((var(--z) + 8) * 1px));
}

.de-pie {
  position: absolute;
  transform-style: preserve-3d;
  transform: translateZ(calc(var(--z) * 1px));
}
.puerta,
.tu {
  position: absolute;
  display: block;
  transform-origin: bottom;
}
.puerta {
  width: 44px;
  height: 78px;
  transform: translateY(-78px) rotateX(-90deg);
  border: 3px solid var(--lumbre);
  border-bottom: 0;
  border-radius: 22px 22px 0 0;
  background: radial-gradient(circle at 50% 75%, rgb(255 150 112 / 0.9), rgb(242 90 31 / 0.25) 60%, transparent);
  box-shadow: 0 0 28px rgb(242 90 31 / 0.55);
}
.tu {
  width: 14px;
  height: 14px;
  transform: translateY(-14px) rotateX(-90deg) translateY(-6px);
  border-radius: 999px;
  background: #f2f2ef;
  box-shadow: 0 0 0 4px rgb(242 242 239 / 0.15);
}

/* Entrada: los tramos suben a su sitio, uno tras otro (una vez, al cargar). */
@media (prefers-reduced-motion: no-preference) {
  .tramo,
  .pilar {
    animation: subir 620ms var(--ease-out) backwards;
    animation-delay: calc(120ms + var(--i) * 70ms);
  }
  .puerta {
    animation: encender 700ms ease-out 620ms backwards;
  }
  @keyframes subir {
    from {
      opacity: 0;
      transform: translateZ(calc((var(--z) - 36) * 1px));
    }
  }
  @keyframes encender {
    from {
      opacity: 0;
      box-shadow: 0 0 0 rgb(242 90 31 / 0);
    }
  }
}
</style>
