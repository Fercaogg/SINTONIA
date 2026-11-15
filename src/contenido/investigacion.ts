// Contenido de /investigacion en un solo sitio. Lo que vale null todavía no
// lo ha facilitado Fernando (o el Comité de Ética): en la web sale el texto
// digno y está en PENDIENTES.md. Para publicarlo, basta con rellenarlo aquí.

/** Pregunta de investigación (CTS). */
export const PREGUNTA: string | null = null

/** Hipótesis. `tema` es lo que ya se sabe de cada una; `texto`, la redacción definitiva. */
export const HIPOTESIS: { clave: 'H1' | 'H2' | 'H3'; tema: string | null; texto: string | null }[] = [
  { clave: 'H1', tema: null, texto: null },
  { clave: 'H2', tema: null, texto: null },
  { clave: 'H3', tema: 'Relacionada con Puente al doctorado y la orientación sobre el doctorado.', texto: null },
]

/** Diseño del estudio (facilitado por Fernando en el encargo). */
export const DISENO = [
  'Mixto y longitudinal, durante 10 semanas.',
  'Un microensayo aleatorizado: cada semana, un sorteo con probabilidad 0,5 decide qué parejas reciben las tres preguntas de la agenda. Así se puede comparar qué pasa con y sin ellas en la misma pareja a lo largo del tiempo (Qian et al., 2022).',
  'Un cuestionario al principio (pretest) y otro al final (postest).',
  'Entre 8 y 10 entrevistas.',
  'Diseñado para poder ampliarse a TFG y tesis doctorales.',
]

/** Comité de Ética: estado del informe. null mientras no haya resolución. */
export const COMITE_ETICA: { estado: string; referencia: string | null } | null = null

/** Enlace público del preregistro en OSF. El enlace solo aparece cuando existe. */
export const PREREGISTRO_OSF: string | null = null

export const CALENDARIO: { cuando: string; que: string | null }[] = [
  { cuando: 'Enero de 2027', que: null },
  { cuando: 'Febrero a abril de 2027', que: 'Piloto en dos másteres de la Universidad de Salamanca, con 30 a 50 parejas.' },
  { cuando: 'Mayo y junio de 2027', que: null },
]

/**
 * Publicaciones y difusión (artículos, congresos, prensa). Mientras esté vacía,
 * la sección no se muestra; aparece sola al añadir la primera entrada.
 * `cita` en APA 7; `enlace`, opcional.
 */
export const PUBLICACIONES: { cita: string; enlace?: string; fecha: string }[] = []

/** Datos para "Cómo citar SINTONÍA". */
export const CITA = {
  autoria: 'Martín Vaquero, F.',
  titulo: 'SINTONÍA',
  descripcion: 'Prototipo de software del Trabajo Fin de Máster, Universidad de Salamanca',
}
