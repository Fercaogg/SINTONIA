// Genera la locución con Piper (voz libre es_ES-davefx, dominio público CC0).
// Crea un audio por frase en public/voz/ y apunta sus tiempos en src/voz.json.
// Uso: npm run voz      (necesita: pip install piper-tts)
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { buildSync } from 'esbuild'
import { raiz } from './comun.mjs'

const VOZ = 'es_ES-davefx-medium'
const VELOCIDAD = Number(process.env.VELOCIDAD || 1.08) // más de 1 = más despacio

const modelo = path.join(raiz, 'voces', `${VOZ}.onnx`)
if (!existsSync(modelo)) {
  mkdirSync(path.join(raiz, 'voces'), { recursive: true })
  const base = `https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/davefx/medium/${VOZ}.onnx`
  for (const [u, f] of [[base, modelo], [base + '.json', modelo + '.json']]) execFileSync('curl', ['-sSL', '-o', f, u])
}

buildSync({ entryPoints: [path.join(raiz, 'src/guion.ts')], outfile: path.join(raiz, 'out/guion.mjs'), format: 'esm' })
const { GUION } = await import(pathToFileURL(path.join(raiz, 'out/guion.mjs')).href + '?' + Date.now())

const carpeta = path.join(raiz, 'public/voz')
rmSync(carpeta, { recursive: true, force: true })
mkdirSync(carpeta, { recursive: true })
const dur = (f) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString())
// Solo para que la voz lo pronuncie bien; el texto en pantalla no cambia.
const paraVoz = (s) => s.replace(/SINTONÍA/g, 'Sintonía').replace(/TFM/g, 'te efe eme')

const frases = []
for (const e of GUION) {
  if (e.locucion.startsWith('(')) continue
  let fin = 0
  e.locucion.split(/(?<=[.?!])\s+/).forEach((texto, i) => {
    const archivo = `voz/e${String(e.n).padStart(2, '0')}-${i + 1}.wav`
    const destino = path.join(raiz, 'public', archivo)
    execFileSync('python3', ['-m', 'piper', '-m', modelo, '-f', destino, '--length-scale', String(VELOCIDAD)], { input: paraVoz(texto), stdio: ['pipe', 'ignore', 'ignore'] })
    const d = dur(destino)
    const en = e.voz[i] ?? fin + 0.3 // si falta el tiempo en el guion, va detrás de la anterior
    if (en < fin) console.log(`  OJO, escena ${e.n}: la frase ${i + 1} empieza antes de que acabe la anterior (${fin.toFixed(1)} s)`)
    frases.push({ escena: e.n, archivo, inicio: Number((e.inicio + en).toFixed(2)), dur: Number(d.toFixed(2)), texto })
    fin = en + d
  })
  console.log(`Escena ${e.n}: dura ${e.dur} s y la voz acaba en el segundo ${fin.toFixed(1)}`)
}
writeFileSync(path.join(raiz, 'src/voz.json'), JSON.stringify(frases, null, 1))
console.log('Hecho: public/voz y src/voz.json')
