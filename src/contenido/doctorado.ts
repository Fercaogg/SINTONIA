// Contenido del apartado «Doctorado» del panel del estudiante.
//
// Reglas (encargo de Fernando, 25/11/2026):
//   - Todo sale de fuentes oficiales (USAL, BOE, AEI, Junta, fundaciones) y
//     lleva su enlace. Nada inventado: lo que aún no se ha comprobado se marca
//     con PENDIENTE y se muestra como «En elaboración» dentro del panel.
//   - Las fechas de las convocatorias NO van aquí: las mantiene Investigación
//     en su panel (tabla convocatorias) y se ven en la pestaña de plazos.
//   - Cuando se complete una sección, se cambia `estado` a 'comprobado' y se
//     anota la fecha de consulta en `consultado`.

export type Estado = 'comprobado' | 'pendiente'

export interface Fuente {
  titulo: string
  url: string
}

export interface Seccion {
  clave: 'que-es' | 'acceso' | 'requisitos' | 'programas' | 'plazos' | 'grupos' | 'orientacion'
  titulo: string
  icono: string
  resumen: string
}

export const SECCIONES: Seccion[] = [
  { clave: 'que-es', titulo: 'Qué es', icono: 'graduation', resumen: 'Qué es un doctorado, cuánto dura y cómo se organiza.' },
  { clave: 'acceso', titulo: 'Cómo acceder', icono: 'checkin', resumen: 'Los pasos, en orden, desde elegir programa hasta la matrícula.' },
  { clave: 'requisitos', titulo: 'Qué necesito', icono: 'document', resumen: 'Requisitos de acceso y documentos.' },
  { clave: 'programas', titulo: 'Programas', icono: 'building', resumen: 'Programas de doctorado de la Universidad de Salamanca.' },
  { clave: 'plazos', titulo: 'Plazos y ayudas', icono: 'calendar', resumen: 'Convocatorias, avisos en la agenda y comparación de ayudas.' },
  { clave: 'grupos', titulo: 'Grupos', icono: 'team', resumen: 'Grupos de investigación de la Universidad de Salamanca.' },
  { clave: 'orientacion', titulo: 'Orientación', icono: 'chat', resumen: 'A quién preguntar y qué hablar en la tutoría.' },
]

/** Fuentes oficiales de cada sección (facilitadas por Fernando o ya comprobadas en docs/FUENTES-OFICIALES.md). */
export const FUENTES: Record<Seccion['clave'], Fuente[]> = {
  'que-es': [
    { titulo: 'Real Decreto 99/2011, que regula las enseñanzas oficiales de doctorado (texto consolidado)', url: 'https://www.boe.es/buscar/pdf/2011/BOE-A-2011-2541-consolidado.pdf' },
    { titulo: 'Reglamento de Doctorado de la Universidad de Salamanca (BOCyL, 15/12/2025)', url: 'https://bocyl.jcyl.es/boletines/2025/12/15/pdf/BOCYL-D-15122025-31.pdf' },
  ],
  acceso: [
    { titulo: 'Escuela de Doctorado «Studii Salamantini»: requisitos de acceso', url: 'https://doctorado.usal.es/es/requisitos-acceso' },
    { titulo: 'Guía de Buenas Prácticas para la Gestión Académica de los Programas de Doctorado', url: 'http://posgrado.usal.es/DOCTORADO%2099/GuiaBuenasPracticas.pdf' },
  ],
  requisitos: [{ titulo: 'Escuela de Doctorado «Studii Salamantini»: requisitos de acceso', url: 'https://doctorado.usal.es/es/requisitos-acceso' }],
  programas: [{ titulo: 'Escuela de Doctorado «Studii Salamantini»: programas de doctorado', url: 'https://doctorado.usal.es/es/doctorados' }],
  plazos: [
    { titulo: 'Convocatorias de investigación de la Universidad de Salamanca', url: 'https://convocatoriasinvestigacion.usal.es/' },
    { titulo: 'Agencia Estatal de Investigación: buscador de convocatorias', url: 'https://www.aei.gob.es/convocatorias/buscador-convocatorias' },
  ],
  grupos: [{ titulo: 'Portal de Producción Científica de la USAL: grupos de investigación', url: 'https://produccioncientifica.usal.es/grupos' }],
  orientacion: [{ titulo: 'Escuela de Doctorado «Studii Salamantini»', url: 'https://doctorado.usal.es/es/requisitos-acceso' }],
}

