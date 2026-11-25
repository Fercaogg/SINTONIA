// Puente al doctorado: información pública sobre el doctorado en la USAL y
// las ayudas predoctorales. Todo sale de las páginas oficiales consultadas el
// 25/11/2026 (detalle y enlaces en docs/FUENTES-OFICIALES.md, apartado 4).
// Lo que no se ha podido comprobar va como [PENDIENTE: ...] y la pantalla lo
// muestra en amarillo (componente Pendiente.vue). No se inventa ningún dato.

/** Fecha de la última consulta a las páginas oficiales. */
export const CONSULTA_DOCTORADO = '2026-11-25'

export interface Programa {
  nombre: string
  url: string
}

export interface Rama {
  rama: string
  programas: Programa[]
}

/** Página oficial con la oferta completa (45 programas en 6 ramas el 25/11/2026). */
export const URL_OFERTA = 'https://doctorado.usal.es/es/doctorados'

/**
 * Programas cuyo nombre coincide con las áreas del TFM (estudios de ciencia,
 * tecnología y sociedad; educación y tecnología educativa; sociología;
 * filosofía de la ciencia; psicología). Es una coincidencia por el nombre:
 * las líneas de investigación de cada programa están en su ficha.
 */
export const AFINES = [
  'Lógica, Filosofía de la Ciencia y Estudios Sociales de la Ciencia',
  'Formación en la Sociedad del Conocimiento',
  'Educación',
  'Ciencias Sociales (incluye línea de investigación en "Traducción y mediación intercultural")',
  'Psicología',
  'Filosofía',
]

