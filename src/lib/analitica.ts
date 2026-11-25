// Analítica de visitas sin cookies (Vercel Web Analytics).
//
// - No usa cookies ni guarda nada en el navegador, y no identifica a nadie:
//   solo cuenta visitas por página, país y tipo de dispositivo. Por eso no
//   necesita aviso de cookies (ver /cookies).
// - El script lo sirve la propia web (/_vercel/insights/script.js), así que
//   la CSP no cambia: no se llama a ningún tercero.
// - Solo cuenta las páginas públicas de src/contenido/paginas.json. Nunca los
//   paneles de estudiante, tutor/a, dirección o investigación, ni los enlaces
//   de acceso. Se envía la ruta sin parámetros ni fragmento.
// - Respeta "No rastrear" y Global Privacy Control.
// - Solo se activa en la dirección pública (VITE_URL_SITIO); en local, en
//   las pruebas y en la demostración, no. Se desactiva con VITE_ANALITICA=false.
import paginas from '@/contenido/paginas.json'
import { URL_SITIO } from '@/lib/publico'

const PUBLICAS = new Set(paginas.map((p) => p.ruta))

type Evento = { type: string; url: string }
type Va = ((...args: unknown[]) => void) & { q?: unknown[] }
declare global {
  interface Window {
    va?: Va
    vaq?: unknown[]
  }
  interface Navigator {
    globalPrivacyControl?: boolean
  }
}

/** Devuelve el evento limpio si es de una página pública; si no, null (no se envía). */
export function filtrarEvento(evento: Evento): Evento | null {
  let url: URL
  try {
    url = new URL(evento.url)
  } catch {
    return null
  }
  const ruta = url.pathname.replace(/\.html$/, '').replace(/(.)\/$/, '$1') || '/'
  if (!PUBLICAS.has(ruta)) return null
  return { ...evento, url: url.origin + ruta }
}

export function analiticaPermitida(origen: string, entorno: Record<string, unknown>, nav: Partial<Navigator>): boolean {
  if (entorno.VITE_ANALITICA === 'false' || entorno.VITE_MODO_DEMO === 'true' || !entorno.PROD) return false
  if (nav.doNotTrack === '1' || nav.globalPrivacyControl === true) return false
  return origen === new URL(URL_SITIO).origin
}

export function iniciarAnalitica(): void {
  if (typeof window === 'undefined' || !analiticaPermitida(location.origin, import.meta.env, navigator)) return
  window.va =
    window.va ||
    function (...args: unknown[]) {
      ;(window.vaq = window.vaq || []).push(args)
    }
  window.va('beforeSend', filtrarEvento)
  const script = document.createElement('script')
  script.src = '/_vercel/insights/script.js'
  script.defer = true
  script.dataset.sdkn = 'sintonia'
  document.head.appendChild(script)
}
