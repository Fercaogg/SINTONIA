import { describe, expect, it } from 'vitest'
import { analiticaPermitida, filtrarEvento } from './analitica'
import { URL_SITIO } from './publico'

describe('analítica sin cookies', () => {
  const ev = (ruta: string) => ({ type: 'pageview', url: URL_SITIO + ruta })

  it('cuenta solo las páginas públicas, sin parámetros ni fragmento', () => {
    expect(filtrarEvento(ev('/'))?.url).toBe(URL_SITIO + '/')
    expect(filtrarEvento(ev('/seguridad?utm=x#a'))?.url).toBe(URL_SITIO + '/seguridad')
    expect(filtrarEvento(ev('/en/research'))?.url).toBe(URL_SITIO + '/en/research')
  })

  it('nunca cuenta los paneles ni los enlaces de acceso', () => {
    for (const r of ['/estudiante', '/estudiante/checkin', '/tutor', '/direccion/avisos', '/investigador/datos', '/cuenta', '/acceso/confirmar#access_token=x', '/no-existe']) {
      expect(filtrarEvento(ev(r)), r).toBeNull()
    }
  })

  it('solo en la web publicada, y respeta "No rastrear"', () => {
    const origen = new URL(URL_SITIO).origin
    expect(analiticaPermitida(origen, { PROD: true }, {})).toBe(true)
    expect(analiticaPermitida('http://localhost:4173', { PROD: true }, {})).toBe(false)
    expect(analiticaPermitida(origen, { PROD: false }, {})).toBe(false)
    expect(analiticaPermitida(origen, { PROD: true, VITE_ANALITICA: 'false' }, {})).toBe(false)
    expect(analiticaPermitida(origen, { PROD: true, VITE_MODO_DEMO: 'true' }, {})).toBe(false)
    expect(analiticaPermitida(origen, { PROD: true }, { doNotTrack: '1' })).toBe(false)
    expect(analiticaPermitida(origen, { PROD: true }, { globalPrivacyControl: true })).toBe(false)
  })
})
