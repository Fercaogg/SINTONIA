<script setup lang="ts">
// Oposiciones: qué oposiciones puede preparar el estudiante con sus estudios.
// Todo se calcula en el navegador (src/lib/oposiciones.ts): no se guarda nada.
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { FUENTE_PLAZAS, NIVELES, RAMAS, TITULACIONES, type Ambito, type Nivel, type Rama } from '@/contenido/oposiciones'
import { ENCAJES, abiertasConMaster, buscarOposiciones, formatoPlazas, ramaDe, type MasterProfesorado, type Perfil } from '@/lib/oposiciones'
import AppIcon from '@/components/comun/AppIcon.vue'
import Pendiente from '@/components/comun/Pendiente.vue'

const PREFIJO_RAMA = 'rama:'

// Quien usa SINTONÍA está haciendo un máster: es el valor de partida.
const nivel = ref<Nivel>(6)
const estudios = ref('') // una titulación, «rama:<rama>» o vacío
const master = ref<MasterProfesorado>('no')
const ambito = ref<Ambito | 'Todos'>('Todos')

const OPCIONES_MASTER: { valor: MasterProfesorado; texto: string }[] = [
  { valor: 'si', texto: 'Sí' },
  { valor: 'cursando', texto: 'Lo estoy cursando' },
  { valor: 'no', texto: 'No' },
]
const OPCIONES_AMBITO: (Ambito | 'Todos')[] = ['Todos', 'Estado', 'Castilla y León']

const universitario = computed(() => nivel.value >= 4)
const conGrado = computed(() => nivel.value >= 5)

const perfil = computed<Perfil>(() => {
  const e = universitario.value ? estudios.value : ''
  const titulacion = e && !e.startsWith(PREFIJO_RAMA) ? e : null
  const rama = e.startsWith(PREFIJO_RAMA) ? (e.slice(PREFIJO_RAMA.length) as Rama) : titulacion ? ramaDe(titulacion) : null
  return { nivel: nivel.value, rama, titulacion, master: conGrado.value ? master.value : 'no', ambito: ambito.value }
})

const resultados = computed(() => buscarOposiciones(perfil.value))
const grupos = computed(() =>
  ENCAJES.map((e) => ({ ...e, lista: resultados.value.filter((r) => r.encaje === e.clave) })).filter((g) => g.lista.length),
)
const conMaster = computed(() => (conGrado.value ? abiertasConMaster(perfil.value) : 0))
const sinEstudios = computed(() => universitario.value && !estudios.value)

const plural = (n: number, uno: string, varios: string) => `${formatoPlazas(n)} ${n === 1 ? uno : varios}`
</script>

