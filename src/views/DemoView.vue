<script setup lang="ts">
import SaltarContenido from '@/components/layout/SaltarContenido.vue'
// /demo: entrada a la demostración, con datos ficticios en una instalación
// totalmente separada de la real (otro proyecto de Supabase y de Vercel) que
// se reinicia cada noche.
import { RouterLink } from 'vue-router'
import { ACCESOS_DEMO, enlaceEntrada, hayDemostracion } from '@/lib/demo'
import { EN_ELABORACION_PROYECTO } from '@/lib/publico'
import AppLogo from '@/components/comun/AppLogo.vue'
import AppIcon from '@/components/comun/AppIcon.vue'
import PiePublico from '@/components/layout/PiePublico.vue'
import OndasSintonia from '@/components/portada/OndasSintonia.vue'

const ICONOS = { estudiante: 'person', tutor: 'users', direccion: 'chart', investigador: 'flask' } as const
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <SaltarContenido />
    <p class="sticky top-0 z-30 bg-amber-100 text-amber-900 text-sm font-semibold text-center px-4 py-2 border-b border-amber-200" role="note" data-banda-demo>
      Demostración: datos ficticios
    </p>
    <header class="border-b border-surface-200">
      <div class="max-w-[1180px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <RouterLink to="/" class="text-xl" aria-label="SINTONÍA, inicio"><AppLogo /></RouterLink>
        <RouterLink to="/" class="btn-secondary text-sm"><AppIcon name="back" :size="16" /> Volver al inicio</RouterLink>
      </div>
    </header>

    <main id="contenido" tabindex="-1" class="outline-none flex-1">
      <section class="max-w-[1180px] mx-auto px-4 sm:px-6 py-14 sm:py-20 grid gap-12 lg:grid-cols-[5fr_7fr] items-start">
        <div>
          <p class="text-xs font-mono font-normal uppercase tracking-[0.14em] text-surface-600">Demostración</p>
          <h1 class="font-display text-4xl sm:text-6xl font-medium tracking-tight text-surface-900 mt-3">Entra como quieras</h1>
          <p class="mt-6 text-lg leading-relaxed">
            Un máster inventado, con 4 tutores, 12 estudiantes y 6 semanas simuladas. Elige un perfil y verás SINTONÍA por dentro, tal como lo vería esa persona.
          </p>
          <ul class="mt-6 space-y-2 texto-suave">
            <li class="flex gap-2"><AppIcon name="shield" :size="18" class="mt-0.5 shrink-0 text-brand-900" />Separada por completo de los datos reales.</li>
            <li class="flex gap-2"><AppIcon name="history" :size="18" class="mt-0.5 shrink-0 text-brand-900" />Se reinicia cada noche: puedes probarlo todo.</li>
            <li class="flex gap-2"><AppIcon name="person" :size="18" class="mt-0.5 shrink-0 text-brand-900" />Solo nombres inventados.</li>
          </ul>
          <RouterLink to="/demo/recorrido" class="btn-primary mt-8 px-6 py-3">¿Primera vez? Haz el recorrido guiado (60 s)</RouterLink>
          <div class="mt-10"><OndasSintonia :desfase="0.6" :alto="70" /></div>
        </div>

        <div>
          <ul v-if="hayDemostracion" class="grid gap-4 sm:grid-cols-2" aria-label="Perfiles de la demostración">
            <li v-for="a in ACCESOS_DEMO" :key="a.rol">
              <a :href="enlaceEntrada(a.rol)" class="tarjeta-perfil card p-6 h-full flex flex-col gap-3 no-underline">
                <span class="w-12 h-12 rounded-full bg-marino text-white flex items-center justify-center" aria-hidden="true">
                  <AppIcon :name="ICONOS[a.rol]" :size="22" />
                </span>
                <span class="font-display text-2xl font-semibold text-surface-900">{{ a.etiqueta }}</span>
                <span class="texto-suave">{{ a.descripcion }}</span>
                <span class="mt-auto pt-2 font-medium text-brand-900 inline-flex items-center gap-1">Entrar como {{ a.etiqueta.toLowerCase() }} <span aria-hidden="true">→</span></span>
              </a>
            </li>
          </ul>
          <div v-else class="card p-6">
            <h2 class="font-display text-xl font-semibold text-surface-900">La demostración</h2>
            <p class="mt-2 italic texto-suave">{{ EN_ELABORACION_PROYECTO }}</p>
            <p class="mt-4">Mientras tanto, puedes probar las dos miradas en la <RouterLink to="/#demostracion" class="enlace">demostración del inicio</RouterLink>.</p>
          </div>
        </div>
      </section>
    </main>
    <PiePublico />
  </div>
</template>

<style scoped>
.tarjeta-perfil {
  transition: transform var(--dur-micro) var(--ease-out), box-shadow var(--dur-ui) ease;
}
@media (hover: hover) and (pointer: fine) {
  .tarjeta-perfil:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-elevated);
  }
}
.tarjeta-perfil:active {
  transform: scale(0.98);
}
</style>
