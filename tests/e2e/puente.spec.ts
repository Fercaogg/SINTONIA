// Puente al doctorado por puertas: seis cajas en la entrada y, al pulsar
// cada una, toda su información.

import { expect, test } from '@playwright/test'
import { entrarConContrasena, sinErroresDeAccesibilidad, sinRayasLargas } from './ayudantes'

const PUERTAS: [string, RegExp][] = [
  ['Becas y contratos', /convocatorias?$/],
  ['Plazos', /abierta|próxima/i],
  ['Qué necesito', /^6 pasos$/],
  ['Tipos de doctorado', /^4 modalidades$/],
  ['Congresos y eventos', /próximos?|Ninguno/],
  ['Normativa', /documentos? oficiales?$/],
]

test('la entrada muestra seis puertas, cada una con lo que hay dentro', async ({ page }) => {
  await entrarConContrasena(page, 'ana@usal.es')
  await page.goto('/estudiante/puente')
  await expect(page.getByRole('switch', { name: 'Avisarme de los plazos en la agenda' })).toBeVisible()
  const puertas = page.getByRole('navigation', { name: 'Apartados de Puente al doctorado' }).getByRole('link')
  await expect(puertas).toHaveCount(6)
  for (const [titulo, resumen] of PUERTAS) {
    const puerta = puertas.filter({ hasText: titulo })
    await expect(puerta).toHaveCount(1)
    await expect(puerta.locator('span').last()).toHaveText(resumen)
  }
  await sinErroresDeAccesibilidad(page)
  await sinRayasLargas(page)
})

test('al pulsar cada puerta se ve todo su contenido y se puede volver', async ({ page }) => {
  await entrarConContrasena(page, 'ana@usal.es')
  for (const [titulo] of PUERTAS) {
    await page.goto('/estudiante/puente')
    await page.getByRole('link', { name: new RegExp(titulo) }).first().click()
    await expect(page.getByRole('heading', { level: 1, name: titulo })).toBeVisible()
    await expect(page).toHaveTitle(`${titulo} · Puente al doctorado · SINTONÍA`)
    await sinErroresDeAccesibilidad(page)
    await sinRayasLargas(page)
    // Desde cada puerta se llega a las otras cinco.
    await expect(page.getByRole('navigation', { name: 'Otros apartados de Puente al doctorado' }).getByRole('link')).toHaveCount(5)
  }
  await page.getByRole('link', { name: 'Puente al doctorado', exact: true }).filter({ visible: true }).last().click()
  await expect(page).toHaveURL(/\/estudiante\/puente$/)
})

test('Plazos ordena las convocatorias por su momento y lleva el interruptor', async ({ page }) => {
  await entrarConContrasena(page, 'ana@usal.es')
  await page.goto('/estudiante/puente/plazos')
  await expect(page.getByRole('switch', { name: 'Avisarme de los plazos en la agenda' })).toBeVisible()
  // La convocatoria ficticia de la base de datos local abre dentro de 7 días.
  const proximas = page.getByRole('region', { name: /Abren próximamente/ })
  await expect(proximas.getByRole('heading', { name: 'Convocatoria de ejemplo (ficticia)' })).toBeVisible()
  await expect(proximas.getByText('Abre pronto').first()).toBeVisible()
  await expect(page.getByRole('region', { name: /Abiertas ahora/ })).toBeVisible()
})

test('Qué necesito y Tipos citan su fuente oficial y marcan lo que falta por comprobar', async ({ page }) => {
  await entrarConContrasena(page, 'ana@usal.es')
  await page.goto('/estudiante/puente/necesito')
  await expect(page.getByRole('listitem').filter({ hasText: 'Una persona que dirija tu tesis' })).toContainText('hasta tres directores')
  await expect(page.getByRole('link', { name: /Reglamento de Doctorado de la USAL/ }).first()).toHaveAttribute('href', /bocyl\.jcyl\.es/)
  // Lo comprobado en el BOE (texto consolidado, julio de 2023) y lo que falta.
  await expect(page.getByRole('listitem').filter({ hasText: 'Un título que dé acceso' })).toContainText('300 créditos ECTS')
  await expect(page.locator('[data-pendiente="true"]')).toHaveCount(1)
  await expect(page.locator('[data-pendiente="true"]')).toContainText('admisión en la Escuela de Doctorado de la USAL')
  await page.goto('/estudiante/puente/tipos')
  await expect(page.getByRole('listitem').filter({ hasText: 'Tiempo completo' })).toContainText('cuatro años como máximo')
  await expect(page.getByRole('link', { name: /artículo 15\.1/ })).toHaveAttribute('href', /boe\.es/)
  await expect(page.locator('[data-pendiente="true"]')).toHaveCount(0)
})

test('un congreso anotado en el calendario aparece en Congresos y eventos', async ({ page }, info) => {
  await entrarConContrasena(page, 'ana@usal.es')
  const titulo = `Congreso de prueba ${info.project.name}`
  const fecha = new Date(Date.now() + 20 * 86_400_000).toISOString().slice(0, 10)
  await page.goto('/calendario')
  await page.getByRole('button', { name: 'Añadir fecha' }).click()
  await page.getByRole('group', { name: 'Tipo' }).getByText('Congreso', { exact: true }).click()
  await page.getByLabel('Título').fill(titulo)
  await page.getByLabel('Fecha', { exact: true }).fill(fecha)
  await page.getByRole('button', { name: 'Anotar' }).click()
  await expect(page.getByRole('status').filter({ hasText: /./ }).first()).toBeVisible()

  await page.goto('/estudiante/puente/eventos')
  await expect(page.getByRole('heading', { name: titulo })).toBeVisible()
  // Aquí solo se consulta: se edita en el calendario.
  await expect(page.getByRole('button', { name: /Editar/ })).toHaveCount(0)
})
