// Flujos de acceso: registro con código, enlace por correo, consentimiento
// y redirecciones por perfil.

import { expect, test } from '@playwright/test'
import { abrirMenuSiMovil, sinErroresDeAccesibilidad, codigosLibres, entrarConContrasena, ipNueva, porProyecto, sinRayasLargas, ultimoEnlace } from './ayudantes'

test.beforeEach(async ({ page }) => {
  await ipNueva(page)
})

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

const MENSAJE_REGISTRO = 'No hemos podido completar el registro. Revisa el código y que el correo sea el institucional de la Universidad.'

test('un código inventado y un correo no institucional dan el mismo mensaje', async ({ page }, info) => {
  await page.goto('/registro')
  await page.getByLabel('Código de acceso').fill('ZZZZZZZZZZZZ')
  await page.getByLabel('Tu nombre').fill('Alguien')
  await page.getByLabel('Correo institucional').fill('alguien@usal.es')
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page.getByRole('alert')).toHaveText(MENSAJE_REGISTRO)

  await page.getByLabel('Código de acceso').fill(codigosLibres()[2])
  await page.getByLabel('Correo institucional').fill(porProyecto(info, ['a@gmail.com', 'b@gmail.com']))
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page.getByRole('alert')).toHaveText(MENSAJE_REGISTRO)
})

test('al pedir el enlace, la respuesta es la misma exista o no la cuenta', async ({ page }) => {
  const textos: string[] = []
  for (const email of ['ana@usal.es', 'nadie.registrado@usal.es']) {
    await page.goto('/acceso')
    await page.getByLabel('Correo institucional').fill(email)
    await page.getByRole('button', { name: 'Enviarme el enlace' }).click()
    const estado = page.getByRole('status')
    await expect(estado).toContainText('Si hay una cuenta con')
    textos.push((await estado.innerText()).replace(email, 'CORREO'))
  }
  expect(textos[0]).toBe(textos[1])
})

test('tras muchos intentos con el mismo correo, el registro se detiene un rato', async ({ page }, info) => {
  const email = porProyecto(info, ['insistente.m@usal.es', 'insistente.e@usal.es'])
  await page.goto('/registro')
  await page.getByLabel('Tu nombre').fill('Alguien')
  await page.getByLabel('Correo institucional').fill(email)
  for (let i = 0; i < 5; i++) {
    await ipNueva(page)
    await page.getByLabel('Código de acceso').fill(`ZZZZZZZZZZZ${i}`)
    await page.getByRole('button', { name: 'Continuar' }).click()
    await expect(page.getByRole('alert')).toHaveText(MENSAJE_REGISTRO)
  }
  await ipNueva(page)
  await page.getByLabel('Código de acceso').fill('ZZZZZZZZZZZ9')
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page.getByRole('alert')).toContainText('demasiados intentos')
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
  await expect(page).toHaveURL(/\/(consentimiento\/aceptar|tutor)$/)
  if (page.url().endsWith('/consentimiento/aceptar')) {
    await page.getByLabel(/He leído el texto y acepto participar/).check()
    await page.getByRole('button', { name: 'Aceptar y continuar' }).click()
  }
  await expect(page).toHaveURL(/\/tutor$/)
  await expect(page.getByText('Ana de ejemplo').first()).toBeVisible()
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
  await sinErroresDeAccesibilidad(page)
})

test('las pantallas públicas no se salen por los lados y pasan la revisión de accesibilidad', async ({ page }) => {
  for (const ruta of ['/', '/como-funciona', '/acceso', '/registro', '/privacidad', '/aviso-legal', '/cookies', '/consentimiento', '/no-existe']) {
    await page.goto(ruta)
    await page.waitForLoadState('networkidle')
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(desborde, `La página ${ruta} es más ancha que la pantalla`).toBeLessThanOrEqual(0)
    await sinErroresDeAccesibilidad(page)
  }
})

test('las páginas públicas nunca muestran "[PENDIENTE]" y enlazan las páginas legales', async ({ page }) => {
  for (const ruta of ['/', '/como-funciona', '/privacidad', '/aviso-legal', '/cookies', '/consentimiento', '/acceso', '/registro']) {
    await page.goto(ruta)
    await page.waitForLoadState('networkidle')
    const texto = await page.locator('body').innerText()
    expect(texto, ruta).not.toContain('[PENDIENTE')
    expect(texto, ruta).not.toContain('PENDIENTE:')
  }
  await page.goto('/como-funciona')
  await expect(page.getByText('En elaboración. Pendiente de revisión por el Comité de Ética de la Universidad de Salamanca.').first()).toBeVisible()
  const pie = page.getByRole('navigation', { name: 'Información legal' })
  for (const enlace of ['Privacidad', 'Aviso legal', 'Cookies', 'Consentimiento']) {
    await expect(pie.getByRole('link', { name: enlace })).toBeVisible()
  }
  await expect(page.getByText('Prototipo del Trabajo Fin de Máster de Fernando Martín Vaquero · Universidad de Salamanca')).toBeVisible()
})

test('las páginas privadas piden no aparecer en buscadores', async ({ page }) => {
  await page.goto('/privacidad')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow')
  await page.goto('/estudiante')
  await expect(page).toHaveURL(/\/acceso/)
  await page.goto('/no-existe')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
})
