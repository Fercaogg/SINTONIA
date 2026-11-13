export interface Calendario {
  estado: 'sin_fecha' | 'antes' | 'abierta' | 'entre' | 'terminado'
  semana?: number
  proxima?: number
  abre?: string
  cierra?: string
  semanas: number
}

export interface Item {
  clave: string
  texto: string
  ancla_min: string
  ancla_max: string
  privado: boolean
  obligatorio: boolean
  provisional: boolean
}

export interface CheckinEstudiante {
  calendario: Calendario
  items: Item[]
  url_servicio_psicologico: string | null
  respuesta: {
    avance: number
    siguiente_paso: number
    apoyo: number
    bienestar: number | null
    actualizado_at: string
  } | null
}

export interface CheckinTutor {
  calendario: Calendario
  items: Item[]
  estudiantes: { pareja_id: string; nombre: string; cotutor?: boolean; avance: number | null; siguiente_paso: number | null }[]
}

export interface AgendaSemana {
  estado: 'agenda' | 'sin_agenda'
  semana: number
  preguntas?: string[]
  linea_puente?: string | null
}
