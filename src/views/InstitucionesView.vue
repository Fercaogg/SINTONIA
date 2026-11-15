<script setup lang="ts">
// /instituciones: para másteres, programas y escuelas de doctorado. El
// problema, cómo se implanta, qué necesita la universidad, qué ve cada perfil
// y "Solicitar una demostración". Contenido en src/contenido/instituciones.ts.
import { RouterLink } from 'vue-router'
import LayoutPublico from '@/components/layout/LayoutPublico.vue'
import AppIcon from '@/components/comun/AppIcon.vue'
import OndasSintonia from '@/components/portada/OndasSintonia.vue'
import FormularioDemostracion from '@/components/portada/FormularioDemostracion.vue'
import { NECESITA, PASOS_IMPLANTACION } from '@/contenido/instituciones'
import { PERFILES } from '@/contenido/portada'
</script>

<template>
  <LayoutPublico>
    <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-900">Para instituciones</p>
    <h1 class="titulo-pagina mt-2 mb-3">SINTONÍA en tu máster, programa o escuela de doctorado</h1>
    <p class="text-lg leading-relaxed texto-suave">
      Un registro semanal muy breve de estudiante y tutor/a para que las tutorías empiecen por lo que importa. Sin notas, sin rankings y sin vigilar.
    </p>
    <div class="mt-6 flex flex-col gap-3 sm:flex-row">
      <a href="#solicitar" class="btn-primary px-6 py-3">Solicitar una demostración</a>
      <RouterLink to="/demo/recorrido" class="btn-secondary px-6 py-3">Probarla en 60 segundos</RouterLink>
      <a href="/dosier/sintonia-dosier.pdf" download="sintonia-dosier.pdf" class="btn-secondary px-6 py-3"><AppIcon name="download" :size="16" />Dosier en PDF</a>
    </div>

    <section class="mt-14" aria-labelledby="t-problema-i">
      <h2 id="t-problema-i" class="font-display text-2xl font-semibold text-surface-900">El problema que resuelve</h2>
      <div class="mt-4 card p-5" aria-hidden="true"><OndasSintonia :desfase="0.7" :alto="70" :grosor="3" /></div>
      <p class="mt-4 leading-relaxed">
        Estudiante y tutor/a no siempre ven igual el mismo trabajo. En un estudio sobre la tutorización del TFM, el profesorado valoró la tutorización
        mejor que el alumnado (Colomo Magaña et al., 2025). Y cómo percibe el estudiante esa relación se ha relacionado con su nota, con lo que cree
        que aprende y con su satisfacción (de Kleijn et al., 2012).
      </p>
      <p class="mt-3 leading-relaxed">
        SINTONÍA hace visible cada semana si las dos miradas se separan, y propone tres preguntas neutras para hablarlo en la tutoría, antes de que el
        desajuste crezca.
      </p>
    </section>

    <section class="mt-14" aria-labelledby="t-implantar">
      <h2 id="t-implantar" class="font-display text-2xl font-semibold text-surface-900">Cómo se implanta en un máster</h2>
      <ol class="mt-6 relative">
        <li v-for="(p, i) in PASOS_IMPLANTACION" :key="p.titulo" class="relative grid grid-cols-[2.75rem_1fr] gap-x-4 pb-8 last:pb-0">
          <span v-if="i < PASOS_IMPLANTACION.length - 1" class="absolute left-[1.375rem] top-11 bottom-0 w-0.5 -translate-x-1/2 bg-surface-200" aria-hidden="true" />
          <span class="relative z-10 h-11 w-11 rounded-full bg-marino text-white flex items-center justify-center font-display font-semibold" aria-hidden="true">{{ i + 1 }}</span>
          <div class="pt-2">
            <h3 class="font-display text-lg font-semibold text-surface-900"><span class="sr-only">Paso {{ i + 1 }}: </span>{{ p.titulo }}</h3>
            <p class="mt-1 leading-relaxed">{{ p.texto }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section class="mt-14" aria-labelledby="t-necesita">
      <h2 id="t-necesita" class="font-display text-2xl font-semibold text-surface-900">Qué necesita la universidad</h2>
      <ul class="mt-6 grid gap-3 sm:grid-cols-2">
        <li v-for="n in NECESITA" :key="n.titulo" class="card p-4 flex gap-3">
          <span class="h-10 w-10 shrink-0 rounded-lg bg-brand-100 text-brand-900 flex items-center justify-center"><AppIcon :name="n.icono" :size="20" /></span>
          <span>
            <span class="block font-semibold text-surface-900">{{ n.titulo }}</span>
            <span class="block text-sm texto-suave">{{ n.texto }}</span>
          </span>
        </li>
      </ul>
    </section>

    <section class="mt-14" aria-labelledby="t-ve">
      <h2 id="t-ve" class="font-display text-2xl font-semibold text-surface-900">Qué datos ve cada perfil</h2>
      <ul class="mt-6 grid gap-3 md:grid-cols-3">
        <li v-for="p in PERFILES" :key="p.clave" class="card p-4">
          <h3 class="font-display text-lg font-semibold text-surface-900">{{ p.nombre }}</h3>
          <p class="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-surface-800">Ve</p>
          <ul class="mt-1 space-y-1 text-sm">
            <li v-for="t in p.ve" :key="t" class="flex gap-2"><AppIcon name="eye" :size="15" class="mt-0.5 shrink-0 text-brand-900" />{{ t }}</li>
          </ul>
          <p class="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-surface-800">No ve</p>
          <ul class="mt-1 space-y-1 text-sm">
            <li v-for="t in p.noVe" :key="t" class="flex gap-2"><AppIcon name="lock" :size="15" class="mt-0.5 shrink-0 text-surface-800" />{{ t }}</li>
          </ul>
        </li>
      </ul>
      <p class="mt-4 text-sm texto-suave">
        El detalle, dato por dato, en <RouterLink to="/como-funciona#quien" class="enlace">Quién ve qué</RouterLink>, y cómo se protegen en
        <RouterLink to="/seguridad" class="enlace">Seguridad</RouterLink>.
      </p>
    </section>

    <section class="mt-14" aria-labelledby="t-estado-p">
      <h2 id="t-estado-p" class="font-display text-2xl font-semibold text-surface-900">En qué punto está</h2>
      <p class="mt-3 leading-relaxed">
        SINTONÍA es el prototipo de un Trabajo Fin de Máster de la Universidad de Salamanca. Se probará de febrero a abril de 2027 en dos másteres de la
        Universidad. Lo que ya está hecho y lo que viene, en la <RouterLink to="/hoja-de-ruta" class="enlace">hoja de ruta</RouterLink>.
      </p>
    </section>

    <section id="solicitar" class="mt-14 scroll-mt-24" aria-labelledby="t-solicitar">
      <h2 id="t-solicitar" class="font-display text-2xl font-semibold text-surface-900">Solicitar una demostración</h2>
      <p class="mt-2 texto-suave mb-6">Te enseñamos SINTONÍA por dentro, con datos ficticios, y resolvemos tus dudas.</p>
      <FormularioDemostracion />
    </section>
  </LayoutPublico>
</template>
