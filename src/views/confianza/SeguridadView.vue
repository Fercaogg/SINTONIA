<script setup lang="ts">
// /seguridad: cómo se protegen los datos. Solo lo comprobado (fuentes en
// docs/FUENTES-OFICIALES.md y DECISIONES.md): región en la UE (Supabase
// eu-central-1, comprobada), cifrado del bienestar, reglas de acceso en la
// base de datos y borrado. Las copias de seguridad dependen del plan de
// Supabase y todavía no están confirmadas (PENDIENTES.md).
import { RouterLink } from 'vue-router'
import LayoutPublico from '@/components/layout/LayoutPublico.vue'
import SeccionLegal from '@/components/comun/SeccionLegal.vue'
import AppIcon from '@/components/comun/AppIcon.vue'
import { CORREO_CONTACTO, EN_ELABORACION_PROYECTO, EN_ELABORACION_PROYECTO_EN } from '@/lib/publico'
import { useIdioma } from '@/lib/idioma'
import { fechaLargaEn } from '@/contenido/en'
import { modoDemo } from '@/lib/supabase'
import { REVISION_SEGURIDAD } from '@/contenido/confianza'
import { fechaLarga } from '@/contenido/novedades'

const RESUMEN = [
  { icono: 'globe', titulo: 'En la Unión Europea', texto: 'Base de datos y funciones del servidor en Fráncfort (Alemania).' },
  { icono: 'lock', titulo: 'Bienestar cifrado', texto: 'Solo lo lee quien lo escribe.' },
  { icono: 'shield', titulo: 'Reglas en la base de datos', texto: 'Cada perfil ve solo lo suyo, aunque falle la web.' },
  { icono: 'trash', titulo: 'Borrado cuando quieras', texto: 'Desde Mi cuenta, sin dar explicaciones.' },
] as const

const { idioma, ruta } = useIdioma()
const RESUMEN_EN = [
  { icono: 'globe', titulo: 'In the European Union', texto: 'Database and server functions in Frankfurt (Germany).' },
  { icono: 'lock', titulo: 'Encrypted wellbeing', texto: 'Only the person who writes it can read it.' },
  { icono: 'shield', titulo: 'Rules in the database', texto: 'Each profile sees only its own data, even if the website fails.' },
  { icono: 'trash', titulo: 'Delete whenever you want', texto: 'From My account, without giving reasons.' },
] as const
</script>

