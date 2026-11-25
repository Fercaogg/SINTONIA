<script setup lang="ts">
// Pie de las páginas públicas: enlaces legales, autoría y versión.
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useIdioma } from '@/lib/idioma'
import BotonWhatsApp from '@/components/comun/BotonWhatsApp.vue'
import { AUTORIA, AUTORIA_EN, CORREO_CONTACTO, VERSION, WHATSAPP } from '@/lib/publico'

const { t, ruta, soloEnEspanol } = useIdioma()

const GRUPOS = computed(() => [
  {
    titulo: t('Proyecto', 'Project'),
    enlaces: [
      { to: '/investigacion', texto: t('La investigación', 'The research') },
      { to: '/instituciones', texto: t('Para instituciones', 'For institutions') },
      { to: '/participantes', texto: t('Kit para participantes', "Participants' kit") },
      { to: '/hoja-de-ruta', texto: t('Hoja de ruta', 'Roadmap') },
      { to: '/novedades', texto: t('Novedades', 'Changelog') },
      { to: '/#preguntas', texto: t('Preguntas frecuentes', 'FAQ') },
      { to: '/#contacto', texto: t('Contacto', 'Contact') },
    ],
  },
  {
    titulo: t('Confianza', 'Trust'),
    enlaces: [
      { to: '/como-funciona', texto: t('Cómo funciona y tus datos', 'How it works and your data') },
      { to: '/seguridad', texto: t('Seguridad', 'Security') },
      { to: '/accesibilidad', texto: t('Accesibilidad', 'Accessibility') },
      { to: '/estado', texto: t('Estado de la plataforma', 'Platform status') },
    ],
  },
  {
    titulo: t('Legal', 'Legal'),
    enlaces: [
      { to: '/privacidad', texto: t('Privacidad', 'Privacy') },
      { to: '/aviso-legal', texto: t('Aviso legal', 'Legal notice') },
      { to: '/cookies', texto: t('Cookies', 'Cookies') },
      { to: '/consentimiento', texto: t('Consentimiento', 'Consent') },
    ],
  },
])
</script>

<template>
  <footer class="border-t border-surface-200 bg-surface-100">
    <div class="max-w-[1100px] mx-auto px-4 sm:px-6 pt-10 grid gap-8 lg:grid-cols-[1fr_auto] text-sm" :class="WHATSAPP ? 'pb-24' : 'pb-10'">
      <div class="space-y-2">
        <p class="text-surface-900 font-medium">{{ t(AUTORIA, AUTORIA_EN) }}</p>
        <p class="texto-suave">{{ t('Contacto', 'Contact') }}: <a :href="`mailto:${CORREO_CONTACTO}`" class="enlace">{{ CORREO_CONTACTO }}</a></p>
        <p class="texto-suave">{{ t('Versión', 'Version') }} {{ VERSION }}</p>
      </div>
      <nav :aria-label="t('Información del proyecto', 'Project information')" class="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
        <div v-for="g in GRUPOS" :key="g.titulo">
          <h2 class="text-sm font-semibold text-surface-900">{{ g.titulo }}</h2>
          <ul class="mt-1">
            <li v-for="e in g.enlaces" :key="e.to">
              <RouterLink :to="ruta(e.to)" class="enlace-pie inline-flex items-center min-h-tactil" :hreflang="soloEnEspanol(e.to) ? 'es' : undefined"
                >{{ e.texto }}<span v-if="soloEnEspanol(e.to)" class="texto-suave"> (in Spanish)</span></RouterLink
              >
            </li>
          </ul>
        </div>
      </nav>
    </div>
    <BotonWhatsApp />
  </footer>
</template>
