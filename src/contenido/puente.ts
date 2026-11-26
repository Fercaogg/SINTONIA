// Contenido de "Puente al doctorado" que no cambia cada año: las puertas de
// la pantalla, qué hace falta para empezar el doctorado y los tipos de
// doctorado.
//
// Regla: solo lo comprobado en una fuente oficial (docs/FUENTES-OFICIALES.md),
// con su fuente. Lo que aún no se ha comprobado vale null y sale como
// "[PENDIENTE: ...]" (ver PENDIENTES.md). Nada se escribe de memoria.
//
// Lo que cambia cada año (convocatorias, fechas, normativa vigente) no está
// aquí: lo gestiona Investigación en el panel y llega de la base de datos.

export type SeccionPuente = 'becas' | 'plazos' | 'necesito' | 'tipos' | 'eventos' | 'normativa'

export interface Puerta {
  clave: SeccionPuente
  titulo: string
  descripcion: string
  icono: string
}

export const PUERTAS: Puerta[] = [
  { clave: 'becas', titulo: 'Becas y contratos', descripcion: 'Las ayudas para hacer el doctorado: quién las convoca y dónde se piden.', icono: 'graduation' },
  { clave: 'plazos', titulo: 'Plazos', descripcion: 'Qué está abierto ahora, qué abre pronto y qué ya ha cerrado.', icono: 'clock' },
  { clave: 'necesito', titulo: 'Qué necesito', descripcion: 'Los pasos para empezar: acceso, admisión, quién dirige la tesis, el primer año y financiación.', icono: 'checkin' },
  { clave: 'tipos', titulo: 'Tipos de doctorado', descripcion: 'Tiempo completo o parcial, mención internacional, mención industrial y cotutela.', icono: 'compare' },
  { clave: 'eventos', titulo: 'Congresos y eventos', descripcion: 'Congresos, seminarios y jornadas anotados en el calendario de tu máster.', icono: 'users' },
  { clave: 'normativa', titulo: 'Normativa', descripcion: 'Los reglamentos oficiales del doctorado, para consultarlos cuando quieras.', icono: 'document' },
]

export interface Fuente {
  texto: string
  url: string
}

export interface Apartado {
  titulo: string
  /** null: todavía no comprobado en la fuente oficial. */
  texto: string | null
  /** Lo que falta por comprobar (se muestra como [PENDIENTE: ...], después del texto si lo hay). */
  pendiente?: string
  fuente: Fuente
  /** Enlace a otra puerta de Puente. */
  puerta?: SeccionPuente
}

// Texto consolidado del BOE, última modificación de 18 de julio de 2023
// (comprobado el 26/11/2026; ver docs/FUENTES-OFICIALES.md, apartado 4).
const URL_RD = 'https://www.boe.es/buscar/act.php?id=BOE-A-2011-2541'
const rd = (articulo: string): Fuente => ({ texto: `Real Decreto 99/2011, de enseñanzas oficiales de doctorado (${articulo})`, url: URL_RD })
const REGLAMENTO_USAL: Fuente = {
  texto: 'Reglamento de Doctorado de la Universidad de Salamanca (BOCyL de 15 de diciembre de 2025)',
  url: 'https://bocyl.jcyl.es/boletines/2025/12/15/pdf/BOCYL-D-15122025-31.pdf',
}
const ESCUELA_DOCTORADO: Fuente = {
  texto: 'Escuela de Doctorado «Studii Salamantini» de la Universidad de Salamanca',
  url: 'https://doctorado.usal.es/',
}
const CONVOCATORIAS_USAL: Fuente = {
  texto: 'Convocatorias de investigación de la Universidad de Salamanca',
  url: 'https://convocatoriasinvestigacion.usal.es/',
}

