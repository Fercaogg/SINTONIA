// Carga de los datos de una pantalla del panel, igual en todas:
//  * `cargando` y `error` para EstadoCarga y AvisoError;
//  * `cargar()` para el botón "Reintentar";
//  * si la carga falló por la red, se reintenta sola al volver la conexión;
//  * con `alVolver` (por defecto), al volver a la pestaña tras un rato se
//    refrescan los datos sin mostrar la rueda (un panel abierto el lunes no
//    debe enseñar el viernes la semana anterior).
//
// No usar `alVolver` en pantallas con formularios rellenados a partir de los
// datos cargados: el refresco borraría lo que se está escribiendo.

import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ErrorSintonia, mensajeDeError } from './api'

/** Tiempo fuera de la pestaña a partir del cual se refresca al volver. */
export const AUSENCIA_MS = 60_000

/**
 * Llama a `fn` cuando la persona vuelve a la pestaña tras al menos
 * AUSENCIA_MS fuera (por ejemplo, para comprobar si la semana ha cambiado).
 */
export function useAlVolver(fn: () => unknown) {
  let ocultaDesde = 0
  function alCambiar() {
    if (document.visibilityState === 'hidden') {
      ocultaDesde = Date.now()
      return
    }
    if (ocultaDesde && Date.now() - ocultaDesde >= AUSENCIA_MS) void fn()
    ocultaDesde = 0
  }
  onMounted(() => document.addEventListener('visibilitychange', alCambiar))
  onBeforeUnmount(() => document.removeEventListener('visibilitychange', alCambiar))
}

export function useCarga(cargarDatos: () => Promise<unknown>, { alVolver = true } = {}) {
  const cargando = ref(true)
  const error = ref('')
  /** La última carga falló (no una acción posterior de la pantalla). */
  const falloCarga = ref(false)
  let enCurso = false
  let sinConexion = false
  let mensajeCarga = ''
  // Si después falla otra acción de la pantalla (guardar, borrar...), su
  // aviso ya no es el de la carga: no debe ofrecer "Reintentar" la carga.
  watch(error, (v) => {
    if (v !== mensajeCarga) falloCarga.value = false
  })

  async function ejecutar(silencioso: boolean) {
    if (enCurso) return
    enCurso = true
    if (!silencioso) {
      cargando.value = true
      error.value = ''
      falloCarga.value = false
    }
    try {
      await cargarDatos()
      sinConexion = false
      if (falloCarga.value) {
        error.value = ''
        falloCarga.value = false
      }
    } catch (e) {
      sinConexion = e instanceof ErrorSintonia && e.codigo === 'SIN_CONEXION'
      // En un refresco silencioso se conservan los datos que ya había.
      if (!silencioso) {
        mensajeCarga = mensajeDeError(e)
        error.value = mensajeCarga
        falloCarga.value = true
      }
    } finally {
      if (!silencioso) cargando.value = false
      enCurso = false
    }
  }

  const cargar = () => ejecutar(false)
  const refrescar = () => ejecutar(true)

  if (alVolver) useAlVolver(() => (falloCarga.value ? cargar() : refrescar()))
  function alVolverLaConexion() {
    if (falloCarga.value && sinConexion) void cargar()
  }

  onMounted(() => {
    void cargar()
    window.addEventListener('online', alVolverLaConexion)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('online', alVolverLaConexion)
  })

  return { cargando, error, falloCarga, cargar, refrescar }
}
