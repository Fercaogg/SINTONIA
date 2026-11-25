// Busca enlaces rotos en las páginas públicas (src/contenido/paginas.json):
//   - internos: que la dirección no acabe en la página 404 y que exista el
//     apartado (#ancla) al que apunta;
//   - archivos (PDF, imágenes): que respondan 200;
//   - externos (con --externos): que respondan sin error.
// Uso: con la web compilada en marcha (npx vite preview), o contra la publicada:
//   node scripts/comprobar-enlaces.mjs [http://localhost:4173] [--externos]
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const base = (args.find((a) => a.startsWith('http')) || 'http://localhost:4173').replace(/\/$/, '')
const externos = args.includes('--externos')
const paginas = JSON.parse(readFileSync(join(raiz, 'src', 'contenido', 'paginas.json'), 'utf8')).map((p) => p.ruta)

const navegador = await chromium.launch()
const pagina = await navegador.newPage({ reducedMotion: 'reduce' })
const enlaces = new Map() // href -> páginas donde aparece
for (const ruta of paginas) {
  await pagina.goto(base + ruta, { waitUntil: 'networkidle' })
  for (const href of await pagina.$$eval('a[href]', (as) => as.map((a) => a.href))) {
    if (!/^https?:/.test(href)) continue
    if (!enlaces.has(href)) enlaces.set(href, new Set())
    enlaces.get(href).add(ruta)
  }
}

const rotos = []
const esArchivo = (u) => /\.(pdf|png|jpe?g|webp|svg|mp4|webm|xml|txt)$/i.test(u.pathname)
for (const [href, origen] of enlaces) {
  const u = new URL(href)
  const desde = [...origen].join(', ')
  if (u.origin === new URL(base).origin) {
    if (esArchivo(u)) {
      const r = await pagina.request.get(href)
      if (r.status() !== 200) rotos.push(`${href} (${r.status()}) en ${desde}`)
      continue
    }
    await pagina.goto(href, { waitUntil: 'networkidle' })
    if (await pagina.getByRole('heading', { name: 'Esta página no está en sintonía' }).count()) {
      rotos.push(`${u.pathname} (404) en ${desde}`)
    } else if (u.hash && u.hash.length > 1) {
      const id = decodeURIComponent(u.hash.slice(1))
      if (!(await pagina.locator(`[id="${id}"]`).count())) rotos.push(`${u.pathname}${u.hash} (no existe el apartado) en ${desde}`)
    }
  } else if (externos && !/^mailto:|wa\.me/.test(href)) {
    try {
      const r = await fetch(href, { method: 'GET', redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (comprobador de enlaces)' }, signal: AbortSignal.timeout(15000) })
      if (r.status >= 400 && r.status !== 403 && r.status !== 429) rotos.push(`${href} (${r.status}) en ${desde}`)
    } catch (e) {
      rotos.push(`${href} (${e.cause?.code || e.name}) en ${desde}`)
    }
  }
}
await navegador.close()

console.log(`${paginas.length} páginas, ${enlaces.size} enlaces distintos${externos ? '' : ' (externos sin comprobar: añade --externos)'}.`)
if (rotos.length) {
  console.log(`\n${rotos.length} enlaces rotos:`)
  for (const r of rotos) console.log('  - ' + r)
  process.exit(1)
}
console.log('Ningún enlace roto.')
