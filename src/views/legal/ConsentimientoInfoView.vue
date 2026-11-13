<script setup lang="ts">
// Consentimiento informado: qué supone participar, para leerlo antes de
// registrarse. El texto definitivo se acepta dentro de la aplicación, al
// registrarse (/consentimiento/aceptar).
import { RouterLink } from 'vue-router'
import LayoutPublico from '@/components/layout/LayoutPublico.vue'
import SeccionLegal from '@/components/comun/SeccionLegal.vue'
</script>

<template>
  <LayoutPublico>
    <h1 class="titulo-pagina mb-2">Consentimiento informado</h1>
    <p class="texto-suave mb-10">Qué supone participar en el estudio, para que lo sepas antes de registrarte.</p>

    <SeccionLegal id="supone" titulo="Qué supone participar">
      <ul class="list-disc pl-5 space-y-1.5">
        <li>Si eres estudiante: unos 60 segundos a la semana para responder cuatro preguntas de 1 a 5. Una de ellas, sobre tu bienestar, solo la ves tú.</li>
        <li>Si eres tutor/a: unos 30 segundos a la semana para responder sobre todos tus estudiantes.</li>
        <li>Algunas semanas, por sorteo, recibiréis tres preguntas neutras para la siguiente tutoría. El sorteo forma parte del estudio.</li>
        <li>Un cuestionario breve al principio y otro al final.</li>
      </ul>
    </SeccionLegal>

    <SeccionLegal id="voluntario" titulo="Es voluntario">
      <p>Participar es voluntario. Puedes retirarte cuando quieras desde <strong>Mi cuenta</strong>, y pedir que se borren tus datos, sin dar explicaciones.</p>
    </SeccionLegal>

    <SeccionLegal id="texto" titulo="Texto del consentimiento" pendiente>
      <p>El texto completo se muestra al registrarte, y solo empiezas a participar si lo aceptas.</p>
    </SeccionLegal>

    <p class="text-sm texto-suave">
      Más detalles en <RouterLink to="/como-funciona" class="enlace">Cómo funciona y tus datos</RouterLink> y en la
      <RouterLink to="/privacidad" class="enlace">política de privacidad</RouterLink>.
    </p>
  </LayoutPublico>
</template>
