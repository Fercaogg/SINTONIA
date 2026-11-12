<script setup lang="ts">
// Página a la que lleva el enlace del correo. Comprueba el enlace y entra.
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useSesion } from '@/stores/sesion'
import { INICIO_ROL } from '@/lib/tipos'
import LayoutAcceso from '@/components/layout/LayoutAcceso.vue'
import EstadoCarga from '@/components/comun/EstadoCarga.vue'
import AvisoError from '@/components/comun/AvisoError.vue'

const route = useRoute()
const router = useRouter()
const sesion = useSesion()
const error = ref('')

onMounted(async () => {
  const token_hash = String(route.query.token_hash || '')
  const tipo = String(route.query.type || 'email') as 'email' | 'signup' | 'magiclink'
  if (!token_hash) {
    error.value = 'El enlace no es válido.'
    return
  }
  const { error: e } = await supabase.auth.verifyOtp({ token_hash, type: tipo })
  if (e) {
    error.value = 'El enlace ha caducado o ya se ha usado. Pide uno nuevo.'
    return
  }
  await sesion.cargar(true)
  router.replace(sesion.rol ? INICIO_ROL[sesion.rol] : '/')
})
</script>

<template>
  <LayoutAcceso>
    <template v-if="error">
      <h1 class="titulo-pagina mb-6">No hemos podido entrar</h1>
      <AvisoError :mensaje="error" class="mb-6" />
      <RouterLink to="/acceso" class="btn-primary w-full">Pedir un enlace nuevo</RouterLink>
    </template>
    <EstadoCarga v-else texto="Comprobando el enlace..." />
  </LayoutAcceso>
</template>
