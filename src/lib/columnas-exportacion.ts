// Orden de las columnas del CSV de investigación. Cada columna está
// descrita en DATOS.md (mantener los dos en el mismo orden).

export const COLUMNAS_INVESTIGACION = [
  'id_pareja', 'id_estudiante', 'id_tutor', 'master', 'tipo_trabajo', 'semana',
  'est_avance', 'est_siguiente_paso', 'est_apoyo', 'est_bienestar', 'est_respondido_at',
  'tut_avance', 'tut_siguiente_paso', 'tut_respondido_at', 'n_cotutores', 'cotutores_respondieron',
  'dif_avance', 'dif_siguiente_paso', 'relevante_avance', 'relevante_siguiente_paso',
  'motivo_avance', 'motivo_siguiente_paso', 'regla_version',
  'sorteo_elegible', 'sorteo_motivo_no_elegible', 'sorteo_probabilidad', 'sorteo_valor', 'sorteo_resultado',
  'sorteo_semilla', 'sorteo_algoritmo', 'sorteo_at',
  'agenda', 'agenda_origen', 'agenda_motivo_banco', 'agenda_version_prompt', 'agenda_modelo',
  'agenda_vista_estudiante', 'agenda_vista_tutor',
  'puente_activado', 'puente_linea', 'puente_vista_estudiante', 'puente_vista_tutor',
  'estudiante_retirado',
] as const

/** Archivo de tutores (cotutoría): una fila por pareja, semana y tutor. */
export const COLUMNAS_TUTORES = [
  'id_pareja', 'id_estudiante', 'id_tutor', 'master', 'semana', 'tutor_principal',
  'tut_avance', 'tut_siguiente_paso', 'dif_avance', 'dif_siguiente_paso',
  'relevante_avance', 'relevante_siguiente_paso', 'motivo_avance', 'motivo_siguiente_paso',
  'regla_version', 'tut_respondido_at',
] as const

export const COLUMNAS_CAMBIOS_TUTOR = ['id_pareja', 'id_tutor_anterior', 'id_tutor_nuevo', 'cambiado_at'] as const
