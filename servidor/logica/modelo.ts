/**
 * REDACCIÓN DE LA AGENDA CON UN MODELO DE LENGUAJE (opcional)
 *
 * El modelo solo recibe la "entrada" construida por entradaParaModelo():
 * qué ítems presentan desajuste, el signo, la magnitud y la semana. Nunca
 * nombres, correos, identificadores ni textos libres.
 *
 * Su respuesta se valida siempre (validarSalidaModelo). Si falla la llamada o
 * la validación, la agenda se hace con el banco de preguntas.
 *
 * Configuración (variables de entorno):
 *   AGENDA_MODO=modelo      para usar el modelo (por defecto: banco)
 *   ANTHROPIC_API_KEY       clave de la API
 *   AGENDA_MODELO           modelo a usar (por defecto: claude-opus-5-5)
 */

import Anthropic from '@anthropic-ai/sdk'
import type { EntradaModelo } from './agenda.js'

export const VERSION_PROMPT = 'agenda-prompt-v1'
export const MODELO_POR_DEFECTO = 'claude-opus-5-5'

export const PROMPT_SISTEMA = `Redactas preguntas para preparar una tutoría académica (TFG, TFM o tesis doctoral) entre una persona que hace el trabajo y la persona que lo dirige.

Recibirás solo datos de una semana del estudio, sin ninguna información personal:
- "avance": cuánto se ha avanzado en el trabajo esa semana.
- "siguiente_paso": si está claro cuál es el siguiente paso.
Para cada aspecto se indica si las dos personas lo valoran de forma claramente distinta ("desajuste_relevante"), el sentido de la diferencia ("signo"), su tamaño de 0 a 4 ("magnitud") y si se repite desde la semana anterior ("persistente"). También recibes la semana del estudio y el total de semanas.

Redacta exactamente tres preguntas para que las dos personas las conversen juntas en la próxima tutoría.

Reglas obligatorias:
- Cada pregunta empieza por "¿" y termina por "?", en español de España, en una sola frase de 160 caracteres como máximo.
- Se dirigen a las dos personas a la vez, en segunda persona del plural ("consideráis", "vais a"). No nombres a ninguna de las dos ni uses las palabras tutor, tutora, estudiante, alumno ni profesor.
- Son neutras: no culpan a nadie, no insinúan quién tiene razón y no revelan quién valoró más o menos.
- No menciones puntuaciones, números, escalas, diferencias ni desajustes.
- No hables de emociones, sentimientos, ánimo, estrés, motivación ni bienestar.
- Son concretas y prácticas: tratan de tareas, entregables, criterios para dar algo por terminado, decisiones pendientes, plazos o la forma de trabajar.
- Si un aspecto tiene un desajuste relevante, al menos una pregunta trata de ese aspecto. Si no hay ninguno, las tres preguntas sirven para revisar el trabajo en general.
- Ten en cuenta el momento del estudio: al principio, preguntas sobre la planificación; hacia el final, sobre el cierre y las entregas.
- No uses rayas largas.

Ejemplos del tono buscado:
- ¿Qué parte del trabajo consideráis cerrada y cuál sigue abierta?
- ¿Cuál es el próximo entregable y para cuándo?
- ¿Hay algo que esté frenando el avance?

Responde solo con el objeto JSON {"preguntas": [pregunta 1, pregunta 2, pregunta 3]}.`

const ESQUEMA = {
  type: 'object',
  properties: {
    preguntas: { type: 'array', items: { type: 'string' } },
  },
  required: ['preguntas'],
  additionalProperties: false,
}

/** Una función que recibe la entrada no personal y devuelve el JSON del modelo. */
export type Redactor = ((entrada: EntradaModelo) => Promise<unknown>) & { modelo: string }

export class ErrorModelo extends Error {}

export function crearRedactorClaude(opciones: { apiKey?: string; modelo?: string; cliente?: Anthropic } = {}): Redactor {
  const modelo = opciones.modelo || MODELO_POR_DEFECTO
  const cliente = opciones.cliente ?? new Anthropic({ apiKey: opciones.apiKey, timeout: 60_000, maxRetries: 1 })

  const redactar = async (entrada: EntradaModelo) => {
    const respuesta = await cliente.beta.messages.create({
      model: modelo,
      max_tokens: 8000,
      // Si el modelo rechaza la petición, el servidor de Anthropic la repite
      // con otro modelo. Si aun así falla, se usa el banco de preguntas.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: {
        effort: 'low',
        format: { type: 'json_schema', schema: ESQUEMA },
      },
      system: PROMPT_SISTEMA,
      messages: [{ role: 'user', content: JSON.stringify(entrada) }],
    })
    if (respuesta.stop_reason === 'refusal') throw new ErrorModelo('El modelo rechazó la petición')
    if (respuesta.stop_reason === 'max_tokens') throw new ErrorModelo('La respuesta del modelo quedó cortada')
    const texto = respuesta.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('')
    try {
      return JSON.parse(texto)
    } catch {
      throw new ErrorModelo('La respuesta del modelo no es JSON')
    }
  }
  return Object.assign(redactar, { modelo })
}

/** Lee la configuración del entorno. Devuelve null si se trabaja sin modelo. */
export function redactorDesdeEntorno(env: Record<string, string | undefined> = process.env): Redactor | null {
  if (env.AGENDA_MODO !== 'modelo') return null
  if (!env.ANTHROPIC_API_KEY) return null
  return crearRedactorClaude({ apiKey: env.ANTHROPIC_API_KEY, modelo: env.AGENDA_MODELO })
}
