<script setup lang="ts">
// Puente al doctorado: el interruptor de los avisos y seis puertas. Cada
// puerta abre su página con toda la información (PuenteSeccionView).
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useCarga } from '@/lib/usar-carga'
import { leerEventos, leerPuente, resumenPlazos, type DatosPuente } from '@/lib/puente'
import { hoy, type Entrada } from '@/lib/calendario'
import { NECESITO, PUERTAS, TIPOS_DOCTORADO, type SeccionPuente } from '@/contenido/puente'
import AppIcon from '@/components/comun/AppIcon.vue'
import AvisoError from '@/components/comun/AvisoError.vue'
import EstadoCarga from '@/components/comun/EstadoCarga.vue'
import InterruptorPuente from '@/components/puente/InterruptorPuente.vue'

const datos = ref<DatosPuente | null>(null)
const eventos = ref<Entrada[] | null>(null)

const { cargando, error, cargar } = useCarga(async () => {
  // Si el calendario falla, la pantalla sigue: solo falta ese resumen.
  const [d, e] = await Promise.all([leerPuente(), leerEventos().catch(() => null)])
  datos.value = d
  eventos.value = e
})

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`

/** La línea de cada puerta: lo que hay dentro, para decidir si entrar. */
const resumen = computed<Record<SeccionPuente, string>>(() => {
  const d = datos.value
  return {
    becas: d ? plural(d.convocatorias.length, 'convocatoria', 'convocatorias') : '',
    plazos: d ? resumenPlazos(d.convocatorias, hoy()) : '',
    necesito: plural(NECESITO.length, 'paso', 'pasos'),
    tipos: plural(TIPOS_DOCTORADO.length, 'modalidad', 'modalidades'),
    eventos: eventos.value === null ? '' : eventos.value.length ? plural(eventos.value.length, 'próximo', 'próximos') : 'Ninguno anotado todavía',
    normativa: d ? plural(d.normativa.length, 'documento oficial', 'documentos oficiales') : '',
  }
})
</script>

<template>
  <div class="fade-in max-w-3xl">
    <h1 class="titulo-pagina">Puente al doctorado</h1>
    <p class="texto-suave mt-1 mb-8">Todo lo que necesitas para dar el paso al doctorado, a tu ritmo. Elige por dónde empezar.</p>

    <EstadoCarga v-if="cargando" />
    <AvisoError v-else-if="!datos" :mensaje="error" :reintentar="cargar" />
    <template v-else>
      <nav aria-label="Apartados de Puente al doctorado">
        <ul class="grid gap-4 sm:grid-cols-2">
          <li v-for="p in PUERTAS" :key="p.clave">
            <RouterLink :to="`/estudiante/puente/${p.clave}`" class="card tarjeta-enlace p-5 no-underline h-full flex flex-col" :data-puerta="p.clave">
              <span class="flex items-center gap-3">
                <span class="w-11 h-11 rounded-2xl bg-brand-50 flex items-center justify-center shrink-0" aria-hidden="true">
                  <AppIcon :name="p.icono" :size="22" class="text-surface-900" />
                </span>
                <span class="font-semibold text-surface-900 flex-1">{{ p.titulo }}</span>
                <AppIcon name="back" :size="18" class="text-surface-900 rotate-180 shrink-0" aria-hidden="true" />
              </span>
              <span class="text-sm texto-suave mt-3 flex-1">{{ p.descripcion }}</span>
              <span v-if="resumen[p.clave]" class="text-xs font-mono uppercase tracking-[0.08em] text-surface-800 mt-3">{{ resumen[p.clave] }}</span>
            </RouterLink>
          </li>
        </ul>
      </nav>

      <!-- Debajo de las puertas: lo primero que se ve al entrar son las cajas. -->
      <InterruptorPuente v-model="datos.activado" class="mt-8" />
    </template>
  </div>
</template>