// Lista copiada de https://doctorado.usal.es/es/doctorados (25/11/2026),
// con el mismo orden y los mismos nombres que la página oficial.
export const RAMAS: Rama[] = [
  {
    rama: 'Arte y Humanidades',
    programas: [
      { nombre: 'Español: investigación avanzada en Lengua y Literatura', url: 'https://doctorado.usal.es/es/doctorado/espa%C3%B1ol-investigaci%C3%B3n-avanzada-en-lengua-y-literatura' },
      { nombre: 'Estudios ingleses avanzados: lenguas y culturas en contacto', url: 'https://doctorado.usal.es/es/doctorado/estudios-ingleses-avanzados-lenguas-y-culturas-en-contacto' },
      { nombre: 'Filosofía', url: 'https://doctorado.usal.es/es/doctorado/filosof%C3%ADa' },
      { nombre: 'Historia del Arte y Musicología', url: 'https://doctorado.usal.es/es/doctorado/historia-del-arte-y-musicolog%C3%ADa' },
      { nombre: 'Historia Medieval, Moderna, Contemporánea y de América', url: 'https://doctorado.usal.es/es/doctorado/historia-medieval-moderna-contempor%C3%A1nea-y-de-am%C3%A9rica' },
      { nombre: 'Lenguas Modernas', url: 'https://doctorado.usal.es/es/doctorado/lenguas-modernas' },
      { nombre: 'Lógica, Filosofía de la Ciencia y Estudios Sociales de la Ciencia', url: 'https://doctorado.usal.es/es/doctorado/l%C3%B3gica-filosof%C3%ADa-de-la-ciencia-y-estudios-sociales-de-la-ciencia' },
      { nombre: 'Prehistoria y Ciencias de la Antigüedad', url: 'https://doctorado.usal.es/es/doctorado/prehistoria-y-ciencias-de-la-antig%C3%BCedad' },
      { nombre: 'Producción y prácticas artísticas', url: 'https://doctorado.usal.es/es/doctorado/producci%C3%B3n-y-pr%C3%A1cticas-art%C3%ADsticas' },
      { nombre: 'Textos de la antigüedad clásica y su pervivencia', url: 'https://doctorado.usal.es/es/doctorado/textos-de-la-antig%C3%BCedad-cl%C3%A1sica-y-su-pervivencia' },
      { nombre: 'Tradición literaria, cultura escrita y humanidades digitales', url: 'https://doctorado.usal.es/es/doctorado/tradici%C3%B3n-literaria-cultura-escrita-y-humanidades-digitales' },
    ],
  },
  {
    rama: 'Ciencias',
    programas: [
      { nombre: 'Agrobiotecnología', url: 'https://doctorado.usal.es/es/doctorado/agrobiotecnolog%C3%ADa' },
      { nombre: 'Biología Funcional y Genómica', url: 'https://doctorado.usal.es/es/doctorado/biolog%C3%ADa-funcional-y-gen%C3%B3mica' },
      { nombre: 'Biología y conservación de la Biodiversidad', url: 'https://doctorado.usal.es/es/doctorado/biolog%C3%ADa-y-conservaci%C3%B3n-de-la-biodiversidad' },
      { nombre: 'Ciencia y Tecnología Químicas', url: 'https://doctorado.usal.es/es/doctorado/ciencia-y-tecnolog%C3%ADa-qu%C3%ADmicas' },
      { nombre: 'Enología, Viticultura y sostenibilidad', url: 'https://doctorado.usal.es/es/doctorado/enolog%C3%ADa-viticultura-y-sostenibilidad' },
      { nombre: 'Estadística Multivariante Aplicada', url: 'https://doctorado.usal.es/es/doctorado/estad%C3%ADstica-multivariante-aplicada' },
      { nombre: 'Física Aplicada y Tecnología', url: 'https://doctorado.usal.es/es/doctorado/f%C3%ADsica-aplicada-y-tecnolog%C3%ADa' },
      { nombre: 'Física Fundamental y Matemáticas', url: 'https://doctorado.usal.es/es/doctorado/f%C3%ADsica-fundamental-y-matem%C3%A1ticas' },
      { nombre: 'Geología', url: 'https://doctorado.usal.es/es/doctorado/geolog%C3%ADa' },
      { nombre: 'Microbiología y Genética Molecular', url: 'https://doctorado.usal.es/es/doctorado/microbiolog%C3%ADa-y-gen%C3%A9tica-molecular' },
    ],
  },
  {
    rama: 'Ciencias de la Salud',
    programas: [
      { nombre: 'Biología y Clínica del Cáncer', url: 'https://doctorado.usal.es/es/doctorado/biolog%C3%ADa-y-cl%C3%ADnica-del-c%C3%A1ncer' },
      { nombre: 'Biomedicina clínica y experimental. Salud, enfermedad y sociedad', url: 'https://doctorado.usal.es/es/doctorado/biomedicina-cl%C3%ADnica-y-experimental-salud-enfermedad-y-sociedad' },
      { nombre: 'Cirugía y Odontoestomatología', url: 'https://doctorado.usal.es/es/doctorado/cirug%C3%ADa-y-odontoestomatolog%C3%ADa' },
      { nombre: 'Farmacia y Salud', url: 'https://doctorado.usal.es/es/doctorado/farmacia-y-salud' },
      { nombre: 'Fisiopatología y Farmacología', url: 'https://doctorado.usal.es/es/doctorado/fisiopatolog%C3%ADa-y-farmacolog%C3%ADa' },
      { nombre: 'Neurociencias', url: 'https://doctorado.usal.es/es/doctorado/neurociencias' },
      { nombre: 'Psicología', url: 'https://doctorado.usal.es/es/doctorado/psicolog%C3%ADa' },
      { nombre: 'Salud y Desarrollo en los Trópicos', url: 'https://doctorado.usal.es/es/doctorado/salud-y-desarrollo-en-los-tr%C3%B3picos' },
      { nombre: 'Salud, discapacidad, dependencia y bienestar', url: 'https://doctorado.usal.es/es/doctorado/salud-discapacidad-dependencia-y-bienestar' },
    ],
  },
  {
    rama: 'Ciencias Sociales y Jurídicas',
    programas: [
      { nombre: 'Administración, hacienda y justicia en el Estado Social', url: 'https://doctorado.usal.es/es/doctorado/administraci%C3%B3n-hacienda-y-justicia-en-el-estado-social' },
      { nombre: 'Ciencias Sociales (incluye línea de investigación en "Traducción y mediación intercultural")', url: 'https://doctorado.usal.es/es/doctorado/ciencias-sociales-incluye-l%C3%ADnea-de-investigaci%C3%B3n-en-traducci%C3%B3n-y-mediaci%C3%B3n-intercultural' },
      { nombre: 'Derecho privado (Programa Interuniversitario Universidad de Salamanca y Universidad Pública de Navarra)', url: 'https://doctorado.usal.es/es/doctorado/derecho-privado-programa-interuniversitario-universidad-de-salamanca-y-universidad-p%C3%BAblica' },
      { nombre: 'Economía', url: 'https://doctorado.usal.es/es/doctorado/econom%C3%ADa' },
      { nombre: 'Economía de la Empresa', url: 'https://doctorado.usal.es/es/doctorado/econom%C3%ADa-de-la-empresa' },
      { nombre: 'Educación', url: 'https://doctorado.usal.es/es/doctorado/educaci%C3%B3n' },
      { nombre: 'Estado de Derecho y Gobernanza Global', url: 'https://doctorado.usal.es/es/doctorado/estado-de-derecho-y-gobernanza-global' },
      { nombre: 'Estudios interdisciplinares de Género y políticas de igualdad', url: 'https://doctorado.usal.es/es/doctorado/estudios-interdisciplinares-de-g%C3%A9nero-y-pol%C3%ADticas-de-igualdad' },
      { nombre: 'Formación en la Sociedad del Conocimiento', url: 'https://doctorado.usal.es/es/doctorado/formaci%C3%B3n-en-la-sociedad-del-conocimiento' },
      { nombre: 'Lectura y Comprensión', url: 'https://doctorado.usal.es/es/doctorado/lectura-y-comprensi%C3%B3n' },
    ],
  },
  {
    rama: 'Ingeniería y Arquitectura',
    programas: [
      { nombre: 'Energía y propulsión marina', url: 'https://doctorado.usal.es/es/doctorado/energ%C3%ADa-y-propulsi%C3%B3n-marina' },
      { nombre: 'Geotecnologías Aplicadas a la Construcción, Energía e Industria', url: 'https://doctorado.usal.es/es/doctorado/geotecnolog%C3%ADas-aplicadas-la-construcci%C3%B3n-energ%C3%ADa-e-industria' },
      { nombre: 'Ingeniería de Sistemas Hídricos', url: 'https://doctorado.usal.es/es/doctorado/ingenier%C3%ADa-de-sistemas-h%C3%ADdricos' },
      { nombre: 'Ingeniería informática', url: 'https://doctorado.usal.es/es/doctorado/ingenier%C3%ADa-inform%C3%A1tica' },
    ],
  },
  {
    rama: 'Programas Multidisciplinares',
    programas: [
      { nombre: 'Inteligencia Artificial Aplicada', url: 'https://doctorado.usal.es/es/doctorado/inteligencia-artificial-aplicada' },
    ],
  },
]

