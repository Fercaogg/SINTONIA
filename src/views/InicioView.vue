<script setup lang="ts">
// Portada: una página larga con navegación fija y anclas.
// Fase 3 del encargo: contenido y estructura. La composición visual
// definitiva (ondas, movimiento) llega en la Fase 4, tras elegir dirección.
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useSesion } from '@/stores/sesion'
import { INICIO_ROL } from '@/lib/tipos'
import { modoDemo } from '@/lib/supabase'
import { ANTECEDENTE, AUTOR, DATOS_CLAVE, DIRECCION, PARA_QUIEN, PASOS, REFERENCIAS } from '@/contenido/portada'
import AppLogo from '@/components/comun/AppLogo.vue'
import AppIcon from '@/components/comun/AppIcon.vue'
import BandaEntorno from '@/components/comun/BandaEntorno.vue'
import AccesosDemo from '@/components/comun/AccesosDemo.vue'
import PiePublico from '@/components/layout/PiePublico.vue'
import DemoSintonia from '@/components/portada/DemoSintonia.vue'
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
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <BandaEntorno />
    <header class="sticky top-0 z-30 bg-surface-50/95 backdrop-blur-md border-b border-surface-200">
      <div class="max-w-[1100px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <RouterLink to="/" class="text-xl" aria-label="SINTONÍA, inicio"><AppLogo /></RouterLink>
        <nav aria-label="Secciones" class="hidden xl:block">
          <ul class="flex items-center gap-1 text-sm">
            <li v-for="s in SECCIONES" :key="s.id">
              <a :href="`#${s.id}`" class="px-2.5 py-2 min-h-tactil inline-flex items-center whitespace-nowrap rounded-md text-surface-800 hover:bg-surface-100 hover:text-surface-900">{{ s.texto }}</a>
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
        <ul class="max-w-[1100px] mx-auto px-4 py-2 grid grid-cols-2 gap-1 text-sm">
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

      <!-- 1. Hero -->
      <section class="py-14 sm:py-20">
        <div class="max-w-[1100px] mx-auto px-4 sm:px-6 grid gap-10 lg:grid-cols-[1.1fr_1fr] items-start">
          <div>
            <h1 class="font-display text-4xl sm:text-5xl font-bold text-surface-900 mb-6 leading-tight">
              Acompañar el trabajo académico,<br />
              <span class="text-brand-900">sin vigilar</span>
            </h1>
            <p class="text-lg sm:text-xl mb-8 texto-suave">
              Un registro semanal muy breve de estudiante y tutor/a para que las tutorías empiecen por lo que importa.
            </p>
            <AccesosDemo v-if="modoDemo" class="mb-6" />
            <div class="flex flex-col sm:flex-row gap-3">
              <RouterLink v-if="!modoDemo" to="/registro" class="btn-primary px-6 py-3">Tengo un código</RouterLink>
              <a href="#demostracion" class="btn-secondary px-6 py-3">Ver la demostración</a>
            </div>
          </div>
          <DemoSintonia />
        </div>
      </section>

      <!-- Datos clave del producto -->
      <section aria-label="SINTONÍA en cifras" class="border-y border-surface-200 bg-white">
        <dl class="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="d in DATOS_CLAVE" :key="d.texto">
            <dt class="sr-only">{{ d.texto }}</dt>
            <dd>
              <span class="font-display text-4xl font-bold text-surface-900 tabular-nums">{{ d.cifra }}</span>
              <span class="font-display text-lg font-semibold text-surface-900"> {{ d.unidad }}</span>
              <span class="block text-sm texto-suave mt-1" aria-hidden="true">{{ d.texto }}</span>
            </dd>
          </div>
        </dl>
      </section>

      <!-- 2. El problema -->
      <section id="problema" class="scroll-mt-20 max-w-[800px] mx-auto px-4 sm:px-6 py-16" aria-labelledby="t-problema">
        <h2 id="t-problema" class="font-display text-3xl font-semibold text-surface-900 mb-6">El problema</h2>
        <div class="space-y-4 text-lg leading-relaxed">
          <p>
            Estudiante y tutor/a no siempre ven igual el mismo trabajo. En un estudio sobre la tutorización del TFM, el profesorado valoró la
            tutorización mejor que el alumnado (Colomo Magaña et al., 2025).
          </p>
          <p>
            Y esa relación importa: cómo percibe el estudiante la relación con su tutor/a se ha relacionado con la nota final, con lo que cree
            que el tutor/a aporta a su aprendizaje y con su satisfacción (de Kleijn et al., 2012).
          </p>
          <p>
            ¿Llega a todo el mundo por igual la información sobre el doctorado? SINTONÍA se pregunta si acercarla a través de la tutoría
            ayuda a quien termina el máster.
          </p>
        </div>
        <p class="mt-6"><RouterLink to="/investigacion" class="enlace">Cómo lo vamos a estudiar y referencias</RouterLink></p>
      </section>

      <!-- 3. Cómo funciona -->
      <section id="como-funciona" class="scroll-mt-20 bg-white border-y border-surface-200" aria-labelledby="t-como">
        <div class="max-w-[1100px] mx-auto px-4 sm:px-6 py-16">
          <h2 id="t-como" class="font-display text-3xl font-semibold text-surface-900 mb-8">Cómo funciona</h2>
          <ol class="grid gap-4 md:grid-cols-3">
            <li v-for="(p, i) in PASOS" :key="p.titulo" class="card p-6">
              <div class="w-11 h-11 rounded-xl bg-brand-100 flex items-center justify-center mb-4">
                <AppIcon :name="p.icono" :size="22" class="text-surface-900" />
              </div>
              <p class="text-xs font-medium uppercase tracking-wider texto-suave mb-1">Paso {{ i + 1 }}</p>
              <h3 class="font-semibold text-surface-900 mb-2">{{ p.titulo }}</h3>
              <p class="text-sm leading-relaxed">{{ p.texto }}</p>
              <p class="text-sm texto-suave leading-relaxed mt-3">{{ p.detalle }}</p>
            </li>
          </ol>
        </div>
      </section>

      <!-- 4. Para cada perfil -->
      <section id="perfiles" class="scroll-mt-20 max-w-[1100px] mx-auto px-4 sm:px-6 py-16" aria-labelledby="t-perfiles">
        <h2 id="t-perfiles" class="font-display text-3xl font-semibold text-surface-900 mb-2">Para cada perfil</h2>
        <p class="texto-suave mb-6">Qué hace cada persona, cuánto tiempo le lleva, qué ve y qué no ve.</p>
        <PestanasPerfiles />
      </section>

      <!-- 5. Puente al doctorado -->
      <section id="puente" class="scroll-mt-20 bg-surface-900 text-white" aria-labelledby="t-puente">
        <div class="max-w-[1100px] mx-auto px-4 sm:px-6 py-16 grid gap-8 md:grid-cols-2">
          <div>
            <h2 id="t-puente" class="font-display text-3xl font-semibold mb-4">Puente al doctorado</h2>
            <p class="text-lg leading-relaxed text-white/90">
              Si el estudiante lo activa, SINTONÍA tiene en cuenta los plazos de las convocatorias predoctorales y de admisión al doctorado.
            </p>
          </div>
          <ol class="space-y-4 text-white/90">
            <li class="flex gap-3"><span class="font-display font-semibold text-white">1.</span>El estudiante activa Puente en su panel, cuando quiera. Puede desactivarlo igual de fácil.</li>
            <li class="flex gap-3"><span class="font-display font-semibold text-white">2.</span>Cuando una convocatoria abre o cierra pronto, la agenda de la tutoría incluye una línea para comentarla.</li>
            <li class="flex gap-3"><span class="font-display font-semibold text-white">3.</span>La información llega a través de la tutoría: es una conversación, no un aviso automático.</li>
          </ol>
        </div>
      </section>

      <!-- 6. Privacidad y ética -->
      <section id="privacidad" class="scroll-mt-20 max-w-[1100px] mx-auto px-4 sm:px-6 py-16" aria-labelledby="t-privacidad">
        <h2 id="t-privacidad" class="font-display text-3xl font-semibold text-surface-900 mb-6">Privacidad y ética</h2>
        <div class="grid gap-8 md:grid-cols-[1fr_1fr]">
          <ul class="space-y-3 text-base leading-relaxed">
            <li class="flex gap-3"><AppIcon name="lock" :size="20" class="mt-1 shrink-0 text-brand-900" />Tu tutor/a no ve tus respuestas ni tu bienestar. La dirección solo ve cifras de 5 personas o más.</li>
            <li class="flex gap-3"><AppIcon name="shield" :size="20" class="mt-1 shrink-0 text-brand-900" />Las reglas de quién ve qué están escritas en la propia base de datos.</li>
            <li class="flex gap-3"><AppIcon name="brain" :size="20" class="mt-1 shrink-0 text-brand-900" />No deduce emociones, no pone notas y no hace rankings.</li>
          </ul>
          <div class="space-y-4 text-base leading-relaxed">
            <p>Las tecnologías no son neutrales: sus decisiones de diseño también deciden quién puede hacer qué (Winner, 1980). Y el uso de datos de estudiantes plantea dilemas éticos (Slade y Prinsloo, 2013). SINTONÍA los aborda en el propio diseño: cada dato tiene un destino definido.</p>
            <p><RouterLink to="/como-funciona" class="enlace">Ver la tabla de quién ve qué y tus derechos</RouterLink></p>
          </div>
        </div>
      </section>

      <!-- 8. Para quién es -->
      <section id="para-quien" class="scroll-mt-20 bg-white border-y border-surface-200" aria-labelledby="t-para">
        <div class="max-w-[1100px] mx-auto px-4 sm:px-6 py-16">
          <h2 id="t-para" class="font-display text-3xl font-semibold text-surface-900 mb-8">Para quién es</h2>
          <ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <li v-for="p in PARA_QUIEN" :key="p.titulo">
              <h3 class="font-semibold text-surface-900">{{ p.titulo }}</h3>
              <p class="text-sm texto-suave mt-1">{{ p.texto }}</p>
            </li>
          </ul>
        </div>
      </section>

      <!-- 9. Dirección -->
      <section id="direccion" class="scroll-mt-20 max-w-[1100px] mx-auto px-4 sm:px-6 py-16" aria-labelledby="t-direccion">
        <h2 id="t-direccion" class="font-display text-3xl font-semibold text-surface-900 mb-8">Dirección</h2>
        <ul class="grid gap-6 md:grid-cols-2 auto-rows-fr">
          <li v-for="m in DIRECCION" :key="m.nombre"><TarjetaDireccion :miembro="m" /></li>
        </ul>
        <p class="mt-8 text-base">{{ AUTOR }}</p>
        <p class="mt-1 text-base texto-suave">Antecedente: {{ ANTECEDENTE }}</p>
      </section>

      <!-- 10. Preguntas frecuentes -->
      <section id="preguntas" class="scroll-mt-20 bg-white border-y border-surface-200" aria-labelledby="t-preguntas">
        <div class="max-w-[800px] mx-auto px-4 sm:px-6 py-16">
          <h2 id="t-preguntas" class="font-display text-3xl font-semibold text-surface-900 mb-8">Preguntas frecuentes</h2>
          <PreguntasFrecuentes />
        </div>
      </section>

      <!-- Referencias citadas en esta página -->
      <section class="max-w-[800px] mx-auto px-4 sm:px-6 pt-4" aria-labelledby="t-refs">
        <h2 id="t-refs" class="font-display text-lg font-semibold text-surface-900 mb-3">Referencias citadas</h2>
        <ul class="space-y-2 text-sm texto-suave">
          <li v-for="r in CITADAS" :key="r.clave" class="pl-6 -indent-6">
            {{ r.texto }} <a v-if="r.enlace" :href="r.enlace" target="_blank" rel="noopener noreferrer" class="enlace break-all">{{ r.enlace }}<span class="sr-only"> (se abre en otra pestaña)</span></a>
          </li>
        </ul>
      </section>

      <!-- 11. Contacto -->
      <section id="contacto" class="scroll-mt-20 max-w-[800px] mx-auto px-4 sm:px-6 py-16" aria-labelledby="t-contacto">
        <h2 id="t-contacto" class="font-display text-3xl font-semibold text-surface-900 mb-2">Contacto</h2>
        <p class="texto-suave mb-6">Si te interesa SINTONÍA para tu máster, programa o escuela de doctorado, o tienes cualquier duda.</p>
        <FormularioContacto />
      </section>
    </main>

    <PiePublico />
  </div>
</template>
