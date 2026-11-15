<script setup lang="ts">
// /accesibilidad: declaración de accesibilidad con el nivel real, según la
// revisión que se ha hecho de verdad (pruebas automáticas con axe en todas
// las pantallas, en claro y en oscuro, móvil y escritorio, y Lighthouse).
// Mientras no haya una revisión manual completa con lectores de pantalla,
// lo honesto es "parcialmente conforme".
import LayoutPublico from '@/components/layout/LayoutPublico.vue'
import SeccionLegal from '@/components/comun/SeccionLegal.vue'
import { CORREO_CONTACTO } from '@/lib/publico'
import { REVISION_ACCESIBILIDAD } from '@/contenido/confianza'
import { fechaLarga } from '@/contenido/novedades'
</script>

<template>
  <LayoutPublico>
    <h1 class="titulo-pagina mb-2">Declaración de accesibilidad</h1>
    <p class="texto-suave mb-2">Queremos que cualquier persona pueda usar SINTONÍA, también con lector de pantalla, solo con el teclado o con el texto ampliado.</p>
    <p class="text-sm texto-suave mb-10">Preparada el {{ fechaLarga(REVISION_ACCESIBILIDAD) }}. Última revisión: {{ fechaLarga(REVISION_ACCESIBILIDAD) }}.</p>

    <SeccionLegal id="situacion" titulo="Situación de cumplimiento">
      <p>
        SINTONÍA es <strong>parcialmente conforme</strong> con las Pautas de Accesibilidad para el Contenido Web (WCAG) 2.2, nivel AA. "Parcialmente"
        porque, aunque las revisiones automáticas no encuentran errores, todavía no se ha hecho una revisión manual completa con lectores de
        pantalla (ver "Limitaciones conocidas").
      </p>
    </SeccionLegal>

    <SeccionLegal id="como" titulo="Cómo se ha revisado">
      <ul class="list-disc pl-5 space-y-1.5">
        <li>Autoevaluación del propio equipo del proyecto.</li>
        <li>
          Revisión automática con axe (criterios A y AA de WCAG 2.0, 2.1 y 2.2) en todas las páginas públicas y en las pantallas de cada perfil,
          en móvil (360 px de ancho) y en escritorio, en modo claro y en modo oscuro. Se repite con cada cambio importante.
        </li>
        <li>Lighthouse de Google: 100 sobre 100 en accesibilidad en la portada.</li>
        <li>Pruebas con teclado de los controles principales, como el check-in y la tabla "Quién ve qué".</li>
      </ul>
    </SeccionLegal>

    <SeccionLegal id="pensado" titulo="Qué está pensado para la accesibilidad">
      <ul class="list-disc pl-5 space-y-1.5">
        <li>Los controles principales se usan con el teclado y el foco se ve siempre.</li>
        <li>Contraste suficiente (AA) en modo claro y en modo oscuro, que sigue la preferencia de tu sistema.</li>
        <li>Con "reducir movimiento" activado en tu dispositivo, no hay animaciones: todo se ve quieto y en su sitio.</li>
        <li>Las animaciones largas (el fondo del inicio y el recorrido del producto) se pueden pausar.</li>
        <li>Botones y enlaces de 44 píxeles como mínimo, cómodos en el móvil.</li>
        <li>La información nunca depende solo del color: siempre va acompañada de texto o de un icono.</li>
        <li>Los gráficos del panel de la dirección tienen un resumen en texto para lectores de pantalla.</li>
      </ul>
    </SeccionLegal>

    <SeccionLegal id="limitaciones" titulo="Limitaciones conocidas">
      <ul class="list-disc pl-5 space-y-1.5">
        <li>No se ha hecho todavía una revisión manual completa con lectores de pantalla (NVDA, JAWS, VoiceOver o TalkBack). Está prevista antes del piloto.</li>
        <li>El logotipo usa el verde de la marca con un contraste menor que el del texto. Las WCAG no exigen contraste a los logotipos.</li>
        <li>Los archivos de datos para el análisis (CSV) que descarga el equipo de investigación son tablas sin formato pensadas para programas de estadística.</li>
      </ul>
    </SeccionLegal>

    <SeccionLegal id="contacto" titulo="Contacto">
      <p>
        Si encuentras una barrera, algo que no puedes usar o tienes una sugerencia, escríbenos a
        <a :href="`mailto:${CORREO_CONTACTO}`" class="enlace">{{ CORREO_CONTACTO }}</a>. Cuéntanos en qué página estabas y qué ha pasado, y te
        responderemos lo antes posible.
      </p>
    </SeccionLegal>
  </LayoutPublico>
</template>
