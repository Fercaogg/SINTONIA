// Convierte el logotipo de SINTONÍA (símbolo SVG de src/components/comun/SimboloSintonia.vue
// y nombre en Instrument Sans 600, como AppLogo.vue) a PNG transparente con Chromium.
// Uso: node brand/plantillas/carta-apoyo-tcue/logotipo.mjs
import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)('playwright')
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { readFileSync } from 'node:fs'
const aqui = path.dirname(fileURLToPath(import.meta.url))
const fuente = path.resolve(aqui, '../../../src/assets/fuentes/instrument-sans-latin-600-normal.woff2')
const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:IS;src:url(data:font/woff2;base64,${readFileSync(fuente).toString('base64')}) format('woff2');font-weight:600}
html,body{margin:0;background:transparent}
#l{display:inline-flex;align-items:center;gap:.4em;font:600 200px/1 IS;letter-spacing:-.04em;color:#1B1B1B;padding:0}
#l svg{width:1.15em;height:1.15em;flex-shrink:0}
</style><span id="l"><svg viewBox="0 0 114 114" xmlns="http://www.w3.org/2000/svg">
<path d="M50 30A30 30 0 0 1 80 0H114A30 30 0 0 1 84 30Z" fill="#1B1B1B"/>
<path d="M0 42H84A30 30 0 0 1 114 72H30A30 30 0 0 1 0 42Z" fill="#F25A1F"/>
<path d="M0 114A30 30 0 0 1 30 84H64A30 30 0 0 1 34 114Z" fill="#1B1B1B"/></svg><span>SINTONÍA</span></span>`
const b = await chromium.launch()
const p = await b.newPage({ deviceScaleFactor: 2 })
await p.setContent(html)
await p.evaluate(() => document.fonts.ready)
await p.locator('#l').screenshot({ path: path.join(aqui, 'recursos/sintonia-logotipo.png'), omitBackground: true })
await b.close()
