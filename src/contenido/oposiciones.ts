// Oposiciones por estudios: base de datos de SINTONÍA, fase 1 (Estado y
// docentes de Castilla y León). Recogida por Fernando; solo entran las
// oposiciones con la titulación exigida verificada.
//
// Cómo añadir o cambiar una oposición:
//   - nivelMinimo: el título mínimo que pide la convocatoria (ver NIVELES).
//   - grupo: el grupo o subgrupo oficial; null si aún no está confirmado.
//   - exige: titulaciones concretas que pide (vacío = vale cualquiera del nivel).
//   - afinidad: ramas o titulaciones a las que encaja especialmente.
//   - masterProfesorado: true si pide el Máster en Formación del Profesorado.
// La lógica del buscador está en src/lib/oposiciones.ts.

export type Ambito = 'Estado' | 'Castilla y León'
export type Grupo = 'A1' | 'A2' | 'C1' | 'C2'
export type Rama =
  | 'Artes y Humanidades'
  | 'Ciencias'
  | 'Ciencias de la Salud'
  | 'Ciencias Sociales y Jurídicas'
  | 'Ingeniería y Arquitectura'

/** Niveles de estudios, de menos a más. El número sirve para comparar. */
export const NIVELES = [
  { valor: 1, texto: 'Graduado en ESO' },
  { valor: 2, texto: 'Bachillerato o Técnico de FP' },
  { valor: 3, texto: 'Técnico Superior de FP' },
  { valor: 4, texto: 'Diplomatura, Ingeniería técnica o Arquitectura técnica' },
  { valor: 5, texto: 'Grado universitario o Licenciatura' },
  { valor: 6, texto: 'Máster universitario' },
  { valor: 7, texto: 'Doctorado' },
] as const

export type Nivel = (typeof NIVELES)[number]['valor']

/** Nivel universitario mínimo para cada grupo (EBEP, art. 76). */
export const NIVEL_GRUPO: Record<Grupo, Nivel> = { A1: 5, A2: 4, C1: 2, C2: 1 }

export const RAMAS: Rama[] = [
  'Artes y Humanidades',
  'Ciencias',
  'Ciencias de la Salud',
  'Ciencias Sociales y Jurídicas',
  'Ingeniería y Arquitectura',
]

/** Titulaciones que se pueden elegir en el buscador, por rama. */
export const TITULACIONES: Record<Rama, string[]> = {
  'Artes y Humanidades': ['Bellas Artes', 'Filología', 'Filosofía', 'Geografía', 'Historia', 'Historia del Arte', 'Humanidades', 'Información y Documentación', 'Traducción e Interpretación'],
  Ciencias: ['Biología', 'Biotecnología', 'Ciencias Ambientales', 'Física', 'Geología', 'Matemáticas', 'Química'],
  'Ciencias de la Salud': ['Enfermería', 'Farmacia', 'Fisioterapia', 'Medicina', 'Nutrición Humana y Dietética', 'Odontología', 'Psicología', 'Terapia Ocupacional'],
  'Ciencias Sociales y Jurídicas': ['Administración y Dirección de Empresas', 'Ciencia Política y de la Administración', 'Comunicación Audiovisual', 'Criminología', 'Derecho', 'Economía', 'Educación Primaria', 'Educación Infantil', 'Educación Social', 'Pedagogía', 'Periodismo', 'Relaciones Laborales y Recursos Humanos', 'Sociología', 'Trabajo Social', 'Turismo'],
  'Ingeniería y Arquitectura': ['Arquitectura', 'Ingeniería Agrícola', 'Ingeniería Civil', 'Ingeniería Eléctrica', 'Ingeniería Industrial', 'Ingeniería Informática', 'Ingeniería Mecánica', 'Ingeniería de Telecomunicación'],
}

export interface Oposicion {
  id: string
  nombre: string
  ambito: Ambito
  grupo: Grupo | null
  nivelMinimo: Nivel
  plazas: number
  requisito?: string
  masterProfesorado?: boolean
  exige?: string[]
  afinidad?: { ramas?: Rama[]; titulaciones?: string[] }
}

