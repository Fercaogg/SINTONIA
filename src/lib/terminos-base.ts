// Términos según el tipo de trabajo (función pura, sin dependencias: la usan
// también los correos del servidor). En una tesis doctoral, la persona que
// acompaña el trabajo es el director/a de tesis y quien lo hace, el
// doctorando/a (Real Decreto 99/2011). En TFG y TFM, tutor/a y estudiante.

export type TipoDeTrabajo = 'TFG' | 'TFM' | 'TESIS'

const CAMBIOS_TESIS: [RegExp, string][] = [
  [/Cotutor\/a/g, 'Codirector/a'],
  [/cotutor\/a/g, 'codirector/a'],
  [/Cotutoría/g, 'Codirección'],
  [/cotutoría/g, 'codirección'],
  [/Cotutores/g, 'Codirectores'],
  [/cotutores/g, 'codirectores'],
  [/Tutor\/a/g, 'Director/a de tesis'],
  [/tutor\/a/g, 'director/a de tesis'],
  [/Tutores/g, 'Directores de tesis'],
  [/tutores/g, 'directores de tesis'],
  [/Estudiantes/g, 'Doctorandos/as'],
  [/estudiantes/g, 'doctorandos/as'],
  [/Estudiante/g, 'Doctorando/a'],
  [/estudiante/g, 'doctorando/a'],
]

/** Adapta un texto escrito para TFG y TFM al tipo de trabajo. */
export function adaptarTexto(texto: string, tipo: TipoDeTrabajo | null | undefined): string {
  if (tipo !== 'TESIS' || !texto) return texto
  return CAMBIOS_TESIS.reduce((t, [patron, nuevo]) => t.replace(patron, nuevo), texto)
}

