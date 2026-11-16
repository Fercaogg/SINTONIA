// Monta STORYBOARD.pdf con las imágenes de out/storyboard/ y los textos de src/guion.ts.
// Uso: npm run storyboard
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { buildSync } from 'esbuild'

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)

// 1. Dibujar las imágenes fijas.
execFileSync('node', [path.join(raiz, 'scripts/fotogramas.mjs')], { stdio: 'inherit' })

// 2. Leer el guion y la lista de imágenes.
mkdirSync(path.join(raiz, 'out'), { recursive: true })
buildSync({ entryPoints: [path.join(raiz, 'src/guion.ts')], outfile: path.join(raiz, 'out/guion.mjs'), format: 'esm' })
const { GUION, DURACION_TOTAL } = await import(pathToFileURL(path.join(raiz, 'out/guion.mjs')).href)
const fuente = readFileSync(path.join(raiz, 'src/storyboard.tsx'), 'utf8')
const fotogramas = [...fuente.matchAll(/id: '(\d+)', escena: (\d+)(?:, pie: '([^']*)')?/g)].map((m) => ({ id: m[1], escena: Number(m[2]), pie: m[3] }))

const img = (id) => 'data:image/png;base64,' + readFileSync(path.join(raiz, `out/storyboard/${id}.png`)).toString('base64')
const reloj = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
const simbolo = readFileSync(path.join(raiz, '../public/brand/sintonia-simbolo.svg'), 'utf8').replace('viewBox="0 0 2000 2000"', 'viewBox="330 291 1340 1340" width="120" height="120"')

const letra = [400, 600, 700].map((w) => `@font-face{font-family:"Fira Sans";font-weight:${w};src:url(data:font/woff2;base64,${readFileSync(path.join(raiz, `node_modules/@fontsource/fira-sans/files/fira-sans-latin-${w}-normal.woff2`)).toString('base64')})}`).join('')

const paginas = fotogramas.map((f) => {
  const e = GUION.find((g) => g.n === f.escena)
  const primera = fotogramas.find((x) => x.escena === f.escena).id === f.id
  return `<section>
    <header><span class="num">Escena ${e.n}</span><h2>${e.titulo}${primera ? '' : ' (continuación)'}</h2><span class="tiempo">${reloj(e.inicio)} a ${reloj(e.fin)} · ${e.fin - e.inicio} s</span></header>
    <div class="cuerpo">
      <figure><img src="${img(f.id)}">${f.pie ? `<figcaption>${f.pie}</figcaption>` : ''}</figure>
      <aside>${primera ? `
        <h3>Texto en pantalla</h3><ul>${e.textos.map((t) => `<li>${t}</li>`).join('')}</ul>
        <h3>Locución</h3><p class="voz">${e.locucion}</p>
        <h3>Movimiento</h3><p>${e.movimiento}</p>` : `<h3>Misma escena</h3><p>Esta imagen pertenece a la escena ${e.n}. El texto y la locución están en la página anterior.</p>`}
      </aside>
    </div>
  </section>`
})

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${letra}
  @page { size: A4 landscape; margin: 0 }
  * { box-sizing: border-box } body { margin: 0; font-family: "Fira Sans", sans-serif; color: #0A4A6C }
  section { width: 297mm; height: 210mm; padding: 12mm 14mm; page-break-after: always; display: flex; flex-direction: column }
  header { display: flex; align-items: baseline; gap: 5mm; border-bottom: 0.6mm solid #34C6A3; padding-bottom: 3mm; margin-bottom: 6mm }
  header h2 { margin: 0; font-size: 20pt; flex: 1 } .num { font-size: 11pt; font-weight: 600; background: #0A4A6C; color: #fff; padding: 1mm 3mm; border-radius: 2mm }
  .tiempo { font-size: 11pt; color: #5A6B75 }
  .cuerpo { display: grid; grid-template-columns: 178mm 1fr; gap: 8mm; flex: 1 }
  figure { margin: 0 } img { width: 100%; border: 0.3mm solid #E3EAEA; border-radius: 2mm; display: block }
  figcaption { font-size: 10pt; color: #5A6B75; margin-top: 2mm }
  aside h3 { font-size: 9pt; text-transform: uppercase; letter-spacing: 0.08em; color: #1d7060; margin: 0 0 1.5mm }
  aside p, aside li { font-size: 10.5pt; line-height: 1.45; color: #3A4A54; margin: 0 0 5mm } aside ul { margin: 0 0 5mm; padding-left: 5mm } aside li { margin: 0 0 1mm; font-weight: 600; color: #0A4A6C }
  .voz { border-left: 0.8mm solid #E3EAEA; padding-left: 3mm }
  .portada { justify-content: center; align-items: center; text-align: center }
  .portada h1 { font-size: 44pt; letter-spacing: 0.02em; margin: 6mm 0 2mm } .portada p { font-size: 13pt; color: #5A6B75; margin: 1mm 0 }
</style></head><body>
  <section class="portada">${simbolo}<h1>SINTONÍA</h1><p style="font-size:18pt;color:#0A4A6C;font-weight:600">Storyboard del vídeo explicativo</p>
    <p>${GUION.length} escenas · ${reloj(DURACION_TOTAL)} de duración · 1920 × 1080</p><p>Primera fase: imágenes fijas para aprobar antes de animar</p></section>
  ${paginas.join('\n')}
</body></html>`
writeFileSync(path.join(raiz, 'out/storyboard.html'), html)

// 3. Imprimir el PDF.
const { chromium } = require('playwright')
const navegador = await chromium.launch()
const pagina = await navegador.newPage()
await pagina.goto(pathToFileURL(path.join(raiz, 'out/storyboard.html')).href)
await pagina.evaluate(() => document.fonts.ready)
await pagina.pdf({ path: path.join(raiz, 'STORYBOARD.pdf'), format: 'A4', landscape: true, printBackground: true })
await navegador.close()
console.log('Hecho: video/STORYBOARD.pdf')
