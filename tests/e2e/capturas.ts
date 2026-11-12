// Genera las capturas de pantalla de docs/capturas (npm run capturas).
// No es un test: solo recorre las pantallas y las fotografía.

import { test, type Page } from '@playwright/test'
import { codigosLibres, entrarConContrasena, porProyecto, ultimoEnlace } from './ayudantes'

const carpeta = 'docs/capturas'

async function foto(page: Page, nombre: string, proyecto: string) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: `${carpeta}/${proyecto}/${nombre}.png`, fullPage: true })
}

test('pantallas públicas y de acceso', async ({ page }, info) => {
  const p = info.project.name
  await page.goto('/')
  await foto(page, '01-inicio', p)
  await page.goto('/como-funciona')
  await foto(page, '02-como-funciona', p)
  await page.goto('/acceso')
  await foto(page, '03-acceso', p)
  await page.goto('/registro')
  await page.getByLabel('Código de acceso').fill('ZZZZZZZZ')
  await page.getByLabel('Tu nombre').fill('Marta')
  await page.getByLabel('Correo institucional').fill('marta@usal.es')
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByRole('alert').waitFor()
  await foto(page, '04-registro-error', p)

  const email = porProyecto(info, ['marta.m@usal.es', 'marta.e@usal.es'])
  await page.getByLabel('Código de acceso').fill(porProyecto(info, codigosLibres()))
  await page.getByLabel('Correo institucional').fill(email)
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByRole('heading', { name: 'Revisa tu correo' }).waitFor()
  await foto(page, '05-registro-revisa-correo', p)

  await page.goto(await ultimoEnlace(email))
  await page.getByRole('heading', { name: 'Consentimiento informado' }).waitFor()
  await foto(page, '06-consentimiento', p)
  await page.getByLabel(/He leído el texto/).check()
  await page.getByRole('button', { name: 'Aceptar y continuar' }).click()
  await page.getByRole('heading', { name: /Hola/ }).waitFor()
  await foto(page, '07-estudiante-inicio', p)
})

test('pantallas de tutora, dirección e investigación', async ({ page }, info) => {
  const p = info.project.name
  await entrarConContrasena(page, 'tutora@usal.es')
  await page.waitForURL(/\/(consentimiento|tutor)$/)
  if (page.url().endsWith('/consentimiento')) {
    await page.getByLabel(/He leído el texto/).check()
    await page.getByRole('button', { name: 'Aceptar y continuar' }).click()
  }
  await page.getByRole('heading', { name: 'Tus estudiantes' }).waitFor()
  await foto(page, '08-tutor-inicio', p)
  await page.goto('/tutor/codigos')
  await page.getByRole('heading', { name: 'Códigos para tus estudiantes' }).waitFor()
  await foto(page, '09-tutor-codigos', p)
  if (p === 'movil') {
    await page.getByRole('button', { name: 'Abrir el menú' }).click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${carpeta}/${p}/10-tutor-menu-movil.png` })
    await page.keyboard.press('Escape')
  }

  await page.context().clearCookies()
  await page.evaluate(() => localStorage.clear())
  await entrarConContrasena(page, 'direccion@usal.es')
  await page.getByRole('heading', { name: 'Resumen del máster' }).waitFor()
  await foto(page, '11-direccion-inicio', p)

  await page.evaluate(() => localStorage.clear())
  await entrarConContrasena(page, 'investigador@usal.es')
  await page.getByRole('heading', { name: 'Másteres y códigos' }).waitFor()
  await page.getByRole('heading', { name: 'Códigos de este máster' }).waitFor()
  await foto(page, '12-investigacion-masters', p)
})
