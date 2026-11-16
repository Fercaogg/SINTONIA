// Fase 5: versión en inglés de las páginas públicas (/en).

import { expect, test } from '@playwright/test'
import { sinErroresDeAccesibilidad, sinRayasLargas } from './ayudantes'

const PAGINAS: [string, string][] = [
  ['/en', 'Supporting academic work'],
  ['/en/how-it-works', 'How it works and your data'],
  ['/en/research', 'The research'],
  ['/en/institutions', "SINTONÍA in your Master's programme"],
  ['/en/security', 'Security'],
  ['/en/accessibility', 'Accessibility statement'],
  ['/en/roadmap', 'Roadmap'],
  ['/en/status', 'Platform status'],
  ['/en/changelog', 'Changelog'],
]

test('las páginas en inglés: idioma, título, sin desbordes y revisión de accesibilidad', async ({ page }) => {
  for (const [ruta, titulo] of PAGINAS) {
    await page.goto(ruta)
    await page.waitForLoadState('networkidle')
    expect(await page.evaluate(() => document.documentElement.lang), ruta).toBe('en')
    await expect(page.getByRole('heading', { level: 1 }), ruta).toContainText(titulo)
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(desborde, `${ruta} es más ancha que la pantalla`).toBeLessThanOrEqual(0)
    const texto = await page.locator('body').innerText()
    expect(texto, ruta).not.toContain('[PENDIENTE')
    await sinRayasLargas(page)
    await sinErroresDeAccesibilidad(page)
  }
})

test('selector de idioma: de español a inglés y vuelta, en la misma página', async ({ page }) => {
  await page.goto('/seguridad')
  await page.getByRole('link', { name: 'View this page in English' }).click()
  await expect(page).toHaveURL(/\/en\/security$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Security')
  await page.getByRole('link', { name: 'Ver esta página en español' }).click()
  await expect(page).toHaveURL(/\/seguridad$/)
  expect(await page.evaluate(() => document.documentElement.lang)).toBe('es')
  // Una página sin versión en inglés no muestra el selector.
  await page.goto('/privacidad')
  await expect(page.getByRole('link', { name: 'View this page in English' })).toHaveCount(0)
})

test('en inglés, los enlaces van a la versión inglesa o avisan de que la página está en español', async ({ page }) => {
  await page.goto('/en')
  const pie = page.getByRole('navigation', { name: 'Project information' })
  await expect(pie.getByRole('link', { name: 'Security' })).toHaveAttribute('href', '/en/security')
  await expect(pie.getByRole('link', { name: /Privacy \(in Spanish\)/ })).toHaveAttribute('href', '/privacidad')
  // La demostración del inicio funciona en inglés, con preguntas en inglés.
  const demo = page.locator('#demostracion')
  await demo.getByLabel('Student').fill('5')
  await demo.getByLabel('Supervisor').fill('2')
  await expect(demo.getByText('points of difference: there is a mismatch.', { exact: false })).toBeVisible()
  await expect(demo.getByRole('listitem')).toHaveCount(3)
})

test('las páginas en inglés se sirven con su título, hreflang e imagen para compartir', async ({ request }) => {
  const html = await (await request.get('/en/security')).text()
  expect(html).toContain('<html lang="en">')
  expect(html).toContain('<title>Security · SINTONÍA</title>')
  expect(html).toMatch(/<link rel="alternate" hreflang="es" href="https:\/\/[^"]+\/seguridad" \/>/)
  expect(html).toMatch(/og:image" content="https:\/\/[^"]+\/og\/en-seguridad\.png"/)
  const es = await (await request.get('/seguridad')).text()
  expect(es).toMatch(/<link rel="alternate" hreflang="en" href="https:\/\/[^"]+\/en\/security" \/>/)
})
