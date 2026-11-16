// Contenido público en el idioma de la página (español o inglés).
import { computed } from 'vue'
import * as ES from '@/contenido/portada'
import * as EN from '@/contenido/en'
import { useIdioma } from './idioma'

export function useContenido() {
  const { idioma } = useIdioma()
  return computed(() =>
    idioma.value === 'en'
      ? { DATOS_CLAVE: EN.DATOS_CLAVE, PASOS: EN.PASOS, PERFILES: EN.PERFILES, PARA_QUIEN: EN.PARA_QUIEN, PREGUNTAS: EN.PREGUNTAS, AUTOR: EN.AUTOR, ANTECEDENTE: EN.ANTECEDENTE }
      : { DATOS_CLAVE: ES.DATOS_CLAVE, PASOS: ES.PASOS, PERFILES: ES.PERFILES, PARA_QUIEN: ES.PARA_QUIEN, PREGUNTAS: ES.PREGUNTAS, AUTOR: ES.AUTOR, ANTECEDENTE: ES.ANTECEDENTE },
  )
}