/** Estado de cada sección: qué está ya comprobado y qué falta. */
export const ESTADO: Record<Seccion['clave'], { estado: Estado; consultado?: string; falta?: string }> = {
  'que-es': { estado: 'pendiente', falta: 'Explicación en sencillo a partir del Real Decreto 99/2011 y del Reglamento de la USAL.' },
  acceso: { estado: 'pendiente', falta: 'Pasos y periodos de preinscripción, admisión y matrícula del curso 2026/27.' },
  requisitos: { estado: 'pendiente', falta: 'Requisitos de acceso y documentación, de la página de la Escuela de Doctorado.' },
  programas: { estado: 'pendiente', falta: 'Lista de programas de doctorado de la USAL, con su enlace oficial.' },
  plazos: { estado: 'pendiente', falta: 'Cuantía, duración, requisitos, ventajas y desventajas de cada ayuda.' },
  grupos: { estado: 'pendiente', falta: 'Directorio de grupos de investigación del Portal de Producción Científica.' },
  orientacion: { estado: 'pendiente', falta: 'Contacto y atención de la Escuela de Doctorado y servicios de orientación.' },
}

/**
 * Pasos para acceder al doctorado. Solo los títulos, que siguen el orden del
 * Real Decreto 99/2011 (admisión, matrícula, documento de actividades y plan
 * de investigación); el detalle de cada paso queda PENDIENTE de la fuente oficial.
 */
export const PASOS_ACCESO: { titulo: string; detalle: string }[] = [
  { titulo: 'Elegir programa de doctorado', detalle: '[PENDIENTE: detalle según la Escuela de Doctorado]' },
  { titulo: 'Buscar director/a y línea de investigación', detalle: '[PENDIENTE: detalle según la Escuela de Doctorado]' },
  { titulo: 'Comprobar los requisitos de acceso', detalle: '[PENDIENTE: detalle según la Escuela de Doctorado]' },
  { titulo: 'Hacer la preinscripción', detalle: '[PENDIENTE: periodos y documentos del curso 2026/27]' },
  { titulo: 'Esperar la resolución de admisión', detalle: '[PENDIENTE: detalle según la Escuela de Doctorado]' },
  { titulo: 'Matricularse', detalle: '[PENDIENTE: periodos de matrícula del curso 2026/27]' },
  { titulo: 'Documento de actividades y plan de investigación', detalle: '[PENDIENTE: plazos según el Reglamento de Doctorado de la USAL]' },
]

/**
 * Ayudas para hacer el doctorado, para la tabla de comparación. Solo se
 * rellenan con datos de la convocatoria oficial; lo demás, PENDIENTE.
 * Plazos de 2026 comprobados el 15/11/2026 (docs/FUENTES-OFICIALES.md, apartado 2).
 */
export interface Ayuda {
  nombre: string
  organismo: string
  ultimaConvocatoria: string
  duracion: string
  cuantia: string
  requisitos: string
  ventajas: string[]
  desventajas: string[]
  url: string
}

const P = (que: string) => `[PENDIENTE: ${que}]`

