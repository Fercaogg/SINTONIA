import { createApp } from 'vue'
import { createPinia } from 'pinia'
// Instrument Sans e IBM Plex Mono (las de LUMBRA360), servidas desde el propio
// sitio, sin llamadas a Google: @font-face en src/assets/fuentes.css. Ver DISENO.md.
import './assets/main.css'
import App from './App.vue'
import { router } from './router'
import { iniciarAnalitica } from './lib/analitica'
import { vigilarSesion } from './lib/vigilar-sesion'
import { esErrorDeCarga, fallo, MENSAJE_FALLO, MENSAJE_VERSION, recargarUnaVez } from './lib/fallos'

const app = createApp(App).use(createPinia()).use(router)

// Fallos inesperados al pintar una pantalla: se registran y se avisa, en vez
// de dejar la pantalla a medias sin explicación (src/lib/fallos.ts).
app.config.errorHandler = (e) => {
  console.error(e)
  fallo.value = esErrorDeCarga(e) ? MENSAJE_VERSION : MENSAJE_FALLO
}

// Versión nueva publicada con la pestaña abierta: faltan los archivos de la
// anterior. Se recarga una vez en la pantalla a la que se iba.
router.onError((e, destino) => {
  if (esErrorDeCarga(e)) {
    if (!recargarUnaVez(destino.fullPath)) fallo.value = MENSAJE_VERSION
    return
  }
  console.error(e)
  fallo.value = MENSAJE_FALLO
})
// (No se usa el aviso "vite:preloadError": recargaría la pantalla de la que
// se sale, no la de destino. Lo que no pase por el router lo recoge
// errorHandler y ofrece "Recargar".)

vigilarSesion(router)
app.mount('#app')

// Visitas a las páginas públicas, sin cookies (ver src/lib/analitica.ts).
iniciarAnalitica()
