// Fase 1 de las mejoras profesionales: páginas de confianza.

import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { sinErroresDeAccesibilidad, sinRayasLargas } from './ayudantes'

const version = JSON.parse(readFileSync('package.json', 'utf8')).version as string

test('/seguridad: datos en la UE, cifrado, quién ve qué, borrado y fecha de revisión', async ({ page }) => {
  await page.goto('/seguridad')
  await expect(page.getByRole('heading', { level: 1, name: 'Seguridad' })).toBeVisible()
  await expect(page.getByText(/Última revisión: \d+ de \w+ de 20\d\d/)).toBeVisible()
  await expect(page.locator('#donde').locator('..')).toContainText('Fráncfort')
  await expect(page.getByRole('link', { name: 'Quién ve qué' })).toHaveAttribute('href', '/como-funciona#quien')
  await expect(page.locator('#borrado').locator('..')).toContainText('Retirarme y borrar todos mis datos y mi cuenta')
  // Las copias de seguridad aún no están confirmadas: texto digno, nunca "[PENDIENTE]".
  await expect(page.locator('#copias').locator('..')).toContainText('En elaboración')
  await sinRayasLargas(page)
  await sinErroresDeAccesibilidad(page)
})

test('/accesibilidad: nivel real, limitaciones y contacto', async ({ page }) => {
  await page.goto('/accesibilidad')
  await expect(page.getByText('parcialmente conforme')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Limitaciones conocidas' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'ferca@usal.es' }).first()).toBeVisible()
  await sinErroresDeAccesibilidad(page)
})

test('/novedades: la versión actual es la de package.json y aparece en el pie', async ({ page }) => {
  await page.goto('/novedades')
  await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(`Versión ${version}`)
  await expect(page.getByText(`Versión ${version}`, { exact: true })).toBeVisible()
  expect(await page.locator('time').count()).toBeGreaterThanOrEqual(4)
  await sinErroresDeAccesibilidad(page)
})

test('/estado: comprobación real del servidor, la base de datos y el acceso', async ({ page, request }) => {
  const r = await request.get('/api/estado')
  const cuerpo = await r.json()
  expect(cuerpo).toMatchObject({ ok: true, servidor: 'ok', baseDeDatos: 'ok', acceso: 'ok' })
  expect(JSON.stringify(cuerpo)).not.toMatch(/supabase|key|clave/i)
  await page.goto('/estado')
  await expect(page.getByText('Todo funciona con normalidad.')).toBeVisible()
  await expect(page.getByText('Funciona', { exact: true })).toHaveCount(3)
  await page.getByRole('button', { name: 'Volver a comprobar' }).click()
  await expect(page.getByText('Todo funciona con normalidad.')).toBeVisible()
  await sinErroresDeAccesibilidad(page)
})

test('/estado: si el servidor no responde, lo dice sin romperse', async ({ page }) => {
  await page.route('**/api/estado', (ruta) => ruta.abort())
  await page.goto('/estado')
  await expect(page.getByText('El servidor no responde ahora mismo.')).toBeVisible()
})
