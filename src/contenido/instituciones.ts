// Contenido de /instituciones, del dosier y de /hoja-de-ruta. Solo lo que
// existe de verdad (README, apartado 4) o está planificado en el proyecto
// (diseño del estudio y calendario de /investigacion).

/** Cómo se implanta en un máster (tal como funciona hoy el panel de Investigación). */
export const PASOS_IMPLANTACION = [
  {
    titulo: 'Alta del máster',
    texto: 'Se crea el máster en el panel de Investigación. Cada persona de la dirección recibe un código personal para registrarse con su correo de la universidad.',
  },
  {
    titulo: 'Invitación de tutores',
    texto: 'Cada tutor/a recibe su propio código, con una etiqueta interna y nunca con su nombre. Sirve para una persona y caduca a los 30 días.',
  },
  {
    titulo: 'Códigos para estudiantes',
    texto: 'Cuando los tutores se han registrado, cada uno reparte desde su panel los códigos de pareja para sus estudiantes.',
  },
  {
    titulo: 'Calendario',
    texto: 'Se fijan la fecha de inicio, la duración (10 semanas en el piloto) y los días de apertura y cierre de cada semana. Desde entonces, SINTONÍA abre y cierra las semanas sola.',
  },
] as const

/** Qué necesita la universidad. */
export const NECESITA = [
  { icono: 'mail', titulo: 'Correo institucional', texto: 'Estudiantes, tutores y dirección entran con el correo de la universidad. Se admiten los dominios que se indiquen.' },
  { icono: 'globe', titulo: 'Solo un navegador', texto: 'No hay nada que instalar ni que conectar con otros sistemas de la universidad. Funciona en el móvil y en el ordenador.' },
  { icono: 'users', titulo: 'Una persona de referencia', texto: 'Alguien de la dirección del máster que reparta los códigos a los tutores y conozca el calendario.' },
  { icono: 'clock', titulo: 'Un minuto a la semana', texto: 'Unos 60 segundos por estudiante y 30 por tutor/a, para todos sus estudiantes.' },
  { icono: 'shield', titulo: 'Aprobación ética, si se investiga', texto: 'Si los datos se van a usar en un estudio, hace falta el informe favorable del comité de ética correspondiente.' },
] as const

/** Hoja de ruta: solo lo hecho y lo planificado. */
export const HOJA_DE_RUTA = {
  hecho: [
    'Check-in semanal de estudiante y tutor/a, en el móvil y en el ordenador.',
    'Comparación de las dos miradas con reglas públicas y agenda de tres preguntas neutras.',
    'Sorteo semanal registrado (microensayo con probabilidad 0,5).',
    'Bienestar cifrado, que solo ve el propio estudiante.',
    'Panel de la dirección con cifras solo de 5 personas o más.',
    '"Necesito apoyo", retirada del estudio y borrado de la cuenta.',
    'Puente al doctorado y calendario compartido.',
    'Cotutoría, cambio de tutor/a y términos de tesis doctoral.',
    'Cuestionarios inicial y final, y exportación de datos para el análisis.',
    'Demostración pública con datos ficticios.',
    'Datos en la Unión Europea (Fráncfort).',
  ],
  piloto: [
    'Piloto en dos másteres de la Universidad de Salamanca, con 30 a 50 parejas.',
    'Diez semanas de check-in, con el sorteo semanal de la agenda.',
    'Cuestionario al principio y al final.',
    'Entre 8 y 10 entrevistas.',
  ],
  despues: [
    'Ampliación a Trabajos Fin de Grado, con la misma lógica de dos miradas.',
    'Ampliación a tesis doctorales, con los términos de doctorado ya preparados.',
    'Puente al doctorado para conectar a quien termina un máster con la información sobre el doctorado.',
  ],
}
