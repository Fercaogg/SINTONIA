<script setup lang="ts">
// Pie de las páginas públicas: enlaces legales, autoría y versión.
import { RouterLink } from 'vue-router'
import { AUTORIA, CORREO_CONTACTO, VERSION } from '@/lib/publico'

const ENLACES = [
  { to: '/investigacion', texto: 'La investigación' },
  { to: '/#preguntas', texto: 'Preguntas frecuentes' },
  { to: '/#contacto', texto: 'Contacto' },
  { to: '/como-funciona', texto: 'Cómo funciona y tus datos' },
  { to: '/privacidad', texto: 'Privacidad' },
  { to: '/aviso-legal', texto: 'Aviso legal' },
  { to: '/cookies', texto: 'Cookies' },
  { to: '/consentimiento', texto: 'Consentimiento' },
]
</script>

<template>
  <footer class="border-t border-surface-200 bg-papel">
    <div class="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 grid gap-6 sm:grid-cols-[1fr_auto] text-sm">
      <div class="space-y-2">
        <p class="text-surface-900 font-medium">{{ AUTORIA }}</p>
        <p class="texto-suave">Contacto: <a :href="`mailto:${CORREO_CONTACTO}`" class="enlace">{{ CORREO_CONTACTO }}</a></p>
        <p class="texto-suave">Versión {{ VERSION }}</p>
      </div>
      <nav aria-label="Información legal">
        <ul class="flex flex-wrap gap-x-4 sm:flex-col sm:items-end">
          <li v-for="e in ENLACES" :key="e.to">
            <RouterLink :to="e.to" class="enlace inline-flex items-center min-h-tactil">{{ e.texto }}</RouterLink>
          </li>
        </ul>
      </nav>
    </div>
  </footer>
</template>
