// Flujos de acceso: registro con código, enlace por correo, consentimiento
// y redirecciones por perfil.

import { expect, test } from '@playwright/test'
import { abrirMenuSiMovil, sinErroresDeAccesibilidad, codigosLibres, entrarConContrasena, porProyecto, sinRayasLargas, ultimoEnlace } from './ayudantes'

test('un estudiante se registra con su código, acepta el consentimiento y llega a su panel', async ({ page }, info) => {
  const codigo = porProyecto(info, codigosLibres())
  const email = porProyecto(info, ['lucia.movil@usal.es', 'lucia.escritorio@usal.es'])

  await page.goto('/')
  await sinRayasLargas(page)
  await page.getByRole('link', { name: 'Tengo un código' }).click()

  await page.getByLabel('Código de acceso').fill(codigo.toLowerCase())
  await page.getByLabel('Tu nombre').fill('Lucía Prueba')
  await page.getByLabel('Correo institucional').fill(email)
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page.getByRole('heading', { name: 'Revisa tu correo' })).toBeVisible()

  await page.goto(await ultimoEnlace(email))
  await expect(page.getByRole('heading', { name: 'Consentimiento informado' })).toBeVisible()
  await expect(page.locator('[data-pendiente="true"]').first()).toBeVisible()
  await sinRayasLargas(page)

  const aceptar = page.getByRole('button', { name: 'Aceptar y continuar' })
  await expect(aceptar).toBeDisabled()
  await page.getByLabel(/He leído el texto y acepto participar/).check()
  await aceptar.click()

  await expect(page).toHaveURL(/\/estudiante$/)
  await expect(page.getByRole('heading', { name: 'Hola, Lucía' })).toBeVisible()
  await sinRayasLargas(page)
})

test('un código inventado muestra un mensaje claro', async ({ page }) => {
  await page.goto('/registro')
  await page.getByLabel('Código de acceso').fill('ZZZZZZZZ')
  await page.getByLabel('Tu nombre').fill('Alguien')
  await page.getByLabel('Correo institucional').fill('alguien@usal.es')
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page.getByRole('alert')).toContainText('El código no es válido')
})

test('un correo no institucional se rechaza', async ({ page }, info) => {
  const codigo = codigosLibres()[2]
  await page.goto('/registro')
  await page.getByLabel('Código de acceso').fill(codigo)
  await page.getByLabel('Tu nombre').fill('Alguien')
  await page.getByLabel('Correo institucional').fill(porProyecto(info, ['a@gmail.com', 'b@gmail.com']))
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page.getByRole('alert')).toContainText('correo institucional')
})

test('sin sesión, las páginas privadas llevan a iniciar sesión', async ({ page }) => {
  await page.goto('/estudiante')
  await expect(page).toHaveURL(/\/acceso/)
  await page.goto('/investigacion')
  await expect(page).toHaveURL(/\/acceso/)
})

test('la dirección no puede abrir las pantallas de investigación', async ({ page }) => {
  await entrarConContrasena(page, 'direccion@usal.es')
  await expect(page).toHaveURL(/\/direccion$/)
  await expect(page.getByRole('heading', { name: 'Resumen del máster' })).toBeVisible()
  await page.goto('/investigacion')
  await expect(page).toHaveURL(/\/direccion$/)
})

test('la tutora ve a sus estudiantes y los códigos que puede repartir', async ({ page }) => {
  await entrarConContrasena(page, 'tutora@usal.es')
  // La primera vez hay que aceptar el consentimiento.
  await expect(page).toHaveURL(/\/(consentimiento|tutor)$/)
  if (page.url().endsWith('/consentimiento')) {
    await page.getByLabel(/He leído el texto y acepto participar/).check()
    await page.getByRole('button', { name: 'Aceptar y continuar' }).click()
  }
  await expect(page).toHaveURL(/\/tutor$/)
  await expect(page.getByText('Ana de ejemplo')).toBeVisible()
  await abrirMenuSiMovil(page)
  await page.getByRole('link', { name: 'Códigos para tus estudiantes' }).click()
  await expect(page.getByRole('heading', { name: 'Códigos para tus estudiantes' })).toBeVisible()
  await sinRayasLargas(page)
})

test('el investigador crea un máster y códigos', async ({ page }, info) => {
  await entrarConContrasena(page, 'investigador@usal.es')
  await expect(page).toHaveURL(/\/investigacion$/)
  const nombre = porProyecto(info, ['Máster móvil', 'Máster escritorio'])
  await page.getByLabel('Nombre', { exact: true }).fill(nombre)
  await page.getByRole('button', { name: 'Crear máster' }).click()
  await expect(page.getByRole('heading', { name: `Crear códigos para ${nombre}` })).toBeVisible()
  await page.getByLabel('Cantidad').fill('2')
  await page.getByLabel('Etiqueta interna (opcional)').fill('Tutor 1')
  await page.getByRole('button', { name: 'Crear códigos' }).click()
  await expect(page.getByText('Códigos creados:')).toBeVisible()
  await expect(page.locator('tbody tr')).toHaveCount(2)
  await sinRayasLargas(page)
})

test('las pantallas públicas no se salen por los lados y pasan la revisión de accesibilidad', async ({ page }) => {
  for (const ruta of ['/', '/como-funciona', '/acceso', '/registro', '/no-existe']) {
    await page.goto(ruta)
    await page.waitForLoadState('networkidle')
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(desborde, `La página ${ruta} es más ancha que la pantalla`).toBeLessThanOrEqual(0)
    await sinErroresDeAccesibilidad(page)
  }
})
