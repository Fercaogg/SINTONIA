// Estado de la sesión: quién está conectado y con qué perfil.

import { defineStore } from 'pinia'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { ErrorSintonia, llamar, mensajeDeError } from '@/lib/api'
import { borrarBorradores } from '@/lib/borrador'
import type { Perfil } from '@/lib/tipos'

export const useSesion = defineStore('sesion', {
  state: () => ({
    sesion: null as Session | null,
    perfil: null as Perfil | null,
    cargada: false,
    /**
     * Hay sesión, pero el perfil no se ha podido cargar (por ejemplo, sin
     * conexión). No es lo mismo que no tener cuenta: no se manda a /acceso.
     */
    errorCarga: '',
    /** La persona ha pulsado "Cerrar sesión" (no es una sesión caducada). */
    saliendo: false,
  }),

  getters: {
    conectado: (s) => !!s.sesion,
    rol: (s) => s.perfil?.rol ?? null,
  },

  actions: {
    async cargar(forzar = false) {
      if (this.cargada && !forzar) return
      const { data } = await supabase.auth.getSession()
      this.sesion = data.session
      this.perfil = null
      this.errorCarga = ''
      if (this.sesion) {
        try {
          this.perfil = await llamar<Perfil | null>('mi_perfil')
        } catch (e) {
          this.perfil = null
          if (e instanceof ErrorSintonia && e.codigo === 'SESION_CADUCADA') {
            this.sesion = null
          } else {
            // Sin marcarla como cargada: la próxima navegación lo reintenta.
            this.errorCarga = mensajeDeError(e)
            return
          }
        }
      }
      this.cargada = true
    },

    /** Olvida la sesión sin llamar a nadie (caducada o cerrada en otra pestaña). */
    olvidar() {
      this.sesion = null
      this.perfil = null
      this.errorCarga = ''
      this.cargada = true
    },

    async salir() {
      this.saliendo = true
      try {
        await supabase.auth.signOut()
      } finally {
        // En un ordenador compartido no deben quedar respuestas a medias.
        borrarBorradores()
        this.olvidar()
        this.saliendo = false
      }
    },
  },
})
