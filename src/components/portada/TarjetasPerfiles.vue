<script setup lang="ts">
// "Para cada perfil": las tres personas una al lado de otra, con la misma
// estructura (tiempo, qué hace, qué ve y qué no ve), para compararlas de un
// vistazo. Antes eran pestañas: así no hay nada escondido.
// Rediseño del 25/11/2026: carrusel que se desliza con el dedo (imán en cada
// tarjeta, desplazamiento nativo) y botones redondos para ratón y teclado.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useContenido } from '@/lib/contenido'
import AppIcon from '@/components/comun/AppIcon.vue'
import ClipPerfil from './ClipPerfil.vue'
import { vCursor, vRevelar } from '@/lib/efectos'

const contenido = useContenido()
const PERFILES = computed(() => contenido.value.PERFILES)
const ICONOS = { estudiante: 'person', tutor: 'users', direccion: 'chart' } as const
import { useIdioma } from '@/lib/idioma'
const { t } = useIdioma()

const pista = ref<HTMLElement | null>(null)
const alInicio = ref(true)
const alFinal = ref(false)
function actualizar() {
  const el = pista.value
  if (!el) return
  alInicio.value = el.scrollLeft < 8
  alFinal.value = el.scrollLeft + el.clientWidth > el.scrollWidth - 8
}
function mover(sentido: 1 | -1) {
  const el = pista.value
  const tarjeta = el?.querySelector<HTMLElement>(':scope > li')
  if (!el || !tarjeta) return
  const paso = tarjeta.offsetWidth + 20
  const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollBy({ left: sentido * paso, behavior: suave ? 'smooth' : 'auto' })
}
onMounted(() => {
  actualizar()
  pista.value?.addEventListener('scroll', actualizar, { passive: true })
  window.addEventListener('resize', actualizar, { passive: true })
})
onBeforeUnmount(() => {
  pista.value?.removeEventListener('scroll', actualizar)
  window.removeEventListener('resize', actualizar)
})
</script>

<template>
  <ul ref="pista" class="carrusel focus-visible:outline-offset-[-3px]" tabindex="0" :aria-label="t('Perfiles', 'Profiles')">
    <li v-for="(p, i) in PERFILES" :key="p.clave" v-revelar="i" class="baldosa p-6 sm:p-8 flex flex-col">
      <ClipPerfil :rol="p.clave" class="mb-6" />
      <div class="flex items-center gap-3">
        <span class="h-11 w-11 shrink-0 rounded-xl bg-brand-100 text-brand-900 flex items-center justify-center"><AppIcon :name="ICONOS[p.clave]" :size="22" /></span>
        <h3 class="font-display text-2xl font-semibold text-surface-900">{{ p.nombre }}</h3>
      </div>
      <p class="mt-5 flex items-start gap-2 rounded-lg bg-surface-100 px-3 py-2.5 text-sm font-medium text-surface-900">
        <AppIcon name="clock" :size="16" class="mt-0.5 shrink-0 text-brand-900" />{{ p.tiempo }}
      </p>
      <h4 class="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-surface-800">{{ t('Qué hace', 'What they do') }}</h4>
      <ul class="mt-2 space-y-2 text-[0.95rem] leading-relaxed">
        <li v-for="t in p.hace" :key="t">{{ t }}</li>
      </ul>
      <div class="mt-auto pt-6">
      <div class="grid gap-4 border-t border-surface-200 pt-5">
        <div>
          <h4 class="text-xs font-semibold uppercase tracking-[0.14em] text-surface-800">{{ t('Qué ve', 'What they see') }}</h4>
          <ul class="mt-2 space-y-1.5 text-sm">
            <li v-for="t in p.ve" :key="t" class="flex gap-2"><AppIcon name="eye" :size="16" class="mt-0.5 shrink-0 text-brand-900" />{{ t }}</li>
          </ul>
        </div>
        <div>
          <h4 class="text-xs font-semibold uppercase tracking-[0.14em] text-surface-800">{{ t('Qué no ve', 'What they do not see') }}</h4>
          <ul class="mt-2 space-y-1.5 text-sm">
            <li v-for="t in p.noVe" :key="t" class="flex gap-2"><AppIcon name="lock" :size="16" class="mt-0.5 shrink-0 text-surface-800" />{{ t }}</li>
          </ul>
        </div>
      </div>
      </div>
    </li>
  </ul>
  <div class="max-w-[1180px] mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
    <p class="text-sm texto-suave">{{ t('Clips grabados en la demostración, con datos ficticios.', 'Clips recorded in the demo (in Spanish), with fictitious data.') }}</p>
    <div class="flex gap-3" :class="alInicio && alFinal ? 'invisible' : ''">
      <button type="button" class="boton-redondo" :disabled="alInicio" :aria-label="t('Perfil anterior', 'Previous profile')" @click="mover(-1)">
        <AppIcon name="arrow_right" :size="18" class="rotate-180" />
      </button>
      <button type="button" class="boton-redondo" :disabled="alFinal" :aria-label="t('Perfil siguiente', 'Next profile')" @click="mover(1)">
        <AppIcon name="arrow_right" :size="18" />
      </button>
    </div>
  </div>
</template>
