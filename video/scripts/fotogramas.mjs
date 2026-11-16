// Dibuja las imágenes fijas del storyboard en out/storyboard/.
import { bundle } from '@remotion/bundler'
import { renderStill, selectComposition } from '@remotion/renderer'
import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const navegadorLocal = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell'
const browserExecutable = process.env.NAVEGADOR || (existsSync(navegadorLocal) ? navegadorLocal : undefined)
const solo = process.argv.slice(2)

const serveUrl = await bundle({ entryPoint: path.join(raiz, 'src/index.ts') })
const composition = await selectComposition({ serveUrl, id: 'Storyboard', browserExecutable })
mkdirSync(path.join(raiz, 'out/storyboard'), { recursive: true })
for (let f = 0; f < composition.durationInFrames; f++) {
  const nombre = String(f + 1).padStart(2, '0')
  if (solo.length && !solo.includes(nombre)) continue
  await renderStill({ composition, serveUrl, frame: f, output: path.join(raiz, `out/storyboard/${nombre}.png`), browserExecutable })
  console.log('fotograma', nombre)
}
