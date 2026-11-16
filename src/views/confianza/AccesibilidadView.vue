<script setup lang="ts">
// /accesibilidad: declaración de accesibilidad con el nivel real, según la
// revisión que se ha hecho de verdad (pruebas automáticas con axe en todas
// las pantallas, en claro y en oscuro, móvil y escritorio, y Lighthouse).
// Mientras no haya una revisión manual completa con lectores de pantalla,
// lo honesto es "parcialmente conforme".
import LayoutPublico from '@/components/layout/LayoutPublico.vue'
import SeccionLegal from '@/components/comun/SeccionLegal.vue'
import { CORREO_CONTACTO } from '@/lib/publico'
import { PREPARACION_ACCESIBILIDAD, REVISION_ACCESIBILIDAD } from '@/contenido/confianza'
import { fechaLarga } from '@/contenido/novedades'
import { fechaLargaEn } from '@/contenido/en'
import { useIdioma } from '@/lib/idioma'
const { idioma } = useIdioma()
</script>

<template>
  <LayoutPublico>
    <template v-if="idioma === 'es'">
    <h1 class="titulo-pagina mb-2">Declaración de accesibilidad</h1>
    <p class="texto-suave mb-2">Queremos que cualquier persona pueda usar SINTONÍA, también con lector de pantalla, solo con el teclado o con el texto ampliado.</p>
    <p class="text-sm texto-suave mb-10">Preparada el {{ fechaLarga(PREPARACION_ACCESIBILIDAD) }}. Última revisión: {{ fechaLarga(REVISION_ACCESIBILIDAD) }}.</p>

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
        <li>Lighthouse de Google, en móvil: 100 sobre 100 en accesibilidad en todas las páginas públicas, en español y en inglés.</li>
        <li>Prueba automática de navegación completa con el teclado en todas las páginas públicas: cada parada se ve, nada atrapa el foco y se llega hasta el final. También el check-in, la tabla "Quién ve qué" y la demostración guiada.</li>
      </ul>
    </SeccionLegal>

    <SeccionLegal id="pensado" titulo="Qué está pensado para la accesibilidad">
      <ul class="list-disc pl-5 space-y-1.5">
        <li>Toda la web se usa con el teclado y el foco se ve siempre. El primer enlace de cada página, "Saltar al contenido", evita recorrer la cabecera.</li>
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
    </template>
    <template v-else>
    <h1 class="titulo-pagina mb-2">Accessibility statement</h1>
    <p class="texto-suave mb-2">We want anyone to be able to use SINTONÍA, including with a screen reader, only with the keyboard or with enlarged text.</p>
    <p class="text-sm texto-suave mb-10">Prepared on {{ fechaLargaEn(PREPARACION_ACCESIBILIDAD) }}. Last reviewed: {{ fechaLargaEn(REVISION_ACCESIBILIDAD) }}.</p>

    <SeccionLegal id="situacion" titulo="Compliance status">
      <p>
        SINTONÍA is <strong>partially conformant</strong> with the Web Content Accessibility Guidelines (WCAG) 2.2, level AA. "Partially" because,
        although automated reviews find no errors, a full manual review with screen readers has not been done yet (see "Known limitations").
      </p>
    </SeccionLegal>

    <SeccionLegal id="como" titulo="How it was reviewed">
      <ul class="list-disc pl-5 space-y-1.5">
        <li>Self-assessment by the project team.</li>
        <li>
          Automated review with axe (WCAG 2.0, 2.1 and 2.2 level A and AA criteria) on every public page and on the screens of each profile, on
          mobile (360 px wide) and desktop, in light and dark mode. It is repeated with every significant change.
        </li>
        <li>Google Lighthouse, on mobile: 100 out of 100 for accessibility on every public page, in Spanish and English.</li>
        <li>An automated test of full keyboard navigation on every public page: every stop is visible, nothing traps the focus and you can reach the end. Also the check-in, the "Who sees what" table and the guided demo.</li>
      </ul>
    </SeccionLegal>

    <SeccionLegal id="pensado" titulo="What is designed for accessibility">
      <ul class="list-disc pl-5 space-y-1.5">
        <li>The whole website works with the keyboard and the focus is always visible. The first link on each page, "Skip to content", saves going through the header.</li>
        <li>Sufficient contrast (AA) in light and dark mode, which follows your system preference.</li>
        <li>With "reduce motion" turned on in your device, there are no animations: everything is still and in place.</li>
        <li>Long animations (the home page background and the product walkthrough) can be paused.</li>
        <li>Buttons and links are at least 44 pixels, comfortable on phones.</li>
        <li>Information never depends on colour alone: it always comes with text or an icon.</li>
        <li>The programme directors' charts have a text summary for screen readers.</li>
      </ul>
    </SeccionLegal>

    <SeccionLegal id="limitaciones" titulo="Known limitations">
      <ul class="list-disc pl-5 space-y-1.5">
        <li>A full manual review with screen readers (NVDA, JAWS, VoiceOver or TalkBack) has not been done yet. It is planned before the pilot.</li>
        <li>The logo uses the brand green with lower contrast than the text. WCAG does not require contrast for logos.</li>
        <li>The data files for analysis (CSV) downloaded by the research team are plain tables meant for statistics software.</li>
        <li>The app itself (dashboards) and some pages, such as the legal ones, are only available in Spanish.</li>
      </ul>
    </SeccionLegal>

    <SeccionLegal id="contacto" titulo="Contact">
      <p>
        If you find a barrier, something you cannot use or have a suggestion, write to
        <a :href="`mailto:${CORREO_CONTACTO}`" class="enlace">{{ CORREO_CONTACTO }}</a>. Tell us which page you were on and what happened, and we will
        reply as soon as possible.
      </p>
    </SeccionLegal>
    </template>
  </LayoutPublico>
</template>
