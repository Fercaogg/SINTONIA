<script setup lang="ts">
// Página de entrada. Sin tono comercial: explica qué es y deja entrar.
import { RouterLink } from 'vue-router'
import { useSesion } from '@/stores/sesion'
import { INICIO_ROL } from '@/lib/tipos'
import AppLogo from '@/components/comun/AppLogo.vue'
import AppIcon from '@/components/comun/AppIcon.vue'
import BandaEntorno from '@/components/comun/BandaEntorno.vue'

const sesion = useSesion()

const pasos = [
  { icono: 'checkin', titulo: 'Un minuto a la semana', texto: 'Estudiante y tutor/a responden por separado unas pocas preguntas sobre cómo avanza el trabajo.' },
  { icono: 'compare', titulo: 'Dos miradas', texto: 'SINTONÍA compara las respuestas con reglas sencillas y públicas. No hay notas ni rankings.' },
  { icono: 'chat', titulo: 'Tres preguntas para la tutoría', texto: 'Si las miradas no coinciden, ambos reciben las mismas tres preguntas neutras para hablarlo.' },
]
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <BandaEntorno />
    <header class="bg-surface-50/90 backdrop-blur-md border-b border-surface-200">
      <div class="max-w-[1100px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <RouterLink to="/" class="text-xl" aria-label="SINTONÍA, inicio"><AppLogo /></RouterLink>
        <nav class="flex items-center gap-2 sm:gap-3" aria-label="Acceso">
          <RouterLink v-if="sesion.rol" :to="INICIO_ROL[sesion.rol]" class="btn-primary text-sm">Ir a mi panel</RouterLink>
          <template v-else>
            <RouterLink to="/acceso" class="btn-secondary text-sm">Iniciar sesión</RouterLink>
            <RouterLink to="/registro" class="btn-primary text-sm">Registrarme</RouterLink>
          </template>
        </nav>
      </div>
    </header>

    <main id="contenido" class="flex-1">
      <section class="relative overflow-hidden py-16 sm:py-24">
        <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div class="absolute top-16 left-10 w-72 h-72 bg-brand-400/20 rounded-full blur-3xl" />
          <div class="absolute bottom-0 right-10 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        </div>
        <div class="relative max-w-[900px] mx-auto px-4 sm:px-6 text-center">
          <h1 class="font-display text-4xl sm:text-5xl font-bold text-surface-900 mb-6 leading-tight slide-up">
            Acompañar el trabajo académico,<br />
            <span class="text-brand-900">sin vigilar</span>
          </h1>
          <p class="text-lg sm:text-xl max-w-2xl mx-auto mb-10 texto-suave slide-up">
            Un registro semanal muy breve de estudiante y tutor/a para que las tutorías empiecen por lo que importa.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
            <RouterLink to="/registro" class="btn-primary px-6 py-3">Tengo un código</RouterLink>
            <RouterLink to="/como-funciona" class="btn-secondary px-6 py-3">Cómo funciona y tus datos</RouterLink>
          </div>
        </div>
      </section>

      <section class="max-w-[1100px] mx-auto px-4 sm:px-6 pb-20" aria-labelledby="como">
        <h2 id="como" class="sr-only">Cómo funciona</h2>
        <ol class="grid gap-4 sm:grid-cols-3">
          <li v-for="(p, i) in pasos" :key="p.titulo" class="card p-6">
            <div class="w-11 h-11 rounded-xl bg-brand-100 flex items-center justify-center mb-4">
              <AppIcon :name="p.icono" :size="22" class="text-surface-900" />
            </div>
            <p class="text-xs font-medium uppercase tracking-wider texto-suave mb-1">Paso {{ i + 1 }}</p>
            <h3 class="font-semibold text-surface-900 mb-2">{{ p.titulo }}</h3>
            <p class="text-sm texto-suave leading-relaxed">{{ p.texto }}</p>
          </li>
        </ol>
      </section>
    </main>

    <footer class="border-t border-surface-200 py-6 px-4 text-center text-sm texto-suave">
      Prototipo del Trabajo Fin de Máster de Fernando Martín Vaquero · Universidad de Salamanca ·
      <RouterLink to="/como-funciona" class="enlace">Privacidad</RouterLink>
    </footer>
  </div>
</template>
