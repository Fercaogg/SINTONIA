<script setup lang="ts">
// Investigación: pretest y postest. Vista previa de los ítems y número de
// personas que han respondido (nunca respuestas individuales en pantalla).
import { onMounted, ref } from 'vue'
import { llamar, mensajeDeError } from '@/lib/api'
import AvisoError from '@/components/comun/AvisoError.vue'
import EstadoCarga from '@/components/comun/EstadoCarga.vue'
import Pendiente from '@/components/comun/Pendiente.vue'

interface Resumen { clave: string; titulo: string; desde_semana: number; hasta_semana: number; items: number; pendientes: number; personas: number }
interface Item { id: number; bloque: string; texto: string; tipo: string; opciones: string[] | null; ancla_min: string | null; ancla_max: string | null }

const resumen = ref<Resumen[]>([])
const items = ref<Record<string, Item[]>>({})
const cargando = ref(true)
const error = ref('')

const TIPOS: Record<string, string> = { escala: 'Escala', si_no: 'Sí o no', opcion: 'Una opción' }

onMounted(async () => {
  try {
    resumen.value = await llamar('resumen_cuestionarios')
    for (const c of resumen.value) {
      items.value[c.clave] = (await llamar<{ items: Item[] }>('ver_cuestionario', { p_clave: c.clave })).items
    }
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="fade-in max-w-3xl">
    <h1 class="titulo-pagina">Cuestionarios</h1>
    <p class="texto-suave mt-1 mb-8">
      Pretest y postest de los estudiantes. Los textos, escalas e instrucciones se cambian en la tabla
      <code>cuestionario_items</code> de Supabase (ver el README).
    </p>

    <EstadoCarga v-if="cargando" />
    <AvisoError v-else-if="error" :mensaje="error" />
    <section v-for="c in resumen" v-else :key="c.clave" class="card p-5 sm:p-6 mb-6" :aria-labelledby="`t-${c.clave}`">
      <h2 :id="`t-${c.clave}`" class="font-semibold text-surface-900">{{ c.titulo }}</h2>
      <p class="text-sm texto-suave mt-1">
        Abierto
        {{ c.desde_semana === 0 ? 'desde el registro' : `desde la semana ${c.desde_semana}` }}
        hasta el cierre de la semana {{ c.hasta_semana }}.
        {{ c.personas }} {{ c.personas === 1 ? 'persona ha' : 'personas han' }} respondido.
        <template v-if="c.pendientes"> {{ c.pendientes }} {{ c.pendientes === 1 ? 'ítem pendiente' : 'ítems pendientes' }}.</template>
      </p>
      <ol class="mt-4 space-y-3 list-decimal pl-5">
        <li v-for="i in items[c.clave]" :key="i.id" class="text-sm">
          <span class="texto-suave">{{ i.bloque }} · {{ TIPOS[i.tipo] }}</span><br />
          <Pendiente :texto="i.texto" />
          <span v-if="i.opciones" class="block texto-suave mt-1">Opciones: {{ i.opciones.join(' / ') }}</span>
        </li>
      </ol>
    </section>
  </div>
</template>
