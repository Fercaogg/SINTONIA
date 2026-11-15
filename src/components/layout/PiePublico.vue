<script setup lang="ts">
// Pie de las páginas públicas: enlaces legales, autoría y versión.
import { RouterLink } from 'vue-router'
import { AUTORIA, CORREO_CONTACTO, VERSION } from '@/lib/publico'

const GRUPOS = [
  {
    titulo: 'Proyecto',
    enlaces: [
      { to: '/investigacion', texto: 'La investigación' },
      { to: '/instituciones', texto: 'Para instituciones' },
      { to: '/participantes', texto: 'Kit para participantes' },
      { to: '/hoja-de-ruta', texto: 'Hoja de ruta' },
      { to: '/novedades', texto: 'Novedades' },
      { to: '/#preguntas', texto: 'Preguntas frecuentes' },
      { to: '/#contacto', texto: 'Contacto' },
    ],
  },
  {
    titulo: 'Confianza',
    enlaces: [
      { to: '/como-funciona', texto: 'Cómo funciona y tus datos' },
      { to: '/seguridad', texto: 'Seguridad' },
      { to: '/accesibilidad', texto: 'Accesibilidad' },
      { to: '/estado', texto: 'Estado de la plataforma' },
    ],
  },
  {
    titulo: 'Legal',
    enlaces: [
      { to: '/privacidad', texto: 'Privacidad' },
      { to: '/aviso-legal', texto: 'Aviso legal' },
      { to: '/cookies', texto: 'Cookies' },
      { to: '/consentimiento', texto: 'Consentimiento' },
    ],
  },
]
</script>

<template>
  <footer class="border-t border-surface-200 bg-papel">
    <div class="max-w-[1100px] mx-auto px-4 sm:px-6 py-10 grid gap-8 lg:grid-cols-[1fr_auto] text-sm">
      <div class="space-y-2">
        <p class="text-surface-900 font-medium">{{ AUTORIA }}</p>
        <p class="texto-suave">Contacto: <a :href="`mailto:${CORREO_CONTACTO}`" class="enlace">{{ CORREO_CONTACTO }}</a></p>
        <p class="texto-suave">Versión {{ VERSION }}</p>
      </div>
      <nav aria-label="Información del proyecto" class="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
        <div v-for="g in GRUPOS" :key="g.titulo">
          <h2 class="text-xs font-semibold uppercase tracking-[0.14em] text-surface-800">{{ g.titulo }}</h2>
          <ul class="mt-1">
            <li v-for="e in g.enlaces" :key="e.to">
              <RouterLink :to="e.to" class="enlace inline-flex items-center min-h-tactil">{{ e.texto }}</RouterLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </footer>
</template>
