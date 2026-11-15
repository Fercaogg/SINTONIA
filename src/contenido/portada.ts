// Textos de las páginas públicas (portada y /investigacion).
//
// Reglas (encargo de Fernando, 13/11/2026):
//   - Nada inventado: solo datos del producto y del proyecto que Fernando ha
//     dado. Lo que falta usa EN_ELABORACION y está en PENDIENTES.md.
//   - Las únicas referencias permitidas son las de REFERENCIAS (APA 7).
//   - Sin rayas largas.

export const DATOS_CLAVE = [
  { cifra: '60', unidad: 's', texto: 'a la semana para el estudiante' },
  { cifra: '30', unidad: 's', texto: 'a la semana para el tutor/a, con todos sus estudiantes' },
  { cifra: '3', unidad: 'preguntas', texto: 'neutras para la tutoría, cuando hay sorteo' },
  { cifra: '5', unidad: 'personas', texto: 'como mínimo para que la dirección vea una cifra' },
] as const

// Los tres pasos de la portada actual, conservados y ampliados con un detalle.
export const PASOS = [
  {
    titulo: 'Un minuto a la semana',
    texto: 'Estudiante y tutor/a responden por separado unas pocas preguntas sobre cómo avanza el trabajo.',
    detalle: 'El estudiante, cuatro preguntas de 1 a 5 (una de ellas, sobre su bienestar, solo la ve él o ella). El tutor/a, una o dos por estudiante.',
    icono: 'checkin',
  },
  {
    titulo: 'Dos miradas',
    texto: 'SINTONÍA compara las respuestas con reglas sencillas y públicas. No hay notas ni rankings.',
    detalle: 'Hay desajuste si la diferencia es de 2 puntos o más, o de 1 punto en el mismo sentido durante 2 semanas seguidas. Nadie tiene razón: son dos miradas.',
    icono: 'compare',
  },
  {
    titulo: 'Tres preguntas para la tutoría',
    texto: 'Si las miradas no coinciden, ambos reciben las mismas tres preguntas neutras para hablarlo.',
    detalle: 'Cada semana, un sorteo (con probabilidad 0,5) decide qué parejas las reciben. Es parte del estudio: así se puede saber si las preguntas ayudan.',
    icono: 'chat',
  },
] as const

export interface Perfil {
  clave: 'estudiante' | 'tutor' | 'direccion'
  nombre: string
  tiempo: string
  hace: string[]
  ve: string[]
  noVe: string[]
}

export const PERFILES: Perfil[] = [
  {
    clave: 'estudiante',
    nombre: 'Estudiante',
    tiempo: 'Unos 60 segundos a la semana',
    hace: [
      'Responde cuatro preguntas de 1 a 5: avance, siguiente paso, apoyo percibido y bienestar.',
      'Si quiere, activa Puente al doctorado y anota fechas en su calendario.',
      'Si lo necesita, pulsa "Necesito apoyo" para avisar a la dirección del máster.',
    ],
    ve: ['Sus propias respuestas y su histórico.', 'La agenda de la tutoría, cuando hay sorteo.'],
    noVe: ['Las respuestas de su tutor/a.', 'Datos de otros estudiantes.'],
  },
  {
    clave: 'tutor',
    nombre: 'Tutor/a',
    tiempo: 'Unos 30 segundos a la semana, para todos sus estudiantes',
    hace: [
      'Responde, por cada estudiante, cómo ve el avance y, si quiere, el siguiente paso.',
      'Recibe la misma agenda que su estudiante cuando hay sorteo.',
    ],
    ve: ['Sus propias respuestas.', 'El nombre de sus estudiantes y la agenda de cada pareja.'],
    noVe: ['Las respuestas de sus estudiantes.', 'El bienestar de nadie.', 'Datos de otros tutores.'],
  },
  {
    clave: 'direccion',
    nombre: 'Dirección del máster',
    tiempo: 'Cuando quiera consultarlo',
    hace: [
      'Consulta cifras del máster, como la tasa de respuesta.',
      'Recibe los avisos de "Necesito apoyo", con el nombre solo si el estudiante lo autoriza.',
    ],
    ve: ['Datos agregados, calculados sobre 5 personas o más.'],
    noVe: ['Ninguna respuesta individual.', 'El bienestar de nadie.', 'Ninguna cifra calculada sobre menos de 5 personas.'],
  },
]

