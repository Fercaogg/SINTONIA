// La agenda: las mismas tres preguntas para estudiante y tutor, o el mensaje
// neutro. Ni el sorteo ni el desajuste se mencionan en la interfaz.

import { expect, test, type Page } from '@playwright/test'
import { entrarConContrasena, salir, sinErroresDeAccesibilidad, sinRayasLargas } from './ayudantes'

async function sinPalabrasInternas(page: Page) {
  const texto = (await page.locator('body').innerText()).toLowerCase()
  for (const palabra of ['sorteo', 'desajuste', 'aleatori', 'inteligencia artificial', ' ia ']) {
    expect(texto, `La pantalla menciona "${palabra}"`).not.toContain(palabra)
  }
}

test('estudiante y tutora ven las mismas tres preguntas', async ({ page }) => {
  await entrarConContrasena(page, 'ana@usal.es')
  const deAna = page.locator('[data-agenda="preguntas"] li')
  await expect(deAna).toHaveCount(3)
  const preguntas = await deAna.allInnerTexts()
  await sinErroresDeAccesibilidad(page)
  await sinPalabrasInternas(page)
  await sinRayasLargas(page)

  await salir(page)
  await entrarConContrasena(page, 'tutora@usal.es')
  if (page.url().endsWith('/consentimiento')) {
    await page.getByLabel(/He leído el texto/).check()
    await page.getByRole('button', { name: 'Aceptar y continuar' }).click()
  }
  const tarjeta = page.locator('section', { has: page.getByRole('heading', { name: 'Ana de ejemplo' }) })
  await expect(tarjeta.locator('[data-agenda="preguntas"] li')).toHaveCount(3)
  expect(await tarjeta.locator('[data-agenda="preguntas"] li').allInnerTexts()).toEqual(preguntas)
})

test('las parejas sin agenda ven el mensaje neutro', async ({ page }) => {
  await entrarConContrasena(page, 'tutor8@usal.es')
  await expect(page.getByRole('heading', { name: 'Agendas para las tutorías' })).toBeVisible()
  const conAgenda = await page.locator('[data-agenda="preguntas"]').count()
  const sinAgenda = await page.locator('[data-agenda="sin_agenda"]').count()
  expect(conAgenda + sinAgenda).toBe(8)
  expect(conAgenda).toBeGreaterThan(0)
  expect(sinAgenda).toBeGreaterThan(0)
  await expect(page.locator('[data-agenda="sin_agenda"]').first()).toHaveText('Esta semana no hay agenda. Sigue como siempre.')
  await sinErroresDeAccesibilidad(page)
  await sinPalabrasInternas(page)
})

test('el investigador ve cuántas parejas recibieron agenda cada semana', async ({ page }) => {
  await entrarConContrasena(page, 'investigador@usal.es')
  await page.goto('/investigacion/calendario')
  const tabla = page.locator('section', { has: page.getByRole('heading', { name: 'Sorteos por semana' }) })
  await expect(tabla.locator('tbody tr')).toHaveCount(2)
  await sinErroresDeAccesibilidad(page)
})
