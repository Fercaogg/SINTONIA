// Genera los iconos del logotipo a partir del SVG (public/favicon.svg):
//   - apple-touch-icon.png (180 px, fondo blanco): pantalla de inicio del iPhone;
//   - icono-192.png e icono-512.png: Android y el manifiesto (site.webmanifest);
//   - icono-maskable-512.png: versión con margen de seguridad para Android;
//   - favicon.ico (16, 32 y 48 px): navegadores y buscadores que no leen SVG
//     (Google muestra este icono junto al resultado).
// Uso: node scripts/generar-iconos.mjs (necesita ImageMagick para el .ico).
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const publica = join(raiz, 'public')
const svg = readFileSync(join(publica, 'favicon.svg'), 'utf8').replace(/<style>[\s\S]*?<\/style>/, '<style>.p{fill:#0A4A6C}</style>')

// [archivo, lado, proporción del símbolo, fondo]
const ICONOS = [
  ['apple-touch-icon.png', 180, 2 / 3, '#fff'],
  ['icono-192.png', 192, 0.75, '#fff'],
  ['icono-512.png', 512, 0.75, '#fff'],
  ['icono-maskable-512.png', 512, 0.55, '#fff'],
  ['favicon-16.png', 16, 1, 'transparent'],
  ['favicon-32.png', 32, 1, 'transparent'],
  ['favicon-48.png', 48, 1, 'transparent'],
]

const navegador = await chromium.launch()
for (const [archivo, lado, proporcion, fondo] of ICONOS) {
  const pagina = await navegador.newPage({ viewport: { width: lado, height: lado } })
  const s = Math.round(lado * proporcion)
  await pagina.setContent(
    `<body style="margin:0;background:${fondo};display:grid;place-items:center;width:${lado}px;height:${lado}px"><div style="width:${s}px;height:${s}px">${svg.replace('<svg ', `<svg width="${s}" height="${s}" `)}</div></body>`,
  )
  await pagina.screenshot({ path: join(publica, archivo), omitBackground: fondo === 'transparent' })
  await pagina.close()
  console.log(`public/${archivo}`)
}
await navegador.close()

// favicon.ico con los tres tamaños; los PNG pequeños solo sirven para crearlo.
const pequenos = ['favicon-16.png', 'favicon-32.png', 'favicon-48.png'].map((f) => join(publica, f))
execFileSync('convert', [...pequenos, join(publica, 'favicon.ico')])
execFileSync('rm', pequenos)
console.log('public/favicon.ico')

// Comprime los PNG sin perder calidad visible.
for (const [archivo] of ICONOS.filter(([a]) => !a.startsWith('favicon-'))) {
  execFileSync('convert', [join(publica, archivo), '-strip', '-define', 'png:compression-level=9', join(publica, archivo)])
}
