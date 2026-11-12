<script setup lang="ts">
// Estructura de las pantallas con sesión iniciada.
// Basada en WW360 AppLayout.vue (estudiante y tutor: menú blanco) y
// AdminLayout.vue (dirección e investigación: menú azul marino).
import { computed, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useSesion } from '@/stores/sesion'
import { NOMBRE_ROL, type Rol } from '@/lib/tipos'
import AppIcon from '@/components/comun/AppIcon.vue'
import AppLogo from '@/components/comun/AppLogo.vue'
import BandaEntorno from '@/components/comun/BandaEntorno.vue'

interface Enlace { to: string; label: string; icon: string; exact?: boolean }

const CUENTA: Enlace = { to: '/cuenta', label: 'Mi cuenta', icon: 'profile' }
const COMO: Enlace = { to: '/como-funciona', label: 'Cómo funciona y tus datos', icon: 'shield' }

const MENUS: Record<Rol, Enlace[]> = {
  estudiante: [
    { to: '/estudiante', label: 'Inicio', icon: 'home', exact: true },
    { to: '/estudiante/checkin', label: 'Check-in semanal', icon: 'checkin' },
    { to: '/estudiante/historial', label: 'Mi histórico', icon: 'history' },
    { to: '/estudiante/puente', label: 'Puente al doctorado', icon: 'graduation' },
    { to: '/estudiante/apoyo', label: 'Necesito apoyo', icon: 'heart' },
    CUENTA,
    COMO,
  ],
  tutor: [
    { to: '/tutor', label: 'Inicio', icon: 'home', exact: true },
    { to: '/tutor/checkin', label: 'Check-in semanal', icon: 'checkin' },
    { to: '/tutor/codigos', label: 'Códigos para tus estudiantes', icon: 'key' },
    CUENTA,
    COMO,
  ],
  direccion: [
    { to: '/direccion', label: 'Resumen del máster', icon: 'chart', exact: true },
    { to: '/direccion/avisos', label: 'Avisos de apoyo', icon: 'inbox' },
    CUENTA,
    COMO,
  ],
  investigador: [
    { to: '/investigacion', label: 'Másteres y códigos', icon: 'building', exact: true },
    { to: '/investigacion/calendario', label: 'Calendario del estudio', icon: 'calendar' },
    { to: '/investigacion/convocatorias', label: 'Convocatorias', icon: 'graduation' },
    { to: '/investigacion/cuestionarios', label: 'Cuestionarios', icon: 'document' },
    CUENTA,
    COMO,
  ],
}

const sesion = useSesion()
const route = useRoute()
const router = useRouter()
const menuAbierto = ref(false)

const rol = computed(() => sesion.perfil?.rol ?? 'estudiante')
const oscuro = computed(() => rol.value === 'direccion' || rol.value === 'investigador')
const enlaces = computed(() => (sesion.perfil?.retirado ? [CUENTA, COMO] : MENUS[rol.value]))

const iniciales = computed(() => {
  const n = sesion.perfil?.nombre || 'S'
  return n.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
})

function activo(e: Enlace) {
  return e.exact ? route.path === e.to : route.path.startsWith(e.to)
}

watch(() => route.fullPath, () => { menuAbierto.value = false })

async function salir() {
  await sesion.salir()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <a href="#contenido" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] btn-primary">Saltar al contenido</a>
    <BandaEntorno />

    <div class="flex flex-1">
      <div v-if="menuAbierto" class="fixed inset-0 bg-black/30 z-40 lg:hidden" aria-hidden="true" @click="menuAbierto = false" />

      <aside
        id="menu-lateral"
        class="fixed lg:sticky top-0 left-0 z-50 h-screen w-64 flex flex-col transition-transform duration-300 lg:translate-x-0"
        :class="[
          menuAbierto ? 'translate-x-0' : '-translate-x-full',
          oscuro ? 'bg-surface-900' : 'bg-white border-r border-surface-200/60',
        ]"
        aria-label="Menú principal"
        @keydown.esc="menuAbierto = false"
      >
        <div class="p-6 pb-4">
          <RouterLink to="/" class="text-xl inline-block" aria-label="SINTONÍA, ir al inicio">
            <AppLogo :variante="oscuro ? 'claro' : 'oscuro'" />
          </RouterLink>
          <p class="mt-2 text-xs font-medium" :class="oscuro ? 'text-white/80' : 'texto-suave'">
            {{ NOMBRE_ROL[rol] }}<template v-if="sesion.perfil?.master"> · {{ sesion.perfil.master.nombre }}</template>
          </p>
        </div>

        <nav class="flex-1 px-3 space-y-1 overflow-y-auto">
          <RouterLink
            v-for="e in enlaces"
            :key="e.to"
            :to="e.to"
            :class="[oscuro ? 'sidebar-link-oscuro' : 'sidebar-link', { active: activo(e) }]"
            :aria-current="activo(e) ? 'page' : undefined"
          >
            <AppIcon :name="e.icon" :size="18" />
            {{ e.label }}
          </RouterLink>
        </nav>

        <div class="p-4 border-t" :class="oscuro ? 'border-white/10' : 'border-surface-200/60'">
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
              :class="oscuro ? 'bg-white/15 text-white' : 'bg-brand-100 text-surface-900'"
              aria-hidden="true"
            >
              {{ iniciales }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold truncate" :class="oscuro ? 'text-white' : 'text-surface-900'">{{ sesion.perfil?.nombre }}</p>
              <p class="text-xs truncate" :class="oscuro ? 'text-white/80' : 'texto-suave'">{{ sesion.perfil?.email }}</p>
            </div>
          </div>
          <button
            type="button"
            :class="oscuro ? 'sidebar-link-oscuro w-full' : 'sidebar-link w-full !text-red-700 hover:!bg-red-50'"
            @click="salir"
          >
            <AppIcon name="logout" :size="18" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div class="flex-1 min-w-0">
        <header class="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-surface-200/60 px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            class="p-2 rounded-xl hover:bg-surface-100 min-h-tactil min-w-tactil flex items-center justify-center"
            :aria-expanded="menuAbierto"
            aria-controls="menu-lateral"
            aria-label="Abrir el menú"
            @click="menuAbierto = true"
          >
            <AppIcon name="menu" :size="22" />
          </button>
          <div class="flex-1 text-lg">
            <RouterLink to="/" aria-label="SINTONÍA, ir al inicio"><AppLogo /></RouterLink>
          </div>
        </header>

        <main id="contenido" class="p-4 lg:p-8 max-w-5xl mx-auto" tabindex="-1">
          <RouterView />
        </main>
      </div>
    </div>
  </div>
</template>
