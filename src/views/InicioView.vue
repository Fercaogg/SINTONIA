<script setup lang="ts">
// Portada. Composición editorial (Fase 4, DISENO.md apartado 11):
// una sola idea visual recorre la página, las dos ondas de estudiante y
// tutor/a, que empiezan desfasadas (la demostración del inicio), se alinean
// al leer "Cómo funciona" y terminan en sintonía en el cierre.
// Cada apartado tiene una composición distinta.
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useSesion } from '@/stores/sesion'
import { INICIO_ROL } from '@/lib/tipos'
import { modoDemo } from '@/lib/supabase'
import { ANTECEDENTE, AUTOR, DATOS_CLAVE, DIRECCION, PARA_QUIEN, REFERENCIAS } from '@/contenido/portada'
import AppLogo from '@/components/comun/AppLogo.vue'
import AppIcon from '@/components/comun/AppIcon.vue'
import BandaEntorno from '@/components/comun/BandaEntorno.vue'
import AccesosDemo from '@/components/comun/AccesosDemo.vue'
import PiePublico from '@/components/layout/PiePublico.vue'
import DemoSintonia from '@/components/portada/DemoSintonia.vue'
import CifraAnimada from '@/components/portada/CifraAnimada.vue'
import ComoFuncionaOndas from '@/components/portada/ComoFuncionaOndas.vue'
import OndasSintonia from '@/components/portada/OndasSintonia.vue'
import PestanasPerfiles from '@/components/portada/PestanasPerfiles.vue'
import TarjetaDireccion from '@/components/portada/TarjetaDireccion.vue'
import PreguntasFrecuentes from '@/components/portada/PreguntasFrecuentes.vue'
import FormularioContacto from '@/components/portada/FormularioContacto.vue'

const sesion = useSesion()
const route = useRoute()
const menuAbierto = ref(false)
const CITADAS = REFERENCIAS.filter((r) => ['colomo2025', 'dekleijn2012', 'winner1980', 'slade2013'].includes(r.clave))

const SECCIONES = [
  { id: 'problema', texto: 'El problema' },
  { id: 'como-funciona', texto: 'Cómo funciona' },
  { id: 'perfiles', texto: 'Perfiles' },
  { id: 'puente', texto: 'Puente' },
  { id: 'privacidad', texto: 'Privacidad' },
  { id: 'direccion', texto: 'Dirección' },
  { id: 'preguntas', texto: 'Preguntas' },
  { id: 'contacto', texto: 'Contacto' },
]

