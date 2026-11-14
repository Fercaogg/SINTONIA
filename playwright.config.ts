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
    // Sin animaciones: así la revisión de accesibilidad mide los colores finales.
    reducedMotion: 'reduce',
  },
  projects: [
    { name: 'movil', use: { ...devices['Pixel 7'] } },
    { name: 'escritorio', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 860 } } },
  ],
  webServer: [
    {
      command: 'npx vite-node scripts/local/preparar-bd.mjs && node scripts/local/servidor-local.mjs',
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
      // La aplicación compilada, como en Vercel, y con sus mismas cabeceras
      // de seguridad (CSP incluida, ver vite.config.ts).
      command: `npx vite build --outDir .local/dist-e2e --emptyOutDir && npx vite preview --outDir .local/dist-e2e --port ${PUERTO_APP} --strictPort`,
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
