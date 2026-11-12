// Tests de la llamada al modelo con un cliente simulado (no se hace ninguna
// llamada real ni se gasta nada).

import { describe, expect, it } from 'vitest'
import type Anthropic from '@anthropic-ai/sdk'
import { crearRedactorClaude, ErrorModelo, MODELO_POR_DEFECTO, PROMPT_SISTEMA, redactorDesdeEntorno } from './modelo'
import { entradaParaModelo } from './agenda'
import { calcularDesajustes } from './desajuste'

function clienteFalso(respuesta: Record<string, unknown>) {
  const peticiones: any[] = []
  const cliente = {
    beta: { messages: { create: async (p: unknown) => { peticiones.push(p); return respuesta } } },
  } as unknown as Anthropic
  return { cliente, peticiones }
}

const entrada = entradaParaModelo(
  calcularDesajustes([{ semana: 1, estudiante: { avance: 5, siguiente_paso: 3 }, tutor: { avance: 2, siguiente_paso: 3 } }], 1),
  1,
  10,
)

describe('Llamada al modelo', () => {
  it('envía solo la entrada no personal, con salida JSON, esfuerzo bajo y respaldo ante rechazos', async () => {
    const { cliente, peticiones } = clienteFalso({ stop_reason: 'end_turn', content: [{ type: 'text', text: '{"preguntas":["a","b","c"]}' }] })
    const r = await crearRedactorClaude({ cliente })(entrada)
    expect(r).toEqual({ preguntas: ['a', 'b', 'c'] })
    const p = peticiones[0]
    expect(p.model).toBe(MODELO_POR_DEFECTO)
    expect(p.system).toBe(PROMPT_SISTEMA)
    expect(p.messages).toEqual([{ role: 'user', content: JSON.stringify(entrada) }])
    expect(p.output_config.format.type).toBe('json_schema')
    expect(p.output_config.effort).toBe('low')
    expect(p.fallbacks).toBe('default')
    expect(p.betas).toContain('server-side-fallback-2026-07-01')
  })

  it('el prompt de sistema no contiene rayas largas', () => {
    expect(PROMPT_SISTEMA).not.toContain('—')
  })

  it('un rechazo del modelo se trata como error (y la agenda usará el banco)', async () => {
    const { cliente } = clienteFalso({ stop_reason: 'refusal', content: [] })
    await expect(crearRedactorClaude({ cliente })(entrada)).rejects.toBeInstanceOf(ErrorModelo)
  })

  it('una respuesta que no es JSON se trata como error', async () => {
    const { cliente } = clienteFalso({ stop_reason: 'end_turn', content: [{ type: 'text', text: 'Hola' }] })
    await expect(crearRedactorClaude({ cliente })(entrada)).rejects.toBeInstanceOf(ErrorModelo)
  })
})

describe('Configuración por variables de entorno', () => {
  it('por defecto se trabaja sin modelo (banco de preguntas)', () => {
    expect(redactorDesdeEntorno({})).toBeNull()
    expect(redactorDesdeEntorno({ ANTHROPIC_API_KEY: 'x' })).toBeNull()
  })

  it('con AGENDA_MODO=modelo y clave, usa el modelo indicado', () => {
    const r = redactorDesdeEntorno({ AGENDA_MODO: 'modelo', ANTHROPIC_API_KEY: 'x', AGENDA_MODELO: 'otro-modelo' })
    expect(r?.modelo).toBe('otro-modelo')
  })

  it('sin clave, aunque se pida el modelo, usa el banco', () => {
    expect(redactorDesdeEntorno({ AGENDA_MODO: 'modelo' })).toBeNull()
  })
})
