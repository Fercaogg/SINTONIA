// Orden de las columnas del CSV de investigación. Cada columna está
// descrita en DATOS.md (mantener los dos en el mismo orden).

export const COLUMNAS_INVESTIGACION = [
  'id_pareja', 'id_estudiante', 'id_tutor', 'master', 'tipo_trabajo', 'semana',
  'est_avance', 'est_siguiente_paso', 'est_apoyo', 'est_bienestar', 'est_respondido_at',
  'tut_avance', 'tut_siguiente_paso', 'tut_respondido_at',
  'dif_avance', 'dif_siguiente_paso', 'relevante_avance', 'relevante_siguiente_paso',
  'motivo_avance', 'motivo_siguiente_paso', 'regla_version',
  'sorteo_elegible', 'sorteo_motivo_no_elegible', 'sorteo_probabilidad', 'sorteo_valor', 'sorteo_resultado',
  'sorteo_semilla', 'sorteo_algoritmo', 'sorteo_at',
  'agenda', 'agenda_origen', 'agenda_motivo_banco', 'agenda_version_prompt', 'agenda_modelo',
  'agenda_vista_estudiante', 'agenda_vista_tutor',
  'puente_activado', 'puente_linea', 'puente_vista_estudiante', 'puente_vista_tutor',
  'estudiante_retirado',
] as const
