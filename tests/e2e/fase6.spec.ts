// Panel de la dirección (con supresión) y descarga de datos de investigación.

import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { entrarConContrasena, sinErroresDeAccesibilidad, sinRayasLargas } from './ayudantes'

test('la dirección ve datos agregados y "datos insuficientes" donde hay menos de 5 personas', async ({ page }) => {
  await entrarConContrasena(page, 'direccion@usal.es')
  await expect(page.getByRole('heading', { name: 'Resumen del máster' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Todos los datos' })).toBeVisible()
  // En los datos locales hay 2 tutores: todo lo calculado sobre tutores está suprimido.
  await expect(page.getByText('Datos insuficientes para garantizar el anonimato').first()).toBeVisible()
  await expect(page.locator('figure')).toHaveCount(4)
  const texto = await page.locator('body').innerText()
  expect(texto).not.toMatch(/[EPT]-[A-Z2-9]{6}|bienestar:|Ana de ejemplo|Tutora de ejemplo/)
  await sinErroresDeAccesibilidad(page)
  await sinRayasLargas(page)
})

test('el investigador descarga el CSV semanal y queda en la auditoría', async ({ page }) => {
  await entrarConContrasena(page, 'investigador@usal.es')
  await page.goto('/investigacion/datos')
  await sinErroresDeAccesibilidad(page)
  const descarga = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Descargar CSV' }).first().click()
  const archivo = await descarga
  expect(archivo.suggestedFilename()).toMatch(/^sintonia_semanal_\d{4}-\d{2}-\d{2}\.csv$/)
  const contenido = readFileSync(await archivo.path(), 'utf8')
  expect(contenido.split('\n')[0]).toMatch(/^id_pareja,id_estudiante,id_tutor,master,tipo_trabajo,semana,/)
  expect(contenido).not.toMatch(/Ana de ejemplo|@usal\.es/)
  await expect(page.getByText('Descarga de los datos semanales').first()).toBeVisible()
})

test('el investigador descarga el pretest y el postest por separado', async ({ page }) => {
  await entrarConContrasena(page, 'investigador@usal.es')
  await page.goto('/investigacion/datos')
  const nombres: string[] = []
  page.on('download', (d) => nombres.push(d.suggestedFilename()))
  await page.getByRole('button', { name: 'Descargar CSV' }).nth(1).click()
  await expect.poll(() => nombres.length).toBe(2)
  expect(nombres.some((n) => n.startsWith('sintonia_pretest_'))).toBe(true)
  expect(nombres.some((n) => n.startsWith('sintonia_postest_'))).toBe(true)
})
