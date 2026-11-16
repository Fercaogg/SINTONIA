<script setup lang="ts">
// "Cómo funciona y tus datos": explicación en lenguaje claro de qué se
// calcula y quién ve qué. Los textos legales quedan pendientes del Comité.
import { computed, onMounted, ref } from 'vue'
import { useIdioma } from '@/lib/idioma'
import { RouterLink } from 'vue-router'
import { llamar } from '@/lib/api'
import LayoutPublico from '@/components/layout/LayoutPublico.vue'
import Pendiente from '@/components/comun/Pendiente.vue'
import TablaQuienVe from '@/components/portada/TablaQuienVe.vue'
const config = ref<Record<string, { valor: string }>>({})

onMounted(async () => {
  try {
    config.value = await llamar('configuracion_publica')
  } catch {
    config.value = {}
  }
})

const { t, ruta } = useIdioma()
const quienVeEs = [
  { dato: 'Tus respuestas sobre el avance, el siguiente paso y el apoyo', tu: 'Sí', tutor: 'No', direccion: 'No', investigacion: 'Sí, con un código y sin tu nombre' },
  { dato: 'Tu respuesta de bienestar', tu: 'Sí', tutor: 'No', direccion: 'No', investigacion: 'Solo en la exportación para el análisis, con un código y sin tu nombre' },
  { dato: 'Las respuestas de tu tutor/a sobre ti', tu: 'No', tutor: 'Sí', direccion: 'No', investigacion: 'Sí, con un código y sin nombres' },
  { dato: 'Las tres preguntas de la agenda', tu: 'Sí', tutor: 'Sí', direccion: 'No', investigacion: 'Sí, con un código' },
  { dato: 'Tu nombre', tu: 'Sí', tutor: 'Sí', direccion: 'Solo si pulsas "Necesito apoyo" y lo autorizas', investigacion: 'No' },
  { dato: 'Resúmenes del máster (por ejemplo, la tasa de respuesta)', tu: 'No', tutor: 'No', direccion: 'Sí, solo si hay 5 personas o más', investigacion: 'Sí' },
]
const quienVeEn = [
  { dato: 'Your answers about progress, next step and support', tu: 'Yes', tutor: 'No', direccion: 'No', investigacion: 'Yes, with a code and without your name' },
  { dato: 'Your wellbeing answer', tu: 'Yes', tutor: 'No', direccion: 'No', investigacion: 'Only in the export for analysis, with a code and without your name' },
  { dato: "Your supervisor's answers about you", tu: 'No', tutor: 'Yes', direccion: 'No', investigacion: 'Yes, with a code and without names' },
  { dato: 'The three agenda questions', tu: 'Yes', tutor: 'Yes', direccion: 'No', investigacion: 'Yes, with a code' },
  { dato: 'Your name', tu: 'Yes', tutor: 'Yes', direccion: 'Only if you press "I need support" and allow it', investigacion: 'No' },
  { dato: 'Programme summaries (for example, the response rate)', tu: 'No', tutor: 'No', direccion: 'Yes, only if there are 5 people or more', investigacion: 'Yes' },
]
const quienVe = computed(() => (t('es', 'en') === 'en' ? quienVeEn : quienVeEs))
</script>

