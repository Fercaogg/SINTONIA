// Pantallas reales del panel para el apartado «La aplicación por dentro» de
// la portada, en modo demostración (datos ficticios): npm run pantallas.
// Se guardan en .local/pantallas y scripts/convertir-pantallas.py las deja en
// public/portada (WebP, 1600 x 1000).

import { mkdirSync } from 'node:fs'
import { test, type Browser, type Page } from '@playwright/test'
import { entrarComo, type Perfil } from './ayudantes'

const carpeta = '.local/pantallas'

async function foto(browser: Browser, perfil: Perfil, nombre: string, ruta: string, antes?: (page: Page) => Promise<void>) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.25, locale: 'es-ES', timezoneId: 'Europe/Madrid', reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await entrarComo(page, perfil)
  await page.goto(ruta)
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  await page.addStyleTag({ content: '[data-banda-entorno] { display: none !important }' })
  if (antes) await antes(page)
  await page.mouse.move(0, 0)
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${carpeta}/${nombre}.png` })
  await ctx.close()
}

test('pantallas de la portada', async ({ browser }) => {
  test.setTimeout(120_000)
  mkdirSync(carpeta, { recursive: true })
  await foto(browser, 'Estudiante', 'app-estudiante', '/estudiante')
  await foto(browser, 'Estudiante', 'app-checkin', '/estudiante/checkin', async (page) => {
    const grupos = page.getByRole('radiogroup')
    await grupos.nth(0).getByRole('radio', { name: '4' }).click()
    await grupos.nth(1).getByRole('radio', { name: '3' }).click()
  })
  await foto(browser, 'Tutor/a', 'app-tutor', '/tutor', async (page) => {
    const agendas = page.getByRole('heading', { name: 'Agendas para las tutorías' })
    if (await agendas.count()) await agendas.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 24))
  })
  await foto(browser, 'Dirección del máster', 'app-direccion', '/direccion')
})
