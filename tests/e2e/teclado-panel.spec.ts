// Navegación con el teclado dentro del panel de cada perfil (después de la
// Fase 5): las mismas comprobaciones que en las páginas públicas
// (teclado.spec.ts) y, de paso, accesibilidad automática (axe) en claro y en
// oscuro en las pantallas que aún no la tenían.
import { test, expect, type Page } from '@playwright/test'
import { entrarConContrasena, sinErroresDeAccesibilidad } from './ayudantes'

const PERFILES: { correo: string; pantallas: string[] }[] = [
  { correo: 'ana@usal.es', pantallas: ['/estudiante', '/estudiante/checkin', '/estudiante/historial', '/estudiante/apoyo', '/estudiante/puente', '/calendario', '/cuenta'] },
  { correo: 'tutora@usal.es', pantallas: ['/tutor', '/tutor/checkin', '/tutor/codigos'] },
  { correo: 'direccion@usal.es', pantallas: ['/direccion', '/direccion/avisos'] },
  {
    correo: 'investigador@usal.es',
    pantallas: ['/investigador', '/investigador/parejas', '/investigador/calendario', '/investigador/convocatorias', '/investigador/cuestionarios', '/investigador/datos'],
  },
]

async function parada(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    if (!el || el === document.body) return { id: -1, etiqueta: 'body', area: 0, foco: false, cuerpo: true }
    const r = el.getBoundingClientRect()
    const s = getComputedStyle(el)
    return {
      id: Array.from(document.querySelectorAll('*')).indexOf(el),
      etiqueta: `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40)}"`,
      area: r.width * r.height,
      foco: (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none',
      cuerpo: false,
    }
  })
}

async function recorrerConTabulador(page: Page) {
  await page.keyboard.press('Tab')
  const saltar = page.getByRole('link', { name: 'Saltar al contenido' })
  await expect(saltar).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('main#contenido')).toBeFocused()
  const vistos = new Set<number>()
  for (let i = 0; i < 300; i++) {
    await page.keyboard.press('Tab')
    const p = await parada(page)
    if (p.cuerpo || vistos.has(p.id)) return vistos.size
    expect(p.area, `${p.etiqueta} no se ve`).toBeGreaterThan(0)
    expect(p.foco, `${p.etiqueta} no muestra el foco`).toBe(true)
    vistos.add(p.id)
  }
  throw new Error('El tabulador no termina: posible trampa de foco')
}

test.describe('panel con teclado', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
  })

  for (const { correo, pantallas } of PERFILES) {
    test(`${correo}: cada pantalla se recorre con el tabulador`, async ({ page }) => {
      test.setTimeout(120_000)
      await entrarConContrasena(page, correo)
      for (const ruta of pantallas) {
        await page.goto(ruta)
        await page.waitForLoadState('networkidle')
        await page.locator('main#contenido').waitFor()
        const paradas = await recorrerConTabulador(page)
        expect(paradas, ruta).toBeGreaterThan(0)
      }
    })
  }
})

test.describe('panel en oscuro', () => {
  test.use({ colorScheme: 'dark' })

  for (const { correo, pantallas } of PERFILES) {
    test(`${correo}: contraste y accesibilidad en oscuro`, async ({ page }) => {
      test.setTimeout(120_000)
      await entrarConContrasena(page, correo)
      for (const ruta of pantallas) {
        await page.goto(ruta)
        await page.waitForLoadState('networkidle')
        await sinErroresDeAccesibilidad(page)
      }
    })
  }
})