export interface Paso {
  titulo: string
  texto: string
  enlace?: { texto: string; url: string }
}

/** Cómo se entra en un programa de doctorado (curso 2026/27). */
export const PASOS_ACCESO: Paso[] = [
  {
    titulo: 'Comprueba que cumples un requisito de acceso',
    texto:
      'La vía habitual: títulos oficiales españoles de Grado y de Máster Universitario que sumen al menos 300 créditos ECTS. Hay otras vías (títulos extranjeros, otro doctorado, títulos anteriores al EEES, formación sanitaria especializada).',
    enlace: { texto: 'Requisitos de acceso', url: 'https://doctorado.usal.es/es/requisitos-acceso' },
  },
  {
    titulo: 'Busca quien dirija o tutele tu tesis',
    texto:
      'La preinscripción pide el compromiso de un investigador o investigadora del programa de ejercer de tutor, director o codirector de tesis. Vale un correo electrónico o el impreso de aceptación.',
  },
  {
    titulo: 'Haz la preinscripción',
    texto:
      'En la aplicación de preinscripción de la USAL, aunque todavía no cumplas los requisitos (por ejemplo, si estás terminando el máster). Se adjuntan: DNI o pasaporte, títulos de Máster y de Grado con sus certificados de notas, currículum, el compromiso del investigador y lo que pida cada programa. Se puede volver a entrar para añadir documentos.',
    enlace: { texto: 'Aplicación de preinscripción', url: 'https://www.usal.es/acceso-autopreinscripcion-doctorado' },
  },
  {
    titulo: 'Espera el listado de admitidos',
    texto:
      'La Comisión Académica de cada programa aplica sus requisitos y criterios de admisión y publica los listados en la ficha del programa. Puede exigir complementos de formación.',
  },
  {
    titulo: 'Formaliza la matrícula',
    texto:
      'Preferentemente por correo postal (Administración de las Escuelas de Doctorado, Patio de Escuelas Menores, 37008 Salamanca) o en persona con cita previa. Con el impreso de matrícula, el DNI o pasaporte y las copias de los títulos.',
    enlace: { texto: 'Preinscripción y matrícula', url: 'https://doctorado.usal.es/es/preinscripcion-matricula' },
  },
]

