// Modo demostración: cuentas públicas de la instalación de demostración
// (datos ficticios, dominio inventado sintonia.example). Deben coincidir con
// scripts/demo/generar-demo.ts.

import { ref } from 'vue'
import { llamar } from './api'
import { modoDemo } from './supabase'
import type { Rol } from './tipos'

export const CONTRASENA_DEMO = 'demo-sintonia'

export const ACCESOS_DEMO: { rol: Rol; etiqueta: string; descripcion: string; email: string }[] = [
  { rol: 'estudiante', etiqueta: 'Estudiante', descripcion: 'Check-in, agenda y Puente al doctorado', email: 'estudiante01@sintonia.example' },
  { rol: 'tutor', etiqueta: 'Tutor/a', descripcion: 'Check-in de sus estudiantes y agendas', email: 'tutor1@sintonia.example' },
  { rol: 'direccion', etiqueta: 'Dirección del máster', descripcion: 'Solo datos agregados y anónimos', email: 'direccion@sintonia.example' },
  { rol: 'investigador', etiqueta: 'Investigación', descripcion: 'Calendario, convocatorias y datos', email: 'investigacion@sintonia.example' },
]

/** ¿Qué dice la base de datos? 'demo', 'real' o null mientras se consulta. */
export const modoServidor = ref<'demo' | 'real' | null>(null)

let consulta: Promise<void> | null = null
export function comprobarModoServidor(): Promise<void> {
  consulta ??= llamar<{ modo: 'demo' | 'real' }>('modo_instalacion')
    .then((r) => { modoServidor.value = r.modo })
    .catch(() => { modoServidor.value = null })
  return consulta
}

/** Los accesos rápidos solo aparecen si la aplicación Y la base de datos son de demostración. */
export const accesosDisponibles = () => modoDemo && modoServidor.value === 'demo'
