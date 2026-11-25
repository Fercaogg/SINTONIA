<script setup lang="ts">
// Pie de las páginas públicas, con la estructura del de LUMBRA360: logotipo y
// descripción a la izquierda, columnas de enlaces y una barra inferior con la
// autoría y la versión.
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppLogo from '@/components/comun/AppLogo.vue'
import { useIdioma } from '@/lib/idioma'
import { AUTORIA, AUTORIA_EN, CORREO_CONTACTO, VERSION } from '@/lib/publico'

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
  <footer class="border-t border-surface-200 bg-surface-50">
    <div class="max-w-[1264px] mx-auto px-6 sm:px-8 grid grid-cols-2 gap-x-8 gap-y-12 py-16 sm:py-20 lg:grid-cols-12">
      <div class="col-span-2 flex flex-col gap-4 lg:col-span-6">
        <RouterLink :to="ruta('/')" class="self-start rounded-md text-xl" :aria-label="t('SINTONÍA, inicio', 'SINTONÍA, home')"><AppLogo /></RouterLink>
        <p class="max-w-[24rem] text-sm texto-suave">
          {{ t('Registro semanal de estudiante y tutor/a para acompañar trabajos académicos sin vigilar.', 'A weekly check-in for student and supervisor to support academic work without surveillance.') }}
        </p>
        <p class="text-sm texto-suave">
          {{ t('Contacto', 'Contact') }}: <a :href="`mailto:${CORREO_CONTACTO}`" class="enlace">{{ CORREO_CONTACTO }}</a>
        </p>
      </div>
      <nav :aria-label="t('Información del proyecto', 'Project information')" class="contents">
        <div v-for="g in GRUPOS" :key="g.titulo" class="flex flex-col gap-2 lg:col-span-2" :class="g.titulo === GRUPOS[0].titulo ? 'col-span-2 sm:col-span-1' : ''">
          <h2 class="text-sm font-semibold text-surface-900">{{ g.titulo }}</h2>
          <ul class="flex flex-col">
            <li v-for="e in g.enlaces" :key="e.to">
              <RouterLink :to="ruta(e.to)" class="pie-enlace" :hreflang="soloEnEspanol(e.to) ? 'es' : undefined"
                >{{ e.texto }}<span v-if="soloEnEspanol(e.to)"> (in Spanish)</span></RouterLink
              >
            </li>
          </ul>
        </div>
      </nav>
    </div>
    <div class="max-w-[1264px] mx-auto px-6 sm:px-8">
      <div class="flex flex-col gap-2 border-t border-surface-200 py-6 text-xs texto-suave sm:flex-row sm:justify-between">
        <p>{{ t(AUTORIA, AUTORIA_EN) }}.</p>
        <p class="flex gap-x-4"><span>{{ t('Versión', 'Version') }} {{ VERSION }}</span><span>© SINTONÍA</span></p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.pie-enlace {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  font-size: 0.875rem;
  color: rgb(var(--rgb-s600));
  text-decoration: none;
  transition: color var(--dur-micro) ease;
}
.pie-enlace:hover {
  color: rgb(var(--rgb-s900));
}
</style>
