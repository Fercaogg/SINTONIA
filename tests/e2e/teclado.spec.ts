// Navegación completa con el teclado (Fase 5): en cada página pública se
// recorre todo con el tabulador, de principio a fin, y se comprueba que:
//   - lo primero es "Saltar al contenido" y lleva al contenido;
//   - cada parada se ve (tamaño real y foco visible) y nada atrapa el foco;
//   - el recorrido llega hasta el pie de la página.
import { test, expect, type Page } from '@playwright/test'

// Las pantallas de acceso, el recorrido guiado y la 404 no tienen pie: allí basta con que el
// recorrido termine y vuelva al principio.
const SIN_PIE = ['/acceso', '/registro', '/no-existe', '/demo/recorrido']

const PAGINAS = [
  '/',
  '/como-funciona',
  '/investigacion',
  '/instituciones',
  '/demo',
  '/demo/recorrido',
  '/seguridad',
  '/accesibilidad',
  '/novedades',
  '/estado',
  '/hoja-de-ruta',
  '/participantes',
  '/privacidad',
  '/acceso',
  '/registro',
  '/en',
  '/en/how-it-works',
  '/no-existe',
]

type Parada = { id: number; etiqueta: string; ancho: number; alto: number; foco: boolean; enPie: boolean; cuerpo: boolean }

async function parada(page: Page): Promise<Parada> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    if (!el || el === document.body) return { id: -1, etiqueta: 'body', ancho: 0, alto: 0, foco: false, enPie: false, cuerpo: true }
    const r = el.getBoundingClientRect()
    const s = getComputedStyle(el)
    const foco = (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none'
    return {
      id: Array.from(document.querySelectorAll('*')).indexOf(el),
      etiqueta: `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40)}"`,
      ancho: r.width,
      alto: r.height,
      foco,
      enPie: !!el.closest('footer'),
      cuerpo: false,
    }
  })
}

test.describe('navegación con teclado', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
  })

  for (const ruta of PAGINAS) {
    test(`${ruta}: se recorre entera con el tabulador`, async ({ page }) => {
      await page.goto(ruta)
      await page.locator('main#contenido').waitFor()

      // 1. Lo primero, saltar al contenido.
      await page.keyboard.press('Tab')
      const saltar = page.getByRole('link', { name: /Saltar al contenido|Skip to content/ })
      await expect(saltar).toBeFocused()
      await expect(saltar).toBeInViewport()
      await page.keyboard.press('Enter')
      await expect(page.locator('main#contenido')).toBeFocused()

      // 2. Desde el contenido, todo el recorrido hasta el pie.
      const vistos = new Set<number>()
      let llegaAlPie = false
      let completo = false
      for (let i = 0; i < 400; i++) {
        await page.keyboard.press('Tab')
        const p = await parada(page)
        if (p.cuerpo || vistos.has(p.id)) {
          completo = true // se ha dado la vuelta completa: no hay trampa
          break
        }
        expect(p.ancho * p.alto, `${p.etiqueta} no se ve`).toBeGreaterThan(0)
        expect(p.foco, `${p.etiqueta} no muestra el foco`).toBe(true)
        if (p.enPie) llegaAlPie = true
        vistos.add(p.id)
        if (llegaAlPie && !p.enPie) {
          completo = true // tras el pie vuelve a empezar: no hay trampa
          break
        }
      }
      expect(completo, 'el recorrido termina y vuelve al principio').toBe(true)
      if (!SIN_PIE.includes(ruta)) expect(llegaAlPie, 'el tabulador llega al pie de la página').toBe(true)
      expect(vistos.size).toBeGreaterThan(0)
    })
  }

  test('el selector de idioma y los botones se activan con el teclado', async ({ page }) => {
    await page.goto('/seguridad')
    const ingles = page.getByRole('link', { name: /English/ })
    await ingles.focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/en\/security$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('el recorrido de la demostración se usa con el teclado', async ({ page }) => {
    await page.goto('/demo/recorrido')
    const grupos = page.getByRole('radiogroup')
    const n = await grupos.count()
    expect(n).toBeGreaterThan(0)
    // Cada escala se contesta solo con el teclado: foco, flecha y Espacio.
    for (let i = 0; i < n; i++) {
      await grupos.nth(i).getByRole('radio').first().focus()
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('Space')
      await expect(grupos.nth(i).locator('[aria-checked="true"]')).toHaveCount(1)
    }
    const siguiente = page.getByRole('button', { name: 'Siguiente' })
    await expect(siguiente).toBeEnabled()
    await siguiente.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('button', { name: 'Atrás' })).toBeVisible()
  })
})
