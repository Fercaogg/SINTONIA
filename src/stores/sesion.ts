// Estado de la sesión: quién está conectado y con qué perfil.

import { defineStore } from 'pinia'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { llamar } from '@/lib/api'
import type { Perfil } from '@/lib/tipos'

export const useSesion = defineStore('sesion', {
  state: () => ({
    sesion: null as Session | null,
    perfil: null as Perfil | null,
    cargada: false,
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
      if (this.sesion) {
        try {
          this.perfil = await llamar<Perfil | null>('mi_perfil')
        } catch {
          this.perfil = null
        }
      }
      this.cargada = true
    },

    async salir() {
      await supabase.auth.signOut()
      this.sesion = null
      this.perfil = null
      this.cargada = true
    },
  },
})
