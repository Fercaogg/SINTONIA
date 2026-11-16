// Idioma de las páginas públicas (Fase 5 de las mejoras). La aplicación
// interna (paneles) sigue solo en español.
//
// Las páginas en inglés cuelgan de /en (src/router/index.ts, meta.idioma) y
// usan los mismos componentes: cada texto lleva sus dos versiones con t().
// ruta() convierte un enlace en español en su equivalente en inglés, si existe
// (src/contenido/paginas.json, campo "alterna").
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PAGINAS from '@/contenido/paginas.json'

export type Idioma = 'es' | 'en'
const PARES = PAGINAS as { ruta: string; alterna?: string }[]

export function rutaEn(rutaEs: string): string | null {
  const [base, ancla] = rutaEs.split('#')
  const p = PARES.find((x) => x.ruta === (base || '/') && x.alterna)
  return p ? p.alterna + (ancla ? `#${ancla}` : '') : null
}

export function useIdioma() {
  // Fuera del enrutador (pruebas unitarias), español.
  let route: ReturnType<typeof useRoute> | undefined
  try {
    route = useRoute()
  } catch {
    route = undefined
  }
  const idioma = computed<Idioma>(() => (route?.meta?.idioma === 'en' ? 'en' : 'es'))
  const t = (es: string, en: string) => (idioma.value === 'en' ? en : es)
  /** Enlace a una página: en inglés, su versión en inglés si existe. */
  const ruta = (rutaEs: string) => (idioma.value === 'en' ? (rutaEn(rutaEs) ?? rutaEs) : rutaEs)
  /** En inglés, ¿esta página solo existe en español? (para avisarlo junto al enlace). */
  const soloEnEspanol = (rutaEs: string) => idioma.value === 'en' && !rutaEn(rutaEs)
  return { idioma, t, ruta, soloEnEspanol }
}
