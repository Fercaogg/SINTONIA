/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_ENTORNO_LOCAL?: string
  readonly VITE_MODO_DEMO?: string
  readonly VITE_URL_DEMO?: string
  readonly VITE_URL_SITIO?: string
  // "false" desactiva la analítica de visitas sin cookies (src/lib/analitica.ts).
  readonly VITE_ANALITICA?: string
  // Número de WhatsApp de contacto, con prefijo de país y sin espacios (34600000000).
  readonly VITE_WHATSAPP?: string
  // Las pone la integración de Supabase en Vercel (son públicas).
  readonly NEXT_PUBLIC_SUPABASE_URL?: string
  readonly NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string
  readonly NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
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
