<script setup lang="ts">
// Tabla "Quién ve qué", interactiva: al pasar el ratón por un dato (o al
// llegar con el teclado, o al tocarlo en el móvil) se ilumina quién lo ve y
// se cierra un candado donde no hay acceso. El texto de cada celda sigue
// siendo la información completa: el color y el icono solo la refuerzan.
import { computed, ref } from 'vue'
import { useIdioma } from '@/lib/idioma'
import AppIcon from '@/components/comun/AppIcon.vue'

export interface FilaQuienVe {
  dato: string
  tu: string
  tutor: string
  direccion: string
  investigacion: string
}

const props = defineProps<{ filas: FilaQuienVe[] }>()

const { t } = useIdioma()
const COLUMNAS = computed(() => [
  { clave: 'tu', titulo: t('Tú (estudiante)', 'You (student)'), corto: t('Tú', 'You') },
  { clave: 'tutor', titulo: t('Tu tutor/a', 'Your supervisor'), corto: t('Tu tutor/a', 'Your supervisor') },
  { clave: 'direccion', titulo: t('Dirección del máster', 'Programme directors'), corto: t('Dirección', 'Directors') },
  { clave: 'investigacion', titulo: t('Investigación', 'Research'), corto: t('Investigación', 'Research') },
] as const)

type Acceso = 'si' | 'parcial' | 'no'
function acceso(texto: string): Acceso {
  if (/^No\b/.test(texto)) return 'no'
  if (/^(Sí|Yes)$/.test(texto)) return 'si'
  return 'parcial'
}

const activa = ref<number | null>(null)
const valor = (i: number, c: 'tu' | 'tutor' | 'direccion' | 'investigacion') => props.filas[i][c]
</script>

<template>
  <div>
    <!-- Móvil: una tarjeta por dato; al tocarla se ilumina -->
    <ul class="space-y-3 sm:hidden">
      <li v-for="(fila, i) in filas" :key="fila.dato">
        <button
          type="button"
          class="card w-full text-left p-4 quien-tarjeta"
          :aria-pressed="activa === i"
          @click="activa = activa === i ? null : i"
        >
          <span class="block font-semibold text-surface-900 mb-2">{{ fila.dato }}</span>
          <span class="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1.5 text-sm">
            <template v-for="c in COLUMNAS" :key="c.clave">
              <span class="texto-suave">{{ c.corto }}</span>
              <span class="celda" :data-acceso="acceso(valor(i, c.clave))" :data-activa="activa === i">
                <span class="candado" aria-hidden="true"><AppIcon :name="acceso(valor(i, c.clave)) === 'no' ? 'lock' : 'eye'" :size="14" /></span>
                {{ valor(i, c.clave) }}
              </span>
            </template>
          </span>
        </button>
      </li>
    </ul>

    <!-- Escritorio: tabla -->
    <div class="card overflow-x-auto hidden sm:block relative" tabindex="0" role="region" :aria-label="t('Tabla de quién ve qué', 'Who sees what table')" @mouseleave="activa = null">
      <table class="w-full text-sm text-left">
        <caption class="sr-only">{{ t('Quién puede ver cada dato. Pasa por un dato para resaltarlo.', 'Who can see each piece of data. Hover over an item to highlight it.') }}</caption>
        <thead class="bg-surface-100 text-surface-800">
          <tr>
            <th scope="col" class="p-3 font-semibold">{{ t('Dato', 'Data') }}</th>
            <th v-for="c in COLUMNAS" :key="c.clave" scope="col" class="p-3 font-semibold">{{ c.titulo }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(fila, i) in filas"
            :key="fila.dato"
            class="border-t border-surface-200 align-top fila"
            :data-activa="activa === i"
            @mouseenter="activa = i"
          >
            <th scope="row" class="p-0 font-medium text-surface-900">
              <button type="button" class="w-full text-left p-3 min-h-tactil" :aria-pressed="activa === i" @focus="activa = i" @click="activa = i">
                {{ fila.dato }}
              </button>
            </th>
            <td v-for="c in COLUMNAS" :key="c.clave" class="p-3">
              <span class="celda" :data-acceso="acceso(valor(i, c.clave))" :data-activa="activa === i">
                <span class="candado" aria-hidden="true"><AppIcon :name="acceso(valor(i, c.clave)) === 'no' ? 'lock' : 'eye'" :size="14" /></span>
                {{ valor(i, c.clave) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.fila {
  transition: background-color var(--dur-micro) ease;
}
.fila[data-activa='true'] {
  background-color: var(--color-primary-tint-08);
}
.celda {
  display: inline-flex;
  gap: 0.375rem;
  align-items: flex-start;
  border-radius: var(--radius-sm);
  padding: 0.125rem 0.375rem;
  margin: -0.125rem -0.375rem;
  transition: background-color var(--dur-micro) ease;
}
.candado {
  display: inline-flex;
  margin-top: 0.15rem;
  opacity: 0;
  transform: translateY(-3px) scale(0.9);
  transition: opacity var(--dur-micro) var(--ease-out), transform var(--dur-micro) var(--ease-out);
}
/* Fila activa: quien ve el dato se ilumina; donde no hay acceso, el candado se cierra. */
.celda[data-activa='true'][data-acceso='si'],
.celda[data-activa='true'][data-acceso='parcial'] {
  background-color: var(--color-primary-tint-15);
}
.celda[data-activa='true'] .candado {
  opacity: 1;
  transform: none;
}
.celda[data-acceso='no'] .candado {
  color: rgb(var(--rgb-s800));
}
.celda[data-acceso='si'] .candado,
.celda[data-acceso='parcial'] .candado {
  color: rgb(var(--rgb-b900));
}
.quien-tarjeta {
  transition: transform var(--dur-micro) var(--ease-out);
}
.quien-tarjeta:active {
  transform: scale(0.99);
}
@media (prefers-reduced-motion: reduce) {
  .candado {
    transform: none;
  }
}
</style>
