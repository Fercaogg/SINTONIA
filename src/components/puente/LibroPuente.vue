<script setup lang="ts">
// Un volumen de la estantería de Puente al doctorado, en 3D (solo CSS).
// Lomo al frente, portada en el lado derecho y cantos de papel arriba.
// «fuera» lo saca de la estantería y lo gira para enseñar la portada.
import AppIcon from '@/components/comun/AppIcon.vue'
import type { EstiloLibro } from './libros'

defineProps<{ titulo: string; volumen: string; icono: string; estilo: EstiloLibro; fuera?: boolean }>()
</script>

<template>
  <span
    class="libro"
    :class="{ fuera }"
    :style="{
      '--tela': estilo.tela,
      '--tinta': estilo.tinta,
      '--filete': estilo.filete,
      '--g': `${estilo.grosor}px`,
      '--a': `${estilo.alto}px`,
    }"
  >
    <span class="cara lomo">
      <span class="vol">{{ volumen }}</span>
      <span class="titulo-lomo">{{ titulo }}</span>
      <AppIcon :name="icono" :size="16" class="icono-lomo" />
    </span>
    <span class="cara portada">
      <span class="vol">Vol. {{ volumen }}</span>
      <span class="titulo-portada">{{ titulo }}</span>
      <AppIcon :name="icono" :size="22" />
    </span>
    <span class="cara cantos" />
  </span>
</template>

<style scoped>
.libro {
  --p: 118px; /* fondo del libro */
  position: relative;
  display: block;
  width: var(--g);
  height: var(--a);
  transform-style: preserve-3d;
  transform-origin: 50% 100%;
  transition: transform 420ms var(--ease-out);
}
.cara {
  position: absolute;
  display: flex;
  backface-visibility: hidden;
}

/* Lomo: tela con un poco de textura y dos filetes arriba y abajo. */
.lomo {
  inset: 0;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0 12px;
  color: var(--tinta);
  background:
    linear-gradient(90deg, rgb(0 0 0 / 0.18), transparent 18%, rgb(255 255 255 / 0.08) 45%, transparent 60%, rgb(0 0 0 / 0.22)),
    repeating-linear-gradient(0deg, rgb(255 255 255 / 0.025) 0 2px, transparent 2px 4px),
    var(--tela);
  border-radius: 3px 3px 2px 2px;
  box-shadow:
    inset 0 10px 0 -8px var(--filete),
    inset 0 16px 0 -14px var(--filete),
    inset 0 -10px 0 -8px var(--filete),
    inset 0 -16px 0 -14px var(--filete);
}
.vol {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  margin-top: 8px;
}
.titulo-lomo {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-weight: 600;
  font-size: 0.875rem;
  letter-spacing: 0.01em;
  white-space: nowrap;
  line-height: 1;
}
.icono-lomo {
  margin-bottom: 8px;
  opacity: 0.85;
}

/* Portada: en el lado derecho, hacia el fondo. Se ve al girar el libro. */
.portada {
  top: 0;
  left: 100%;
  width: var(--p);
  height: 100%;
  transform-origin: left;
  transform: rotateY(90deg);
  flex-direction: column;
  justify-content: space-between;
  padding: 18px 16px;
  color: var(--tinta);
  background:
    linear-gradient(90deg, rgb(0 0 0 / 0.25), transparent 12%),
    var(--tela);
  border-radius: 0 4px 4px 0;
  box-shadow: inset 0 0 0 6px transparent, inset 0 0 0 7px var(--filete);
  /* Solo se ve con el libro fuera: de canto, entre lomos, ensucia. */
  opacity: 0;
  transition: opacity 200ms ease;
}
.libro.fuera .portada {
  opacity: 1;
}
.portada .vol {
  margin-top: 0;
}
.titulo-portada {
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.01em;
}

/* Cantos de las hojas, arriba. */
.cantos {
  top: 0;
  left: 2px;
  width: calc(var(--g) - 4px);
  height: var(--p);
  transform-origin: top;
  transform: rotateX(-90deg);
  background: repeating-linear-gradient(90deg, #f4efe4 0 1px, #e2dccd 1px 2px);
}

/* Fuera de la estantería: sale hacia ti, sube y gira para enseñar la portada. */
.libro.fuera {
  transform: translate3d(-6px, -16px, 120px) rotateY(-40deg);
}
@media (prefers-reduced-motion: reduce) {
  .libro {
    transition: none;
  }
  .libro.fuera {
    transform: translate3d(0, -10px, 0);
  }
}
</style>
