<script setup lang="ts">
// Estantería de Puente al doctorado: un volumen por puerta y, al final,
// apoyado y en blanco, «Tu tesis», el libro que aún no está escrito.
//
// Los libros se pueden pulsar con el ratón o el dedo, pero son una
// ilustración: para el teclado y los lectores de pantalla, la navegación es
// el índice que hay debajo (PuenteView), con la misma información y más.
import { useRouter } from 'vue-router'
import { PUERTAS } from '@/contenido/puente'
import LibroPuente from './LibroPuente.vue'
import { ESTILOS, VOLUMENES } from './libros'

defineProps<{ activa: number | null }>()
const emit = defineEmits<{ señalar: [indice: number | null] }>()
const router = useRouter()

</script>

<template>
  <div class="estanteria" aria-hidden="true" @pointerleave="emit('señalar', null)">
    <div class="fila">
      <a
        v-for="(p, i) in PUERTAS"
        :key="p.clave"
        :href="`/estudiante/puente/${p.clave}`"
        tabindex="-1"
        class="hueco"
        :style="{ '--i': i }"
        @pointerenter="emit('señalar', i)"
        @click.prevent="router.push(`/estudiante/puente/${p.clave}`)"
      >
        <LibroPuente :titulo="p.titulo" :volumen="VOLUMENES[i]" :icono="p.icono" :estilo="ESTILOS[p.clave]" :fuera="activa === i" />
      </a>
      <!-- Tu tesis: en blanco, apoyada en el último volumen. -->
      <span class="tesis">
        <span class="tesis-libro">
          <span class="tesis-titulo">Tu tesis</span>
        </span>
      </span>
    </div>
    <div class="balda" />
  </div>
</template>

<style scoped>
.estanteria {
  position: relative;
  perspective: 1100px;
  perspective-origin: 50% -20%;
  padding-top: 40px;
}
.fila {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
  transform-style: preserve-3d;
  padding: 0 8px;
}
.hueco {
  display: block;
  transform-style: preserve-3d;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

/* Tu tesis: un volumen sin escribir, inclinado, con el filo de lumbre. */
.tesis {
  display: block;
  margin-left: 40px;
  transform-origin: 0 100%;
  transform: rotate(-12deg);
}
.tesis-libro {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 214px;
  border: 1.5px dashed rgb(var(--rgb-b500));
  border-radius: 3px;
  background: repeating-linear-gradient(0deg, rgb(var(--rgb-b500) / 0.06) 0 1px, transparent 1px 10px);
}
.tesis-titulo {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-lumbre-texto);
  letter-spacing: 0.02em;
}

/* La balda: madera clara de piedra con canto y sombra. */
.balda {
  position: relative;
  height: 16px;
  margin: 0 -4px;
  border-radius: 3px;
  background: linear-gradient(180deg, rgb(var(--rgb-s300)) 0 5px, rgb(var(--rgb-s200)) 5px);
  box-shadow: 0 18px 30px -12px rgb(0 0 0 / 0.35);
}

/* Entrada: los volúmenes se colocan uno tras otro (una vez, al cargar). */
@media (prefers-reduced-motion: no-preference) {
  .hueco {
    animation: colocar 520ms var(--ease-out) backwards;
    animation-delay: calc(120ms + var(--i) * 60ms);
  }
  .tesis {
    animation: apoyar 700ms var(--ease-out) 600ms backwards;
  }
  @keyframes colocar {
    from {
      opacity: 0;
      transform: translateY(-18px);
    }
  }
  @keyframes apoyar {
    from {
      opacity: 0;
      transform: rotate(0deg);
    }
  }
}

/* En el móvil, volúmenes más finos y sin la tesis (no cabe con aire). */
@media (max-width: 639px) {
  .fila {
    gap: 2px;
    padding: 0;
  }
  .hueco :deep(.libro) {
    width: calc(var(--g) * 0.78);
    height: calc(var(--a) * 0.82);
  }
  .tesis {
    display: none;
  }
}
</style>
