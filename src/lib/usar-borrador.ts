// Borrador de un formulario de check-in (ver src/lib/borrador.ts):
//  * mientras haya cambios sin enviar, se guardan en el navegador (sin las
//    preguntas privadas) y se avisa si se intenta cerrar la pestaña;
//  * al volver, la pantalla los recupera con `recuperar()`;
//  * al enviar con éxito, `descartar()`.

import { computed, onBeforeUnmount, onMounted, watch, type Ref } from 'vue'
import { borrarBorrador, guardarBorrador, leerBorrador } from './borrador'

interface Opciones<T> {
  /** Clave del borrador, o null mientras no se pueda guardar (sin datos, semana cerrada...). */
  clave: Ref<string | null>
  /** Cierre de la semana: el borrador caduca entonces. */
  caduca: Ref<string | undefined>
  /** Lo que ya está enviado. */
  enviado: Ref<T>
  /** Lo que se puede guardar en el navegador (quita lo privado). */
  guardable: (v: T) => T
}

const igual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

export function useBorrador<T>(valores: Ref<T>, o: Opciones<T>) {
  /** Hay cambios sin enviar (incluidas las preguntas privadas). */
  const pendiente = computed(() => !!o.clave.value && !igual(valores.value, o.enviado.value))

  watch(
    valores,
    (v) => {
      const clave = o.clave.value
      if (!clave || !o.caduca.value) return
      const g = o.guardable(v)
      if (igual(g, o.guardable(o.enviado.value))) borrarBorrador(clave)
      else guardarBorrador(clave, g, o.caduca.value)
    },
    { deep: true },
  )

  function alSalir(ev: BeforeUnloadEvent) {
    if (!pendiente.value) return
    ev.preventDefault()
    ev.returnValue = '' // Navegadores antiguos.
  }
  onMounted(() => window.addEventListener('beforeunload', alSalir))
  onBeforeUnmount(() => window.removeEventListener('beforeunload', alSalir))

  return {
    pendiente,
    recuperar: (): T | null => (o.clave.value ? leerBorrador<T>(o.clave.value) : null),
    descartar: () => {
      if (o.clave.value) borrarBorrador(o.clave.value)
    },
  }
}
