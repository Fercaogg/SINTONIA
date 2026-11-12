// Rutas de la aplicación y control de acceso por perfil.
// Ojo: esto solo decide qué pantalla se muestra. Los permisos de verdad los
// aplica la base de datos (RLS), aunque alguien se salte esta comprobación.

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useSesion } from '@/stores/sesion'
import { INICIO_ROL, necesitaConsentimiento, type Rol } from '@/lib/tipos'

declare module 'vue-router' {
  interface RouteMeta {
    publica?: boolean
    soloSinSesion?: boolean
    rol?: Rol
    titulo?: string
  }
}

const LayoutPanel = () => import('@/components/layout/LayoutPanel.vue')

const routes: RouteRecordRaw[] = [
  { path: '/', component: () => import('@/views/InicioView.vue'), meta: { publica: true } },
  { path: '/como-funciona', component: () => import('@/views/ComoFuncionaView.vue'), meta: { publica: true, titulo: 'Cómo funciona y tus datos' } },
  { path: '/acceso', component: () => import('@/views/acceso/AccesoView.vue'), meta: { publica: true, soloSinSesion: true, titulo: 'Iniciar sesión' } },
  { path: '/acceso/confirmar', component: () => import('@/views/acceso/ConfirmarAccesoView.vue'), meta: { publica: true, titulo: 'Entrando' } },
  { path: '/registro', component: () => import('@/views/acceso/RegistroView.vue'), meta: { publica: true, soloSinSesion: true, titulo: 'Crear tu cuenta' } },
  { path: '/consentimiento', component: () => import('@/views/acceso/ConsentimientoView.vue'), meta: { titulo: 'Consentimiento informado' } },
  {
    path: '/estudiante',
    component: LayoutPanel,
    meta: { rol: 'estudiante' },
    children: [
      { path: '', component: () => import('@/views/estudiante/PanelEstudianteView.vue'), meta: { titulo: 'Inicio' } },
      { path: 'checkin', component: () => import('@/views/estudiante/CheckinEstudianteView.vue'), meta: { titulo: 'Check-in semanal' } },
      { path: 'historial', component: () => import('@/views/estudiante/HistorialView.vue'), meta: { titulo: 'Mi histórico' } },
      { path: 'apoyo', component: () => import('@/views/estudiante/ApoyoView.vue'), meta: { titulo: 'Necesito apoyo' } },
      { path: 'puente', component: () => import('@/views/estudiante/PuenteView.vue'), meta: { titulo: 'Puente al doctorado' } },
      { path: 'cuestionario/:clave', component: () => import('@/views/estudiante/CuestionarioView.vue'), meta: { titulo: 'Cuestionario' } },
    ],
  },
  {
    path: '/tutor',
    component: LayoutPanel,
    meta: { rol: 'tutor' },
    children: [
      { path: '', component: () => import('@/views/tutor/PanelTutorView.vue'), meta: { titulo: 'Inicio' } },
      { path: 'checkin', component: () => import('@/views/tutor/CheckinTutorView.vue'), meta: { titulo: 'Check-in semanal' } },
      { path: 'codigos', component: () => import('@/views/tutor/CodigosTutorView.vue'), meta: { titulo: 'Códigos para tus estudiantes' } },
    ],
  },
  {
    path: '/direccion',
    component: LayoutPanel,
    meta: { rol: 'direccion' },
    children: [
      { path: '', component: () => import('@/views/direccion/PanelDireccionView.vue'), meta: { titulo: 'Resumen del máster' } },
      { path: 'avisos', component: () => import('@/views/direccion/AvisosApoyoView.vue'), meta: { titulo: 'Avisos de apoyo' } },
    ],
  },
  {
    path: '/investigacion',
    component: LayoutPanel,
    meta: { rol: 'investigador' },
    children: [
      { path: '', component: () => import('@/views/investigacion/MastersView.vue'), meta: { titulo: 'Másteres y códigos' } },
      { path: 'calendario', component: () => import('@/views/investigacion/CalendarioView.vue'), meta: { titulo: 'Calendario del estudio' } },
      { path: 'convocatorias', component: () => import('@/views/investigacion/ConvocatoriasView.vue'), meta: { titulo: 'Convocatorias' } },
      { path: 'cuestionarios', component: () => import('@/views/investigacion/CuestionariosView.vue'), meta: { titulo: 'Cuestionarios' } },
    ],
  },
  {
    path: '/cuenta',
    component: LayoutPanel,
    children: [{ path: '', component: () => import('@/views/CuentaView.vue'), meta: { titulo: 'Mi cuenta' } }],
  },
  { path: '/:pathMatch(.*)*', component: () => import('@/views/NoEncontradaView.vue'), meta: { publica: true, titulo: 'Página no encontrada' } },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  const sesion = useSesion()
  await sesion.cargar()
  const perfil = sesion.perfil

  if (to.meta.soloSinSesion && perfil) return INICIO_ROL[perfil.rol]
  if (to.meta.publica) return true

  if (!sesion.conectado || !perfil) return { path: '/acceso', query: { volver: to.fullPath } }

  // Quien se ha retirado solo puede ver su cuenta (para descargar o borrar sus datos).
  if (perfil.retirado) return to.path === '/cuenta' ? true : '/cuenta'

  if (necesitaConsentimiento(perfil.rol) && !perfil.consentimiento.aceptado && to.path !== '/consentimiento') {
    return '/consentimiento'
  }
  if (to.path === '/consentimiento' && (!necesitaConsentimiento(perfil.rol) || perfil.consentimiento.aceptado)) {
    return INICIO_ROL[perfil.rol]
  }

  const rolRequerido = to.matched.find((r) => r.meta.rol)?.meta.rol
  if (rolRequerido && rolRequerido !== perfil.rol) return INICIO_ROL[perfil.rol]
  return true
})

router.afterEach((to) => {
  document.title = to.meta.titulo ? `${to.meta.titulo} · SINTONÍA` : 'SINTONÍA'
})
