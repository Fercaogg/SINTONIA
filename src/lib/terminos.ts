// Términos adaptados al tipo de trabajo en las pantallas (ver terminos-base.ts).

import { computed } from 'vue'
import { useSesion } from '@/stores/sesion'
import { adaptarTexto } from './terminos-base'

export { adaptarTexto }

/** En las pantallas: t('texto') adapta el texto al tipo de trabajo del máster o programa. */
export function useTerminos() {
  const sesion = useSesion()
  const tipo = computed(() => sesion.perfil?.master?.tipo_trabajo ?? null)
  return { tipo, t: (texto: string) => adaptarTexto(texto, tipo.value) }
}
