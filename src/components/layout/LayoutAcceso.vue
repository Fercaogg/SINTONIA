<script setup lang="ts">
// Estructura de las pantallas de acceso: dos columnas en escritorio, con el
// panel azul marino a la izquierda (WW360 LoginView.vue), y solo el
// formulario en el móvil.
import { RouterLink } from 'vue-router'
import AppLogo from '@/components/comun/AppLogo.vue'
import BandaEntorno from '@/components/comun/BandaEntorno.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <BandaEntorno />
    <div class="flex-1 flex">
      <div class="hidden lg:flex w-1/2 bg-marino relative overflow-hidden items-center justify-center p-12">
        <div class="absolute inset-0" aria-hidden="true">
          <div class="absolute top-20 left-20 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl" />
          <div class="absolute bottom-20 right-20 w-80 h-80 bg-brand-400/10 rounded-full blur-3xl" />
        </div>
        <div class="relative max-w-md">
          <RouterLink to="/" class="text-3xl inline-block mb-8" aria-label="SINTONÍA, ir al inicio">
            <AppLogo variante="claro" />
          </RouterLink>
          <p class="font-display text-4xl font-semibold text-white mb-4 tracking-tight leading-tight">
            Dos miradas sobre el mismo trabajo
          </p>
          <p class="text-white/85 leading-relaxed">
            Un registro semanal muy breve de estudiante y tutor/a. Cuando las dos miradas no coinciden,
            SINTONÍA propone tres preguntas para la siguiente tutoría.
          </p>
          <div class="mt-10 flex gap-8">
            <div>
              <p class="font-display text-2xl font-semibold text-brand-400">1 minuto</p>
              <p class="text-xs text-white/80">a la semana</p>
            </div>
            <div>
              <p class="font-display text-2xl font-semibold text-brand-400">3 preguntas</p>
              <p class="text-xs text-white/80">para la tutoría</p>
            </div>
          </div>
        </div>
      </div>

      <main id="contenido" class="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div class="w-full max-w-md">
          <div class="lg:hidden mb-10 text-2xl">
            <RouterLink to="/" aria-label="SINTONÍA, ir al inicio"><AppLogo /></RouterLink>
          </div>
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
