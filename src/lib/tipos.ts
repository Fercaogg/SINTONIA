export type Rol = 'estudiante' | 'tutor' | 'direccion' | 'investigador'
export type TipoTrabajo = 'TFG' | 'TFM' | 'TESIS'

export interface Perfil {
  rol: Rol
  seudonimo: string
  nombre: string
  email: string
  recordatorios: boolean
  retirado: boolean
  master: { id: string; nombre: string; tipo_trabajo: TipoTrabajo } | null
  consentimiento: { version_vigente: number | null; aceptado: boolean }
}

export const NOMBRE_ROL: Record<Rol, string> = {
  estudiante: 'Estudiante',
  tutor: 'Tutor/a',
  direccion: 'Dirección del máster',
  investigador: 'Investigación',
}

export const INICIO_ROL: Record<Rol, string> = {
  estudiante: '/estudiante',
  tutor: '/tutor',
  direccion: '/direccion',
  investigador: '/investigador',
}

/** Perfiles que participan en el estudio y deben aceptar el consentimiento. */
export function necesitaConsentimiento(rol: Rol): boolean {
  return rol === 'estudiante' || rol === 'tutor'
}
