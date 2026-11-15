<script setup lang="ts">
// Clip corto en bucle de la demostración real de un perfil (sin sonido).
//   - Ligero: WebM (VP9) y MP4 de respaldo, entre 40 y 100 KB; no se
//     descarga hasta que la tarjeta está cerca de la pantalla.
//   - Solo se reproduce mientras se ve; fuera de pantalla, se pausa.
//   - Con "reducir movimiento", una imagen fija en su lugar.
// Es decorativo: lo que enseña está explicado en el texto de la tarjeta.
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { prefiereMenosMovimiento } from '@/lib/movimiento'

const props = defineProps<{ rol: 'estudiante' | 'tutor' | 'direccion' }>()
const quieto = prefiereMenosMovimiento()
const video = ref<HTMLVideoElement | null>(null)
const cargar = ref(false)
let observador: IntersectionObserver | null = null

onMounted(() => {
  if (quieto || !video.value) return
  observador = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting) {
        cargar.value = true
        video.value?.play().catch(() => {})
      } else video.value?.pause()
    },
    { rootMargin: '200px 0px', threshold: 0.2 },
  )
  observador.observe(video.value)
})
onBeforeUnmount(() => observador?.disconnect())
const ruta = (ext: string) => `/clips/${props.rol}.${ext}`
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-surface-200 bg-surface-100 aspect-[4/3]" aria-hidden="true">
    <img v-if="quieto" :src="ruta('webp')" alt="" width="360" height="720" loading="lazy" class="h-full w-full object-cover object-top" />
    <video
      v-else
      ref="video"
      class="h-full w-full object-cover object-top"
      :poster="ruta('webp')"
      muted
      loop
      playsinline
      preload="none"
      width="360"
      height="720"
      disablepictureinpicture
    >
      <template v-if="cargar">
        <source :src="ruta('webm')" type="video/webm" />
        <source :src="ruta('mp4')" type="video/mp4" />
      </template>
    </video>
  </div>
</template>