export interface Plazo {
  que: string
  cuando: string
}

/** Plazos oficiales del curso 2026/27 (todos ya pasados el 25/11/2026). */
export const PLAZOS_2026_27: Plazo[] = [
  { que: 'Preinscripción', cuando: 'Del 1 de marzo al 7 de septiembre de 2026' },
  { que: 'Acceso con título de fuera del EEES', cuando: 'Del 1 de marzo al 7 de septiembre de 2026' },
  { que: 'Primer listado de admitidos', cuando: 'A partir del 15 de junio de 2026' },
  { que: 'Segundo listado de admitidos', cuando: 'A partir del 18 de septiembre de 2026' },
  { que: 'Matrícula de nuevo ingreso (julio)', cuando: 'Del 3 al 17 de julio de 2026, de 9:00 a 13:30' },
  { que: 'Matrícula de nuevo ingreso (septiembre)', cuando: 'Del 21 de septiembre al 9 de octubre de 2026, de 9:00 a 13:30' },
  { que: 'Anulación de matrícula (sin devolución de tasas)', cuando: 'Hasta el 30 de diciembre de 2026' },
]

/** Lo que interesa a quien termina el máster en 2027. */
export const PLAZOS_2027_28 =
  '[PENDIENTE: plazos de preinscripción y matrícula del curso 2027/28, sin publicar el 25/11/2026. Según las preguntas frecuentes de la Escuela, el plazo de preinscripción «suele abrirse en marzo-mayo»]'

export const TASAS = {
  norma:
    'Decreto 8/2024, de 30 de mayo, de precios públicos del curso 2024-25, prorrogado para el curso 2026-27',
  url: 'https://doctorado.usal.es/es/precios-publicos',
  importes:
    '[PENDIENTE: importes de la matrícula de doctorado 2026-27. El resumen oficial está en posgrado.usal.es, que no se ha podido abrir desde aquí]',
}

export interface Grupo {
  nombre: string
  url: string
}

/** Portal oficial de los grupos de investigación de la USAL. */
export const URL_GRUPOS = 'https://produccioncientifica.usal.es/grupos'

/** Grupos de las áreas cercanas al TFM: vacío hasta poder leer el portal oficial. */
export const GRUPOS_CERCANOS: Grupo[] = []

export const GRUPOS_PENDIENTE =
  '[PENDIENTE: grupos de investigación de las áreas cercanas al TFM. El portal produccioncientifica.usal.es no respondió el 25/11/2026 (error 503)]'

export interface Ayuda {
  id: string
  nombre: string
  organismo: string
  cuantia: string
  duracion: string
  requisitos: string
  plazos: string
  ventajas: string[]
  desventajas: string[]
  url: string | null
}

/**
 * Comparativa de ayudas predoctorales. Las ventajas y desventajas se deducen
 * de las bases de cada convocatoria (se cita el artículo cuando se puede).
 */
