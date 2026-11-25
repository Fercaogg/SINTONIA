<script setup lang="ts">
// Cabecera común de todas las páginas públicas, como la de LUMBRA360:
// transparente arriba; al bajar, fondo difuminado y filete. Logotipo,
// secciones de la portada, idioma, «Iniciar sesión» discreto y un único botón
// destacado. En la portada los enlaces son anclas; en las demás páginas llevan
// a la sección de la portada.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useSesion } from '@/stores/sesion'
import { INICIO_ROL } from '@/lib/tipos'
import { modoDemo } from '@/lib/supabase'
import { useIdioma } from '@/lib/idioma'
import AppLogo from '@/components/comun/AppLogo.vue'
import AppIcon from '@/components/comun/AppIcon.vue'
import SelectorIdioma from '@/components/comun/SelectorIdioma.vue'

const props = withDefaults(defineProps<{ enPortada?: boolean }>(), { enPortada: false })

const sesion = useSesion()
const route = useRoute()
const { t, ruta, idioma } = useIdioma()
const menuAbierto = ref(false)
const plegada = ref(false)

const SECCIONES = computed(() => [
  { id: 'como-funciona', texto: t('Cómo funciona', 'How it works') },
  { id: 'privacidad', texto: t('Privacidad', 'Privacy') },
  { id: 'perfiles', texto: t('Perfiles', 'Profiles') },
  { id: 'puente', texto: t('Puente', 'Bridge') },
  { id: 'respaldo', texto: t('Respaldo', 'Backing') },
  { id: 'preguntas', texto: t('Preguntas', 'FAQ') },
  { id: 'contacto', texto: t('Contacto', 'Contact') },
])
const destino = (id: string) => (props.enPortada ? `#${id}` : `${ruta('/')}#${id}`.replace('//#', '/#'))

let marco = 0
function medir() {
  marco = 0
  plegada.value = window.scrollY > 8
}
const alDesplazar = () => {
  if (!marco) marco = requestAnimationFrame(medir)
}
onMounted(() => {
  window.addEventListener('scroll', alDesplazar, { passive: true })
  medir()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', alDesplazar)
  cancelAnimationFrame(marco)
})
watch(() => route.fullPath, () => (menuAbierto.value = false))
</script>

<template>
  <header class="cabecera sticky top-0 z-30" :data-plegada="plegada || menuAbierto">
    <div class="max-w-[1264px] mx-auto px-6 sm:px-8 h-16 flex items-center justify-between gap-6">
      <RouterLink :to="ruta('/')" class="text-xl rounded-md py-2" :aria-label="t('SINTONÍA, inicio', 'SINTONÍA, home')"><AppLogo /></RouterLink>
      <nav :aria-label="t('Secciones', 'Sections')" class="hidden lg:block">
        <ul class="flex items-center gap-7">
          <li v-for="s in SECCIONES" :key="s.id">
            <a :href="destino(s.id)" class="enlace-nav">{{ s.texto }}</a>
          </li>
        </ul>
      </nav>
      <div class="flex items-center gap-2">
        <SelectorIdioma />
        <RouterLink v-if="sesion.rol" :to="INICIO_ROL[sesion.rol]" class="btn-primary min-h-10 px-5 text-sm">{{ t('Ir a mi panel', 'My dashboard') }}</RouterLink>
        <template v-else>
          <!-- «Iniciar sesión» es para quien ya tiene cuenta: discreto. El botón destacado es el código o la demo. -->
          <span class="hidden sm:contents"><RouterLink to="/acceso" class="enlace-nav font-medium" :lang="idioma === 'en' ? 'es' : undefined">{{ t('Iniciar sesión', 'Sign in') }}</RouterLink></span>
          <a v-if="modoDemo" :href="destino('entrar')" class="btn-primary min-h-10 px-5 text-sm hidden sm:inline-flex">{{ t('Probar', 'Try it') }}</a>
          <RouterLink v-else to="/registro" class="btn-primary min-h-10 px-5 text-sm hidden sm:inline-flex">{{ t('Tengo un código', 'I have a code') }}</RouterLink>
        </template>
        <button
          type="button"
          class="lg:hidden min-w-tactil min-h-tactil inline-flex items-center justify-center rounded-full text-surface-900 hover:bg-surface-100"
          :aria-expanded="menuAbierto"
          aria-controls="menu-secciones"
          @click="menuAbierto = !menuAbierto"
        >
          <AppIcon :name="menuAbierto ? 'close' : 'menu'" :size="22" :etiqueta="menuAbierto ? t('Cerrar las secciones', 'Close sections') : t('Abrir las secciones', 'Open sections')" />
        </button>
      </div>
    </div>
    <nav v-show="menuAbierto" id="menu-secciones" :aria-label="t('Secciones', 'Sections')" class="lg:hidden border-t border-surface-200">
      <ul class="max-w-[1264px] mx-auto px-6 py-2 grid grid-cols-2 gap-1 text-sm">
        <li v-for="s in SECCIONES" :key="s.id">
          <a :href="destino(s.id)" class="px-2 min-h-tactil flex items-center rounded-md text-surface-900 hover:bg-surface-100" @click="menuAbierto = false">{{ s.texto }}</a>
        </li>
        <li v-if="!sesion.rol" class="sm:hidden col-span-2 flex items-center gap-3 border-t border-surface-200 pt-2 mt-1">
          <RouterLink to="/acceso" class="px-2 min-h-tactil flex items-center rounded-md text-surface-900 hover:bg-surface-100" :lang="idioma === 'en' ? 'es' : undefined">{{ t('Iniciar sesión', 'Sign in') }}</RouterLink>
          <RouterLink v-if="!modoDemo" to="/registro" class="btn-primary min-h-10 px-5 text-sm ml-auto">{{ t('Tengo un código', 'I have a code') }}</RouterLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.cabecera {
  background: transparent;
  border-bottom: 1px solid transparent;
  transition: background-color 240ms var(--ease-out), border-color 240ms var(--ease-out);
}
.cabecera[data-plegada='true'] {
  background: color-mix(in srgb, rgb(var(--rgb-s50)) 88%, transparent);
  border-bottom-color: rgb(var(--rgb-s200));
  backdrop-filter: blur(14px) saturate(1.3);
  -webkit-backdrop-filter: blur(14px) saturate(1.3);
}
.enlace-nav {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  white-space: nowrap;
  font-size: 0.875rem;
  color: rgb(var(--rgb-s600));
  text-decoration: none;
  transition: color var(--dur-micro) ease;
}
.enlace-nav:hover {
  color: rgb(var(--rgb-s900));
}
</style>
