// Páginas estáticas para buscadores y redes, y su coherencia con vercel.json.
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
// @ts-expect-error: módulos de Node en JavaScript, sin tipos
import { etiquetas, leerPaginas, robots, sitemap } from '../scripts/paginas-estaticas.mjs'
// @ts-expect-error: módulos de Node en JavaScript, sin tipos
import { reglas } from '../scripts/sincronizar-vercel.mjs'

const raiz = process.cwd()
const paginas = leerPaginas(raiz) as { ruta: string; idioma: string; og: string; imagen?: unknown; alterna?: string; titulo: string; descripcion: string }[]

describe('páginas públicas (src/contenido/paginas.json)', () => {
  it('vercel.json está sincronizado (si falla: node scripts/sincronizar-vercel.mjs)', () => {
    const config = JSON.parse(readFileSync('vercel.json', 'utf8'))
    const r = reglas(paginas)
    expect(config.rewrites).toEqual([r.paginas, r.resto])
    expect(config.headers.find((h: { headers: { key: string }[] }) => h.headers.some((x) => x.key === 'X-Robots-Tag')).source).toBe(r.noIndexar)
  })

  it('cada página principal tiene su imagen para compartir de 1200 x 630', () => {
    for (const p of paginas.filter((p) => p.imagen)) {
      const archivo = `public/og/${p.idioma === 'en' ? 'en-' : ''}${p.og}.png`
      expect(existsSync(archivo), archivo).toBe(true)
      const png = readFileSync(archivo)
      expect([png.readUInt32BE(16), png.readUInt32BE(20)], archivo).toEqual([1200, 630])
    }
  })

  it('títulos y descripciones únicos, sin rayas largas', () => {
    expect(new Set(paginas.map((p) => p.ruta)).size).toBe(paginas.length)
    for (const p of paginas) {
      expect(p.descripcion.length, p.ruta).toBeLessThanOrEqual(170)
      expect(p.titulo + p.descripcion, p.ruta).not.toContain('—')
    }
  })

  it('las versiones en otro idioma se enlazan en los dos sentidos', () => {
    for (const p of paginas.filter((p) => p.alterna)) {
      const otra = paginas.find((q) => q.ruta === p.alterna)
      expect(otra, `${p.ruta} -> ${p.alterna}`).toBeDefined()
      expect(otra!.alterna).toBe(p.ruta)
    }
  })

  it('todas las direcciones salen de una sola (dominio propio)', () => {
    const base = 'https://sintonia.ejemplo.es'
    const html = etiquetas(paginas.find((p) => p.ruta === '/seguridad'), paginas, base)
    expect(html).toContain('<link rel="canonical" href="https://sintonia.ejemplo.es/seguridad" />')
    expect(html).toContain('og:image" content="https://sintonia.ejemplo.es/og/seguridad.png"')
    expect(html).not.toContain('vercel.app')
    expect(sitemap(paginas, base)).not.toContain('vercel.app')
    expect(robots(paginas, base)).toContain('Sitemap: https://sintonia.ejemplo.es/sitemap.xml')
  })
})
