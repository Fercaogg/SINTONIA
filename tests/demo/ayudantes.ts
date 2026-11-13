import { expect, type Page } from '@playwright/test'
export { sinErroresDeAccesibilidad, sinRayasLargas } from '../e2e/ayudantes'

export type Perfil = 'Estudiante' | 'Tutor/a' | 'Dirección del máster' | 'Investigación'

/** Entra con el acceso rápido de la demostración. */
export async function entrarComo(page: Page, perfil: Perfil) {
  await page.goto('/acceso')
  await page.getByRole('button', { name: new RegExp(`^${perfil.replace('/', '\\/')}`) }).click()
  await page.waitForURL((u) => !u.pathname.startsWith('/acceso'))
}

export async function abrirMenuSiMovil(page: Page) {
  const boton = page.getByRole('button', { name: 'Abrir el menú' })
  if (await boton.isVisible()) await boton.click()
}

/** Ninguna pantalla más ancha que el móvil. */
export async function sinDesbordeLateral(page: Page) {
  const desborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(desborde, `${page.url()} es más ancha que la pantalla`).toBeLessThanOrEqual(0)
}

/**
 * Botones, campos y opciones de al menos 44 x 44 px (los enlaces dentro de
 * un texto quedan fuera, como permiten las WCAG).
 */
export async function objetivosTactiles(page: Page) {
  const pequenos = await page.evaluate(() => {
    const visibles = [...document.querySelectorAll<HTMLElement>('main button, main input:not([type=checkbox]):not([type=radio]), main select, main [role=radio], main [role=switch], main a.btn-primary, main a.btn-secondary, header button')]
      .filter((el) => el.offsetParent !== null && !el.closest('[aria-hidden=true]'))
    return visibles
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.height < 43.5 || r.width < 43.5)
      .map(({ el, r }) => `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`)
  })
  expect(pequenos, `Controles de menos de 44 px en ${page.url()}`).toEqual([])
}
