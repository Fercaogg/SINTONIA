<script setup lang="ts">
// "Para cada perfil": las tres personas una al lado de otra, con la misma
// estructura (tiempo, qué hace, qué ve y qué no ve), para compararlas de un
// vistazo. Antes eran pestañas: así no hay nada escondido.
import { PERFILES } from '@/contenido/portada'
import AppIcon from '@/components/comun/AppIcon.vue'
import { vCursor, vRevelar } from '@/lib/efectos'

const ICONOS = { estudiante: 'person', tutor: 'users', direccion: 'chart' } as const
</script>

<template>
  <ul class="grid gap-6 lg:grid-cols-3">
    <li v-for="(p, i) in PERFILES" :key="p.clave" v-revelar="i" v-cursor="'inclinar'" class="card p-6 sm:p-7 flex flex-col">
      <div class="flex items-center gap-3">
        <span class="h-11 w-11 shrink-0 rounded-xl bg-brand-100 text-brand-900 flex items-center justify-center"><AppIcon :name="ICONOS[p.clave]" :size="22" /></span>
        <h3 class="font-display text-2xl font-semibold text-surface-900">{{ p.nombre }}</h3>
      </div>
      <p class="mt-5 flex items-start gap-2 rounded-lg bg-surface-100 px-3 py-2.5 text-sm font-medium text-surface-900">
        <AppIcon name="clock" :size="16" class="mt-0.5 shrink-0 text-brand-900" />{{ p.tiempo }}
      </p>
      <h4 class="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-surface-800">Qué hace</h4>
      <ul class="mt-2 space-y-2 text-[0.95rem] leading-relaxed">
        <li v-for="t in p.hace" :key="t">{{ t }}</li>
      </ul>
      <div class="mt-auto pt-6">
      <div class="grid gap-4 border-t border-surface-200 pt-5">
        <div>
          <h4 class="text-xs font-semibold uppercase tracking-[0.14em] text-surface-800">Qué ve</h4>
          <ul class="mt-2 space-y-1.5 text-sm">
            <li v-for="t in p.ve" :key="t" class="flex gap-2"><AppIcon name="eye" :size="16" class="mt-0.5 shrink-0 text-brand-900" />{{ t }}</li>
          </ul>
        </div>
        <div>
          <h4 class="text-xs font-semibold uppercase tracking-[0.14em] text-surface-800">Qué no ve</h4>
          <ul class="mt-2 space-y-1.5 text-sm">
            <li v-for="t in p.noVe" :key="t" class="flex gap-2"><AppIcon name="lock" :size="16" class="mt-0.5 shrink-0 text-surface-800" />{{ t }}</li>
          </ul>
        </div>
      </div>
      </div>
    </li>
  </ul>
</template>
