// Vigila la sesión mientras la aplicación está abierta:
//  * si caduca o se cierra en otra pestaña o dispositivo, lleva a /acceso con
//    un aviso y recuerda la pantalla para volver a ella al entrar;
//  * si en otra pestaña entra otra cuenta, recarga el perfil.
//
// Sin esto, la aplicación seguía creyendo que había sesión y todas las
// llamadas fallaban con un mensaje genérico.

import type { Router } from 'vue-router'
import { supabase } from './supabase'
import { cuandoCaduqueLaSesion } from './api'
import { recordarVolver } from './volver'
import { useSesion } from '@/stores/sesion'
import { INICIO_ROL } from './tipos'

export function vigilarSesion(router: Router) {
  const sesion = useSesion()

  function sesionTerminada() {
    if (sesion.saliendo) return
    const teniaSesion = sesion.conectado || !!sesion.perfil
    sesion.olvidar()
    const ruta = router.currentRoute.value
    if (!teniaSesion || ruta.meta.publica) return
    recordarVolver(ruta.fullPath)
    router.replace({ path: '/acceso', query: { motivo: 'sesion' } })
  }

  // La API avisa cuando la base de datos rechaza el token (401).
  cuandoCaduqueLaSesion(() => {
    if (sesion.saliendo) return
    // Limpia el token guardado en este navegador; avisa con SIGNED_OUT.
    void supabase.auth.signOut({ scope: 'local' }).finally(sesionTerminada)
  })

  supabase.auth.onAuthStateChange((evento, nueva) => {
    // No se llama a Supabase dentro de este aviso (lo bloquearía): se aplaza.
    setTimeout(async () => {
      if (evento === 'SIGNED_OUT') {
        sesionTerminada()
        return
      }
      if (evento !== 'SIGNED_IN' && evento !== 'TOKEN_REFRESHED' && evento !== 'USER_UPDATED') return
      if (!sesion.cargada) return // El router la cargará en la primera navegación.
      const antes = sesion.sesion?.user.id
      sesion.sesion = nueva
      if (nueva && antes && nueva.user.id !== antes) {
        // Otra cuenta ha entrado en otra pestaña: no se mezclan datos.
        await sesion.cargar(true)
        if (sesion.perfil) router.replace(INICIO_ROL[sesion.perfil.rol])
      }
    }, 0)
  })
}
