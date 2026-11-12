<script setup lang="ts">
// Mensaje cuando el check-in no está abierto.
import { computed } from 'vue'
import type { Calendario } from '@/lib/tipos-checkin'
import { desdeApertura } from '@/lib/fechas'
import EstadoVacio from '@/components/comun/EstadoVacio.vue'

const props = defineProps<{ calendario: Calendario }>()

const contenido = computed(() => {
  const c = props.calendario
  switch (c.estado) {
    case 'sin_fecha':
      return { titulo: 'El estudio aún no ha empezado', texto: 'Cuando se abra la primera semana te avisaremos por correo.' }
    case 'antes':
      return { titulo: 'El estudio aún no ha empezado', texto: `La primera semana se abre el ${desdeApertura(c.abre!)}.` }
    case 'entre':
      return { titulo: `La semana ${c.semana} ya se ha cerrado`, texto: `La semana ${c.proxima} se abre el ${desdeApertura(c.abre!)}.` }
    case 'terminado':
      return { titulo: 'El estudio ha terminado', texto: 'Gracias por participar.' }
    default:
      return { titulo: '', texto: '' }
  }
})
</script>

<template>
  <EstadoVacio icono="calendar" :titulo="contenido.titulo" :texto="contenido.texto" />
</template>
