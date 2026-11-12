// Derechos sobre los datos: descarga, retirada y borrado.

import { expect, test } from '@playwright/test'
import { codigosLibres, porProyecto, registrarEstudiante } from './ayudantes'

test('un estudiante descarga sus datos y después se retira o los borra', async ({ page }, info) => {
  const libres = codigosLibres().slice(3)
  const codigo = porProyecto(info, libres)
  const email = porProyecto(info, ['retira@usal.es', 'borra@usal.es'])
  await registrarEstudiante(page, codigo, email, 'Persona de prueba')

  await page.goto('/cuenta')
  const descarga = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Descargar' }).click()
  expect((await descarga).suggestedFilename()).toBe('mis-datos-sintonia.json')

  if (info.project.name === 'movil') {
    await page.getByRole('button', { name: /conservar mis respuestas/ }).click()
    await page.getByLabel('Confirmación').fill('retirarme')
    await page.getByRole('button', { name: 'Confirmar' }).click()
    await expect(page.getByText('Te has retirado del estudio.').first()).toBeVisible()
    // Ya no puede entrar al check-in.
    await page.goto('/estudiante/checkin')
    await expect(page).toHaveURL(/\/cuenta$/)
  } else {
    await page.getByRole('button', { name: /borrar todos mis datos/ }).click()
    const confirmar = page.getByRole('button', { name: 'Confirmar' })
    await page.getByLabel('Confirmación').fill('borra')
    await expect(confirmar).toBeDisabled()
    await page.getByLabel('Confirmación').fill('BORRAR')
    await confirmar.click()
    await expect(page.getByText('Hemos borrado tu cuenta y todos tus datos.')).toBeVisible()
  }
})
