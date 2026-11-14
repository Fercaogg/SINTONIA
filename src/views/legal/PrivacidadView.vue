<script setup lang="ts">
// Política de privacidad: estructura completa. Lo que debe redactar o
// confirmar el Comité de Ética aparece como "En elaboración" (PENDIENTES.md).
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { llamar } from '@/lib/api'
import { estaPendiente } from '@/lib/publico'
import LayoutPublico from '@/components/layout/LayoutPublico.vue'
import SeccionLegal from '@/components/comun/SeccionLegal.vue'

const config = ref<Record<string, { valor: string }>>({})
onMounted(async () => {
  try {
    config.value = await llamar('configuracion_publica')
  } catch {
    config.value = {}
  }
})
const texto = (clave: string) => config.value[clave]?.valor
</script>

<template>
  <LayoutPublico>
    <h1 class="titulo-pagina mb-2">Política de privacidad</h1>
    <p class="texto-suave mb-10">
      Qué datos usa SINTONÍA, para qué y qué puedes hacer con ellos. La explicación práctica, con la tabla de quién ve cada dato, está en
      <RouterLink to="/como-funciona" class="enlace">Cómo funciona y tus datos</RouterLink>.
    </p>

    <p v-if="!estaPendiente(texto('texto_politica_privacidad'))" class="mb-10 whitespace-pre-line">{{ texto('texto_politica_privacidad') }}</p>

    <SeccionLegal id="responsable" titulo="Responsable del tratamiento" :pendiente="estaPendiente(texto('responsable_tratamiento'))">
      <p v-if="!estaPendiente(texto('responsable_tratamiento'))" class="whitespace-pre-line">{{ texto('responsable_tratamiento') }}</p>
    </SeccionLegal>

    <SeccionLegal id="finalidad" titulo="Finalidad">
      <p>Hacer posible un registro semanal breve de estudiante y tutor/a para preparar mejor las tutorías, y estudiar si ese acompañamiento ayuda, dentro de la investigación del Trabajo Fin de Máster del que forma parte SINTONÍA.</p>
      <p>SINTONÍA no evalúa a nadie, no pone notas y no deduce emociones.</p>
    </SeccionLegal>

    <SeccionLegal id="base" titulo="Base jurídica" pendiente />

    <SeccionLegal id="categorias" titulo="Categorías de datos">
      <ul class="list-disc pl-5 space-y-1.5">
        <li>Identificación: tu nombre y tu correo institucional.</li>
        <li>Respuestas semanales de 1 a 5 sobre el avance, el siguiente paso y el apoyo percibido.</li>
        <li>Bienestar: una respuesta de 1 a 5 que solo ves tú y que se guarda cifrada.</li>
        <li>Cuestionarios inicial y final del estudio.</li>
        <li>Si lo usas: Puente al doctorado y las fechas que anotes en el calendario.</li>
        <li>Registro de seguridad: qué acciones importantes se hacen y cuándo (por ejemplo, cada descarga de datos). Para frenar abusos, los intentos de registro y acceso se cuentan con una huella que no permite saber tu IP ni tu correo, y se borra a las 24 horas.</li>
      </ul>
    </SeccionLegal>

    <SeccionLegal id="conservacion" titulo="Conservación" pendiente />

    <SeccionLegal id="destinatarios" titulo="Destinatarios" pendiente>
      <p>Dentro de SINTONÍA, cada dato solo lo ve quien indica la tabla "Quién ve qué". Para funcionar, SINTONÍA usa estos servicios técnicos:</p>
      <ul class="list-disc pl-5 space-y-1.5">
        <li>Supabase: base de datos y acceso con enlace por correo.</li>
        <li>Vercel: publicación de la web y tareas automáticas.</li>
        <li>Un servicio de envío de correo, para los enlaces de acceso y los recordatorios.</li>
      </ul>
      <p>Si se activa el programa de redacción de preguntas, no recibe ningún dato personal.</p>
    </SeccionLegal>

    <SeccionLegal id="derechos" titulo="Tus derechos y cómo ejercerlos">
      <p>Tienes derecho a acceder a tus datos, rectificarlos, suprimirlos, oponerte a su tratamiento, limitarlo y llevártelos (portabilidad).</p>
      <p>Desde <strong>Mi cuenta</strong>, en tu panel, puedes hacerlo tú directamente: descargar todos tus datos, corregir tu nombre, retirarte del estudio y borrar tu cuenta.</p>
      <p>También puedes presentar una reclamación ante la Agencia Española de Protección de Datos.</p>
    </SeccionLegal>
  </LayoutPublico>
</template>
