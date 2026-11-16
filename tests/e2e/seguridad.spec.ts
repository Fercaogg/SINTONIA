// La aplicación compilada funciona con la política de seguridad (CSP) de
// vercel.json: ningún recurso bloqueado en ninguna pantalla de ningún perfil.

import { expect, test, type Page } from '@playwright/test'
import { entrarConContrasena, salir } from './ayudantes'

async function vigilarCsp(page: Page) {
  const bloqueos: string[] = []
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      ;(window as any).__csp = [...((window as any).__csp || []), `${e.violatedDirective} ${e.blockedURI}`]
    })
  })
  page.on('console', (m) => {
    if (/Content Security Policy/i.test(m.text())) bloqueos.push(m.text().slice(0, 200))
  })
  return async () => {
    const enPagina = await page.evaluate(() => (window as any).__csp || [])
    return [...bloqueos, ...enPagina]
  }
}

const RECORRIDOS: { cuenta: string | null; rutas: string[] }[] = [
  { cuenta: null, rutas: ['/', '/como-funciona', '/investigacion', '/acceso', '/registro', '/privacidad', '/aviso-legal', '/cookies', '/consentimiento', '/no-existe'] },
  { cuenta: 'ana@usal.es', rutas: ['/estudiante', '/estudiante/checkin', '/estudiante/historial', '/estudiante/puente', '/calendario', '/cuenta'] },
  { cuenta: 'tutora@usal.es', rutas: ['/tutor', '/tutor/checkin', '/calendario'] },
  { cuenta: 'direccion@usal.es', rutas: ['/direccion', '/direccion/avisos'] },
  { cuenta: 'investigador@usal.es', rutas: ['/investigador', '/investigador/parejas', '/investigador/datos'] },
]

test('la política de seguridad (CSP) no bloquea nada en ninguna pantalla', async ({ page }) => {
  const bloqueos = await vigilarCsp(page)
  for (const { cuenta, rutas } of RECORRIDOS) {
    if (cuenta) await entrarConContrasena(page, cuenta)
    for (const ruta of rutas) {
      await page.goto(ruta)
      await expect(page.locator('h1').first()).toBeVisible()
      await page.waitForLoadState('networkidle')
      expect(await bloqueos(), `CSP en ${ruta}`).toEqual([])
    }
    if (cuenta) await salir(page)
  }
})

test('las cabeceras de seguridad están presentes', async ({ request }) => {
  const r = await request.get('/')
  const h = r.headers()
  expect(h['content-security-policy']).toContain("frame-ancestors 'none'")
  expect(h['content-security-policy']).not.toContain('unsafe-eval')
  expect(h['content-security-policy']).not.toContain('unsafe-inline')
  expect(h['x-frame-options']).toBe('DENY')
  expect(h['x-content-type-options']).toBe('nosniff')
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin')
  expect(h['permissions-policy']).toContain('camera=()')
})

test('robots.txt y sitemap.xml existen y solo nombran páginas públicas', async ({ request }) => {
  const robots = await request.get('/robots.txt')
  expect(robots.headers()['content-type']).toContain('text/plain')
  expect(await robots.text()).toContain('Disallow: /')
  const mapa = await (await request.get('/sitemap.xml')).text()
  expect(mapa).toContain('<urlset')
  expect(mapa).not.toMatch(/estudiante|tutor|direccion|investigador|cuenta/)
  // Cada página del mapa del sitio debe estar permitida en robots.txt.
  const permitidas = (await robots.text()).split('\n').filter((l) => l.startsWith('Allow: ')).map((l) => l.slice(7).trim())
  for (const [, ruta] of mapa.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)) {
    const ok = permitidas.some((p) => (p.endsWith('$') ? ruta === p.slice(0, -1) : ruta.startsWith(p)))
    expect(ok, `${ruta} está en el sitemap pero robots.txt no la permite`).toBe(true)
  }
})

test('cada página pública se sirve con su título, URL canónica e imagen para compartir', async ({ request }) => {
  for (const [ruta, titulo, imagen] of [
    ['/', 'SINTONÍA: acompañar el trabajo académico, sin vigilar', 'inicio'],
    ['/seguridad', 'Seguridad · SINTONÍA', 'seguridad'],
    ['/demo/recorrido', 'Demostración guiada · SINTONÍA', 'recorrido'],
  ]) {
    const html = await (await request.get(ruta)).text()
    expect(html, ruta).toContain(`<title>${titulo}</title>`)
    expect(html, ruta).toMatch(new RegExp(`<link rel="canonical" href="https://[^"]+${ruta === '/' ? '/' : ruta}" />`))
    expect(html, ruta).toMatch(new RegExp(`<meta property="og:image" content="https://[^"]+/og/${imagen}\\.png" />`))
    const png = await request.get(`/og/${imagen}.png`)
    expect(png.headers()['content-type'], imagen).toContain('image/png')
  }
})
