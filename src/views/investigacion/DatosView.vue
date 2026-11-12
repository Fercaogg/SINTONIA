<script setup lang="ts">
// Investigación: descarga de los datos seudonimizados y registro de auditoría.
import { onMounted, ref } from 'vue'
import { llamar, mensajeDeError } from '@/lib/api'
import { aCsv, descargar, pivotarCuestionario, type RespuestaCuestionario } from '@/lib/csv'
import { COLUMNAS_INVESTIGACION } from '@/lib/columnas-exportacion'
import { fechaCorta, horaDe } from '@/lib/fechas'
import AppIcon from '@/components/comun/AppIcon.vue'
import AvisoError from '@/components/comun/AvisoError.vue'

interface Registro { created_at: string; accion: string; rol: string | null; quien: string | null; detalle: Record<string, unknown> }

const ACCIONES: Record<string, string> = {
  exportacion_investigacion: 'Descarga de los datos semanales',
  exportacion_cuestionarios: 'Descarga de los cuestionarios',
  descarga_mis_datos: 'Una persona descargó sus propios datos',
  consentimiento_aceptado: 'Consentimiento aceptado',
  retirada: 'Retirada del estudio',
  borrado_completo: 'Borrado completo de una cuenta',
  master_creado: 'Máster creado',
  codigos_creados: 'Códigos creados',
  calendario_configurado: 'Calendario configurado',
  convocatoria_guardada: 'Convocatoria guardada',
}

const trabajando = ref('')
const error = ref('')
const aviso = ref('')
const registro = ref<Registro[]>([])

const hoy = () => new Date().toISOString().slice(0, 10)

async function cargarRegistro() {
  registro.value = await llamar('auditoria_reciente', { p_limite: 50 })
}

onMounted(() => cargarRegistro().catch((e) => (error.value = mensajeDeError(e))))

async function descargarSemanal() {
  trabajando.value = 'semanal'
  error.value = ''
  try {
    const filas = await llamar<Record<string, unknown>[]>('exportar_investigacion')
    descargar(`sintonia_semanal_${hoy()}.csv`, aCsv(filas, [...COLUMNAS_INVESTIGACION]))
    aviso.value = `Descargadas ${filas.length} filas.`
    await cargarRegistro()
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    trabajando.value = ''
  }
}

async function descargarCuestionarios() {
  trabajando.value = 'cuestionarios'
  error.value = ''
  try {
    const [respuestas, variables] = await Promise.all([
      llamar<RespuestaCuestionario[]>('exportar_cuestionarios'),
      llamar<Record<string, string[]>>('variables_cuestionarios'),
    ])
    for (const [clave, vars] of Object.entries(variables)) {
      const filas = pivotarCuestionario(respuestas, clave, vars)
      descargar(`sintonia_${clave}_${hoy()}.csv`, aCsv(filas, ['id_estudiante', 'id_pareja', 'master', 'cuestionario', 'respondido_at', ...vars]))
    }
    aviso.value = 'Descargados los archivos del pretest y del postest.'
    await cargarRegistro()
  } catch (e) {
    error.value = mensajeDeError(e)
  } finally {
    trabajando.value = ''
  }
}
</script>

<template>
  <div class="fade-in max-w-3xl">
    <h1 class="titulo-pagina">Datos para el análisis</h1>
    <p class="texto-suave mt-1 mb-8">
      Archivos CSV seudonimizados: cada persona y cada pareja aparecen con un código, nunca con su nombre. Las variables están descritas en
      <strong>DATOS.md</strong>, y el script <strong>analisis/analisis_ejemplo.R</strong> carga el archivo semanal.
    </p>

    <AvisoError v-if="error" :mensaje="error" class="mb-6" />
    <p v-if="aviso" class="aviso-exito mb-6" role="status">{{ aviso }}</p>

    <div class="grid gap-4 sm:grid-cols-2 mb-8">
      <section class="card p-5" aria-labelledby="t-sem">
        <h2 id="t-sem" class="font-semibold text-surface-900">Datos semanales</h2>
        <p class="text-sm texto-suave mt-1 mb-4">Una fila por pareja y semana: check-ins, desajuste, sorteo, agenda, Puente y bienestar.</p>
        <button type="button" class="btn-primary" :disabled="!!trabajando" @click="descargarSemanal">
          <AppIcon name="download" :size="16" /> {{ trabajando === 'semanal' ? 'Preparando...' : 'Descargar CSV' }}
        </button>
      </section>
      <section class="card p-5" aria-labelledby="t-cue">
        <h2 id="t-cue" class="font-semibold text-surface-900">Pretest y postest</h2>
        <p class="text-sm texto-suave mt-1 mb-4">Un archivo por cuestionario: una fila por estudiante y una columna por variable.</p>
        <button type="button" class="btn-primary" :disabled="!!trabajando" @click="descargarCuestionarios">
          <AppIcon name="download" :size="16" /> {{ trabajando === 'cuestionarios' ? 'Preparando...' : 'Descargar CSV' }}
        </button>
      </section>
    </div>

    <p class="aviso-pendiente mb-8">
      El archivo semanal incluye la respuesta de bienestar, que es un dato especialmente protegido. Guárdalo cifrado y no lo compartas.
      Cada descarga queda registrada.
    </p>

    <section class="card p-5 sm:p-6" aria-labelledby="t-aud">
      <h2 id="t-aud" class="font-semibold text-surface-900 mb-1">Registro de auditoría</h2>
      <p class="text-sm texto-suave mb-4">Accesos a datos sensibles, descargas y cambios de configuración (últimos 50).</p>
      <ul class="divide-y divide-surface-200">
        <li v-for="(r, i) in registro" :key="i" class="py-2 text-sm flex flex-col sm:flex-row sm:justify-between gap-1">
          <span class="text-surface-900">{{ ACCIONES[r.accion] ?? r.accion }}</span>
          <span class="texto-suave tabular-nums">{{ r.quien ?? 'cuenta borrada' }} · {{ fechaCorta(r.created_at) }}, {{ horaDe(r.created_at) }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>
