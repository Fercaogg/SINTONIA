import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
// @ts-expect-error: módulo de Node en JavaScript, sin tipos
import { escribir, htmlDe, leerPaginas, URL_POR_DEFECTO } from './scripts/paginas-estaticas.mjs'
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

/**
 * Una página HTML por cada página pública, con su título, descripción, URL
 * canónica e imagen para compartir; y sitemap.xml y robots.txt (ver
 * scripts/paginas-estaticas.mjs). La dirección base sale de VITE_URL_SITIO.
 */
function paginasEstaticas(base: string): Plugin {
  const raiz = fileURLToPath(new URL('.', import.meta.url))
  let salida = 'dist'
  return {
    name: 'sintonia-paginas-estaticas',
    configResolved(c) {
      salida = resolve(c.root, c.build.outDir)
    },
    // En desarrollo y al compilar, el index.html lleva las etiquetas de la portada.
    transformIndexHtml(html) {
      const todas = leerPaginas(raiz)
      return htmlDe(html, todas.find((p: { ruta: string }) => p.ruta === '/'), todas, base)
    },
    closeBundle() {
      escribir(raiz, salida, base)
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
    plugins: [vue(), precargarFuentes(), paginasEstaticas((env.VITE_URL_SITIO || URL_POR_DEFECTO).replace(/\/$/, ''))],
    // NEXT_PUBLIC_: las variables PÚBLICAS que pone la integración de Supabase en Vercel.
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
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
