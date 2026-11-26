<script setup lang="ts">
// Cookies: SINTONÍA no usa cookies, ni de seguimiento ni de analítica, por eso
// no muestra ningún aviso para aceptar (artículo 22.2 de la LSSI: el
// almacenamiento estrictamente necesario no requiere consentimiento). Aquí se
// explica el único almacenamiento que usa y la analítica sin cookies.
import { RouterLink } from 'vue-router'
import LayoutPublico from '@/components/layout/LayoutPublico.vue'
import SeccionLegal from '@/components/comun/SeccionLegal.vue'

const FECHA_REVISION = '24 de noviembre de 2026'
</script>

<template>
  <LayoutPublico>
    <h1 class="titulo-pagina mb-2">Cookies</h1>
    <p class="texto-suave mb-10">Por qué no te mostramos ningún aviso de cookies. Última revisión: {{ FECHA_REVISION }}.</p>

    <SeccionLegal id="no" titulo="Sin cookies">
      <p>SINTONÍA no usa cookies: ni de seguimiento, ni de publicidad, ni de analítica. No carga nada de terceros: ni redes sociales, ni tipos de letra externos, ni vídeos incrustados. Por eso no hay ningún aviso que aceptar.</p>
    </SeccionLegal>

    <SeccionLegal id="tecnico" titulo="Lo único que se guarda en tu navegador">
      <p>Cuando inicias sesión, tu navegador guarda la sesión en su almacenamiento local (no es una cookie), para que no tengas que entrar cada vez. Es imprescindible para usar tu panel, no sirve para seguirte y se borra al cerrar la sesión. Si solo visitas la web, no se guarda nada.</p>
      <div class="card overflow-x-auto" tabindex="0" role="region" aria-label="Tabla del almacenamiento técnico">
        <table class="w-full text-sm text-left">
          <caption class="sr-only">Almacenamiento técnico que usa SINTONÍA</caption>
          <thead class="bg-surface-100 text-surface-800">
            <tr>
              <th scope="col" class="p-3 font-semibold">Nombre</th>
              <th scope="col" class="p-3 font-semibold">Tipo</th>
              <th scope="col" class="p-3 font-semibold">Para qué</th>
              <th scope="col" class="p-3 font-semibold">Duración</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t border-surface-200 align-top">
              <th scope="row" class="p-3 text-xs font-medium tabular-nums">sb-…-auth-token</th>
              <td class="p-3">Almacenamiento local, propio</td>
              <td class="p-3">Mantener tu sesión iniciada</td>
              <td class="p-3">Hasta que cierres la sesión</td>
            </tr>
          </tbody>
        </table>
      </div>
    </SeccionLegal>

    <SeccionLegal id="estadisticas" titulo="Estadísticas de visitas, sin cookies">
      <p>Para saber qué páginas se leen, contamos las visitas a las páginas públicas con Vercel Web Analytics, el servicio de la empresa que publica la web. No usa cookies ni almacenamiento en tu navegador y no te identifica: solo suma visitas por página, país y tipo de dispositivo. Nunca cuenta las pantallas de tu panel, y si tu navegador pide "No rastrear" o Global Privacy Control, no cuenta nada.</p>
      <p>Más detalle en la <RouterLink to="/privacidad" class="enlace">política de privacidad</RouterLink>.</p>
    </SeccionLegal>

    <SeccionLegal id="control" titulo="Cómo borrarlo">
      <p>Cierra la sesión desde tu panel o borra los datos del sitio en la configuración de tu navegador. La web seguirá funcionando; solo tendrás que volver a entrar.</p>
    </SeccionLegal>
  </LayoutPublico>
</template>