export const PARA_QUIEN = [
  { titulo: 'Másteres', texto: 'Para acompañar el Trabajo Fin de Máster. Es donde se hará el piloto.' },
  { titulo: 'Programas de doctorado', texto: 'Para la relación entre doctorando/a y director/a de tesis. La interfaz adapta los términos.' },
  { titulo: 'Grados con TFG', texto: 'Para el Trabajo Fin de Grado, con la misma lógica de dos miradas.' },
  { titulo: 'Escuelas de doctorado', texto: 'Para conectar a quien termina un máster con la información sobre el doctorado.' },
] as const

export const PREGUNTAS = [
  {
    pregunta: '¿Tengo que subir mi trabajo?',
    respuesta: 'No. SINTONÍA no recibe, no lee ni guarda ningún contenido de tu trabajo: solo respuestas de 1 a 5.',
  },
  {
    pregunta: '¿Lo ve mi tutor/a todo?',
    respuesta: 'No. Tu tutor/a no ve tus respuestas, ni tu bienestar. Solo ve sus propias respuestas y, cuando hay sorteo, la misma agenda que tú.',
  },
  {
    pregunta: '¿Cuenta para la nota?',
    respuesta: 'SINTONÍA no pone notas ni envía nada a la evaluación, y tu tutor/a no tiene tus respuestas. El compromiso por escrito irá en el consentimiento informado.',
    pendiente: true,
  },
  {
    pregunta: '¿Qué hace el programa de redacción?',
    respuesta: 'Si se activa, redacta las tres preguntas de la agenda. Solo recibe qué pregunta no coincide, en qué sentido y por cuánto: nunca nombres, correos ni ningún otro dato personal. No lee trabajos, no califica y no deduce emociones (artículo 5.1.f del Reglamento (UE) 2024/1689). Si no está disponible, se usan preguntas escritas de antemano.',
  },
  {
    pregunta: '¿Puedo dejarlo?',
    respuesta: 'Sí, cuando quieras y sin dar explicaciones. Desde Mi cuenta puedes retirarte del estudio, descargar tus datos y borrar tu cuenta.',
  },
  {
    pregunta: '¿Dónde están mis datos?',
    respuesta: 'En servidores de la Unión Europea (Fráncfort, Alemania). El bienestar se guarda cifrado.',
  },
  {
    pregunta: '¿Cuánto tiempo me lleva?',
    respuesta: 'Unos 60 segundos a la semana si eres estudiante, y unos 30 segundos para todos tus estudiantes si eres tutor/a.',
  },
] as const

// Apartado "Dirección": datos facilitados por Fernando (Portal de Producción
// Científica de la Universidad de Salamanca), tal cual. Orden alfabético por
// apellido. Las dos tarjetas tienen exactamente la misma estructura.
export interface MiembroDireccion {
  nombre: string
  iniciales: string
  categoria: string
  departamento: string
  area: string
  instituto: string | null
  grupos: string[]
  tesis: { titulo: string; universidad: string; anio: string }
  perfil: string
  orcid: string
}

export const DIRECCION: MiembroDireccion[] = [
  {
    nombre: 'Dr. Luis Eduardo Andrade Silva',
    iniciales: 'LA',
    categoria: 'Profesor Ayudante Doctor',
    departamento: 'Teoría e Historia de la Educación',
    area: 'Teoría e Historia de la Educación',
    instituto: null,
    grupos: [
      'Cultura Académica, Patrimonio y Memoria Social (CaUSAL)',
      'GTC Pedagógico en Procesos y Prácticas Socioeducativas (PePPS)',
      'Procesos, Espacios y Prácticas Educativas',
    ],
    tesis: {
      titulo: 'Comunidades virtuales y videojugadores. Análisis y perspectivas desde la antropología digital',
      universidad: 'Universidad de Salamanca',
      anio: '2024',
    },
    perfil: 'https://produccioncientifica.usal.es/investigadores/148334/detalle',
    orcid: 'https://orcid.org/0000-0001-8553-9002',
  },
  {
    nombre: 'Dra. Ana María Pinto Llorente',
    iniciales: 'AP',
    categoria: 'Profesora Titular de Universidad',
    departamento: 'Didáctica, Organización y Métodos de Investigación',
    area: 'Didáctica y Organización Escolar',
    instituto: 'Instituto Universitario de Ciencias de la Educación',
    grupos: [
      'GRIAL, Grupo de Investigación en Interacción y eLearning',
      'GTC Human-Computer Interaction, Artificial Intelligence and Gender Perspective (GRIALhci)',
    ],
    tesis: {
      titulo: 'Análisis de un modelo hipermedia modular para la enseñanza del inglés en modalidad semipresencial',
      universidad: 'Universidad de Salamanca',
      anio: '2012',
    },
    perfil: 'https://produccioncientifica.usal.es/investigadores/57371/detalle',
    orcid: 'https://orcid.org/0000-0002-8538-9902',
  },
]

