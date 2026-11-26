import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Una sola tipografía en toda la plataforma: Instrument Sans (DECISIONES.md, 26/11/2026).
function archivos(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const r = join(dir, n)
    return statSync(r).isDirectory() ? archivos(r) : [r]
  })
}

describe('tipografía', () => {
  const codigo = archivos('src').filter((f) => /\.(vue|ts|css)$/.test(f) && !f.endsWith('.test.ts') && !f.includes('/contenido/'))

  it('ningún componente ni estilo usa una monoespaciada', () => {
    for (const f of [...codigo, 'tailwind.config.js', 'index.html']) {
      const texto = readFileSync(f, 'utf8')
      expect(texto, f).not.toMatch(/IBM Plex|font-mono|ui-monospace|\bmonospace\b/)
    }
  })

  it('solo se sirven los archivos de Instrument Sans', () => {
    const fuentes = readdirSync('src/assets/fuentes').filter((n) => n.endsWith('.woff2'))
    expect(fuentes.length).toBeGreaterThan(0)
    for (const n of fuentes) expect(n).toMatch(/^instrument-sans-/)
  })
})
