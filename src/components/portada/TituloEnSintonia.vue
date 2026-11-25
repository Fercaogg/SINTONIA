<script setup lang="ts">
// Segundo momento de la portada (cierre): el titular llega en dos copias,
// verde y azul, separadas como las dos miradas, y al verse se funden en una.
// Una sola vez, solo transform y opacity; con "reducir movimiento" se ve
// directamente unido. El texto real está una sola vez (las copias son
// decorativas y quedan ocultas a los lectores de pantalla).
import { ref } from 'vue'
import { useVisibleUnaVez } from '@/lib/movimiento'

defineProps<{ texto: string; id: string }>()
const raiz = ref<HTMLElement | null>(null)
const unido = useVisibleUnaVez(raiz)
</script>

<template>
  <h2 :id="id" ref="raiz" class="titulo-sintonia" :data-unido="unido">
    <span class="capa capa-verde" aria-hidden="true">{{ texto }}</span>
    <span class="capa capa-tutor" aria-hidden="true">{{ texto }}</span>
    <span class="texto-real">{{ texto }}</span>
  </h2>
</template>

<style scoped>
.titulo-sintonia {
  position: relative;
  display: inline-grid;
}
.titulo-sintonia > * {
  grid-area: 1 / 1;
}
.capa,
.texto-real {
  transition: transform 900ms var(--ease-in-out), opacity 700ms var(--ease-out);
}
.capa-verde {
  /* Lumbre como texto (lumbre 600): contraste suficiente también mientras llega. */
  color: var(--color-lumbre-texto);
  transform: translate(-0.35em, -0.12em);
}
.capa-tutor {
  color: rgb(var(--rgb-s900));
  transform: translate(0.35em, 0.12em);
}
@media (prefers-color-scheme: dark) {
  .capa-verde {
    color: var(--color-primary);
  }
}
.texto-real {
  opacity: 0;
}
.titulo-sintonia[data-unido='true'] .capa {
  transform: none;
  opacity: 0;
}
.titulo-sintonia[data-unido='true'] .texto-real {
  opacity: 1;
  transition-delay: 450ms;
}
@media (prefers-reduced-motion: reduce) {
  .capa {
    display: none;
  }
  .texto-real {
    opacity: 1;
    transition: none;
  }
}
</style>
