import { createApp } from 'vue'
import { createPinia } from 'pinia'
// Instrument Sans e IBM Plex Mono (las de LUMBRA360), servidas desde el propio
// sitio, sin llamadas a Google: @font-face en src/assets/fuentes.css. Ver DISENO.md.
import './assets/main.css'
import App from './App.vue'
import { router } from './router'
import { iniciarAnalitica } from './lib/analitica'

createApp(App).use(createPinia()).use(router).mount('#app')

// Visitas a las páginas públicas, sin cookies (ver src/lib/analitica.ts).
iniciarAnalitica()