export const AYUDAS: Ayuda[] = [
  {
    id: 'fpu',
    nombre: 'FPU 2026 (Formación de Profesorado Universitario)',
    organismo: 'Agencia Estatal de Investigación',
    cuantia:
      '32.500 € al año para el contrato (salario bruto mínimo de 25.457 € al año), 3.350 € para la indemnización final y 10.000 € para estancias y matrícula del doctorado.',
    duracion: 'Hasta 4 años, incluido un periodo de orientación postdoctoral de hasta 12 meses si se lee la tesis antes.',
    requisitos:
      'Estar matriculado o admitido en un doctorado para 2026/27, o estarlo al firmar el contrato. No haber tenido una FPU, no ser doctor/a ni haber tenido más de 12 meses de contrato predoctoral. En la USAL, además: preadmisión o matrícula en un programa de la USAL y director/a con vínculo con la USAL e incluido en ese programa.',
    plazos:
      'Convocatoria 2026 cerrada. Personas participantes: del 20/10/2026 al 12/11/2026 a las 14:00. Plazo interno de la USAL: hasta el 5/11/2026.',
    ventajas: [
      'Es la de mayor cuantía de las comparadas: 32.500 € al año y 10.000 € para estancias y matrícula (art. 8).',
      'No está ligada a un proyecto concreto: la solicitud incluye a la persona, su área temática y quien dirige la tesis.',
      'Permite dar hasta 180 horas de clase (60 al año), útil para la carrera universitaria, que es su finalidad (art. 1).',
    ],
    desventajas: [
      'La trayectoria académica pesa 75 de 100 puntos y hay que llegar a un umbral de 60 (50 en el turno de discapacidad) (anexo I).',
      'Esa nota es la de los estudios de grado: el máster no cuenta para la nota media (anexo III).',
      'Hay que tener director/a y preadmisión en el programa antes del plazo interno de la USAL (5 de noviembre en 2026).',
    ],
    url: 'https://www.aei.gob.es/convocatorias/buscador-convocatorias/ayudas-formacion-profesorado-universitario-fpu-2026',
  },
  {
    id: 'fpi',
    nombre: 'FPI 2026 de la USAL (contratos ligados a proyectos PID 2025)',
    organismo: 'Universidad de Salamanca (Agencia de Gestión de la Investigación)',
    cuantia: '31.100 € al año para el contrato, 3.215 € para la indemnización final y 7.000 € para estancias y matrícula. 15 contratos.',
    duracion: 'Hasta 4 años, incluida la orientación postdoctoral de hasta 12 meses.',
    requisitos:
      'Título que dé acceso al doctorado. Estar matriculado a tiempo completo o admitido en un doctorado de la USAL para 2026/27, o tener un escrito de preadmisión firmado por el coordinador del programa. No ser doctor/a.',
    plazos: 'Convocatoria 2026 cerrada: del 26/10/2026 al 15/11/2026, ampliado hasta el 17/11/2026.',
    ventajas: [
      'El tema, el grupo y la financiación del proyecto ya existen: la tesis va asociada a uno de los proyectos del anexo II (art. 5).',
      'Además de la nota media (hasta 35 puntos), se valoran publicaciones, congresos y movilidad (anexo de criterios).',
      'Permite dar hasta 180 horas de clase (60 al año) (art. 4.5).',
    ],
    desventajas: [
      'Solo se puede pedir para los 15 proyectos de la lista: el tema lo marca el proyecto, no el doctorando/a (art. 1.2).',
      'Cuantía algo menor que la FPU (31.100 € frente a 32.500 € al año; 7.000 € frente a 10.000 € para estancias).',
      'La incorporación depende de la resolución de los proyectos PID 2025 (hasta 9 meses después) (art. 5.2).',
    ],
    url: 'https://convocatoriasinvestigacion.usal.es/contratos-predoctorales-fpi-2026/',
  },
  {
    id: 'usal',
    nombre: 'Contratos predoctorales propios de la USAL',
    organismo: 'Universidad de Salamanca',
    cuantia: '[PENDIENTE: no se ha encontrado la convocatoria de 2026]',
    duracion: '[PENDIENTE]',
    requisitos: '[PENDIENTE]',
    plazos: '[PENDIENTE: no se ha encontrado convocatoria de 2026 ni de 2027 (consulta del 25/11/2026)]',
    ventajas: [],
    desventajas: [],
    url: 'https://convocatoriasinvestigacion.usal.es/',
  },
  {
    id: 'santander',
    nombre: 'Becas Santander: ayuda económica para personal investigador predoctoral 2026 (curso 2026/27)',
    organismo: 'Banco Santander y Escuela de Doctorado de la USAL',
    cuantia: '[PENDIENTE: la convocatoria está en posgrado.usal.es, que no se ha podido abrir desde aquí]',
    duracion: '[PENDIENTE]',
    requisitos:
      'Estar matriculado de nuevo ingreso en 2026/27 en un doctorado de la USAL, haber cursado y terminado un Máster Universitario Oficial en la USAL y residir en España.',
    plazos: 'Convocatoria 2026 cerrada: del 7 de mayo al 1 de octubre de 2026. Resolución publicada el 18 de noviembre de 2026.',
    ventajas: [
      'Está pensada justo para quien termina un máster oficial en la USAL y empieza el doctorado allí (requisitos de la convocatoria).',
      'Se pide ya dentro del programa: el requisito es estar matriculado, y en 2026 el plazo llegó hasta el 1 de octubre, después de la matrícula de julio.',
    ],
    desventajas: [
      'Solo para quien cursó el máster en la USAL y reside en España.',
      'Sin la convocatoria completa no se puede saber la cuantía ni si es compatible con un contrato predoctoral.',
    ],
    url: 'https://doctorado.usal.es/es/convocatorias',
  },
  {
    id: 'jcyl',
    nombre: 'Contratos predoctorales de la Junta de Castilla y León',
    organismo: 'Consejería de Educación de la Junta de Castilla y León',
    cuantia: '[PENDIENTE: no se ha encontrado la convocatoria de 2026]',
    duracion: '[PENDIENTE: en la última edición que muestra el portal de la Junta (convocada en 2019), hasta 4 años]',
    requisitos: '[PENDIENTE]',
    plazos: '[PENDIENTE: el portal de la Junta solo muestra la convocatoria de 2019 (Orden de 12 de diciembre de 2019, 90 contratos)]',
    ventajas: [],
    desventajas: [],
    url: 'https://www.educa.jcyl.es/universidad/es/fondos-europeos/fondo-social-europeo-2021-2027-fse/ayudas-financiar-contratacion-predoctoral-personal-investig',
  },
  {
    id: 'inphinit-incoming',
    nombre: 'INPhINIT «la Caixa», modalidad Incoming',
    organismo: 'Fundación «la Caixa»',
    cuantia: '[PENDIENTE: fundacionlacaixa.org y lacaixafoundation.org no se han podido abrir desde aquí]',
    duracion: '[PENDIENTE]',
    requisitos: '[PENDIENTE]',
    plazos: '[PENDIENTE]',
    ventajas: [],
    desventajas: [],
    url: null,
  },
  {
    id: 'inphinit-retaining',
    nombre: 'INPhINIT «la Caixa», modalidad Retaining',
    organismo: 'Fundación «la Caixa»',
    cuantia: '[PENDIENTE: fundacionlacaixa.org y lacaixafoundation.org no se han podido abrir desde aquí]',
    duracion: '[PENDIENTE]',
    requisitos: '[PENDIENTE]',
    plazos: '[PENDIENTE]',
    ventajas: [],
    desventajas: [],
    url: null,
  },
]

