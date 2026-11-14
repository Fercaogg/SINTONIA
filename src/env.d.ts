/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_ENTORNO_LOCAL?: string
  readonly VITE_MODO_DEMO?: string
  readonly VITE_URL_DEMO?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

/** Versión de package.json, la pone Vite al compilar (vite.config.ts). */
declare const __VERSION_SINTONIA__: string