<template>
  <div class="fade-in max-w-3xl">
    <h1 class="titulo-pagina">Oposiciones</h1>
    <p class="texto-suave mt-1 mb-8">
      Por si, además del doctorado, te planteas opositar: qué oposiciones puedes preparar con tus estudios.
    </p>

    <section class="card p-5 sm:p-6 mb-8" aria-labelledby="t-estudios">
      <h2 id="t-estudios" class="font-semibold text-surface-900 mb-4">Tus estudios</h2>

      <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label for="op-nivel" class="label">Nivel de estudios más alto</label>
          <select id="op-nivel" v-model.number="nivel" class="input-field">
            <option v-for="n in [...NIVELES].reverse()" :key="n.valor" :value="n.valor">{{ n.texto }}</option>
          </select>
        </div>

        <div v-if="universitario">
          <label for="op-titulacion" class="label">Tu titulación de grado</label>
          <select id="op-titulacion" v-model="estudios" class="input-field" aria-describedby="op-titulacion-ayuda">
            <option value="">Elige tu titulación</option>
            <optgroup v-for="r in RAMAS" :key="r" :label="r">
              <option v-for="tit in TITULACIONES[r]" :key="tit" :value="tit">{{ tit }}</option>
              <option :value="PREFIJO_RAMA + r">Otra de {{ r }}</option>
            </optgroup>
          </select>
          <p id="op-titulacion-ayuda" class="text-xs texto-suave mt-1.5">Sirve para destacar las que encajan con lo que has estudiado.</p>
        </div>
      </div>

      <fieldset v-if="conGrado" class="mt-5">
        <legend class="label">¿Tienes el Máster en Formación del Profesorado?</legend>
        <div class="flex flex-wrap gap-2">
          <label v-for="o in OPCIONES_MASTER" :key="o.valor" class="cursor-pointer">
            <input v-model="master" type="radio" name="op-master" :value="o.valor" class="sr-only peer" />
            <span class="opcion-caja inline-flex items-center px-4 min-h-tactil text-sm font-medium rounded-pill border border-[color:var(--color-borde-control)] bg-papel text-surface-900 transition-colors duration-150 hover:border-surface-900 peer-checked:bg-brand-900 peer-checked:text-papel peer-checked:border-brand-900 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-lumbre">{{ o.texto }}</span>
          </label>
        </div>
      </fieldset>

      <fieldset class="mt-5">
        <legend class="label">Ámbito</legend>
        <div class="flex flex-wrap gap-2">
          <label v-for="a in OPCIONES_AMBITO" :key="a" class="cursor-pointer">
            <input v-model="ambito" type="radio" name="op-ambito" :value="a" class="sr-only peer" />
            <span class="opcion-caja inline-flex items-center px-4 min-h-tactil text-sm font-medium rounded-pill border border-[color:var(--color-borde-control)] bg-papel text-surface-900 transition-colors duration-150 hover:border-surface-900 peer-checked:bg-brand-900 peer-checked:text-papel peer-checked:border-brand-900 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-lumbre">{{ a }}</span>
          </label>
        </div>
      </fieldset>

      <p class="mt-5 pt-4 border-t border-surface-200 text-xs texto-suave flex items-start gap-2">
        <AppIcon name="lock" :size="14" class="shrink-0 mt-px" />
        Lo que eliges aquí no se guarda ni lo ve nadie: la lista se calcula en tu dispositivo.
      </p>
    </section>

    <div aria-live="polite" class="mb-6">
      <h2 class="font-display text-2xl font-medium text-surface-900" data-recuento>
        {{ resultados.length === 1 ? '1 oposición' : `${resultados.length} oposiciones` }} para tu perfil
      </h2>
      <p v-if="sinEstudios" class="text-sm texto-suave mt-1">Elige tu titulación para ver primero las que encajan con lo que has estudiado.</p>
      <p v-if="conMaster" class="text-sm mt-3 flex items-start gap-2 text-surface-900">
        <AppIcon name="bulb" :size="18" class="shrink-0" />
        <span>Con el Máster en Formación del Profesorado podrías presentarte a {{ conMaster === 1 ? 'una más' : `${conMaster} más` }}, de Secundaria.</span>
      </p>
    </div>

    <p v-if="!resultados.length" class="card p-5 texto-suave">
      Con estos datos no hay oposiciones en la base de datos. Prueba con otro ámbito.
    </p>

    <section v-for="g in grupos" :key="g.clave" class="mb-8" :aria-labelledby="`g-${g.clave}`" :data-encaje="g.clave">
      <div class="flex items-baseline justify-between gap-3 mb-1">
        <h3 :id="`g-${g.clave}`" class="font-semibold text-surface-900">{{ g.titulo }}</h3>
        <span class="text-xs texto-suave tabular-nums shrink-0">{{ g.lista.length }}</span>
      </div>
      <p class="text-sm texto-suave mb-3">{{ g.texto }}</p>

      <ul class="card divide-y divide-surface-200">
        <li v-for="r in g.lista" :key="r.oposicion.id" class="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
          <div class="flex-1 min-w-0">
            <p class="font-medium text-surface-900 leading-snug">{{ r.oposicion.nombre }}</p>
            <div class="flex flex-wrap items-center gap-1.5 mt-2">
              <span class="badge badge-sky">{{ r.oposicion.ambito }}</span>
              <span v-if="r.oposicion.grupo" class="badge badge-sky">Grupo {{ r.oposicion.grupo }}</span>
              <span v-else class="badge badge-amber">Grupo por confirmar</span>
              <span v-if="r.alTerminarMaster" class="badge badge-lumbre">Al terminar el Máster</span>
            </div>
            <p v-if="r.oposicion.requisito" class="text-sm texto-suave mt-2 flex items-start gap-1.5">
              <AppIcon name="info" :size="16" class="shrink-0 mt-0.5" />
              <span><span class="sr-only">Requisito adicional: </span>{{ r.oposicion.requisito }}</span>
            </p>
          </div>
          <p class="text-sm sm:text-right shrink-0 tabular-nums">
            <span class="font-display text-lg font-medium text-surface-900">{{ formatoPlazas(r.oposicion.plazas) }}</span>
            <span class="texto-suave ml-1">{{ r.oposicion.plazas === 1 ? 'plaza' : 'plazas' }}</span>
          </p>
        </li>
      </ul>
    </section>

    <section class="mt-10 space-y-4 text-sm" aria-labelledby="t-antes">
      <h2 id="t-antes" class="font-semibold text-surface-900">Antes de decidir</h2>
      <p class="texto-suave leading-relaxed">
        Esta lista orienta, no sustituye a la convocatoria. Comprueba los requisitos, el temario y los plazos en el
        boletín oficial: el BOE para las del Estado y el BOCYL para las de Castilla y León.
      </p>
      <p><span class="texto-suave">Plazas: </span><Pendiente :texto="FUENTE_PLAZAS" /></p>
      <details class="card p-4">
        <summary class="cursor-pointer font-medium text-surface-900">Qué significa cada grupo</summary>
        <dl class="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          <dt class="font-semibold text-surface-900">A1</dt><dd class="texto-suave">Grado universitario o Licenciatura.</dd>
          <dt class="font-semibold text-surface-900">A2</dt><dd class="texto-suave">Grado universitario o Diplomatura.</dd>
          <dt class="font-semibold text-surface-900">C1</dt><dd class="texto-suave">Bachillerato o Técnico de FP.</dd>
          <dt class="font-semibold text-surface-900">C2</dt><dd class="texto-suave">Graduado en ESO.</dd>
        </dl>
        <p class="texto-suave mt-3">Con un título superior al que se pide también puedes presentarte.</p>
      </details>
      <p>
        <RouterLink to="/estudiante/puente" class="enlace inline-flex items-center min-h-tactil">Volver a Puente al doctorado</RouterLink>
      </p>
    </section>
  </div>
</template>
