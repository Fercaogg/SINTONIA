<script setup lang="ts">
// Una fecha del calendario: tipo (icono, color y nombre), título, cuándo,
// dónde, con quién y quién la ve.
import { computed } from 'vue'
import { TIPOS, cuando, nombreDia, type Entrada } from '@/lib/calendario'
import { useTerminos } from '@/lib/terminos'
import AppIcon from '@/components/comun/AppIcon.vue'

const props = withDefaults(defineProps<{ entrada: Entrada; conDia?: boolean; compacta?: boolean }>(), { conDia: false, compacta: false })
defineEmits<{ editar: [] }>()

const { t } = useTerminos()
const tipo = computed(() => TIPOS[props.entrada.tipo])
const ev = computed(() => props.entrada.evento)

const quienLoVe = computed(() => {
  const e = ev.value
  if (!e) return 'Convocatoria de Puente al doctorado'
  if (e.ambito === 'privado') return 'Solo tú'
  if (e.ambito === 'master') return 'Todo el máster'
  return e.con ? `Compartido con ${e.con}` : t("Compartido con tu tutor/a")
})

const enlace = computed(() => {
  const u = props.entrada.convocatoria?.enlace ?? ''
  return /^https?:\/\//.test(u) ? u : null
})
</script>

<template>
  <article class="flex gap-3 py-3" :aria-label="`${tipo.etiqueta}: ${entrada.titulo}`">
    <span class="w-1 rounded-full shrink-0" :style="{ backgroundColor: tipo.color }" aria-hidden="true" />
    <div class="flex-1 min-w-0">
      <p class="flex items-center gap-1.5 text-xs font-medium text-surface-800">
        <AppIcon :name="tipo.icono" :size="14" :style="{ color: tipo.color }" />
        {{ tipo.etiqueta }}
        <template v-if="conDia"> · {{ nombreDia(entrada.fecha) }}</template>
      </p>
      <h3 class="font-semibold text-surface-900 break-words">{{ entrada.titulo }}</h3>
      <p class="text-sm texto-suave">
        {{ cuando(entrada) }}<template v-if="ev?.lugar"> · {{ ev.lugar }}</template>
      </p>
      <template v-if="!compacta">
        <p v-if="ev?.con" class="text-sm texto-suave">Con {{ ev.con }}</p>
        <p v-if="ev?.descripcion" class="text-sm text-surface-800 mt-1 whitespace-pre-line break-words">{{ ev.descripcion }}</p>
        <p v-if="entrada.convocatoria?.organismo" class="text-sm texto-suave">{{ entrada.convocatoria.organismo }}</p>
        <p class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs texto-suave">
          <span class="inline-flex items-center gap-1">
            <AppIcon :name="ev?.ambito === 'privado' ? 'lock' : ev?.ambito === 'master' ? 'building' : ev ? 'team' : 'graduation'" :size="12" />
            {{ quienLoVe }}
          </span>
          <span v-if="ev?.autor">Lo anotó: {{ ev.autor }}</span>
        </p>
        <a v-if="enlace" :href="enlace" target="_blank" rel="noopener" class="enlace text-sm inline-flex items-center min-h-tactil">
          Ver la convocatoria oficial<span class="sr-only"> (se abre en otra pestaña)</span>
        </a>
      </template>
    </div>
    <button
      v-if="ev?.editable && !compacta"
      type="button"
      class="btn-secondary self-start !px-3"
      @click="$emit('editar')"
    >
      Editar<span class="sr-only">: {{ entrada.titulo }}</span>
    </button>
  </article>
</template>