<template>
  <LayoutPublico>
    <template v-if="idioma === 'es'">
    <h1 class="titulo-pagina mb-2">Seguridad</h1>
    <p class="texto-suave mb-2">Dónde están tus datos, cómo se protegen y quién puede verlos.</p>
    <p class="text-sm texto-suave mb-8">Última revisión: {{ fechaLarga(REVISION_SEGURIDAD) }}</p>

    <ul class="grid gap-3 sm:grid-cols-2 mb-10">
      <li v-for="r in RESUMEN" :key="r.titulo" class="card p-4 flex gap-3">
        <span class="h-10 w-10 shrink-0 rounded-lg bg-brand-100 text-brand-900 flex items-center justify-center"><AppIcon :name="r.icono" :size="20" /></span>
        <span>
          <span class="block font-semibold text-surface-900">{{ r.titulo }}</span>
          <span class="block text-sm texto-suave">{{ r.texto }}</span>
        </span>
      </li>
    </ul>

    <SeccionLegal id="donde" titulo="Dónde se guardan los datos">
      <p>
        En servidores de la Unión Europea, en Fráncfort (Alemania): la base de datos (Supabase, región eu-central-1, comprobada en la propia
        instalación) y las funciones del servidor (Vercel, región de Fráncfort).
      </p>
    </SeccionLegal>

    <SeccionLegal id="cifrado" titulo="Cifrado">
      <ul class="list-disc pl-5 space-y-1.5">
        <li>Toda la comunicación entre tu navegador y SINTONÍA va cifrada (HTTPS). El navegador no admite conexiones sin cifrar.</li>
        <li>
          Tu respuesta sobre el bienestar se guarda cifrada (AES-256) en una tabla aparte. La clave está en el almacén de secretos de la base
          de datos, no en el código, y solo tú puedes leer esa respuesta.
        </li>
      </ul>
    </SeccionLegal>

    <SeccionLegal id="acceso" titulo="Quién accede a qué">
      <ul class="list-disc pl-5 space-y-1.5">
        <li>
          Las reglas de quién ve qué están escritas en la propia base de datos, en todas las tablas. Así se cumplen aunque alguien intente
          saltarse la web.
        </li>
        <li>Tu tutor/a no ve tus respuestas ni tu bienestar. La dirección del máster solo ve cifras calculadas sobre 5 personas o más.</li>
        <li>Hay pruebas automáticas que comprueban estas reglas antes de publicar cada cambio.</li>
        <li>No hay cookies de seguimiento ni nada cargado desde otras empresas.</li>
      </ul>
      <p>
        El detalle, dato por dato:
        <RouterLink to="/como-funciona#quien" class="enlace">Quién ve qué</RouterLink>.
      </p>
    </SeccionLegal>

    <SeccionLegal id="entrar" titulo="Cómo se entra">
      <ul class="list-disc pl-5 space-y-1.5">
        <li>Para crear una cuenta hace falta un código del máster o de tu tutor/a, que caduca.</li>
        <li>Se entra con un enlace que llega al correo de la universidad: no hay contraseñas que robar.</li>
        <li v-if="modoDemo">En la demostración pública se entra con una contraseña conocida, porque todos los datos son ficticios.</li>
        <li>Los intentos de registro, acceso y contacto tienen un límite, para frenar a los programas automáticos.</li>
      </ul>
    </SeccionLegal>

    <SeccionLegal id="copias" titulo="Copias de seguridad">
      <p class="italic texto-suave" data-en-elaboracion="true">{{ EN_ELABORACION_PROYECTO }}</p>
    </SeccionLegal>

    <SeccionLegal id="borrado" titulo="Cómo pedir el borrado">
      <ol class="list-decimal pl-5 space-y-1.5">
        <li>Entra en SINTONÍA y abre <strong>Mi cuenta</strong>.</li>
        <li>Si quieres, descarga antes tus datos con <strong>Descargar mis datos</strong>.</li>
        <li>En <strong>Dejar el estudio</strong>, pulsa <strong>Retirarme y borrar todos mis datos y mi cuenta</strong> y confírmalo.</li>
      </ol>
      <p>
        Si no puedes entrar, escríbenos a <a :href="`mailto:${CORREO_CONTACTO}`" class="enlace">{{ CORREO_CONTACTO }}</a> desde tu correo de la
        universidad y lo haremos por ti.
      </p>
    </SeccionLegal>

    <SeccionLegal id="avisar" titulo="Si encuentras un problema de seguridad">
      <p>
        Escríbenos a <a :href="`mailto:${CORREO_CONTACTO}`" class="enlace">{{ CORREO_CONTACTO }}</a>. Te agradecemos el aviso y lo revisaremos lo
        antes posible.
      </p>
      <p>
        También puedes ver si la plataforma funciona ahora mismo en <RouterLink to="/estado" class="enlace">Estado</RouterLink>.
      </p>
    </SeccionLegal>
    </template>
    <template v-else>
    <h1 class="titulo-pagina mb-2">Security</h1>
    <p class="texto-suave mb-2">Where your data is, how it is protected and who can see it.</p>
    <p class="text-sm texto-suave mb-8">Last reviewed: {{ fechaLargaEn(REVISION_SEGURIDAD) }}</p>

    <ul class="grid gap-3 sm:grid-cols-2 mb-10">
      <li v-for="r in RESUMEN_EN" :key="r.titulo" class="card p-4 flex gap-3">
        <span class="h-10 w-10 shrink-0 rounded-lg bg-brand-100 text-brand-900 flex items-center justify-center"><AppIcon :name="r.icono" :size="20" /></span>
        <span>
          <span class="block font-semibold text-surface-900">{{ r.titulo }}</span>
          <span class="block text-sm texto-suave">{{ r.texto }}</span>
        </span>
      </li>
    </ul>

    <SeccionLegal id="donde" titulo="Where the data is stored">
      <p>
        On servers in the European Union, in Frankfurt (Germany): the database (Supabase, eu-central-1 region, checked in the installation itself)
        and the server functions (Vercel, Frankfurt region).
      </p>
    </SeccionLegal>

    <SeccionLegal id="cifrado" titulo="Encryption">
      <ul class="list-disc pl-5 space-y-1.5">
        <li>All communication between your browser and SINTONÍA is encrypted (HTTPS). The browser does not accept unencrypted connections.</li>
        <li>
          Your wellbeing answer is stored encrypted (AES-256) in a separate table. The key is kept in the database's secret store, not in the code,
          and only you can read that answer.
        </li>
      </ul>
    </SeccionLegal>

    <SeccionLegal id="acceso" titulo="Who can access what">
      <ul class="list-disc pl-5 space-y-1.5">
        <li>The rules on who sees what are written into the database itself, in every table. So they hold even if someone tries to bypass the website.</li>
        <li>Your supervisor does not see your answers or your wellbeing. Programme directors only see figures calculated over 5 people or more.</li>
        <li>Automated tests check these rules before each change is published.</li>
        <li>There are no tracking cookies and nothing loaded from other companies.</li>
      </ul>
      <p>Item by item: <RouterLink :to="ruta('/como-funciona#quien')" class="enlace">Who sees what</RouterLink>.</p>
    </SeccionLegal>

    <SeccionLegal id="entrar" titulo="How you sign in">
      <ul class="list-disc pl-5 space-y-1.5">
        <li>Creating an account requires a code from the programme or from your supervisor, and it expires.</li>
        <li>You sign in with a link sent to your university email: there are no passwords to steal.</li>
        <li>Registration, sign-in and contact attempts are limited, to stop automated programs.</li>
        <li v-if="modoDemo">In the public demo you sign in with a known password, because all the data is fictitious.</li>
      </ul>
    </SeccionLegal>

    <SeccionLegal id="copias" titulo="Backups">
      <p class="italic texto-suave" data-en-elaboracion="true">{{ EN_ELABORACION_PROYECTO_EN }}</p>
    </SeccionLegal>

    <SeccionLegal id="borrado" titulo="How to request deletion">
      <ol class="list-decimal pl-5 space-y-1.5">
        <li>Sign in to SINTONÍA and open <strong>Mi cuenta</strong> (My account).</li>
        <li>If you want, first download your data with <strong>Descargar mis datos</strong> (Download my data).</li>
        <li>Under <strong>Dejar el estudio</strong> (Leave the study), press <strong>Retirarme y borrar todos mis datos y mi cuenta</strong> (Withdraw and delete all my data and my account) and confirm.</li>
      </ol>
      <p>
        If you cannot sign in, write to <a :href="`mailto:${CORREO_CONTACTO}`" class="enlace">{{ CORREO_CONTACTO }}</a> from your university email and we
        will do it for you.
      </p>
    </SeccionLegal>

    <SeccionLegal id="avisar" titulo="If you find a security problem">
      <p>Write to <a :href="`mailto:${CORREO_CONTACTO}`" class="enlace">{{ CORREO_CONTACTO }}</a>. Thank you for letting us know; we will look into it as soon as possible.</p>
      <p>You can also check whether the platform is working right now on the <RouterLink :to="ruta('/estado')" class="enlace">Status</RouterLink> page.</p>
    </SeccionLegal>
    </template>
  </LayoutPublico>
</template>
