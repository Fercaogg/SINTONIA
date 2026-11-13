import { defineConfig, devices } from '@playwright/test'
import { CLAVE_ANON_LOCAL } from './scripts/local/servidor-local.mjs'

// Pruebas y capturas con la instalación de DEMOSTRACIÓN (datos ficticios).
//   npm run test:demo   comprobaciones (accesos, accesibilidad, criterios)
//   npm run capturas    capturas de todas las pantallas en docs/capturas
const PUERTO_APP = 5175
const PUERTO_API = 54323

export default defineConfig({
  testDir: 'tests/demo',
  testMatch: process.env.CAPTURAS ? /capturas\.ts/ : /\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${PUERTO_APP}`,
    trace: 'off',
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
    reducedMotion: 'reduce',
  },
  projects: [
    { name: 'movil', use: { ...devices['Pixel 7'] } },
    {
      name: 'escritorio',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 860 }, ...(process.env.CAPTURAS ? { deviceScaleFactor: 2 } : {}) },
    },
  ],
  webServer: [
    {
      command: 'npx vite-node scripts/demo/crear-demo.mjs && node scripts/local/servidor-local.mjs',
      port: PUERTO_API,
      reuseExistingServer: false,
      timeout: 180_000,
      env: { LOCAL_BD: 'sintonia_demo', LOCAL_API_PORT: String(PUERTO_API), LOCAL_URL_APP: `http://localhost:${PUERTO_APP}` },
    },
    {
      command: `npx vite --port ${PUERTO_APP} --strictPort`,
      port: PUERTO_APP,
      reuseExistingServer: false,
      env: {
        VITE_SUPABASE_URL: `http://localhost:${PUERTO_API}`,
        VITE_SUPABASE_ANON_KEY: CLAVE_ANON_LOCAL,
        VITE_MODO_DEMO: 'true',
      },
    },
  ],
})
