<script setup lang="ts">
// "Cómo funciona y tus datos": explicación en lenguaje claro de qué se
// calcula y quién ve qué. Los textos legales quedan pendientes del Comité.
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { llamar } from '@/lib/api'
import LayoutPublico from '@/components/layout/LayoutPublico.vue'
import Pendiente from '@/components/comun/Pendiente.vue'
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
        <!-- Móvil: una tarjeta por dato -->
        <ul class="space-y-3 sm:hidden">
          <li v-for="fila in quienVe" :key="fila.dato" class="card p-4">
            <p class="font-semibold text-surface-900 mb-2">{{ fila.dato }}</p>
            <dl class="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-sm">
              <dt class="texto-suave">Tú</dt><dd>{{ fila.tu }}</dd>
              <dt class="texto-suave">Tu tutor/a</dt><dd>{{ fila.tutor }}</dd>
              <dt class="texto-suave">Dirección</dt><dd>{{ fila.direccion }}</dd>
              <dt class="texto-suave">Investigación</dt><dd>{{ fila.investigacion }}</dd>
            </dl>
          </li>
        </ul>
        <div class="card overflow-x-auto hidden sm:block" tabindex="0" role="region" aria-label="Tabla de quién ve qué">
          <table class="w-full text-sm text-left">
            <caption class="sr-only">Quién puede ver cada dato</caption>
            <thead class="bg-surface-100 text-surface-800">
              <tr>
                <th scope="col" class="p-3 font-semibold">Dato</th>
                <th scope="col" class="p-3 font-semibold">Tú (estudiante)</th>
                <th scope="col" class="p-3 font-semibold">Tu tutor/a</th>
                <th scope="col" class="p-3 font-semibold">Dirección del máster</th>
                <th scope="col" class="p-3 font-semibold">Investigación</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="fila in quienVe" :key="fila.dato" class="border-t border-surface-200 align-top">
                <th scope="row" class="p-3 font-medium text-surface-900">{{ fila.dato }}</th>
                <td class="p-3">{{ fila.tu }}</td>
                <td class="p-3">{{ fila.tutor }}</td>
                <td class="p-3">{{ fila.direccion }}</td>
                <td class="p-3">{{ fila.investigacion }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-sm texto-suave mt-3">
          Estas reglas no dependen solo de la aplicación: están escritas en la propia base de datos, que se niega a entregar un dato a quien no le corresponde.
        </p>
      </section>

      <section class="mb-10" aria-labelledby="derechos">
        <h2 id="derechos" class="font-display text-xl font-semibold mb-3">Tus derechos</h2>
        <p class="text-base leading-relaxed">
          Puedes descargar tus datos, corregir tu nombre, retirarte del estudio y borrar tu cuenta cuando quieras, desde tu panel.
          SINTONÍA está preparada para guardar los datos en servidores de la Unión Europea (Fráncfort); lo confirmaremos aquí cuando la instalación definitiva esté en marcha.
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
