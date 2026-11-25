// Genera los iconos PNG del logotipo a partir del SVG (public/favicon.svg):
// apple-touch-icon.png (180 px, fondo blanco, para la pantalla de inicio del
// móvil). Uso: node scripts/generar-iconos.mjs
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(raiz, 'public', 'favicon.svg'), 'utf8').replace(/<style>[\s\S]*?<\/style>/, '<style>.p{fill:#1B1B1B}</style>')
const navegador = await chromium.launch()
const pagina = await navegador.newPage({ viewport: { width: 180, height: 180 } })
await pagina.setContent(`<body style="margin:0;background:#fff;display:grid;place-items:center;width:180px;height:180px"><div style="width:120px;height:120px">${svg.replace('<svg ', '<svg width="120" height="120" ')}</div></body>`)
await pagina.screenshot({ path: join(raiz, 'public', 'apple-touch-icon.png') })
await navegador.close()
console.log('public/apple-touch-icon.png')
