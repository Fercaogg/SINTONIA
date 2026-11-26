<script setup lang="ts">
// Una puerta de Puente al doctorado abierta: toda su información.
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useCarga } from '@/lib/usar-carga'
import { agruparPlazos, GRUPOS_PLAZO, leerEventos, leerPuente, type DatosPuente } from '@/lib/puente'
import { hoy, type Entrada } from '@/lib/calendario'
import { NECESITO, PUERTAS, TIPOS_DOCTORADO, type Apartado, type SeccionPuente } from '@/contenido/puente'
import { useSesion } from '@/stores/sesion'
import AppIcon from '@/components/comun/AppIcon.vue'
import AvisoError from '@/components/comun/AvisoError.vue'
import EstadoCarga from '@/components/comun/EstadoCarga.vue'
import EstadoVacio from '@/components/comun/EstadoVacio.vue'
import Pendiente from '@/components/comun/Pendiente.vue'
import EntradaCalendario from '@/components/calendario/EntradaCalendario.vue'
import InterruptorPuente from '@/components/puente/InterruptorPuente.vue'
import TarjetaConvocatoria from '@/components/puente/TarjetaConvocatoria.vue'

const props = defineProps<{ seccion: SeccionPuente }>()
const puerta = computed(() => PUERTAS.find((p) => p.clave === props.seccion)!)
const otras = computed(() => PUERTAS.filter((p) => p.clave !== props.seccion))

const datos = ref<DatosPuente | null>(null)
const eventos = ref<Entrada[]>([])
const sesion = useSesion()
const master = computed(() => sesion.perfil?.master?.nombre)

const { cargando, error, cargar } = useCarga(async () => {
  if (props.seccion === 'eventos') eventos.value = await leerEventos()
  else if (props.seccion !== 'necesito' && props.seccion !== 'tipos') datos.value = await leerPuente()
})

const grupos = computed(() => agruparPlazos(datos.value?.convocatorias ?? [], hoy()))
const apartados = computed<Apartado[]>(() => (props.seccion === 'necesito' ? NECESITO : props.seccion === 'tipos' ? TIPOS_DOCTORADO : []))
const tituloPuerta = (clave: SeccionPuente) => PUERTAS.find((p) => p.clave === clave)!.titulo
</script>