export interface Contacto {
  que: string
  telefono: string
  correo: string
}

/** Contacto de la Escuela de Doctorado "Studii Salamantini". */
export const CONTACTO_ESCUELA = {
  nombre: 'Escuela de Doctorado «Studii Salamantini»',
  web: 'https://doctorado.usal.es/es',
  direccion: 'Patio de Escuelas Menores, 37008 Salamanca',
  lineas: [
    { que: 'Doctorado', telefono: '+34 923 29 44 00, ext. 5485', correo: 'n.doctor@usal.es' },
    { que: 'Tesis', telefono: '+34 923 29 44 00, ext. 1182', correo: 'tesis@usal.es' },
    { que: 'Unidad Económica', telefono: '+34 923 29 44 00, ext. 1248', correo: 'economia.doctorado@usal.es' },
  ] as Contacto[],
  horario:
    '[PENDIENTE: horario de atención al público. La web de la Escuela no lo publica; solo indica que la matrícula se atiende de 9:00 a 13:30 en sus plazos y que, en persona, es con cita previa]',
  agi: {
    que: 'Dudas sobre la FPU y la FPI en la USAL (Agencia de Gestión de la Investigación)',
    telefono: '923 294 777 y 923 294 500, ext. 1267',
    correo: 'agipersonal@usal.es',
  },
}
