<script setup lang="ts">
// Tarjeta de inicio: las próximas fechas del calendario (dos semanas).
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { llamar } from '@/lib/api'
import { entradas, hoy, proximas, sumarDias, type Calendario } from '@/lib/calendario'
import AppIcon from '@/components/comun/AppIcon.vue'
import EntradaCalendario from './EntradaCalendario.vue'

const HOY = hoy()
const datos = ref<Calendario | null>(null)
const fallo = ref(false)

onMounted(async () => {
  try {
    datos.value = await llamar<Calendario>('mi_calendario', { p_desde: HOY, p_hasta: sumarDias(HOY, 14) })
  } catch {
    fallo.value = true
  }
})

const lista = computed(() => (datos.value ? proximas(entradas(datos.value), HOY, 3) : []))
</script>

<template>
  <section v-if="!fallo" class="card p-5 sm:p-6" aria-labelledby="t-prox-inicio">
    <div class="flex items-center justify-between gap-3">
      <h2 id="t-prox-inicio" class="font-semibold text-surface-900 flex items-center gap-2">
        <AppIcon name="calendar" :size="20" /> Próximas fechas
      </h2>
      <RouterLink to="/calendario" class="enlace text-sm inline-flex items-center min-h-tactil">Ver calendario</RouterLink>
    </div>
    <ul v-if="lista.length" class="divide-y divide-surface-200">
      <li v-for="e in lista" :key="e.id">
        <EntradaCalendario :entrada="e" con-dia compacta />
      </li>
    </ul>
    <p v-else-if="datos" class="text-sm texto-suave mt-1">Nada en las próximas dos semanas. Puedes anotar tutorías, entregas o congresos en el calendario.</p>
  </section>
</template>
