import { defineConfig, devices } from '@playwright/test'
import { CLAVE_ANON_LOCAL } from './scripts/local/servidor-local.mjs'

// Los tests en el navegador usan una base de datos local propia
// (sintonia_e2e), que se crea de cero en cada ejecución.
const PUERTO_APP = 5174
const PUERTO_API = 54322

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PUERTO_APP}`,
    trace: 'off',
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
  },
  projects: process.env.CAPTURAS
    ? [
        // npm run capturas: genera las imágenes de docs/capturas
        { name: 'movil', testMatch: /capturas\.ts/, use: { ...devices['Pixel 7'] } },
        { name: 'escritorio', testMatch: /capturas\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 860 }, deviceScaleFactor: 2 } },
      ]
    : [
        { name: 'movil', use: { ...devices['Pixel 7'] } },
        { name: 'escritorio', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 860 } } },
      ],
  webServer: [
    {
      command: 'node scripts/local/preparar-bd.mjs && node scripts/local/servidor-local.mjs',
      port: PUERTO_API,
      reuseExistingServer: false,
      env: {
        LOCAL_BD: 'sintonia_e2e',
        LOCAL_API_PORT: String(PUERTO_API),
        LOCAL_URL_APP: `http://localhost:${PUERTO_APP}`,
        LOCAL_CODIGOS_ARCHIVO: '.local/codigos-e2e.json',
      },
    },
    {
      command: `npx vite --port ${PUERTO_APP} --strictPort`,
      port: PUERTO_APP,
      reuseExistingServer: false,
      env: {
        VITE_SUPABASE_URL: `http://localhost:${PUERTO_API}`,
        VITE_SUPABASE_ANON_KEY: CLAVE_ANON_LOCAL,
        VITE_ENTORNO_LOCAL: 'true',
      },
    },
  ],
})
