// Exporta el vídeo a out/.
//   node scripts/exportar.mjs            -> vídeo completo (out/sintonia.mp4)
//   node scripts/exportar.mjs 4          -> solo la escena 4 (out/escena-04.mp4)
import { renderMedia, selectComposition } from '@remotion/renderer'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { raiz, browserExecutable, empaquetar } from './comun.mjs'

const n = process.argv[2]
const id = n ? `Escena${String(n).padStart(2, '0')}` : 'Video'
const salida = path.join(raiz, 'out', n ? `escena-${String(n).padStart(2, '0')}.mp4` : 'sintonia.mp4')
mkdirSync(path.join(raiz, 'out'), { recursive: true })
const serveUrl = await empaquetar()
const composition = await selectComposition({ serveUrl, id, browserExecutable })
let ultimo = -1
await renderMedia({
  composition, serveUrl, codec: 'h264', outputLocation: salida, browserExecutable, logLevel: 'error', crf: 20,
  onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p !== ultimo) { ultimo = p; console.log(`${p * 10} %`) } },
})
console.log('Hecho:', salida)
