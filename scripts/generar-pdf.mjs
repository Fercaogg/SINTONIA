// Genera los PDF descargables desde la propia web (kit para participantes y,
// más adelante, el dosier) con el navegador de Playwright.
//
// Uso: con la web en marcha (npm run dev o la vista de demostración),
//   node scripts/generar-pdf.mjs [http://localhost:5173]
// Escribe en public/kit/ y public/dosier/. Vuelve a ejecutarlo cuando cambie el contenido.

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const base = (process.argv[2] || 'http://localhost:5173').replace(/\/$/, '')
const DOCUMENTOS = [
  { ruta: '/participantes/imprimir/hoja-informativa', salida: 'kit/hoja-informativa.pdf', titulo: 'SINTONÍA: hoja informativa (borrador)' },
  { ruta: '/participantes/imprimir/consentimiento', salida: 'kit/consentimiento.pdf', titulo: 'SINTONÍA: consentimiento informado (borrador)' },
  { ruta: '/participantes/imprimir/preguntas', salida: 'kit/preguntas.pdf', titulo: 'SINTONÍA: preguntas frecuentes' },
  { ruta: '/dosier/imprimir', salida: 'dosier/sintonia-dosier.pdf', titulo: 'SINTONÍA: dosier' },
]

const navegador = await chromium.launch()
const pagina = await navegador.newPage({ colorScheme: 'light', reducedMotion: 'reduce' })
for (const d of DOCUMENTOS) {
  await pagina.goto(base + d.ruta, { waitUntil: 'networkidle' })
  await pagina.evaluate((t) => (document.title = t), d.titulo)
  const destino = join(raiz, 'public', d.salida)
  mkdirSync(dirname(destino), { recursive: true })
  await pagina.pdf({ path: destino, format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true, outline: true })
  console.log('PDF:', d.salida)
}
await navegador.close()
