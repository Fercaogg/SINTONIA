// Comprueba que las funciones de Vercel (carpeta api/) arrancan igual que en
// Vercel: cada archivo TypeScript se convierte por separado a JavaScript (sin
// empaquetar) y Node los carga como módulos. Si falta una extensión ".js" en
// una importación, aquí falla igual que fallaría en Vercel.
//
// Uso: node scripts/comprobar-funciones.mjs   (lo ejecuta también un test)

import { build } from 'esbuild'
import { mkdirSync, rmSync, readdirSync, statSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const salida = join(raiz, '.local', 'funciones')

function archivosTs(carpeta) {
  return readdirSync(carpeta).flatMap((nombre) => {
    const ruta = join(carpeta, nombre)
    if (statSync(ruta).isDirectory()) return archivosTs(ruta)
    return nombre.endsWith('.ts') && !nombre.endsWith('.test.ts') ? [ruta] : []
  })
}

/** Convierte api/, servidor/ y src/lib/ a JavaScript, archivo por archivo, como Vercel. */
export async function compilarFunciones() {
  rmSync(salida, { recursive: true, force: true })
  mkdirSync(salida, { recursive: true })
  const entradas = [...archivosTs(join(raiz, 'api')), ...archivosTs(join(raiz, 'servidor')), ...archivosTs(join(raiz, 'src', 'lib'))]
  await build({
    entryPoints: entradas,
    outdir: salida,
    outbase: raiz,
    bundle: false,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    logLevel: 'silent',
  })
  return salida
}

export async function comprobarFunciones() {
  await compilarFunciones()
  const resultados = {}
  for (const api of archivosTs(join(raiz, 'api'))) {
    const nombre = relative(raiz, api).replace(/\.ts$/, '')
    const modulo = await import(pathToFileURL(join(salida, `${nombre}.js`)).href)
    const metodo = modulo.GET ? 'GET' : 'POST'
    const respuesta = await modulo[metodo](new Request('https://sintonia.example/' + nombre, { method: metodo }))
    resultados[nombre] = respuesta.status
  }
  return resultados
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const r = await comprobarFunciones()
  console.log(JSON.stringify(r))
}
