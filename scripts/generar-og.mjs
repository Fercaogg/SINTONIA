// Genera la imagen para compartir en redes (Open Graph), 1200 x 630:
// las dos ondas en sintonía, el nombre y el titular, sobre el azul marino
// de la marca. Uso: node scripts/generar-og.mjs  (crea public/og.png)

import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'

const fuente = (peso) => readFileSync(`node_modules/@fontsource/fira-sans/files/fira-sans-latin-${peso}-normal.woff2`).toString('base64')

function onda(y0, amplitud, fase) {
  const puntos = []
  for (let x = 0; x <= 1200; x += 6) puntos.push(`${x === 0 ? 'M' : 'L'}${x},${(y0 + amplitud * Math.sin((2 * Math.PI * (x + fase)) / 240)).toFixed(1)}`)
  return puntos.join(' ')
}

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Fira; font-weight: 700; src: url(data:font/woff2;base64,${fuente(700)}) format('woff2'); }
@font-face { font-family: Fira; font-weight: 400; src: url(data:font/woff2;base64,${fuente(400)}) format('woff2'); }
body { margin: 0; width: 1200px; height: 630px; background: #0A4A6C; color: #fff; font-family: Fira, sans-serif; overflow: hidden; position: relative; }
.marca { position: absolute; left: 80px; top: 72px; font-weight: 700; font-size: 44px; letter-spacing: -0.5px; }
.marca span { color: #34C6A3; }
h1 { position: absolute; left: 80px; top: 170px; margin: 0; font-weight: 700; font-size: 76px; line-height: 1.04; letter-spacing: -1.5px; max-width: 980px; }
h1 span { color: #4ED7C2; }
svg { position: absolute; left: 0; bottom: 40px; }
</style></head><body>
<div class="marca">SINTON<span>ÍA</span></div>
<h1>Acompañar el trabajo académico, <span>sin vigilar</span></h1>
<svg width="1200" height="160" viewBox="0 0 1200 160">
  <path d="${onda(80, 28, 26)}" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="7" stroke-linecap="round"/>
  <path d="${onda(80, 34, 0)}" fill="none" stroke="#34C6A3" stroke-width="7" stroke-linecap="round" stroke-dasharray="1 0"/>
</svg>
</body></html>`

const navegador = await chromium.launch()
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } })
await pagina.setContent(html)
await pagina.evaluate(() => document.fonts.ready)
await pagina.screenshot({ path: 'public/og.png' })
await navegador.close()
console.log('public/og.png creada (1200 x 630).')
