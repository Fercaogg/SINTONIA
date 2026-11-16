<script setup lang="ts">
// Primer enlace de cada página: solo aparece al llegar con el tabulador y
// lleva directamente al contenido, sin recorrer la cabecera (WCAG 2.4.1).
import { useIdioma } from '@/lib/idioma'
const { t } = useIdioma()

function saltar(e: MouseEvent) {
  const destino = document.getElementById('contenido')
  if (!destino) return
  e.preventDefault()
  destino.focus()
  destino.scrollIntoView()
}
</script>

<template>
  <a href="#contenido" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:px-5 focus:py-2.5 btn-primary" @click="saltar">
    {{ t('Saltar al contenido', 'Skip to content') }}
  </a>
</template>
