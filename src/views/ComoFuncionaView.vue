<script setup lang="ts">
// "Cómo funciona y tus datos": explicación en lenguaje claro de qué se
// calcula y quién ve qué. Los textos legales quedan pendientes del Comité.
import { onMounted, ref } from 'vue'
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

const quienVe = [
  { dato: 'Tus respuestas sobre el avance, el siguiente paso y el apoyo', tu: 'Sí', tutor: 'No', direccion: 'No', investigacion: 'Sí, con un código y sin tu nombre' },
  { dato: 'Tu respuesta de bienestar', tu: 'Sí', tutor: 'No', direccion: 'No', investigacion: 'Solo en la exportación para el análisis, con un código y sin tu nombre' },
  { dato: 'Las respuestas de tu tutor/a sobre ti', tu: 'No', tutor: 'Sí', direccion: 'No', investigacion: 'Sí, con un código y sin nombres' },
  { dato: 'Las tres preguntas de la agenda', tu: 'Sí', tutor: 'Sí', direccion: 'No', investigacion: 'Sí, con un código' },
  { dato: 'Tu nombre', tu: 'Sí', tutor: 'Sí', direccion: 'Solo si pulsas "Necesito apoyo" y lo autorizas', investigacion: 'No' },
  { dato: 'Resúmenes del máster (por ejemplo, la tasa de respuesta)', tu: 'No', tutor: 'No', direccion: 'Sí, solo si hay 5 personas o más', investigacion: 'Sí' },
]
</script>

<template>
  <LayoutPublico>
      <h1 class="titulo-pagina mb-2">Cómo funciona y tus datos</h1>
      <p class="texto-suave mb-10">Lo que hace SINTONÍA, explicado sin letra pequeña.</p>

      <section class="mb-10" aria-labelledby="que">
        <h2 id="que" class="font-display text-xl font-semibold mb-3">Qué hace</h2>
        <ul class="space-y-3 text-base leading-relaxed">
          <li>Cada semana, estudiante y tutor/a responden por separado unas preguntas cortas, de 1 a 5, sobre cómo avanza el trabajo.</li>
          <li>SINTONÍA resta las dos respuestas sobre el avance (y sobre el siguiente paso, si el tutor/a la responde). Si la diferencia es de 2 puntos o más, o de 1 punto en el mismo sentido durante 2 semanas seguidas, considera que hay un desajuste.</li>
          <li>Algunas semanas, por sorteo, la pareja recibe tres preguntas neutras para la siguiente tutoría. El sorteo forma parte del estudio: sirve para saber si las preguntas ayudan.</li>
          <li>Las preguntas pueden redactarse de forma automática con un programa de redacción, que solo recibe qué pregunta no coincide y por cuánto. Nunca recibe nombres, correos ni ninguna otra información personal. Si ese programa no está disponible, se usan preguntas escritas de antemano.</li>
        </ul>
      </section>

      <section class="mb-10" aria-labelledby="no">
        <h2 id="no" class="font-display text-xl font-semibold mb-3">Qué no hace nunca</h2>
        <ul class="space-y-2 text-base leading-relaxed list-disc pl-5">
          <li>No deduce emociones. Tu bienestar solo lo sabe SINTONÍA si tú lo dices, y solo lo ves tú.</li>
          <li>No analiza textos, voz ni comportamiento.</li>
          <li>No pone notas, no hace rankings y no compara a estudiantes ni a tutores.</li>
          <li>No avisa a nadie por tus respuestas. Solo se avisa a la dirección si tú pulsas "Necesito apoyo".</li>
        </ul>
      </section>

      <section class="mb-10" aria-labelledby="quien">
        <h2 id="quien" class="font-display text-xl font-semibold mb-3">Quién ve qué</h2>
        <p class="texto-suave mb-4">Pasa por un dato (o tócalo en el móvil) para ver de un vistazo quién lo ve.</p>
        <TablaQuienVe :filas="quienVe" />
        <p class="text-sm texto-suave mt-3">
          Estas reglas no dependen solo de la aplicación: están escritas en la propia base de datos, que se niega a entregar un dato a quien no le corresponde.
        </p>
      </section>

      <section class="mb-10" aria-labelledby="derechos">
        <h2 id="derechos" class="font-display text-xl font-semibold mb-3">Tus derechos</h2>
        <p class="text-base leading-relaxed">
          Puedes descargar tus datos, corregir tu nombre, retirarte del estudio y borrar tu cuenta cuando quieras, desde tu panel.
          SINTONÍA guarda los datos en servidores de la Unión Europea (Fráncfort, Alemania).
        </p>
      </section>

      <section class="mb-10" aria-labelledby="legal">
        <h2 id="legal" class="font-display text-xl font-semibold mb-3">Política de privacidad</h2>
        <p class="mb-2"><Pendiente publico :texto="config.texto_politica_privacidad?.valor" /></p>
        <p class="mb-2">Responsable del tratamiento: <Pendiente publico :texto="config.responsable_tratamiento?.valor" /></p>
        <p>Toda la estructura, en la <RouterLink to="/privacidad" class="enlace">política de privacidad</RouterLink>.</p>
      </section>
  </LayoutPublico>
</template>
