<script setup lang="ts">
// Inicio del estudiante. El check-in semanal se añade en la siguiente fase.
import { useSesion } from '@/stores/sesion'
import EstadoVacio from '@/components/comun/EstadoVacio.vue'

const sesion = useSesion()
</script>

<template>
  <div class="fade-in max-w-2xl">
    <h1 class="titulo-pagina">Hola, {{ sesion.perfil?.nombre?.split(' ')[0] }}</h1>
    <p class="texto-suave mt-1 mb-8">Aquí harás tu check-in semanal. Te llevará alrededor de un minuto.</p>
    <EstadoVacio icono="calendar" titulo="El estudio aún no ha empezado" texto="Cuando se abra la primera semana te avisaremos por correo." />
  </div>
</template>
