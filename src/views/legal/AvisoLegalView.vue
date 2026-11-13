<script setup lang="ts">
// Aviso legal: estructura completa; lo que falta, "En elaboración".
import LayoutPublico from '@/components/layout/LayoutPublico.vue'
import SeccionLegal from '@/components/comun/SeccionLegal.vue'
import { CORREO_CONTACTO } from '@/lib/publico'
</script>

<template>
  <LayoutPublico>
    <h1 class="titulo-pagina mb-10">Aviso legal</h1>

    <SeccionLegal id="titular" titulo="Titular" pendiente>
      <p>SINTONÍA es el prototipo del Trabajo Fin de Máster de Fernando Martín Vaquero, en el Máster en Estudios de la Ciencia, la Tecnología y la Innovación de la Universidad de Salamanca.</p>
      <p>Contacto: <a :href="`mailto:${CORREO_CONTACTO}`" class="enlace">{{ CORREO_CONTACTO }}</a></p>
    </SeccionLegal>

    <SeccionLegal id="objeto" titulo="Objeto">
      <p>SINTONÍA es un prototipo de investigación para acompañar el trabajo académico entre estudiante y tutor/a. Se usará en un estudio piloto en dos másteres de la Universidad de Salamanca.</p>
    </SeccionLegal>

    <SeccionLegal id="propiedad" titulo="Propiedad intelectual" pendiente />
    <SeccionLegal id="responsabilidad" titulo="Responsabilidad" pendiente />
    <SeccionLegal id="legislacion" titulo="Legislación aplicable" pendiente />
  </LayoutPublico>
</template>
