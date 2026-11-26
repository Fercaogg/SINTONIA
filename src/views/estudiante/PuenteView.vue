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
import EstanteriaPuente from '@/components/puente/EstanteriaPuente.vue'
import { VOLUMENES } from '@/components/puente/libros'

const datos = ref<DatosPuente | null>(null)
const eventos = ref<Entrada[] | null>(null)

const { cargando, error, cargar } = useCarga(async () => {
  // Si el calendario falla, la pantalla sigue: solo falta ese resumen.
  const [d, e] = await Promise.all([leerPuente(), leerEventos().catch(() => null)])
  datos.value = d
  eventos.value = e
})

// El volumen que sale de la estantería: el que señalas en ella o en el índice.
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
    <section class="cabecera-biblioteca relative overflow-hidden rounded-panel mb-10" aria-labelledby="t-puente">
      <div class="grid lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] items-end gap-2">
        <div class="p-6 sm:p-8 lg:p-10 lg:pb-14 relative z-10">
          <p class="antetitulo text-[color:var(--color-lumbre-texto)]">Del máster al doctorado</p>
          <h1 id="t-puente" class="titulo-pagina mt-3">Puente al doctorado</h1>
          <p class="texto-suave mt-3 leading-relaxed max-w-sm">
            Seis volúmenes con todo lo que necesitas para dar el paso. El séptimo lo escribes tú.
          </p>
        </div>
        <EstanteriaPuente :activa="activa" class="px-4 sm:px-8 pb-6 sm:pb-8" @señalar="activa = $event" />
      </div>
    </section>

    <EstadoCarga v-if="cargando" />
    <AvisoError v-else-if="!datos" :mensaje="error" :reintentar="cargar" />
    <template v-else>
      <nav aria-label="Apartados de Puente al doctorado">
        <h2 class="antetitulo mb-2">Índice</h2>
        <ol class="indice">
          <li v-for="(p, i) in PUERTAS" :key="p.clave" class="entrar" :style="{ '--retraso': `${i * 40}ms` }">
            <RouterLink
              :to="`/estudiante/puente/${p.clave}`"
              class="entrada-indice"
              :class="{ activa: activa === i }"
              :data-puerta="p.clave"
              @pointerenter="activa = i"
              @pointerleave="activa = null"
              @focus="activa = i"
              @blur="activa = null"
            >
              <span class="num-indice" aria-hidden="true">{{ VOLUMENES[i] }}</span>
              <span class="min-w-0 flex-1">
                <span class="flex items-baseline gap-3">
                  <span class="font-semibold text-surface-900 text-lg">{{ p.titulo }}</span>
                  <span class="puntos" aria-hidden="true" />
                  <span v-if="resumen[p.clave]" data-resumen class="text-sm text-surface-800 tabular-nums shrink-0 text-right max-w-[45%]">{{ resumen[p.clave] }}</span>
                </span>
                <span class="block text-sm texto-suave mt-1 leading-relaxed">{{ p.descripcion }}</span>
              </span>
            </RouterLink>
          </li>
        </ol>
      </nav>

      <!-- Debajo del índice: lo primero que se ve al entrar es la estantería. -->
      <InterruptorPuente v-model="datos.activado" class="mt-10" />
    </template>
  </div>
</template>
