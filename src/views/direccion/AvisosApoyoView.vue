<script setup lang="ts">
import { RouterLink } from 'vue-router'
// Avisos de "Necesito apoyo" para la dirección del máster.
// Solo aparece el nombre si el estudiante lo ha autorizado.
import { ref } from 'vue'
import { llamar, mensajeDeError } from '@/lib/api'
import { useCarga } from '@/lib/usar-carga'
import { fechaLarga, horaDe } from '@/lib/fechas'
import AppIcon from '@/components/comun/AppIcon.vue'
import AvisoError from '@/components/comun/AvisoError.vue'
import EstadoCarga from '@/components/comun/EstadoCarga.vue'
import EstadoVacio from '@/components/comun/EstadoVacio.vue'

interface Aviso { id: string; created_at: string; nombre: string | null; atendido_at: string | null }

const avisos = ref<Aviso[]>([])

async function cargar() {
  avisos.value = await llamar('avisos_apoyo_direccion')
}

const { cargando, error, falloCarga, cargar: recargar } = useCarga(async () => {
  await cargar()
})

async function atender(id: string) {
  try {
    await llamar('marcar_aviso_atendido', { p_id: id })
    await cargar()
  } catch (e) {
    error.value = mensajeDeError(e)
  }
}
</script>

<template>
  <div class="fade-in max-w-2xl">
    <h1 class="titulo-pagina">Avisos de apoyo</h1>
    <p class="texto-suave mt-1 mb-8">
      Un estudiante solo envía un aviso si pulsa "Necesito apoyo". Su nombre aparece únicamente si ha decidido compartirlo.
    </p>

    <EstadoCarga v-if="cargando" />
    <template v-else>
      <AvisoError v-if="error" :mensaje="error" :reintentar="falloCarga ? recargar : undefined" class="mb-6" />
      <EstadoVacio v-if="!avisos.length" icono="inbox" titulo="No hay avisos" texto="Cuando un estudiante pida apoyo, lo verás aquí." />
      <ul v-else class="space-y-3">
        <li v-for="a in avisos" :key="a.id" class="card p-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div class="flex-1">
            <p class="font-semibold text-surface-900">{{ a.nombre ?? 'Sin nombre' }}</p>
            <p class="text-sm texto-suave">
              {{ fechaLarga(a.created_at) }}, {{ horaDe(a.created_at) }}
              <template v-if="!a.nombre"> · el estudiante no ha querido compartir su nombre</template>
            </p>
          </div>
          <span v-if="a.atendido_at" class="badge badge-green self-start sm:self-center"><AppIcon name="check" :size="12" /> Atendido</span>
          <button v-else type="button" class="btn-secondary text-sm" @click="atender(a.id)">Marcar como atendido</button>
        </li>
      </ul>
      <p class="mt-8 text-sm">
        <RouterLink to="/como-funciona" class="enlace inline-flex items-center min-h-tactil">Cómo funcionan los avisos y qué datos se comparten</RouterLink>
      </p>
    </template>
  </div>
</template>
