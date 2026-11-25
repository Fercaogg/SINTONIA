<script setup lang="ts">
import SaltarContenido from '@/components/layout/SaltarContenido.vue'
// Estructura de las pantallas con sesión iniciada.
// Basada en WW360 AppLayout.vue (estudiante y tutor: menú blanco) y
// AdminLayout.vue (dirección e investigación: menú azul marino).
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useSesion } from '@/stores/sesion'
import { NOMBRE_ROL, type Rol } from '@/lib/tipos'
import { useTerminos } from '@/lib/terminos'
import AppIcon from '@/components/comun/AppIcon.vue'
import AppLogo from '@/components/comun/AppLogo.vue'
import BandaEntorno from '@/components/comun/BandaEntorno.vue'
import AvisoError from '@/components/comun/AvisoError.vue'

interface Enlace { to: string; label: string; icon: string; exact?: boolean }

const CUENTA: Enlace = { to: '/cuenta', label: 'Mi cuenta', icon: 'profile' }
const CALENDARIO: Enlace = { to: '/calendario', label: 'Calendario', icon: 'calendar' }
const COMO: Enlace = { to: '/como-funciona', label: 'Cómo funciona y tus datos', icon: 'shield' }

const MENUS: Record<Rol, Enlace[]> = {
  estudiante: [
    { to: '/estudiante', label: 'Inicio', icon: 'home', exact: true },
    { to: '/estudiante/checkin', label: 'Check-in semanal', icon: 'checkin' },
    CALENDARIO,
    { to: '/estudiante/historial', label: 'Mi histórico', icon: 'history' },
    { to: '/estudiante/puente', label: 'Puente al doctorado', icon: 'graduation' },
    { to: '/estudiante/apoyo', label: 'Necesito apoyo', icon: 'heart' },
    CUENTA,
    COMO,
  ],
  tutor: [
    { to: '/tutor', label: 'Inicio', icon: 'home', exact: true },
    { to: '/tutor/checkin', label: 'Check-in semanal', icon: 'checkin' },
    CALENDARIO,
    { to: '/tutor/codigos', label: 'Códigos para tus estudiantes', icon: 'key' },
    CUENTA,
    COMO,
  ],
  direccion: [
    { to: '/direccion', label: 'Resumen del máster', icon: 'chart', exact: true },
    { to: '/direccion/avisos', label: 'Avisos de apoyo', icon: 'inbox' },
    { ...CALENDARIO, label: 'Calendario del máster' },
    CUENTA,
    COMO,
  ],
  investigador: [
    { to: '/investigador', label: 'Másteres y códigos', icon: 'building', exact: true },
    { to: '/investigador/parejas', label: 'Parejas y tutores', icon: 'team' },
    { to: '/investigador/calendario', label: 'Calendario del estudio', icon: 'calendar' },
    { ...CALENDARIO, label: 'Eventos del máster' },
    { to: '/investigador/convocatorias', label: 'Convocatorias', icon: 'graduation' },
    { to: '/investigador/cuestionarios', label: 'Cuestionarios', icon: 'document' },
    { to: '/investigador/datos', label: 'Datos y auditoría', icon: 'download' },
    CUENTA,
    COMO,
  ],
}

const sesion = useSesion()
const { t } = useTerminos()
const route = useRoute()
const router = useRouter()
const menuAbierto = ref(false)

const rol = computed(() => sesion.perfil?.rol ?? 'estudiante')
// Con «Tinta y lumbre» todos los perfiles comparten el menú claro (LUMBRA360).
const oscuro = computed(() => false)
const enlaces = computed(() =>
  (!sesion.perfil ? [COMO] : sesion.perfil.retirado ? [CUENTA, COMO] : MENUS[rol.value]).map((e) => ({ ...e, label: t(e.label) })),
)

const iniciales = computed(() => {
  const n = sesion.perfil?.nombre || 'S'
  return n.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
})

function activo(e: Enlace) {
  return e.exact ? route.path === e.to : route.path.startsWith(e.to)
}

// --- Menú del móvil -------------------------------------------------------
// Al abrirlo, el foco entra en el menú y no sale de él con el tabulador; Esc
// lo cierra desde cualquier sitio y el foco vuelve al botón que lo abrió.
// Cerrado en el móvil, queda inerte: el tabulador no pasa por enlaces que no
// se ven.
const menu = ref<HTMLElement | null>(null)
const botonMenu = ref<HTMLButtonElement | null>(null)
const escritorio = ref(true)
let consulta: MediaQueryList | null = null
const alCambiarAncho = () => {
  escritorio.value = !!consulta?.matches
  if (escritorio.value) menuAbierto.value = false
}
let cerrandoPorNavegacion = false

