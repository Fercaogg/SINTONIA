// Mide cuánto tarda en cargar el check-in en un móvil con conexión lenta,
// con la versión final de la aplicación (npm run build).
//
//   npm run rendimiento
//
// Simula una conexión "3G rápida" (1,6 Mbit/s de bajada, 150 ms de latencia)
// y un procesador 4 veces más lento. Usa la demostración local.

import { spawn, execSync } from 'node:child_process'
import { chromium, devices } from 'playwright'
import { CLAVE_ANON_LOCAL } from './local/servidor-local.mjs'

const PUERTO_API = 54324
const PUERTO_APP = 4174
const procesos = []
const arrancar = (cmd, env) => {
  const p = spawn('sh', ['-c', cmd], { env: { ...process.env, ...env }, stdio: 'ignore' })
  procesos.push(p)
}
const esperar = async (url) => {
  for (let i = 0; i < 120; i++) {
    try { await fetch(url); return } catch { await new Promise((r) => setTimeout(r, 500)) }
  }
  throw new Error(`No responde ${url}`)
}

try {
  execSync('npx vite-node scripts/demo/crear-demo.mjs', { stdio: 'ignore' })
  arrancar('node scripts/local/servidor-local.mjs', { LOCAL_BD: 'sintonia_demo', LOCAL_API_PORT: String(PUERTO_API) })
  execSync('npx vite build --outDir dist-rendimiento', {
    stdio: 'ignore',
    env: { ...process.env, VITE_SUPABASE_URL: `http://localhost:${PUERTO_API}`, VITE_SUPABASE_ANON_KEY: CLAVE_ANON_LOCAL, VITE_MODO_DEMO: 'true' },
  })
  arrancar(`npx vite preview --outDir dist-rendimiento --port ${PUERTO_APP} --strictPort`, {})
  await esperar(`http://localhost:${PUERTO_API}/__local/ultimo-enlace`)
  await esperar(`http://localhost:${PUERTO_APP}/`)

  const navegador = await chromium.launch()
  const contexto = await navegador.newContext({ ...devices['Pixel 7'] })
  const pagina = await contexto.newPage()

  // Iniciar sesión (sin limitar) para tener la sesión guardada.
  await pagina.goto(`http://localhost:${PUERTO_APP}/acceso`)
  await pagina.getByRole('button', { name: /^Estudiante/ }).click()
  await pagina.waitForURL(/\/estudiante$/)

  // Limitar conexión y procesador, vaciar la caché y cargar el check-in en frío.
  const cdp = await contexto.newCDPSession(pagina)
  await cdp.send('Network.enable')
  await cdp.send('Network.clearBrowserCache')
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 })
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })

  let bytes = 0
  pagina.on('response', async (r) => { try { bytes += (await r.body()).length } catch {} })
  const inicio = Date.now()
  await pagina.goto(`http://localhost:${PUERTO_APP}/estudiante/checkin`)
  await pagina.getByRole('heading', { name: /Check-in de la semana/ }).waitFor()
  const listo = Date.now() - inicio
  const fcp = await pagina.evaluate(() => performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null)

  console.log(`Check-in listo para responder: ${(listo / 1000).toFixed(1)} s`)
  console.log(`Primer contenido visible: ${fcp ? (fcp / 1000).toFixed(1) + ' s' : 'sin dato'}`)
  console.log(`Datos descargados: ${(bytes / 1024).toFixed(0)} KB (sin comprimir)`)
  await navegador.close()
} finally {
  for (const p of procesos) p.kill()
  execSync('rm -rf dist-rendimiento')
}
