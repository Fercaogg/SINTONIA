import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

/**
 * Las cabeceras de seguridad de vercel.json, para `vite preview`. Así los
 * tests en el navegador se ejecutan con la misma política de seguridad (CSP)
 * que la web publicada. En local, la base de datos está en localhost: se
 * añade a connect-src solo aquí.
 */
function cabecerasDeVercel(supabaseLocal: string | null): Record<string, string> {
  const config = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'))
  const generales = config.headers.find((h: { source: string }) => h.source === '/(.*)')
  const cabeceras: Record<string, string> = {}
  for (const { key, value } of generales.headers) cabeceras[key] = value
  if (supabaseLocal) {
    cabeceras['Content-Security-Policy'] = cabeceras['Content-Security-Policy']
      .replace('connect-src ', `connect-src ${supabaseLocal} `)
      .replace('; upgrade-insecure-requests', '')
  }
  delete cabeceras['Strict-Transport-Security']
  return cabeceras
}

/**
 * Precarga de las dos fuentes de la primera pantalla (Fira Sans 400 y 700),
 * para que el titular se pinte antes. Solo al compilar.
 */
function precargarFuentes(): Plugin {
  return {
    name: 'sintonia-precargar-fuentes',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const archivos = Object.keys(ctx.bundle ?? {}).filter((f) => /fira-sans-latin-(400|700)-normal.*\.woff2$/.test(f))
        return archivos.map((f) => ({
          tag: 'link',
          attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${f}`, crossorigin: '' },
          injectTo: 'head' as const,
        }))
      },
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env }
  // En local, el servidor que imita Supabase también sirve las funciones de
  // api/ (registro, acceso, contacto): la aplicación las llama en /api.
  const supabaseLocal = env.VITE_SUPABASE_URL && /^http:\/\/localhost:\d+$/.test(env.VITE_SUPABASE_URL) ? env.VITE_SUPABASE_URL : null
  const proxy = supabaseLocal ? { '/api': { target: supabaseLocal, changeOrigin: true, xfwd: true } } : undefined
  return {
    plugins: [vue(), precargarFuentes()],
    define: {
      __VERSION_SINTONIA__: JSON.stringify(JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version),
    },
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    server: { proxy },
    preview: {
      proxy,
      headers: cabecerasDeVercel(supabaseLocal),
    },
  }
})
