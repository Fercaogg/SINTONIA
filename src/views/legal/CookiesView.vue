<script setup lang="ts">
// Cookies: SINTONÍA no usa cookies de seguimiento ni analítica, por eso no
// muestra ningún aviso de cookies. Aquí se explica el único almacenamiento
// que usa, que es técnico e imprescindible.
import LayoutPublico from '@/components/layout/LayoutPublico.vue'
import SeccionLegal from '@/components/comun/SeccionLegal.vue'
</script>

<template>
  <LayoutPublico>
    <h1 class="titulo-pagina mb-2">Cookies</h1>
    <p class="texto-suave mb-10">Por qué no te mostramos ningún aviso de cookies.</p>

    <SeccionLegal id="no" titulo="Sin cookies de seguimiento">
      <p>SINTONÍA no usa cookies de seguimiento, publicidad ni analítica, y no carga nada de terceros: ni estadísticas de visitas, ni redes sociales, ni tipos de letra externos. Por eso no hay ningún aviso que aceptar.</p>
    </SeccionLegal>

    <SeccionLegal id="tecnico" titulo="Lo único que se guarda en tu navegador">
      <p>Cuando inicias sesión, tu navegador guarda la sesión en su almacenamiento local (no es una cookie), para que no tengas que entrar cada vez. Es imprescindible para usar tu panel, no sirve para seguirte y se borra al cerrar la sesión.</p>
      <div class="card overflow-x-auto" tabindex="0" role="region" aria-label="Tabla del almacenamiento técnico">
        <table class="w-full text-sm text-left">
          <caption class="sr-only">Almacenamiento técnico que usa SINTONÍA</caption>
          <thead class="bg-surface-100 text-surface-800">
            <tr>
              <th scope="col" class="p-3 font-semibold">Nombre</th>
              <th scope="col" class="p-3 font-semibold">Para qué</th>
              <th scope="col" class="p-3 font-semibold">Duración</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t border-surface-200 align-top">
              <th scope="row" class="p-3 font-mono text-xs font-medium">sb-…-auth-token</th>
              <td class="p-3">Mantener tu sesión iniciada</td>
              <td class="p-3">Hasta que cierres la sesión</td>
            </tr>
          </tbody>
        </table>
      </div>
    </SeccionLegal>
  </LayoutPublico>
</template>
