// Genera las imágenes para compartir (Open Graph, 1200 x 630) de cada página
// principal desde la propia web (/og/:clave), en public/og/.
// Uso, con la web en marcha: node scripts/generar-og.mjs [http://localhost:5173]
import { chromium } from 'playwright'
import { mkdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const base = (process.argv[2] || 'http://localhost:5173').replace(/\/$/, '')
const paginas = JSON.parse(readFileSync(join(raiz, 'src', 'contenido', 'paginas.json'), 'utf8')).filter((p) => p.imagen)
mkdirSync(join(raiz, 'public', 'og'), { recursive: true })

const navegador = await chromium.launch()
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 }, colorScheme: 'light', reducedMotion: 'reduce' })
for (const p of paginas) {
  const clave = p.idioma === 'en' ? `en-${p.og}` : p.og
  await pagina.goto(`${base}/og/${clave}`, { waitUntil: 'networkidle' })
  await pagina.addStyleTag({ content: '[data-banda-entorno], .banda-entorno { display: none !important }' })
  await pagina.locator('[data-og-listo]').screenshot({ path: join(raiz, 'public', 'og', `${clave}.png`) })
  console.log('og/' + clave + '.png')
}
await navegador.close()
