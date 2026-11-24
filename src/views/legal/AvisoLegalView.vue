<script setup lang="ts">
// Aviso legal (artículo 10 de la Ley 34/2002, LSSI). Los datos que solo puede
// aportar el titular (NIF y domicilio) salen como "En elaboración" hasta
// tenerlos (PENDIENTES.md). El resto es el texto estándar de un sitio sin
// fines comerciales.
import { RouterLink } from 'vue-router'
import LayoutPublico from '@/components/layout/LayoutPublico.vue'
import SeccionLegal from '@/components/comun/SeccionLegal.vue'
import { CORREO_CONTACTO, EN_ELABORACION_PROYECTO, URL_SITIO } from '@/lib/publico'
</script>

<template>
  <LayoutPublico>
    <h1 class="titulo-pagina mb-2">Aviso legal</h1>
    <p class="texto-suave mb-10">Quién está detrás de esta web y en qué condiciones puedes usarla.</p>

    <SeccionLegal id="titular" titulo="Titular">
      <p>SINTONÍA es el prototipo del Trabajo Fin de Máster de Fernando Martín Vaquero, en el Máster en Estudios de la Ciencia, la Tecnología y la Innovación de la Universidad de Salamanca.</p>
      <ul class="list-disc pl-5 space-y-1.5">
        <li>Sitio web: {{ URL_SITIO.replace(/^https:\/\//, '') }}</li>
        <li>Contacto: <a :href="`mailto:${CORREO_CONTACTO}`" class="enlace">{{ CORREO_CONTACTO }}</a></li>
        <li>Actividad: proyecto de investigación académica, sin ánimo de lucro. No se vende nada ni se publica publicidad.</li>
        <li>NIF y domicilio: <span class="italic texto-suave" data-en-elaboracion="true">{{ EN_ELABORACION_PROYECTO }}</span></li>
      </ul>
    </SeccionLegal>

    <SeccionLegal id="objeto" titulo="Objeto">
      <p>SINTONÍA es un prototipo de investigación para acompañar el trabajo académico entre estudiante y tutor/a. Se usará en un estudio piloto en dos másteres de la Universidad de Salamanca.</p>
      <p>Usar esta web supone aceptar este aviso. Las condiciones de participación en el estudio están en el <RouterLink to="/consentimiento" class="enlace">consentimiento informado</RouterLink>, y el uso de tus datos, en la <RouterLink to="/privacidad" class="enlace">política de privacidad</RouterLink>.</p>
    </SeccionLegal>

    <SeccionLegal id="propiedad" titulo="Propiedad intelectual">
      <p>Los textos, el diseño, el logotipo y el código de SINTONÍA son obra de su autor, salvo que se indique otra cosa. Puedes citarlos y enlazarlos libremente indicando la fuente (en <RouterLink to="/investigacion" class="enlace">La investigación</RouterLink> tienes la cita recomendada).</p>
      <p>Las obras citadas en la web pertenecen a sus autores y se citan con fines de investigación. Las marcas que se nombran son de sus titulares y se mencionan solo para identificarlas.</p>
    </SeccionLegal>

    <SeccionLegal id="responsabilidad" titulo="Responsabilidad">
      <p>SINTONÍA es un prototipo en fase de investigación. Se cuida que la información sea correcta y esté al día, pero puede contener errores o cambiar sin aviso. Las fechas de convocatorias y plazos son orientativas: la fuente válida es siempre la publicación oficial enlazada.</p>
      <p>SINTONÍA no evalúa a nadie ni sustituye a la tutoría, a los servicios de la Universidad ni a la atención profesional. Si estás en una situación de crisis o de riesgo, llama al 024 (atención a la conducta suicida, gratuita y a cualquier hora) o al 112.</p>
      <p>La web puede dejar de estar disponible temporalmente por mantenimiento o por causas técnicas ajenas. Su estado en cada momento está en <RouterLink to="/estado" class="enlace">Estado de la plataforma</RouterLink>.</p>
    </SeccionLegal>

    <SeccionLegal id="enlaces" titulo="Enlaces a otras webs">
      <p>Los enlaces a otras webs (por ejemplo, la Universidad o las convocatorias oficiales) se ofrecen para tu comodidad. SINTONÍA no controla su contenido y no responde de él. Si encuentras un enlace roto o inadecuado, escríbenos y lo quitaremos.</p>
    </SeccionLegal>

    <SeccionLegal id="legislacion" titulo="Legislación aplicable">
      <p>Este aviso se rige por la legislación española, en particular la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI), el Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales.</p>
      <p>Para cualquier controversia, serán competentes los juzgados y tribunales que correspondan según la ley.</p>
    </SeccionLegal>
  </LayoutPublico>
</template>
