// Fase 3 de las mejoras profesionales: credibilidad académica.

import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { sinErroresDeAccesibilidad, sinRayasLargas } from './ayudantes'

const version = JSON.parse(readFileSync('package.json', 'utf8')).version as string

test('/investigacion: todos los apartados, sin [PENDIENTE] y sin enlace de OSF mientras no exista', async ({ page }) => {
  await page.goto('/investigacion')
  for (const [id, titulo] of [
    ['pregunta', 'Pregunta de investigación'], ['hipotesis', 'Hipótesis'], ['diseno', 'Diseño'], ['garantias', 'Garantías'],
    ['calendario', 'Calendario'], ['participar', 'Participar en el piloto'], ['citar', 'Cómo citar SINTONÍA'], ['referencias', 'Referencias'],
  ]) {
    await expect(page.locator(`#${id}`)).toHaveText(titulo)
  }
  for (const h of ['H1', 'H2', 'H3']) await expect(page.getByText(h, { exact: true })).toBeVisible()
  await expect(page.locator('#diseno').locator('..')).toContainText('probabilidad 0,5')
  await expect(page.locator('a[href*="osf.io"]')).toHaveCount(0)
  // "Publicaciones y difusión" está oculta mientras no haya ninguna.
  await expect(page.locator('#publicaciones')).toHaveCount(0)
  await expect(page.locator('#referencias').locator('..').locator('li')).toHaveCount(7)
  const texto = await page.locator('body').innerText()
  expect(texto).not.toContain('[PENDIENTE')
  await sinRayasLargas(page)
  await sinErroresDeAccesibilidad(page)
})

test('/investigacion: "Cómo citar" en APA 7 con versión y año, y botón para copiar', async ({ page, context, browserName }) => {
  if (browserName === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/investigacion#citar')
  const cita = page.locator('#cita-apa')
  await expect(cita).toContainText(`Martín Vaquero, F. (2026). SINTONÍA (Versión ${version})`)
  await expect(cita.locator('i')).toHaveText('SINTONÍA')
  await page.getByRole('button', { name: 'Copiar la cita' }).click()
  await expect(page.getByRole('button', { name: 'Copiada' })).toBeVisible()
  const copiado = await page.evaluate(() => navigator.clipboard.readText().catch(() => ''))
  if (copiado) expect(copiado).toContain(`(Versión ${version})`)
})

test('kit para participantes: tres documentos para leer o descargar en PDF, marcados como borrador', async ({ page, request }) => {
  await page.goto('/participantes')
  const tarjetas = page.locator('main li.card')
  await expect(tarjetas).toHaveCount(3)
  for (const doc of ['hoja-informativa', 'consentimiento', 'preguntas']) {
    const r = await request.get(`/kit/${doc}.pdf`)
    expect(r.status(), doc).toBe(200)
    const cuerpo = await r.body()
    expect(cuerpo.subarray(0, 5).toString(), doc).toBe('%PDF-')
    await expect(page.locator(`a[href="/kit/${doc}.pdf"]`)).toHaveAttribute('download', `sintonia-${doc}.pdf`)
  }
  await tarjetas.first().getByText('Leer aquí').click()
  await expect(tarjetas.first()).toContainText('Pendiente de revisión por el Comité de Ética')
  await expect(tarjetas.first()).toContainText('psicologia@usal.es')
  await sinRayasLargas(page)
  await sinErroresDeAccesibilidad(page)
})

test('las páginas para imprimir no aparecen en buscadores', async ({ page }) => {
  await page.goto('/participantes/imprimir/consentimiento')
  await expect(page.getByRole('heading', { level: 1, name: 'Consentimiento informado' })).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
})