/** Qué necesito para empezar el doctorado, en orden. */
export const NECESITO: Apartado[] = [
  {
    titulo: 'Un título que dé acceso al doctorado',
    texto:
      'Con carácter general, los títulos oficiales de Grado y de Máster universitario (o equivalentes), siempre que sumen al menos 300 créditos ECTS entre los dos. ' +
      'También pueden acceder, entre otros casos, quienes ya son doctores y quienes tienen un título extranjero que da acceso al doctorado en su país: ' +
      'si es del Espacio Europeo de Educación Superior, sin homologarlo; si no, después de que la universidad compruebe que equivale a un máster.',
    fuente: rd('artículo 6'),
  },
  {
    titulo: 'Plaza en un programa de doctorado',
    texto:
      'Cada programa puede fijar sus propios requisitos y criterios de admisión; por ejemplo, el aval de una investigadora o un investigador como posible director de tu tesis. ' +
      'También puede pedirte complementos de formación, que se superan en un curso académico como máximo.',
    pendiente: '[PENDIENTE: cómo y cuándo se pide la admisión en la Escuela de Doctorado de la USAL]',
    fuente: { texto: `${rd('artículo 7').texto} y ${ESCUELA_DOCTORADO.texto}`, url: URL_RD },
  },
  {
    titulo: 'Una persona que dirija tu tesis y otra que te tutorice',
    texto:
      'Una vez admitido, la Comisión académica del programa te asigna una directora o director de tesis y una tutora o tutor, que puede ser la misma persona o no. ' +
      'En la Universidad de Salamanca, si quien dirige la tesis forma parte del programa y tiene contrato con la Universidad, también hace de tutor o tutora. ' +
      'Una tesis puede tener hasta tres directores.',
    fuente: { texto: 'Real Decreto 99/2011 (artículo 11.3) y Reglamento de Doctorado de la USAL (artículos 13.5 y 14.5)', url: REGLAMENTO_USAL.url },
  },
  {
    titulo: 'Un plan de investigación el primer año',
    texto:
      'Antes de que acabe el primer año desde la matrícula, preparas con tu director o directora y tu tutor o tutora un plan de investigación ' +
      '(metodología, objetivos, medios y calendario) y un plan de formación (cursos, seminarios, movilidad...). ' +
      'Te matriculas cada año, y cada año la Comisión académica evalúa tu progreso con ese plan y tu documento de actividades.',
    fuente: rd('artículo 11'),
  },
  {
    titulo: 'Financiación, si la buscas',
    texto:
      'Las ayudas más conocidas son las FPU, las FPI y los contratos predoctorales de la Universidad de Salamanca y de la Junta de Castilla y León. Cada una tiene su convocatoria, con sus propios plazos. ' +
      'Las FPI van ligadas a proyectos de investigación: el proyecto lo piden los grupos de investigación y los contratos para doctorandos se convocan después.',
    fuente: CONVOCATORIAS_USAL,
    puerta: 'becas',
  },
  {
    titulo: 'Hablarlo en la tutoría',
    texto:
      'Según el Reglamento de Doctorado de la USAL, la tutora o el tutor asesora sobre los servicios de apoyo a la investigación de la Universidad (becas, movilidad, idiomas...). ' +
      'Si activas los avisos de Puente, la agenda de la tutoría te propondrá comentarlo cuando se acerque un plazo.',
    fuente: { texto: 'Reglamento de Doctorado de la USAL (artículo 13.7.c)', url: REGLAMENTO_USAL.url },
  },
]

/** Tipos de doctorado según la normativa. */
export const TIPOS_DOCTORADO: Apartado[] = [
  {
    titulo: 'Tiempo completo o tiempo parcial',
    texto:
      'A tiempo completo, cuatro años como máximo, desde la matrícula hasta el depósito de la tesis. ' +
      'Con autorización de la Comisión académica, a tiempo parcial: siete años como máximo. ' +
      'Con una discapacidad del 33 % o más, seis y nueve años. Se puede pedir una prórroga de un año y bajas temporales de hasta dos años en total; ' +
      'la incapacidad temporal, el nacimiento, la adopción o la violencia de género, entre otras situaciones, interrumpen el plazo.',
    fuente: rd('artículo 3'),
  },
  {
    titulo: 'Mención «Doctorado Internacional»',
    texto:
      'Hace falta: una o varias estancias de al menos tres meses en total fuera de España, en universidades o centros de investigación ' +
      '(si son varias, una de al menos un mes), avaladas por la dirección y autorizadas por la Comisión académica; ' +
      'escribir y defender al menos el resumen y las conclusiones en una lengua habitual de la comunicación científica de tu ámbito, distinta de las oficiales en España; ' +
      'que al menos dos de los informes de expertos sobre la tesis sean de instituciones no españolas, y que una persona de una institución no española forme parte del tribunal.',
    fuente: rd('artículo 15.1'),
  },
  {
    titulo: 'Mención «Doctorado Industrial»',
    texto:
      'La tesis desarrolla un proyecto de investigación de interés industrial, comercial, social o cultural de una empresa, entidad o administración pública (no de una universidad), ' +
      'con un convenio entre esa entidad y la universidad, y estás contratado o contratada allí al menos un año. ' +
      'Tienes una persona tutora de la universidad y una responsable en la entidad.',
    fuente: rd('artículo 15 bis'),
  },
  {
    titulo: 'Tesis en cotutela internacional',
    texto:
      'La supervisan doctoras o doctores de dos o más universidades, una española y las demás extranjeras, que firman un convenio de cotutela. ' +
      'Obtienes un título de cada universidad, con una estancia mínima de seis meses en cada una. ' +
      'Con estancias en otras instituciones, también puede llevar la mención «Doctorado Internacional».',
    fuente: rd('artículo 15.2'),
  },
]
