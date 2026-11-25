// Apartado «Respaldo» de la portada: lo ya hecho, los avales y el equipo.
// Mismo contenido que la portada de LUMBRA360 (src/app/page.tsx, AVALES,
// HITOS y EQUIPO), por indicación de Fernando (25/11/2026). Los textos van en
// español e inglés; nombres propios e instituciones no se traducen.

export interface Texto {
  es: string
  en: string
}

export interface Aval {
  tipo: Texto
  nombre: string
  logo: { src: string; ancho: number; alto: number }
}

export const AVALES: Aval[] = [
  { tipo: { es: 'Aval', en: 'Endorsement' }, nombre: 'Universidad de Salamanca', logo: { src: '/marca/terceros/usal.svg', ancho: 2552, alto: 693 } },
  {
    tipo: { es: 'Aval', en: 'Endorsement' },
    nombre: 'Fundación General de la Universidad de Salamanca',
    logo: { src: '/marca/terceros/fundacion-general-usal.webp', ancho: 198, alto: 283 },
  },
  { tipo: { es: 'Programa', en: 'Programme' }, nombre: 'Prototipos 2026/2027', logo: { src: '/marca/terceros/prototipos-tcue.webp', ancho: 427, alto: 239 } },
  {
    tipo: { es: 'Estrategia regional', en: 'Regional strategy' },
    nombre: 'RIS3 de Castilla y León',
    logo: { src: '/marca/terceros/ris3-cyl.svg', ancho: 3747, alto: 748 },
  },
]

export interface Hito {
  etiqueta: Texto
  titulo: string
  texto: Texto
  logo: 'workwell' | 'ymca' | 'simbolo'
  destacado?: boolean
}

export const HITOS: Hito[] = [
  {
    etiqueta: { es: 'Prototipo', en: 'Prototype' },
    titulo: 'WORKWELL360',
    texto: {
      es: 'Nació como TFG y fue premiado por la Junta de Castilla y León y la USAL.',
      en: 'Born as a final degree project and awarded by the Junta de Castilla y León and USAL.',
    },
    logo: 'workwell',
  },
  {
    etiqueta: { es: 'Pilotaje', en: 'Pilot' },
    titulo: 'YMCA Salamanca',
    texto: {
      es: 'Pilotado dentro del programa TCUE, con resultados satisfactorios.',
      en: 'Piloted within the TCUE programme, with satisfactory results.',
    },
    logo: 'ymca',
  },
  {
    etiqueta: { es: 'Evolución', en: 'Evolution' },
    titulo: 'SINTONÍA',
    texto: {
      es: 'Lo aprendido, llevado a la tutoría del trabajo académico.',
      en: 'What we learned, applied to supervising academic work.',
    },
    logo: 'simbolo',
    destacado: true,
  },
]

export interface Miembro {
  nombre: string
  foto: string
  /** Papel en SINTONÍA (Trabajo Fin de Máster). */
  papel: Texto
  cargo: Texto
  detalle: Texto[]
  enlaces: { texto: Texto; href: string }[]
}

const USAL: Texto = { es: 'Universidad de Salamanca', en: 'Universidad de Salamanca' }
const PERFIL: Texto = { es: 'Perfil de investigación', en: 'Research profile' }

export const EQUIPO: Miembro[] = [
  {
    nombre: 'Fernando Martín Vaquero',
    foto: '/equipo/fernando-martin-vaquero.webp',
    papel: { es: 'Autor', en: 'Author' },
    cargo: { es: 'Pedagogo y gestor de proyectos', en: 'Educationalist and project manager' },
    detalle: [
      {
        es: 'Graduado en Pedagogía (Formación y Gestión de Calidad) por la Universidad de Salamanca',
        en: 'Degree in Education (Pedagogía, Training and Quality Management), Universidad de Salamanca',
      },
      {
        es: 'Cursa el Máster en Estudios de la Ciencia, la Tecnología y la Innovación (MECTI)',
        en: "Studying the Master's in Science, Technology and Innovation Studies (MECTI)",
      },
      { es: 'Técnico Gestor de Proyectos Académicos en DIDOSEG', en: 'Academic Project Manager at DIDOSEG' },
      {
        es: 'Creador de WORKWELL360, premio a la excelencia de la Junta de Castilla y León y la USAL',
        en: 'Creator of WORKWELL360, excellence award from the Junta de Castilla y León and USAL',
      },
    ],
    enlaces: [{ texto: { es: 'LinkedIn', en: 'LinkedIn' }, href: 'https://www.linkedin.com/in/fermartvaq/' }],
  },
  {
    nombre: 'Ana María Pinto Llorente',
    foto: '/equipo/ana-maria-pinto-llorente.webp',
    papel: { es: 'Directora del TFM', en: 'Thesis supervisor' },
    cargo: { es: 'Profesora Titular de Universidad', en: 'Associate Professor (Profesora Titular)' },
    detalle: [
      {
        es: 'Departamento de Didáctica, Organización y Métodos de Investigación',
        en: 'Department of Didactics, Organisation and Research Methods',
      },
      { es: 'Instituto Universitario de Ciencias de la Educación', en: 'University Institute of Educational Sciences' },
      { es: 'Grupo GRIAL, de Investigación en Interacción y eLearning', en: 'GRIAL Research Group in Interaction and eLearning' },
      USAL,
    ],
    enlaces: [
      { texto: PERFIL, href: 'https://produccioncientifica.usal.es/investigadores/57371/detalle' },
      { texto: { es: 'ORCID', en: 'ORCID' }, href: 'https://orcid.org/0000-0002-8538-9902' },
    ],
  },
  {
    nombre: 'Luis Eduardo Andrade Silva',
    foto: '/equipo/luis-eduardo-andrade-silva-v2.webp',
    papel: { es: 'Director del TFM', en: 'Thesis supervisor' },
    cargo: { es: 'Profesor Ayudante Doctor', en: 'Assistant Professor (Profesor Ayudante Doctor)' },
    detalle: [
      { es: 'Departamento de Teoría e Historia de la Educación', en: 'Department of Theory and History of Education' },
      { es: 'Grupo CaUSAL, Cultura Académica, Patrimonio y Memoria Social', en: 'CaUSAL Group, Academic Culture, Heritage and Social Memory' },
      { es: 'Grupo Procesos, Espacios y Prácticas Educativas', en: 'Educational Processes, Spaces and Practices Group' },
      USAL,
    ],
    enlaces: [
      { texto: PERFIL, href: 'https://produccioncientifica.usal.es/investigadores/148334/detalle' },
      { texto: { es: 'Web personal', en: 'Personal website' }, href: 'https://gipep.usal.es/luis-eduardo-andrade-silva/' },
      { texto: { es: 'ORCID', en: 'ORCID' }, href: 'https://orcid.org/0000-0001-8553-9002' },
    ],
  },
]