export const AUTOR =
  'Autor: Fernando Martín Vaquero, Máster en Estudios de la Ciencia, la Tecnología y la Innovación, Universidad de Salamanca.'
export const ANTECEDENTE = 'WORKWELL360, Trabajo Fin de Grado en Pedagogía, con pilotaje en YMCA Salamanca.'

// Las únicas referencias permitidas en la web (APA 7), facilitadas por Fernando.
export interface Referencia {
  clave: string
  cita: string
  texto: string
  enlace: string | null
}

export const REFERENCIAS: Referencia[] = [
  {
    clave: 'colomo2025',
    cita: 'Colomo Magaña et al., 2025',
    texto: 'Colomo Magaña, E., Cívico Ariza, A., Franco Caballero, P. D. y Colomo Magaña, A. (2025). Percepciones de alumnado y profesorado sobre la tutorización online del TFM: El caso de la Universidad Internacional de Andalucía. Hachetetepé. Revista científica de Educación y Comunicación, (31), 1-16.',
    enlace: 'https://doi.org/10.25267/Hachetetepe.2025.i31.2202',
  },
  {
    clave: 'dekleijn2012',
    cita: 'de Kleijn et al., 2012',
    texto: "de Kleijn, R. A. M., Mainhard, T., Meijer, P. C., Pilot, A. y Brekelmans, M. (2012). Master's thesis supervision: Relations between perceptions of the supervisor–student relationship, final grade, perceived supervisor contribution to learning and student satisfaction. Studies in Higher Education, 37(8), 925-939.",
    enlace: 'https://doi.org/10.1080/03075079.2011.556717',
  },
  {
    clave: 'grohnert2023',
    cita: 'Grohnert et al., 2023',
    texto: "Grohnert, T., Gromotka, L., Gast, I., Delnoij, L. y Beausaert, S. (2023). Effective master's thesis supervision: A summative framework for research and practice. Educational Research Review, Artículo 100589.",
    enlace: 'https://doi.org/10.1016/j.edurev.2023.100589',
  },
  {
    clave: 'winner1980',
    cita: 'Winner, 1980',
    texto: 'Winner, L. (1980). Do artifacts have politics? Daedalus, 109(1), 121-136.',
    enlace: null,
  },
  {
    clave: 'slade2013',
    cita: 'Slade y Prinsloo, 2013',
    texto: 'Slade, S. y Prinsloo, P. (2013). Learning analytics: Ethical issues and dilemmas. American Behavioral Scientist, 57(10), 1509-1528.',
    enlace: 'https://doi.org/10.1177/0002764213479366',
  },
  {
    clave: 'qian2022',
    cita: 'Qian et al., 2022',
    texto: 'Qian, T., Walton, A. E., Collins, L. M., Klasnja, P., Lanza, S. T., Nahum-Shani, I., Rabbi, M., Russell, M. A., Walton, M. A., Yoo, H. y Murphy, S. A. (2022). The microrandomized trial for developing digital interventions: Experimental design and data analysis considerations. Psychological Methods, 27(5), 874-894.',
    enlace: 'https://doi.org/10.1037/met0000283',
  },
  {
    clave: 'helsinki',
    cita: 'University of Helsinki, s.f.',
    texto: 'University of Helsinki. (s.f.). Supervision plan and Thessa.',
    enlace: 'https://teaching.helsinki.fi/en/node/1664',
  },
]