<template>
  <div class="fade-in max-w-3xl">
    <RouterLink to="/estudiante/puente" class="enlace text-sm inline-flex items-center gap-1 mb-4">
      <AppIcon name="back" :size="16" /> Puente al doctorado
    </RouterLink>
    <div class="flex items-center gap-3">
      <span class="w-11 h-11 rounded-2xl bg-brand-50 flex items-center justify-center shrink-0" aria-hidden="true">
        <AppIcon :name="puerta.icono" :size="22" class="text-surface-900" />
      </span>
      <h1 class="titulo-pagina">{{ puerta.titulo }}</h1>
    </div>
    <p class="texto-suave mt-2 mb-8">{{ puerta.descripcion }}</p>

    <EstadoCarga v-if="cargando" />
    <AvisoError v-else-if="error" :mensaje="error" :reintentar="cargar" />

    <template v-else>
      <!-- Becas y contratos -->
      <template v-if="seccion === 'becas' && datos">
        <EstadoVacio v-if="!datos.convocatorias.length" icono="graduation" titulo="Todavía no hay convocatorias" texto="El equipo de investigación las añadirá en cuanto se publiquen." />
        <ul v-else class="space-y-3">
          <li v-for="c in datos.convocatorias" :key="c.id"><TarjetaConvocatoria :convocatoria="c" /></li>
        </ul>
        <p class="text-sm texto-suave mt-6">
          Las fechas de cada año se añaden cuando se publica la convocatoria oficial, nunca antes. Manda siempre la página oficial.
        </p>
      </template>

      <!-- Plazos -->
      <template v-else-if="seccion === 'plazos' && datos">
        <InterruptorPuente v-model="datos.activado" class="mb-8" />
        <template v-for="g in GRUPOS_PLAZO" :key="g.clave">
          <section v-if="grupos[g.clave].length || g.vacio" class="mb-8" :aria-labelledby="`t-${g.clave}`">
            <h2 :id="`t-${g.clave}`" class="font-display text-xl font-semibold text-surface-900 mb-3">
              {{ g.titulo }} <span class="texto-suave font-normal tabular-nums">({{ grupos[g.clave].length }})</span>
            </h2>
            <p v-if="!grupos[g.clave].length" class="texto-suave text-sm">{{ g.vacio }}</p>
            <ul v-else class="space-y-3">
              <li v-for="c in grupos[g.clave]" :key="c.id"><TarjetaConvocatoria :convocatoria="c" /></li>
            </ul>
          </section>
        </template>
        <p class="text-sm texto-suave">
          Los plazos también aparecen en tu <RouterLink to="/calendario" class="enlace">calendario</RouterLink>.
        </p>
      </template>

      <!-- Qué necesito y tipos de doctorado -->
      <template v-else-if="seccion === 'necesito' || seccion === 'tipos'">
        <component :is="seccion === 'necesito' ? 'ol' : 'ul'" class="space-y-3">
          <li v-for="(a, i) in apartados" :key="a.titulo" class="card p-5 sm:p-6">
            <h2 class="font-semibold text-surface-900 flex items-start gap-3">
              <span v-if="seccion === 'necesito'" class="w-7 h-7 rounded-full bg-brand-50 text-sm font-mono flex items-center justify-center shrink-0" aria-hidden="true">{{ i + 1 }}</span>
              <span class="pt-0.5">{{ a.titulo }}</span>
            </h2>
            <p v-if="a.texto" class="text-sm leading-relaxed mt-2">{{ a.texto }}</p>
            <p v-if="a.pendiente" class="text-sm mt-2"><Pendiente :texto="a.pendiente" /></p>
            <p class="text-xs texto-suave mt-3">
              Fuente:
              <a :href="a.fuente.url" target="_blank" rel="noopener" class="enlace">{{ a.fuente.texto }} <span class="sr-only">(se abre en otra pestaña)</span></a>
            </p>
            <RouterLink v-if="a.puerta" :to="`/estudiante/puente/${a.puerta}`" class="enlace text-sm inline-block mt-2">
              Ver {{ tituloPuerta(a.puerta).toLowerCase() }}
            </RouterLink>
          </li>
        </component>
      </template>

      <!-- Congresos y eventos -->
      <template v-else-if="seccion === 'eventos'">
        <EstadoVacio
          v-if="!eventos.length"
          icono="users"
          titulo="No hay congresos ni eventos anotados"
          :texto="`Cuando la dirección${master ? ` de ${master}` : ''} o tú anotéis un congreso o un seminario en el calendario, aparecerá aquí.`"
        >
          <RouterLink to="/calendario" class="btn-secondary mt-6">Ir al calendario</RouterLink>
        </EstadoVacio>
        <template v-else>
          <ul class="card divide-y divide-surface-200">
            <li v-for="e in eventos" :key="e.id" class="p-4"><EntradaCalendario :entrada="e" con-dia sin-editar /></li>
          </ul>
          <p class="text-sm texto-suave mt-6">
            Los próximos 12 meses. Para anotar uno tuyo, ve al <RouterLink to="/calendario" class="enlace">calendario</RouterLink>.
          </p>
        </template>
      </template>

      <!-- Normativa -->
      <template v-else-if="seccion === 'normativa' && datos">
        <EstadoVacio v-if="!datos.normativa.length" icono="document" titulo="Todavía no hay documentos" texto="El equipo de investigación añadirá aquí la normativa oficial." />
        <ul v-else class="card divide-y divide-surface-200">
          <li v-for="n in datos.normativa" :key="n.url" class="p-4">
            <a :href="n.url" target="_blank" rel="noopener" class="enlace font-medium">
              {{ n.titulo }} <span class="sr-only">(documento oficial, se abre en otra pestaña)</span>
            </a>
            <p v-if="n.descripcion" class="text-sm texto-suave mt-1">{{ n.descripcion }}</p>
          </li>
        </ul>
      </template>
    </template>

    <nav class="mt-12 pt-6 border-t border-surface-200" aria-label="Otros apartados de Puente al doctorado">
      <p class="text-xs font-mono uppercase tracking-[0.14em] texto-suave mb-3">Otros apartados</p>
      <ul class="flex flex-wrap gap-2">
        <li v-for="p in otras" :key="p.clave">
          <RouterLink :to="`/estudiante/puente/${p.clave}`" class="btn-secondary !py-2 text-sm">
            <AppIcon :name="p.icono" :size="16" /> {{ p.titulo }}
          </RouterLink>
        </li>
      </ul>
    </nav>
  </div>
</template>