<template>
  <LayoutPublico>
      <h1 class="titulo-pagina mb-2">{{ t('Cómo funciona y tus datos', 'How it works and your data') }}</h1>
      <p class="texto-suave mb-10">{{ t('Lo que hace SINTONÍA, explicado sin letra pequeña.', 'What SINTONÍA does, explained without small print.') }}</p>

      <section class="mb-10" aria-labelledby="que">
        <h2 id="que" class="font-display text-xl font-semibold mb-3">{{ t('Qué hace', 'What it does') }}</h2>
        <ul class="space-y-3 text-base leading-relaxed">
          <li>{{ t('Cada semana, estudiante y tutor/a responden por separado unas preguntas cortas, de 1 a 5, sobre cómo avanza el trabajo.', 'Each week, student and supervisor separately answer a few short questions, from 1 to 5, about how the work is going.') }}</li>
          <li>{{ t('SINTONÍA resta las dos respuestas sobre el avance (y sobre el siguiente paso, si el tutor/a la responde). Si la diferencia es de 2 puntos o más, o de 1 punto en el mismo sentido durante 2 semanas seguidas, considera que hay un desajuste.', 'SINTONÍA subtracts the two answers about progress (and about the next step, if the supervisor answers it). If the difference is 2 points or more, or 1 point in the same direction two weeks in a row, it considers there is a mismatch.') }}</li>
          <li>{{ t('Algunas semanas, por sorteo, la pareja recibe tres preguntas neutras para la siguiente tutoría. El sorteo forma parte del estudio: sirve para saber si las preguntas ayudan.', 'Some weeks, by draw, the pair receives three neutral questions for the next meeting. The draw is part of the study: it shows whether the questions help.') }}</li>
          <li>{{ t('Las preguntas pueden redactarse de forma automática con un programa de redacción, que solo recibe qué pregunta no coincide y por cuánto. Nunca recibe nombres, correos ni ninguna otra información personal. Si ese programa no está disponible, se usan preguntas escritas de antemano.', 'The questions can be drafted automatically by a writing program, which only receives which question does not match and by how much. It never receives names, emails or any other personal information. If that program is not available, pre-written questions are used.') }}</li>
        </ul>
      </section>

      <section class="mb-10" aria-labelledby="no">
        <h2 id="no" class="font-display text-xl font-semibold mb-3">{{ t('Qué no hace nunca', 'What it never does') }}</h2>
        <ul class="space-y-2 text-base leading-relaxed list-disc pl-5">
          <li>{{ t('No deduce emociones. Tu bienestar solo lo sabe SINTONÍA si tú lo dices, y solo lo ves tú.', 'It does not infer emotions. SINTONÍA only knows your wellbeing if you tell it, and only you see it.') }}</li>
          <li>{{ t('No analiza textos, voz ni comportamiento.', 'It does not analyse text, voice or behaviour.') }}</li>
          <li>{{ t('No pone notas, no hace rankings y no compara a estudiantes ni a tutores.', 'It does not give marks, make rankings or compare students or supervisors.') }}</li>
          <li>{{ t('No avisa a nadie por tus respuestas. Solo se avisa a la dirección si tú pulsas "Necesito apoyo".', 'It does not alert anyone because of your answers. Programme directors are only alerted if you press "I need support".') }}</li>
        </ul>
      </section>

      <section class="mb-10" aria-labelledby="quien">
        <h2 id="quien" class="font-display text-xl font-semibold mb-3">{{ t('Quién ve qué', 'Who sees what') }}</h2>
        <p class="texto-suave mb-4">{{ t('Pasa por un dato (o tócalo en el móvil) para ver de un vistazo quién lo ve.', 'Hover over an item (or tap it on a phone) to see at a glance who sees it.') }}</p>
        <TablaQuienVe :filas="quienVe" />
        <p class="text-sm texto-suave mt-3">
          {{ t('Estas reglas no dependen solo de la aplicación: están escritas en la propia base de datos, que se niega a entregar un dato a quien no le corresponde.', 'These rules do not depend only on the app: they are written into the database itself, which refuses to hand data to anyone it does not belong to.') }}
        </p>
      </section>

      <section class="mb-10" aria-labelledby="derechos">
        <h2 id="derechos" class="font-display text-xl font-semibold mb-3">{{ t('Tus derechos', 'Your rights') }}</h2>
        <p class="text-base leading-relaxed">
          {{ t('Puedes descargar tus datos, corregir tu nombre, retirarte del estudio y borrar tu cuenta cuando quieras, desde tu panel. SINTONÍA guarda los datos en servidores de la Unión Europea (Fráncfort, Alemania).', 'You can download your data, correct your name, withdraw from the study and delete your account whenever you want, from your dashboard. SINTONÍA stores data on servers in the European Union (Frankfurt, Germany).') }}
        </p>
      </section>

      <section class="mb-10" aria-labelledby="legal">
        <h2 id="legal" class="font-display text-xl font-semibold mb-3">{{ t('Política de privacidad', 'Privacy policy') }}</h2>
        <p class="mb-2"><Pendiente publico :texto="config.texto_politica_privacidad?.valor" /></p>
        <p class="mb-2">{{ t('Responsable del tratamiento', 'Data controller') }}: <Pendiente publico :texto="config.responsable_tratamiento?.valor" /></p>
        <p>{{ t('Toda la estructura, en la', 'The full structure is in the') }} <RouterLink to="/privacidad" class="enlace">{{ t('política de privacidad', 'privacy policy (in Spanish)') }}</RouterLink>.</p>
      </section>
  </LayoutPublico>
</template>