const PUENTE = [
  { titulo: 'Lo activas tú', texto: 'El estudiante activa Puente en su panel cuando quiere, y lo desactiva igual de fácil.' },
  { titulo: 'Se acerca un plazo', texto: 'Cuando una convocatoria predoctoral o de admisión abre o cierra pronto, SINTONÍA lo tiene en cuenta.' },
  { titulo: 'Se habla en la tutoría', texto: 'La agenda incluye una línea para comentarlo. Es una conversación, no un aviso automático.' },
]
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <BandaEntorno />
    <header class="sticky top-0 z-30 bg-surface-50/95 backdrop-blur-md border-b border-surface-200">
      <div class="max-w-[1180px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <RouterLink to="/" class="text-xl" aria-label="SINTONÍA, inicio"><AppLogo /></RouterLink>
        <nav aria-label="Secciones" class="hidden xl:block">
          <ul class="flex items-center gap-1 text-sm">
            <li v-for="s in SECCIONES" :key="s.id">
              <a :href="`#${s.id}`" class="enlace-nav">{{ s.texto }}</a>
            </li>
          </ul>
        </nav>
        <div class="flex items-center gap-2">
          <RouterLink v-if="sesion.rol" :to="INICIO_ROL[sesion.rol]" class="btn-primary text-sm">Ir a mi panel</RouterLink>
          <RouterLink v-else to="/acceso" class="btn-secondary text-sm">Iniciar sesión</RouterLink>
          <button
            type="button"
            class="xl:hidden min-w-tactil min-h-tactil inline-flex items-center justify-center rounded-md text-surface-900 hover:bg-surface-100"
            :aria-expanded="menuAbierto"
            aria-controls="menu-secciones"
            @click="menuAbierto = !menuAbierto"
          >
            <AppIcon :name="menuAbierto ? 'close' : 'menu'" :size="22" :etiqueta="menuAbierto ? 'Cerrar las secciones' : 'Abrir las secciones'" />
          </button>
        </div>
      </div>
      <nav v-show="menuAbierto" id="menu-secciones" aria-label="Secciones" class="xl:hidden border-t border-surface-200 bg-surface-50">
        <ul class="max-w-[1180px] mx-auto px-4 py-2 grid grid-cols-2 gap-1 text-sm">
          <li v-for="s in SECCIONES" :key="s.id">
            <a :href="`#${s.id}`" class="px-2 min-h-tactil flex items-center rounded-md text-surface-900 hover:bg-surface-100" @click="menuAbierto = false">{{ s.texto }}</a>
          </li>
        </ul>
      </nav>
    </header>

    <main id="contenido" class="flex-1">
      <p v-if="route.query.borrado" class="aviso-exito max-w-[900px] mx-4 sm:mx-auto mt-6" role="status">
        Hemos borrado tu cuenta y todos tus datos. Gracias por haber participado.
      </p>

      <!-- 1. Inicio: titular grande a la izquierda, la demostración (el producto) a la derecha -->
      <section class="lg:min-h-[calc(100svh-4.5rem)] flex items-center py-12 sm:py-16">
        <div class="max-w-[1180px] w-full mx-auto px-4 sm:px-6 grid gap-12 lg:grid-cols-[7fr_5fr] items-center">
          <div class="entrada">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand-900 mb-5">Tutoría de TFM, TFG y tesis</p>
            <h1 class="font-display text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-7xl font-bold tracking-tight text-surface-900">
              Acompañar el trabajo académico,
              <span class="block text-brand-900">sin vigilar</span>
            </h1>
            <p class="mt-7 text-lg sm:text-xl texto-suave max-w-xl">
              Un registro semanal muy breve de estudiante y tutor/a para que las tutorías empiecen por lo que importa.
            </p>
            <p class="mt-4 text-base text-surface-900 font-medium">Unos 60 segundos a la semana. Sin notas, sin rankings.</p>
            <AccesosDemo v-if="modoDemo" class="mt-8" />
            <div class="mt-8 flex flex-col sm:flex-row gap-3">
              <RouterLink v-if="!modoDemo" to="/registro" class="btn-primary px-6 py-3">Tengo un código</RouterLink>
              <a href="#demostracion" class="btn-secondary px-6 py-3">Ver la demostración</a>
            </div>
          </div>
          <div class="entrada entrada-2">
            <DemoSintonia />
          </div>
        </div>
      </section>

      <!-- Cifras: banda azul marino a sangre, números grandes (solo datos del producto) -->
      <section aria-label="SINTONÍA en cifras" class="bg-marino text-white">
        <div class="max-w-[1180px] mx-auto px-4 sm:px-6 py-14 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          <CifraAnimada v-for="d in DATOS_CLAVE" :key="d.texto" :valor="Number(d.cifra)" :unidad="d.unidad" :texto="d.texto" />
        </div>
      </section>

      <!-- 2. El problema: columnas desiguales, primer párrafo grande -->
      <section id="problema" class="scroll-mt-20 max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28 grid gap-8 lg:grid-cols-[4fr_8fr]" aria-labelledby="t-problema">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand-900">01</p>
          <h2 id="t-problema" class="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-surface-900 mt-2">El problema</h2>
        </div>
        <div class="space-y-6 max-w-2xl">
          <p class="font-display text-2xl sm:text-3xl leading-snug text-surface-900">
            Estudiante y tutor/a no siempre ven igual el mismo trabajo. En un estudio sobre la tutorización del TFM, el profesorado valoró la
            tutorización mejor que el alumnado (Colomo Magaña et al., 2025).
          </p>
          <p class="text-lg leading-relaxed">
            Y esa relación importa: cómo percibe el estudiante la relación con su tutor/a se ha relacionado con la nota final, con lo que cree
            que el tutor/a aporta a su aprendizaje y con su satisfacción (de Kleijn et al., 2012).
          </p>
          <p class="text-lg leading-relaxed">
            ¿Llega a todo el mundo por igual la información sobre el doctorado? SINTONÍA se pregunta si acercarla a través de la tutoría
            ayuda a quien termina el máster.
          </p>
          <p><RouterLink to="/investigacion" class="enlace">Cómo lo vamos a estudiar y referencias</RouterLink></p>
        </div>
      </section>

      <!-- 3. Cómo funciona: el momento de la página (las ondas se alinean al leer) -->
      <section id="como-funciona" class="scroll-mt-20 bg-papel border-y border-surface-200" aria-labelledby="t-como">
        <div class="max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand-900">02</p>
          <h2 id="t-como" class="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-surface-900 mt-2 mb-12">Cómo funciona</h2>
          <ComoFuncionaOndas />
        </div>
      </section>

      <!-- 4. Para cada perfil: pestañas -->
      <section id="perfiles" class="scroll-mt-20 max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28" aria-labelledby="t-perfiles">
        <div class="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand-900">03</p>
            <h2 id="t-perfiles" class="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-surface-900 mt-2">Para cada perfil</h2>
          </div>
          <p class="texto-suave max-w-sm">Qué hace cada persona, cuánto tiempo le lleva, qué ve y qué no ve.</p>
        </div>
        <PestanasPerfiles />
      </section>

      <!-- 5. Puente al doctorado: un recorrido de tres tramos -->
      <section id="puente" class="scroll-mt-20 bg-papel border-y border-surface-200" aria-labelledby="t-puente">
        <div class="max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div class="max-w-2xl">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand-900">04</p>
            <h2 id="t-puente" class="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-surface-900 mt-2">Puente al doctorado</h2>
            <p class="mt-5 text-lg leading-relaxed">
              Si el estudiante lo activa, los plazos de las convocatorias predoctorales y de admisión al doctorado llegan a la tutoría.
            </p>
          </div>
          <ol class="mt-12 grid gap-8 md:grid-cols-3 relative">
            <li v-for="(p, i) in PUENTE" :key="p.titulo" class="relative pt-8 border-t-2" :class="i === 2 ? 'border-brand-500' : 'border-surface-200'">
              <span class="absolute -top-[9px] left-0 w-4 h-4 rounded-full" :class="i === 2 ? 'bg-brand-500' : 'bg-marino'" aria-hidden="true" />
              <h3 class="font-display text-xl font-semibold text-surface-900">{{ p.titulo }}</h3>
              <p class="mt-2 leading-relaxed">{{ p.texto }}</p>
            </li>
          </ol>
        </div>
      </section>

      <!-- 6. Privacidad y ética: una afirmación grande y su desarrollo -->
      <section id="privacidad" class="scroll-mt-20 max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28 grid gap-10 lg:grid-cols-[6fr_6fr]" aria-labelledby="t-privacidad">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand-900">05</p>
          <h2 id="t-privacidad" class="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-surface-900 mt-2">Privacidad y ética</h2>
          <p class="mt-8 font-display text-3xl sm:text-4xl leading-tight text-surface-900">
            Tu bienestar solo lo ves tú. <span class="text-brand-900">La dirección, solo cifras de 5 personas o más.</span>
          </p>
          <RouterLink to="/como-funciona" class="btn-secondary mt-8">Ver quién ve cada dato</RouterLink>
        </div>
        <div class="space-y-5 text-lg leading-relaxed lg:pt-16">
          <p class="flex gap-3"><AppIcon name="lock" :size="22" class="mt-1 shrink-0 text-brand-900" />Tu tutor/a no ve tus respuestas ni tu bienestar.</p>
          <p class="flex gap-3"><AppIcon name="shield" :size="22" class="mt-1 shrink-0 text-brand-900" />Las reglas de quién ve qué están escritas en la propia base de datos.</p>
          <p class="flex gap-3"><AppIcon name="brain" :size="22" class="mt-1 shrink-0 text-brand-900" />No deduce emociones, no pone notas y no hace rankings.</p>
          <p class="texto-suave text-base pt-2">
            Las tecnologías no son neutrales: sus decisiones de diseño también deciden quién puede hacer qué (Winner, 1980). Y el uso de datos de
            estudiantes plantea dilemas éticos (Slade y Prinsloo, 2013). SINTONÍA los aborda en el propio diseño: cada dato tiene un destino definido.
          </p>
        </div>
      </section>

      <!-- 8. Para quién es: tipografía, sin tarjetas -->
      <section id="para-quien" class="scroll-mt-20 bg-marino text-white" aria-labelledby="t-para">
        <div class="max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-24">
          <h2 id="t-para" class="font-display text-4xl sm:text-5xl font-semibold tracking-tight">Para quién es</h2>
          <ul class="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 border-t border-white/20">
            <li v-for="p in PARA_QUIEN" :key="p.titulo" class="py-8 sm:pr-6 lg:px-6 lg:first:pl-0 border-b border-white/20 sm:odd:border-r lg:border-b-0 lg:border-r lg:last:border-r-0">
              <h3 class="font-display text-2xl font-semibold">{{ p.titulo }}</h3>
              <p class="mt-3 text-white/85 leading-relaxed">{{ p.texto }}</p>
            </li>
          </ul>
        </div>
      </section>

      <!-- 9. Dirección: dos tarjetas idénticas -->
      <section id="direccion" class="scroll-mt-20 max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28" aria-labelledby="t-direccion">
        <h2 id="t-direccion" class="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-surface-900 mb-10">Dirección</h2>
        <ul class="grid gap-6 md:grid-cols-2 auto-rows-fr">
          <li v-for="m in DIRECCION" :key="m.nombre"><TarjetaDireccion :miembro="m" /></li>
        </ul>
        <div class="mt-10 pt-8 border-t border-surface-200 space-y-1">
          <p class="text-base text-surface-900">{{ AUTOR }}</p>
          <p class="text-base texto-suave">Antecedente: {{ ANTECEDENTE }}</p>
        </div>
      </section>

      <!-- 10. Preguntas frecuentes: título fijo a la izquierda, lista a la derecha -->
      <section id="preguntas" class="scroll-mt-20 bg-papel border-y border-surface-200" aria-labelledby="t-preguntas">
        <div class="max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28 grid gap-10 lg:grid-cols-[4fr_8fr]">
          <div class="lg:sticky lg:top-28 self-start">
            <h2 id="t-preguntas" class="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-surface-900">Preguntas frecuentes</h2>
            <p class="mt-4 texto-suave">Y si no está aquí, <a href="#contacto" class="enlace">escríbenos</a>.</p>
          </div>
          <PreguntasFrecuentes />
        </div>
      </section>

      <!-- 11. Contacto: dos columnas -->
      <section id="contacto" class="scroll-mt-20 max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28 grid gap-10 lg:grid-cols-[5fr_7fr]" aria-labelledby="t-contacto">
        <div>
          <h2 id="t-contacto" class="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-surface-900">Contacto</h2>
          <p class="mt-4 text-lg leading-relaxed">Si te interesa SINTONÍA para tu máster, programa o escuela de doctorado, o tienes cualquier duda.</p>
        </div>
        <FormularioContacto />
      </section>

      <!-- Cierre: las dos ondas, por fin, en sintonía -->
      <section class="bg-papel border-t border-surface-200" aria-labelledby="t-cierre">
        <div class="max-w-[1180px] mx-auto px-4 sm:px-6 pt-16 pb-14 text-center">
          <OndasSintonia :desfase="0" :alto="80" />
          <h2 id="t-cierre" class="mt-8 font-display text-4xl sm:text-6xl font-bold tracking-tight text-surface-900">En sintonía.</h2>
          <p class="mt-4 text-lg texto-suave max-w-xl mx-auto">Acompañar el trabajo académico, sin vigilar.</p>
          <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <RouterLink v-if="!modoDemo" to="/registro" class="btn-primary px-6 py-3">Tengo un código</RouterLink>
            <RouterLink to="/investigacion" class="btn-secondary px-6 py-3">Leer la investigación</RouterLink>
          </div>
        </div>
      </section>

      <!-- Referencias citadas en esta página -->
      <section class="max-w-[1180px] mx-auto px-4 sm:px-6 py-10" aria-labelledby="t-refs">
        <h2 id="t-refs" class="font-display text-base font-semibold text-surface-900 mb-3">Referencias citadas</h2>
        <ul class="space-y-2 text-sm texto-suave max-w-4xl">
          <li v-for="r in CITADAS" :key="r.clave" class="pl-6 -indent-6">
            {{ r.texto }} <a v-if="r.enlace" :href="r.enlace" target="_blank" rel="noopener noreferrer" class="enlace break-all">{{ r.enlace }}<span class="sr-only"> (se abre en otra pestaña)</span></a>
          </li>
        </ul>
      </section>
    </main>

    <PiePublico />
  </div>
</template>

<style scoped>
.enlace-nav {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 0.65rem;
  border-radius: var(--radius-md);
  white-space: nowrap;
  color: rgb(var(--rgb-s800));
  transition: background-color var(--dur-micro) ease, color var(--dur-micro) ease;
}
.enlace-nav:hover {
  background-color: rgb(var(--rgb-s100));
  color: rgb(var(--rgb-s900));
}

/* Entrada del inicio, una sola vez al cargar (Taste: el inicio entra una vez;
   Emil: ease-out, corta y desde casi su sitio). */
.entrada {
  animation: entrada var(--dur-entrada) var(--ease-out) both;
}
.entrada-2 {
  animation-delay: 80ms;
}
@keyframes entrada {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .entrada {
    animation: none;
  }
}
</style>
