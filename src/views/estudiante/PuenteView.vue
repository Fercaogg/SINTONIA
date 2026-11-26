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
import PuenteEscena from '@/components/puente/PuenteEscena.vue'

const datos = ref<DatosPuente | null>(null)
const eventos = ref<Entrada[] | null>(null)

const { cargando, error, cargar } = useCarga(async () => {
  // Si el calendario falla, la pantalla sigue: solo falta ese resumen.
  const [d, e] = await Promise.all([leerPuente(), leerEventos().catch(() => null)])
  datos.value = d
  eventos.value = e
})

// El tramo del puente que se enciende: el de la puerta que señalas o enfocas.
const activa = ref<number | null>(null)

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
  <div class="fade-in max-w-4xl">
    <section class="cabecera-puente relative overflow-hidden rounded-panel bg-marino text-white mb-8" aria-labelledby="t-puente">
      <div class="relative grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-center">
        <div class="p-6 sm:p-8 lg:p-10 lg:pr-0 relative z-10">
          <p class="antetitulo-lumbre">Del máster al doctorado</p>
          <h1 id="t-puente" class="titulo-pagina !text-white mt-3">Puente al doctorado</h1>
          <p class="text-white/80 mt-3 leading-relaxed max-w-md">
            Seis tramos con todo lo que necesitas para dar el paso, a tu ritmo. Empieza por el que quieras.
          </p>
        </div>
        <PuenteEscena :activa="activa" class="-mt-6 lg:mt-0" />
      </div>
    </section>

    <EstadoCarga v-if="cargando" />
    <AvisoError v-else-if="!datos" :mensaje="error" :reintentar="cargar" />
    <template v-else>
      <nav aria-label="Apartados de Puente al doctorado">
        <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="(p, i) in PUERTAS" :key="p.clave" class="entrar" :style="{ '--retraso': `${i * 50}ms` }">
            <RouterLink
              :to="`/estudiante/puente/${p.clave}`"
              class="card tarjeta-enlace tarjeta-tramo group p-5 no-underline h-full flex flex-col"
              :data-puerta="p.clave"
              @pointerenter="activa = i"
              @pointerleave="activa = null"
              @focus="activa = i"
              @blur="activa = null"
            >
              <span class="flex items-start justify-between gap-3">
                <span class="icono-tramo" aria-hidden="true">
                  <AppIcon :name="p.icono" :size="22" />
                </span>
                <span class="text-xs font-semibold uppercase tracking-[0.08em] texto-suave tabular-nums pt-1">Tramo {{ i + 1 }}</span>
              </span>
              <span class="font-semibold text-surface-900 text-lg mt-4 flex items-center gap-2">
                {{ p.titulo }}
                <AppIcon name="arrow_right" :size="16" class="flecha-tramo shrink-0" aria-hidden="true" />
              </span>
              <span class="text-sm texto-suave mt-1.5 flex-1 leading-relaxed">{{ p.descripcion }}</span>
              <span v-if="resumen[p.clave]" class="resumen-tramo mt-4 tabular-nums">{{ resumen[p.clave] }}</span>
            </RouterLink>
          </li>
        </ul>
      </nav>

      <!-- Debajo de las puertas: lo primero que se ve al entrar son las cajas. -->
      <InterruptorPuente v-model="datos.activado" class="mt-8" />
    </template>
  </div>
</template>