/** Año y fuente de las plazas. Mientras falte, se muestra como pendiente. */
export const FUENTE_PLAZAS = '[PENDIENTE: oferta de empleo público de la que salen las plazas (año y boletín)]'

export const OPOSICIONES: Oposicion[] = [
  // ── Docentes (Castilla y León) ──
  { id: 'secundaria-orientacion-cyl', nombre: 'Secundaria, especialidad Orientación Educativa', ambito: 'Castilla y León', grupo: 'A1', nivelMinimo: 5, plazas: 75, masterProfesorado: true, requisito: 'Máster en Formación del Profesorado (especialidad Orientación)', afinidad: { titulaciones: ['Pedagogía'] } },
  { id: 'secundaria-cyl', nombre: 'Profesor/a de Enseñanza Secundaria', ambito: 'Castilla y León', grupo: 'A1', nivelMinimo: 5, plazas: 970, masterProfesorado: true, requisito: 'Máster en Formación del Profesorado' },

  // ── Grupo A1 ──
  { id: 'tic-superior', nombre: 'Cuerpo Superior de Sistemas y Tecnologías de la Información', ambito: 'Estado', grupo: 'A1', nivelMinimo: 5, plazas: 300, requisito: 'Pruebas por especialidad: IA, Ciberseguridad y Ciencia del Dato' },
  { id: 'inspectores-hacienda', nombre: 'Cuerpo Superior de Inspectores de Hacienda del Estado', ambito: 'Estado', grupo: 'A1', nivelMinimo: 5, plazas: 130 },
  { id: 'estadisticos', nombre: 'Cuerpo Superior de Estadísticos del Estado', ambito: 'Estado', grupo: 'A1', nivelMinimo: 5, plazas: 84 },
  { id: 'superior-cyl', nombre: 'Cuerpo Superior de la Administración de Castilla y León', ambito: 'Castilla y León', grupo: 'A1', nivelMinimo: 5, plazas: 81 },
  { id: 'inspectores-trabajo', nombre: 'Cuerpo Superior de Inspectores de Trabajo y Seguridad Social', ambito: 'Estado', grupo: 'A1', nivelMinimo: 5, plazas: 70 },
  { id: 'tecnicos-seguridad-social', nombre: 'Cuerpo Superior de Técnicos de la Administración de la Seguridad Social', ambito: 'Estado', grupo: 'A1', nivelMinimo: 5, plazas: 51 },
  { id: 'tac', nombre: 'Cuerpo Superior de Administradores Civiles del Estado (TAC)', ambito: 'Estado', grupo: 'A1', nivelMinimo: 5, plazas: 50, requisito: 'Inglés o francés, nivel B2' },
  { id: 'archiveros', nombre: 'Cuerpo Facultativo de Archiveros, Bibliotecarios y Arqueólogos', ambito: 'Estado', grupo: 'A1', nivelMinimo: 5, plazas: 46 },
  { id: 'diplomatica', nombre: 'Carrera Diplomática', ambito: 'Estado', grupo: 'A1', nivelMinimo: 5, plazas: 40, requisito: 'Inglés y francés obligatorios' },
  { id: 'tecnicos-comerciales', nombre: 'Cuerpo Superior de Técnicos Comerciales y Economistas del Estado', ambito: 'Estado', grupo: 'A1', nivelMinimo: 5, plazas: 24 },
  { id: 'interventores', nombre: 'Cuerpo Superior de Interventores y Auditores del Estado', ambito: 'Estado', grupo: 'A1', nivelMinimo: 5, plazas: 16 },

  // ── Grupo A2 ──
  { id: 'subinspectores-empleo', nombre: 'Subinspectores Laborales, Escala de Empleo y Seguridad Social', ambito: 'Estado', grupo: 'A2', nivelMinimo: 4, plazas: 70, afinidad: { ramas: ['Ciencias Sociales y Jurídicas'] } },
  { id: 'gace', nombre: 'Cuerpo de Gestión de la Administración Civil del Estado (GACE)', ambito: 'Estado', grupo: 'A2', nivelMinimo: 4, plazas: 1255 },
  { id: 'gestion-procesal', nombre: 'Gestión Procesal y Administrativa', ambito: 'Estado', grupo: 'A2', nivelMinimo: 4, plazas: 658 },
  { id: 'tecnico-hacienda', nombre: 'Cuerpo Técnico de Hacienda', ambito: 'Estado', grupo: 'A2', nivelMinimo: 4, plazas: 446 },
  { id: 'gsi', nombre: 'Cuerpo de Gestión de Sistemas e Informática', ambito: 'Estado', grupo: 'A2', nivelMinimo: 4, plazas: 400 },
  { id: 'gestion-seguridad-social', nombre: 'Cuerpo de Gestión de la Administración de la Seguridad Social', ambito: 'Estado', grupo: 'A2', nivelMinimo: 4, plazas: 250 },
  { id: 'ayudantes-archivos', nombre: 'Cuerpo de Ayudantes de Archivos, Bibliotecas y Museos', ambito: 'Estado', grupo: 'A2', nivelMinimo: 4, plazas: 103 },
  { id: 'auditoria-contabilidad', nombre: 'Cuerpo Técnico de Auditoría y Contabilidad', ambito: 'Estado', grupo: 'A2', nivelMinimo: 4, plazas: 92 },
  { id: 'gestion-cyl', nombre: 'Cuerpo de Gestión de la Administración de Castilla y León', ambito: 'Castilla y León', grupo: 'A2', nivelMinimo: 4, plazas: 86 },
  { id: 'diplomados-estadistica', nombre: 'Cuerpo de Diplomados en Estadística del Estado', ambito: 'Estado', grupo: 'A2', nivelMinimo: 4, plazas: 79 },

  // ── Grupo C1 ──
  { id: 'administrativo-estado', nombre: 'Cuerpo General Administrativo del Estado', ambito: 'Estado', grupo: 'C1', nivelMinimo: 2, plazas: 2512 },
  { id: 'policia-nacional', nombre: 'Policía Nacional, Escala Básica', ambito: 'Estado', grupo: null, nivelMinimo: 2, plazas: 2163, requisito: 'Permiso B, inglés o francés A2 y pruebas físicas' },
  { id: 'agentes-hacienda', nombre: 'Agentes de la Hacienda Pública', ambito: 'Estado', grupo: 'C1', nivelMinimo: 2, plazas: 1400 },
  { id: 'tramitacion-procesal', nombre: 'Tramitación Procesal y Administrativa', ambito: 'Estado', grupo: 'C1', nivelMinimo: 2, plazas: 1155 },
  { id: 'penitenciarias', nombre: 'Ayudantes de Instituciones Penitenciarias', ambito: 'Estado', grupo: 'C1', nivelMinimo: 2, plazas: 1050 },
  { id: 'tai', nombre: 'Técnicos Auxiliares de Informática del Estado (TAI)', ambito: 'Estado', grupo: 'C1', nivelMinimo: 2, plazas: 1030 },
  { id: 'administrativo-cyl', nombre: 'Cuerpo Administrativo de Castilla y León', ambito: 'Castilla y León', grupo: 'C1', nivelMinimo: 2, plazas: 191 },

  // ── Grupo C2 ──
  { id: 'guardia-civil', nombre: 'Guardia Civil, Escala de Cabos y Guardias', ambito: 'Estado', grupo: null, nivelMinimo: 1, plazas: 1704, requisito: 'Pruebas físicas y demás requisitos de la convocatoria' },
  { id: 'auxiliar-estado', nombre: 'Cuerpo General Auxiliar del Estado', ambito: 'Estado', grupo: 'C2', nivelMinimo: 1, plazas: 1700 },
  { id: 'auxilio-judicial', nombre: 'Auxilio Judicial', ambito: 'Estado', grupo: 'C2', nivelMinimo: 1, plazas: 425 },
  { id: 'auxiliar-cyl', nombre: 'Cuerpo Auxiliar de Castilla y León', ambito: 'Castilla y León', grupo: 'C2', nivelMinimo: 1, plazas: 362 },
]
