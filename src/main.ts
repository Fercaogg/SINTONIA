import { createApp } from 'vue'
import { createPinia } from 'pinia'
// Fira Sans servida desde el propio sitio (sin llamadas a Google). Ver DISENO.md.
import '@fontsource/fira-sans/latin-400.css'
import '@fontsource/fira-sans/latin-500.css'
import '@fontsource/fira-sans/latin-600.css'
import '@fontsource/fira-sans/latin-700.css'
import './assets/main.css'
import App from './App.vue'
import { router } from './router'

createApp(App).use(createPinia()).use(router).mount('#app')
