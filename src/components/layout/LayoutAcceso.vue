<script setup lang="ts">
import SaltarContenido from '@/components/layout/SaltarContenido.vue'
// Estructura de las pantallas de acceso: dos columnas en escritorio, con el
// panel de tinta a la izquierda (WW360 LoginView.vue), y solo el
// formulario en el móvil.
import { RouterLink } from 'vue-router'
import AppLogo from '@/components/comun/AppLogo.vue'
import BandaEntorno from '@/components/comun/BandaEntorno.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <SaltarContenido />
    <BandaEntorno />
    <div class="flex-1 flex">
      <div class="hidden lg:flex w-1/2 bg-marino relative overflow-hidden items-center justify-center p-12">
        <div class="relative max-w-md">
          <RouterLink to="/" class="text-3xl inline-block mb-8" aria-label="SINTONÍA, ir al inicio">
            <AppLogo variante="claro" />
          </RouterLink>
          <p class="font-display text-[2.75rem] font-normal text-white mb-5 tracking-tight leading-[1.02]">
            Dos miradas sobre el mismo trabajo
          </p>
          <p class="text-white/85 leading-relaxed">
            Un registro semanal muy breve de estudiante y tutor/a. Cuando las dos miradas no coinciden,
            SINTONÍA propone tres preguntas para la siguiente tutoría.
          </p>
          <div class="mt-10 flex gap-8">
            <div>
              <p class="font-display text-2xl font-medium text-white">1 minuto</p>
              <p class="font-mono text-xs uppercase tracking-[0.14em] text-brand-400 mt-1">a la semana</p>
            </div>
            <div>
              <p class="font-display text-2xl font-medium text-white">3 preguntas</p>
              <p class="font-mono text-xs uppercase tracking-[0.14em] text-brand-400 mt-1">para la tutoría</p>
            </div>
          </div>
          <p class="mt-14 border-t border-white/15 pt-6 text-sm text-white/70">
            Con el aval de la Universidad de Salamanca y de su Fundación General.
          </p>
        </div>
      </div>

      <main id="contenido" tabindex="-1" class="outline-none flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
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