function enfocables(): HTMLElement[] {
  return Array.from(menu.value?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [])
}
function teclaConMenuAbierto(ev: KeyboardEvent) {
  if (ev.key === 'Escape') {
    ev.preventDefault()
    menuAbierto.value = false
    return
  }
  if (ev.key !== 'Tab') return
  const lista = enfocables()
  if (!lista.length) return
  const primero = lista[0]
  const ultimo = lista[lista.length - 1]
  const dentro = menu.value?.contains(document.activeElement)
  if (ev.shiftKey && (document.activeElement === primero || !dentro)) {
    ev.preventDefault()
    ultimo.focus()
  } else if (!ev.shiftKey && (document.activeElement === ultimo || !dentro)) {
    ev.preventDefault()
    primero.focus()
  }
}
watch(menuAbierto, async (abierto) => {
  if (abierto) {
    document.addEventListener('keydown', teclaConMenuAbierto)
    await nextTick()
    enfocables()[0]?.focus()
  } else {
    document.removeEventListener('keydown', teclaConMenuAbierto)
    if (!cerrandoPorNavegacion) botonMenu.value?.focus()
    cerrandoPorNavegacion = false
  }
})

// --- Cambio de pantalla ----------------------------------------------------
// El foco pasa al contenido nuevo y se anuncia su título a los lectores de
// pantalla (en una aplicación de una sola página no se recarga nada que lo haga).
const anuncio = ref('')
watch(
  () => route.path,
  async () => {
    if (menuAbierto.value) {
      cerrandoPorNavegacion = true
      menuAbierto.value = false
    }
    await nextTick()
    document.getElementById('contenido')?.focus({ preventScroll: true })
    anuncio.value = route.meta.titulo ? `${t(route.meta.titulo)}` : ''
  },
)

onMounted(() => {
  consulta = window.matchMedia('(min-width: 1024px)')
  alCambiarAncho()
  consulta.addEventListener('change', alCambiarAncho)
})
onBeforeUnmount(() => {
  consulta?.removeEventListener('change', alCambiarAncho)
  document.removeEventListener('keydown', teclaConMenuAbierto)
})

// Hay sesión pero el perfil no ha llegado (sin conexión, por ejemplo).
const sinPerfil = computed(() => !sesion.perfil && !!sesion.errorCarga)
const reintentando = ref(false)
async function reintentar() {
  reintentando.value = true
  await sesion.cargar(true)
  reintentando.value = false
  // Vuelve a pasar por el router: comprueba perfil, consentimiento y permisos.
  if (sesion.perfil) router.replace({ path: route.fullPath, force: true })
}

async function salir() {
  await sesion.salir()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <SaltarContenido />
    <BandaEntorno />

    <div class="flex flex-1">
      <div v-if="menuAbierto" class="fixed inset-0 bg-black/30 z-40 lg:hidden" aria-hidden="true" @click="menuAbierto = false" />

      <aside
        id="menu-lateral"
        ref="menu"
        :inert="!escritorio && !menuAbierto"
        class="fixed lg:sticky top-0 left-0 z-50 h-[100dvh] w-64 flex flex-col menu-lateral lg:translate-x-0"
        :class="[
          menuAbierto ? 'translate-x-0' : '-translate-x-full',
          oscuro ? 'bg-marino' : 'bg-surface-100 border-r border-surface-200',
        ]"
        aria-label="Menú principal"
      >
        <div class="p-6 pb-4 relative">
          <button
            type="button"
            class="lg:hidden absolute top-3 right-3 p-2 rounded-xl hover:bg-surface-200 min-h-tactil min-w-tactil flex items-center justify-center"
            aria-label="Cerrar el menú"
            @click="menuAbierto = false"
          >
            <AppIcon name="close" :size="20" />
          </button>
          <RouterLink to="/" class="text-xl inline-block" aria-label="SINTONÍA, ir al inicio">
            <AppLogo :variante="oscuro ? 'claro' : 'oscuro'" />
          </RouterLink>
          <p class="mt-2 text-xs font-medium" :class="oscuro ? 'text-white/80' : 'texto-suave'">
            {{ t(NOMBRE_ROL[rol]) }}<template v-if="sesion.perfil?.master"> · {{ sesion.perfil.master.nombre }}</template>
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
            :class="oscuro ? 'sidebar-link-oscuro w-full' : 'sidebar-link w-full !text-red-700 hover:!bg-red-50 dark:!text-red-300 dark:hover:!bg-red-950'"
            @click="salir"
          >
            <AppIcon name="logout" :size="18" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div class="flex-1 min-w-0">
        <header class="lg:hidden sticky top-0 z-30 bg-papel/90 backdrop-blur-md border-b border-surface-200/60 px-4 py-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] flex items-center gap-3">
          <button
            ref="botonMenu"
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

        <p class="sr-only" aria-live="polite" data-anuncio-pantalla>{{ anuncio }}</p>
        <main id="contenido" class="p-4 lg:p-8 max-w-5xl mx-auto focus:outline-none" tabindex="-1">
          <div v-if="sinPerfil" class="max-w-lg mx-auto pt-8">
            <h1 class="titulo-pagina mb-4">No hemos podido cargar tu cuenta</h1>
            <AvisoError :mensaje="sesion.errorCarga" />
            <p class="texto-suave mt-4">Tu sesión sigue abierta y no se ha perdido nada.</p>
            <button type="button" class="btn-primary mt-6" :disabled="reintentando" @click="reintentar">
              {{ reintentando ? 'Reintentando...' : 'Reintentar' }}
            </button>
          </div>
          <RouterView v-else />
        </main>
      </div>
    </div>
  </div>
</template>
