import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

/**
 * Las cabeceras de seguridad de vercel.json, para `vite preview`. Así los
 * tests en el navegador se ejecutan con la misma política de seguridad (CSP)
 * que la web publicada. En local, la base de datos está en localhost: se
 * añade a connect-src solo aquí.
 */
function cabecerasDeVercel(): Record<string, string> {
  const config = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'))
  const generales = config.headers.find((h: { source: string }) => h.source === '/(.*)')
  const cabeceras: Record<string, string> = {}
  for (const { key, value } of generales.headers) cabeceras[key] = value
  const supabase = process.env.VITE_SUPABASE_URL
  if (supabase && /^http:\/\/localhost:\d+/.test(supabase)) {
    cabeceras['Content-Security-Policy'] = cabeceras['Content-Security-Policy']
      .replace('connect-src ', `connect-src ${supabase} `)
      .replace('; upgrade-insecure-requests', '')
  }
  delete cabeceras['Strict-Transport-Security']
  return cabeceras
}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  preview: {
    headers: cabecerasDeVercel(),
  },
})
