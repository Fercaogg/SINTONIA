// Fase 4 de las mejoras profesionales: instituciones, dosier y hoja de ruta.

import { expect, test } from '@playwright/test'
import { ipNueva, sinErroresDeAccesibilidad, sinRayasLargas } from './ayudantes'

test('/instituciones: problema, implantación en 4 pasos, qué necesita, qué ve cada perfil y solicitud de demostración', async ({ page }) => {
  await ipNueva(page)
  await page.goto('/instituciones')
  for (const t of ['El problema que resuelve', 'Cómo se implanta en un máster', 'Qué necesita la universidad', 'Qué datos ve cada perfil', 'Solicitar una demostración']) {
    await expect(page.getByRole('heading', { level: 2, name: t })).toBeVisible()
  }
  for (const p of ['Alta del máster', 'Invitación de tutores', 'Códigos para estudiantes', 'Calendario']) {
    await expect(page.getByRole('heading', { level: 3, name: new RegExp(p) })).toBeVisible()
  }
  await expect(page.getByRole('link', { name: 'política de privacidad' })).toBeVisible()
  await sinRayasLargas(page)
  await sinErroresDeAccesibilidad(page)

  const form = page.locator('#solicitar')
  await form.getByLabel('Nombre').fill('Lucía')
  // Correo único: el límite de envíos es por correo y lo comparten las pruebas.
  await form.getByLabel('Correo').fill(`demostracion-${Date.now()}@ejemplo.es`)
  await form.getByLabel('Máster, programa o institución').fill('Máster de ejemplo')
  await form.getByRole('button', { name: 'Solicitar una demostración' }).click()
  await expect(form.getByText('Solicitud enviada.')).toBeVisible()
})

test('si el servidor no puede enviar correos, se ofrece escribir con el mensaje preparado', async ({ page }) => {
  await page.route('**/api/contacto', (r) => r.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'x' }) }))
  await page.goto('/instituciones#solicitar')
  const form = page.locator('#solicitar')
  await form.getByLabel('Nombre').fill('Lucía')
  await form.getByLabel('Correo').fill('lucia@ejemplo.es')
  await form.getByLabel('Máster, programa o institución').fill('Máster de ejemplo')
  await form.getByRole('button', { name: 'Solicitar una demostración' }).click()
  await expect(form.getByText('Ahora mismo el formulario no puede enviar correos.')).toBeVisible()
  const enlace = form.getByRole('link', { name: /Escribir a ferca@usal.es/ })
  await expect(enlace).toHaveAttribute('href', /^mailto:ferca@usal\.es\?subject=SINTON/)
  expect(decodeURIComponent((await enlace.getAttribute('href'))!)).toContain('Institución: Máster de ejemplo')
  // Lo mismo en el formulario de contacto de la portada.
  await page.goto('/#contacto')
  const c = page.locator('#contacto')
  await c.getByLabel('Nombre').fill('Lucía')
  await c.getByLabel('Correo').fill('lucia@ejemplo.es')
  await c.getByLabel('Mensaje').fill('Me interesa para mi máster.')
  await c.getByRole('button', { name: 'Enviar mensaje' }).click()
  await expect(c.getByText('Ahora mismo el formulario no puede enviar correos.')).toBeVisible()
})

test('dosier de una página en PDF, descargable desde /instituciones', async ({ page, request }) => {
  await page.goto('/instituciones')
  await expect(page.getByRole('link', { name: /Dosier en PDF/ })).toHaveAttribute('href', '/dosier/sintonia-dosier.pdf')
  const r = await request.get('/dosier/sintonia-dosier.pdf')
  expect(r.status()).toBe(200)
  const cuerpo = (await r.body()).toString('latin1')
  expect(cuerpo.startsWith('%PDF-')).toBe(true)
  expect(cuerpo.match(/\/Type\s*\/Page[^s]/g)?.length).toBe(1)
  await page.goto('/dosier/imprimir')
  for (const t of ['Cómo funciona', 'Garantías éticas', 'Estado del proyecto', 'Dirección']) await expect(page.getByRole('heading', { name: t })).toBeVisible()
  await expect(page.getByText('Dr. Luis Eduardo Andrade Silva')).toBeVisible()
  await expect(page.getByText('Dra. Ana María Pinto Llorente')).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
})

test('/hoja-de-ruta: tres columnas con lo hecho y lo planificado', async ({ page }) => {
  await page.goto('/hoja-de-ruta')
  for (const t of ['Hecho', 'Durante el piloto (febrero a abril de 2027)', 'Después (TFG y tesis)']) {
    await expect(page.getByRole('heading', { level: 2, name: t })).toBeVisible()
  }
  await sinErroresDeAccesibilidad(page)
})