export const AYUDAS: Ayuda[] = [
  {
    nombre: 'Formación de Profesorado Universitario (FPU)',
    organismo: 'Agencia Estatal de Investigación',
    ultimaConvocatoria: 'FPU 2026: solicitudes del 20/10/2026 al 12/11/2026 (en la USAL, plazo interno hasta el 5/11/2026)',
    duracion: P('duración del contrato'),
    cuantia: P('retribución'),
    requisitos: P('requisitos (nota media, año de fin de estudios…)'),
    ventajas: [P('ventajas según las bases')],
    desventajas: [P('desventajas según las bases')],
    url: 'https://www.aei.gob.es/convocatorias/buscador-convocatorias/ayudas-formacion-profesorado-universitario-fpu-2026',
  },
  {
    nombre: 'Contratos predoctorales FPI (ligados a proyectos)',
    organismo: 'Universidad de Salamanca (Agencia de Gestión de la Investigación)',
    ultimaConvocatoria: 'FPI 2026: solicitudes del 26/10/2026 al 15/11/2026',
    duracion: P('duración del contrato'),
    cuantia: P('retribución'),
    requisitos: P('requisitos y proyecto asociado'),
    ventajas: [P('ventajas según las bases')],
    desventajas: [P('desventajas según las bases')],
    url: 'https://convocatoriasinvestigacion.usal.es/contratos-predoctorales-fpi-2026/',
  },
  {
    nombre: 'Contratos predoctorales propios de la USAL',
    organismo: 'Universidad de Salamanca',
    ultimaConvocatoria: P('convocatoria de 2026 (la última vista es la de 2025)'),
    duracion: P('duración del contrato'),
    cuantia: P('retribución'),
    requisitos: P('requisitos'),
    ventajas: [P('ventajas según las bases')],
    desventajas: [P('desventajas según las bases')],
    url: 'https://convocatoriasinvestigacion.usal.es/',
  },
  {
    nombre: 'Contratos predoctorales de la Junta de Castilla y León',
    organismo: 'Junta de Castilla y León (Consejería de Educación)',
    ultimaConvocatoria: P('convocatoria de 2026'),
    duracion: P('duración del contrato'),
    cuantia: P('retribución'),
    requisitos: P('requisitos'),
    ventajas: [P('ventajas según las bases')],
    desventajas: [P('desventajas según las bases')],
    url: 'https://www.educa.jcyl.es/universidad/es',
  },
  {
    nombre: 'Becas de doctorado de la Fundación «la Caixa»',
    organismo: 'Fundación «la Caixa»',
    ultimaConvocatoria: P('convocatoria vigente'),
    duracion: P('duración'),
    cuantia: P('dotación'),
    requisitos: P('requisitos (movilidad, programas…)'),
    ventajas: [P('ventajas según las bases')],
    desventajas: [P('desventajas según las bases')],
    url: P('enlace oficial'),
  },
]

/** Grupos de investigación ya comprobados (los del equipo de SINTONÍA, Portal de Producción Científica). El resto, PENDIENTE del directorio oficial. */
export const GRUPOS_CONOCIDOS: { nombre: string; area: string; url: string }[] = [
  { nombre: 'GRIAL, Grupo de Investigación en Interacción y eLearning', area: 'Educación y tecnología', url: 'https://produccioncientifica.usal.es/grupos' },
  { nombre: 'Cultura Académica, Patrimonio y Memoria Social (CaUSAL)', area: 'Historia de la educación', url: 'https://produccioncientifica.usal.es/grupos' },
  { nombre: 'Procesos, Espacios y Prácticas Educativas', area: 'Educación', url: 'https://produccioncientifica.usal.es/grupos' },
]

/** Preguntas para hablar del doctorado en la tutoría (no son datos: son temas de conversación). */
export const PREGUNTAS_TUTORIA: string[] = [
  '¿Qué parte de mi TFM podría convertirse en una línea de tesis?',
  '¿Qué programa de doctorado encaja mejor con lo que quiero investigar?',
  '¿Conoces algún grupo de investigación que trabaje en mi tema?',
  '¿A qué ayudas podría presentarme y qué necesitaría preparar antes?',
  '¿Qué plazos debería tener en cuenta este curso?',
]
