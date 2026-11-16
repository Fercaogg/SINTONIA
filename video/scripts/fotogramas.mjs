// Saca imágenes fijas del vídeo en out/storyboard/.
// Sin argumentos: las del storyboard (scripts/fotogramas.json).
// Con segundos (por ejemplo: node scripts/fotogramas.mjs 3.5 12): esos instantes.
import { renderStill, selectComposition } from '@remotion/renderer'
import { mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { raiz, browserExecutable, empaquetar } from './comun.mjs'

const args = process.argv.slice(2)
const lista = args.length ? args.map((s) => ({ id: `t${s}`, seg: Number(s) })) : JSON.parse(readFileSync(path.join(raiz, 'scripts/fotogramas.json'), 'utf8'))
const escala = Number(process.env.ESCALA || 1)
const serveUrl = await empaquetar()
const composition = await selectComposition({ serveUrl, id: 'Video', browserExecutable })
mkdirSync(path.join(raiz, 'out/storyboard'), { recursive: true })
for (const f of lista) {
  await renderStill({ composition, serveUrl, frame: Math.round(f.seg * composition.fps), output: path.join(raiz, `out/storyboard/${f.id}.png`), browserExecutable, scale: escala, logLevel: 'error' })
  console.log('imagen', f.id)
}
