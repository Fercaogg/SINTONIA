// Check-ins de estudiante y tutor, aviso de apoyo y calendario.

import { expect, test } from '@playwright/test'
import { entrarConContrasena, salir, sinErroresDeAccesibilidad, sinRayasLargas } from './ayudantes'

test('el estudiante hace su check-in con 4 toques y un botón, en menos de 60 segundos', async ({ page }) => {
  await entrarConContrasena(page, 'ana@usal.es')
  await expect(page.getByRole('heading', { name: 'Hola, Ana' })).toBeVisible()

  const inicio = Date.now()
  await page.getByRole('link', { name: /Hacer el check-in|Revisar/ }).click()
  await expect(page.getByRole('heading', { name: 'Check-in de la semana 3' })).toBeVisible()
  await sinErroresDeAccesibilidad(page)

  // El bienestar lleva el candado y el texto "Solo lo ves tú".
  await expect(page.getByText('Solo lo ves tú')).toBeVisible()

  const grupos = page.getByRole('radiogroup')
  await expect(grupos).toHaveCount(4)
  await grupos.nth(0).getByRole('radio', { name: '4' }).click()
  await grupos.nth(1).getByRole('radio', { name: '2' }).click()
  await grupos.nth(2).getByRole('radio', { name: /^5/ }).click()
  await grupos.nth(3).getByRole('radio', { name: '2' }).click()

  // Bienestar bajo: mensaje amable y enlace al servicio (pendiente de URL).
  await expect(page.getByText('Gracias por decirlo')).toBeVisible()
  await expect(page.getByText('[PENDIENTE: URL oficial del servicio')).toBeVisible()

  // Un único botón de envío.
  const enviar = page.getByRole('button', { name: /^(Enviar|Guardar cambios)$/ })
  await expect(enviar).toHaveCount(1)
  await enviar.click()
  await expect(page.getByRole('heading', { name: 'Check-in guardado' })).toBeVisible()
  expect(Date.now() - inicio).toBeLessThan(60_000)
  await sinRayasLargas(page)

  // Se puede revisar y cambiar.
  await page.getByRole('button', { name: 'Revisar mis respuestas' }).click()
  await expect(page.getByRole('radiogroup').nth(0).getByRole('radio', { name: '4' })).toHaveAttribute('aria-checked', 'true')
  await expect(page.getByRole('button', { name: 'Guardar cambios' })).toBeVisible()
})

test('la escala se puede usar solo con el teclado', async ({ page }) => {
  await entrarConContrasena(page, 'ana@usal.es')
  await page.goto('/estudiante/checkin')
  const grupo = page.getByRole('radiogroup').first()
  await grupo.getByRole('radio').first().focus()
  await page.keyboard.press('End')
  await expect(grupo.getByRole('radio', { name: /^5/ })).toHaveAttribute('aria-checked', 'true')
  await page.keyboard.press('ArrowLeft')
  await expect(grupo.getByRole('radio', { name: '4' })).toHaveAttribute('aria-checked', 'true')
  await expect(grupo.getByRole('radio', { name: '4' })).toBeFocused()
})

test('el histórico muestra las semanas del estudiante', async ({ page }) => {
  await entrarConContrasena(page, 'ana@usal.es')
  await page.goto('/estudiante/historial')
  await expect(page.getByRole('heading', { name: 'Semana 1' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Semana 2' })).toBeVisible()
  await sinErroresDeAccesibilidad(page)
})

test('un tutor con 8 estudiantes responde con 8 toques y un botón, en menos de 60 segundos', async ({ page }) => {
  await entrarConContrasena(page, 'tutor8@usal.es')
  await expect(page.getByRole('heading', { name: /Hola/ })).toBeVisible()

  const inicio = Date.now()
  await page.getByRole('link', { name: /Hacer el check-in|Revisar/ }).click()
  await expect(page.getByRole('heading', { name: 'Check-in de la semana 3' })).toBeVisible()
  await sinErroresDeAccesibilidad(page)

  const tarjetas = page.locator('form li')
  await expect(tarjetas).toHaveCount(8)
  for (let i = 0; i < 8; i++) {
    await tarjetas.nth(i).getByRole('radiogroup').first().getByRole('radio', { name: String((i % 3) + 2) }).click()
  }
  await expect(page.getByText('8 de 8 estudiantes')).toBeVisible()
  await page.getByRole('button', { name: /^(Enviar todo|Guardar cambios)$/ }).click()
  await expect(page.getByRole('heading', { name: 'Check-in guardado' })).toBeVisible()
  expect(Date.now() - inicio).toBeLessThan(60_000)

  // El tutor nunca ve el bienestar ni las respuestas de sus estudiantes.
  const texto = await page.locator('body').innerText()
  expect(texto).not.toMatch(/bienestar/i)
})

test('el aviso de apoyo llega a la dirección, con nombre solo si se autoriza', async ({ page }) => {
  await entrarConContrasena(page, 'ana@usal.es')
  await page.goto('/estudiante/apoyo')
  await sinErroresDeAccesibilidad(page)
  const boton = page.getByRole('button', { name: 'Enviar aviso a la dirección' })
  await boton.click()
  await expect(page.getByText('Aviso enviado a la dirección del máster.')).toBeVisible()
  await page.getByRole('button', { name: 'Compartir también mi nombre' }).click()

  await salir(page)
  await entrarConContrasena(page, 'direccion@usal.es')
  await page.goto('/direccion/avisos')
  await expect(page.getByText('Ana de ejemplo').first()).toBeVisible()
  await sinErroresDeAccesibilidad(page)
  await sinRayasLargas(page)
})

test('el investigador ve el calendario con la semana abierta resaltada', async ({ page }) => {
  await entrarConContrasena(page, 'investigador@usal.es')
  await page.goto('/investigacion/calendario')
  await expect(page.getByRole('heading', { name: 'Calendario del estudio' })).toBeVisible()
  await expect(page.locator('tbody tr')).toHaveCount(10)
  await expect(page.locator('tbody tr.bg-brand-50')).toContainText('3')
  await sinErroresDeAccesibilidad(page)
})
