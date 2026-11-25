// Sincroniza vercel.json con src/contenido/paginas.json:
//   - una reescritura que sirve cada página pública con su propio HTML
//     (con su título, descripción e imagen para compartir);
//   - la lista de páginas que pueden aparecer en buscadores (las demás
//     llevan la cabecera X-Robots-Tag: noindex).
// Uso: node scripts/sincronizar-vercel.mjs (lo comprueba un test).
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const ARCHIVOS = 'api/|robots\\.txt$|sitemap\\.xml$|og\\.png$|favicon\\.svg$|favicon\\.ico$|icono-[a-z0-9-]+\\.png$|site\\.webmanifest$|apple-touch-icon\\.png$|_vercel/|assets/|clips/|kit/|dosier/|og/'

// Pantallas de la aplicación (src/router/index.ts) que no son páginas públicas.
const PANTALLAS = 'acceso/confirmar|consentimiento/aceptar|dosier/imprimir|estudiante|tutor|direccion|investigador|calendario|cuenta'
const SECCIONES = 'estudiante|tutor|direccion|investigador|calendario|cuenta|og|participantes/imprimir'

export function reglas(paginas) {
  const rutas = paginas.map((p) => p.ruta).filter((r) => r !== '/').map((r) => r.slice(1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  return {
    paginas: { source: `/(${rutas.join('|')})`, destination: '/$1.html' },
    // Solo las pantallas de la aplicación van a index.html; cualquier otra
    // dirección recibe 404.html con el código 404 (ver paginas-estaticas.mjs).
    app: { source: `/(${PANTALLAS})`, destination: '/index.html' },
    appDentro: { source: `/(${SECCIONES})/(.*)`, destination: '/index.html' },
    noIndexar: `/((?!${ARCHIVOS}|$|${rutas.map((r) => r + '$').join('|')}).*)`,
  }
}

export function sincronizar() {
  const paginas = JSON.parse(readFileSync(join(raiz, 'src', 'contenido', 'paginas.json'), 'utf8'))
  const ruta = join(raiz, 'vercel.json')
  const config = JSON.parse(readFileSync(ruta, 'utf8'))
  const r = reglas(paginas)
  config.cleanUrls = false
  config.rewrites = [r.paginas, r.app, r.appDentro]
  const cabecera = config.headers.find((h) => h.headers.some((x) => x.key === 'X-Robots-Tag'))
  cabecera.source = r.noIndexar
  writeFileSync(ruta, JSON.stringify(config, null, 2) + '\n')
  return config
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  sincronizar()
  console.log('vercel.json sincronizado con src/contenido/paginas.json')
}
