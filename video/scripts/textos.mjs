// Escribe SUBTITULOS.srt y LOCUCION.md a partir del guion y de los tiempos de la voz.
// Uso: npm run textos
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { buildSync } from 'esbuild'
import { raiz } from './comun.mjs'

mkdirSync(path.join(raiz, 'out'), { recursive: true })
const cargar = async (f) => {
  const salida = path.join(raiz, 'out', f.replace('.ts', '.mjs'))
  buildSync({ entryPoints: [path.join(raiz, 'src', f)], outfile: salida, format: 'esm', bundle: true })
  return import(pathToFileURL(salida).href + '?' + Date.now())
}
const { GUION, DURACION_TOTAL } = await cargar('guion.ts')
const { pistas, VOZ } = await cargar('subtitulos.ts')

const dos = (n) => String(n).padStart(2, '0')
const srt = (s) => { const ms = Math.round(s * 1000); return `${dos(Math.floor(ms / 3600000))}:${dos(Math.floor(ms / 60000) % 60)}:${dos(Math.floor(ms / 1000) % 60)},${String(ms % 1000).padStart(3, '0')}` }
const reloj = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`

writeFileSync(path.join(raiz, 'SUBTITULOS.srt'), pistas().map((p, i) => `${i + 1}\n${srt(p.inicio)} --> ${srt(p.fin)}\n${p.texto}\n`).join('\n'))

let md = `# Locución de SINTONÍA\n\nDuración total del vídeo: ${reloj(DURACION_TOTAL)} (${DURACION_TOTAL} segundos).\n\n`
md += `Voz actual: Álvaro (\`es-ES-AlvaroNeural\`), generada con edge-tts, las voces de "Leer en voz alta" de Microsoft Edge. Si prefieres grabarla tú, lee cada frase procurando que quepa en su hueco; los tiempos se ajustan en \`src/guion.ts\` (campo \`voz\` de cada escena).\n\n`
md += `Música: creada por ordenador para este vídeo con \`scripts/musica.py\`. No usa grabaciones de terceros, así que no tiene licencia ajena.\n`
for (const e of GUION) {
  md += `\n## Escena ${e.n}. ${e.titulo} (${reloj(e.inicio)} a ${reloj(e.fin)})\n\n`
  const frases = VOZ.filter((v) => v.escena === e.n)
  if (!frases.length) { md += `Sin voz, solo música.\n`; continue }
  md += `| Empieza | Termina | Frase |\n| --- | --- | --- |\n`
  for (const f of frases) md += `| ${reloj(f.inicio)} | ${reloj(f.inicio + f.dur)} | ${f.texto} |\n`
}
writeFileSync(path.join(raiz, 'LOCUCION.md'), md)
console.log('Hecho: SUBTITULOS.srt y LOCUCION.md')
