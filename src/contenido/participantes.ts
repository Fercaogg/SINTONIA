// Kit para participantes del piloto: hoja informativa, consentimiento y
// preguntas frecuentes. Solo datos ya publicados en la web y facilitados por
// Fernando; lo que es del Comité de Ética (riesgos y beneficios, texto legal
// del consentimiento, base jurídica) no se redacta aquí: sale el texto digno.
//
// MARCA INTERNA: todo el kit está pendiente de revisión por el Comité de Ética
// de la Universidad de Salamanca (PENDIENTES.md, "Kit para participantes").
export const KIT_PENDIENTE_COMITE = true

export const KIT_VERSION = 'Borrador 1, 15 de noviembre de 2026'

export const DOCUMENTOS = [
  {
    clave: 'hoja-informativa',
    titulo: 'Hoja informativa',
    descripcion: 'Qué es el estudio, qué se te pide, qué pasa con tus datos y cómo dejarlo.',
  },
  {
    clave: 'consentimiento',
    titulo: 'Consentimiento informado',
    descripcion: 'El documento que se acepta para participar. Su texto lo revisa el Comité de Ética.',
  },
  {
    clave: 'preguntas',
    titulo: 'Preguntas frecuentes',
    descripcion: 'Las dudas más habituales, con respuestas cortas.',
  },
] as const

export type ClaveDocumento = (typeof DOCUMENTOS)[number]['clave']

/** Hoja informativa: cada apartado, con sus párrafos. null = del Comité de Ética. */
export const HOJA_INFORMATIVA: { titulo: string; parrafos: string[] | null }[] = [
  {
    titulo: 'Quién hace el estudio',
    parrafos: [
      'Fernando Martín Vaquero, en su Trabajo Fin de Máster (Máster en Estudios de la Ciencia, la Tecnología y la Innovación, Universidad de Salamanca), dirigido por el Dr. Luis Eduardo Andrade Silva y la Dra. Ana María Pinto Llorente.',
    ],
  },
  {
    titulo: 'Qué es SINTONÍA',
    parrafos: [
      'Un registro semanal muy breve de estudiante y tutor/a para que las tutorías empiecen por lo que importa. Cada uno responde por separado unas pocas preguntas sobre cómo avanza el trabajo. Si las dos miradas no coinciden, ambos pueden recibir las mismas tres preguntas neutras para hablarlo en la tutoría.',
    ],
  },
  {
    titulo: 'Qué se te pide',
    parrafos: [
      'Si eres estudiante: cuatro preguntas de 1 a 5 a la semana (avance, siguiente paso, apoyo percibido y bienestar), unos 60 segundos.',
      'Si eres tutor/a: una o dos preguntas por estudiante a la semana, unos 30 segundos para todos.',
      'Durante el piloto, de febrero a abril de 2027: un cuestionario al principio y otro al final. Entre 8 y 10 personas podrán hacer además una entrevista, si quieren.',
      'Cada semana, un sorteo con probabilidad 0,5 decide qué parejas reciben las tres preguntas de la agenda. Es parte del estudio: así se puede saber si las preguntas ayudan.',
    ],
  },
  {
    titulo: 'Lo que SINTONÍA no hace',
    parrafos: ['No pide subir el trabajo ni lo lee. No pone notas, no hace rankings y no deduce emociones.'],
  },
  {
    titulo: 'Quién ve qué',
    parrafos: [
      'Tu tutor/a no ve tus respuestas ni tu bienestar. Tu respuesta sobre el bienestar solo la ves tú.',
      'La dirección del máster solo ve cifras calculadas sobre 5 personas o más, nunca respuestas de una persona.',
    ],
  },
  {
    titulo: 'Tus datos',
    parrafos: [
      'Se guardan en servidores de la Unión Europea (Fráncfort, Alemania). La respuesta sobre el bienestar se guarda cifrada.',
      'Puedes descargar tus datos, retirarte del estudio y borrar tu cuenta cuando quieras, desde Mi cuenta, sin dar explicaciones.',
    ],
  },
  {
    titulo: 'Si no estás bien',
    parrafos: [
      'El servicio de atención psicológica de la Universidad de Salamanca es gratuito para la comunidad universitaria: psicologia@usal.es o 923 294 500, extensión 3292. Si es una urgencia, llama al 112.',
    ],
  },
  { titulo: 'Riesgos y beneficios', parrafos: null },
  { titulo: 'Base jurídica y conservación de los datos', parrafos: null },
  { titulo: 'Contacto', parrafos: ['Para cualquier duda: ferca@usal.es.'] },
]
