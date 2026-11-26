// Puente al doctorado, cuestionarios y pantallas del investigador.

import { expect, test } from '@playwright/test'
import { abrirMenuSiMovil, entrarConContrasena, sinErroresDeAccesibilidad, sinRayasLargas } from './ayudantes'

test('la línea de Puente aparece en la agenda de Ana y en la de su tutora', async ({ page }) => {
  await entrarConContrasena(page, 'ana@usal.es')
  const linea = page.locator('[data-agenda="puente"]')
  await expect(linea).toContainText('Se acerca el plazo de Convocatoria de ejemplo (ficticia). ¿Lo comentáis en la próxima tutoría?')
})

test('el estudiante activa y desactiva Puente al doctorado', async ({ page }) => {
  await entrarConContrasena(page, 'ana@usal.es')
  await page.goto('/estudiante/puente')
  const interruptor = page.getByRole('switch', { name: 'Avisarme de los plazos en la agenda' })
  await expect(interruptor).toHaveAttribute('aria-checked', 'true')
  await interruptor.click()
  await expect(interruptor).toHaveAttribute('aria-checked', 'false')
  await interruptor.click()
  await expect(interruptor).toHaveAttribute('aria-checked', 'true')
  await sinErroresDeAccesibilidad(page)
  // Las convocatorias oficiales (puerta "Becas y contratos") aparecen como pendientes.
  await page.getByRole('link', { name: /Becas y contratos/ }).click()
  await expect(page.getByRole('heading', { name: /Formación de Profesorado Universitario \(FPU\)/ })).toBeVisible()
  await expect(page.locator('[data-pendiente="true"]').first()).toBeVisible()
  await sinErroresDeAccesibilidad(page)
  await sinRayasLargas(page)
})

test('el estudiante responde el cuestionario inicial con un único envío', async ({ page }, info) => {
  await entrarConContrasena(page, 'ana@usal.es')
  const tarjeta = page.getByRole('link', { name: 'Responder' })
  if (await tarjeta.isVisible()) await tarjeta.click()
  else await page.goto('/estudiante/cuestionario/pretest')
  await expect(page.getByRole('heading', { name: 'Cuestionario inicial' })).toBeVisible()
  await expect(page.getByText('¿Cuentas con alguna persona del ámbito académico, distinta de tu tutor/a, que te oriente sobre el doctorado?')).toBeVisible()
  await sinErroresDeAccesibilidad(page)

  const enviar = page.getByRole('button', { name: 'Enviar' })
  // La primera vez (proyecto móvil) aún no hay respuestas: el botón empieza desactivado.
  if (info.project.name === 'movil') await expect(enviar).toBeDisabled()
  await page.getByRole('radiogroup').first().getByRole('radio', { name: '3' }).click()
  await page.getByRole('radio', { name: 'No', exact: true }).click()
  await page.getByLabel('No lo sé').check()
  await enviar.click()
  await expect(page.getByRole('heading', { name: 'Respuestas guardadas' })).toBeVisible()
})

test('el investigador rellena las fechas de una convocatoria', async ({ page }, info) => {
  await entrarConContrasena(page, 'investigador@usal.es')
  await page.goto('/investigador/convocatorias')
  const fpu = page.getByRole('form', { name: /\(FPU\)/ })
  await fpu.getByLabel('Fecha de apertura').fill(info.project.name === 'movil' ? '2027-03-01' : '2027-03-02')
  await fpu.getByLabel('Fecha de cierre').fill('2027-03-31')
  await fpu.getByRole('button', { name: 'Guardar' }).click()
  await expect(page.getByRole('status')).toContainText('guardada')
  await sinErroresDeAccesibilidad(page)
})

test('el investigador ve los cuestionarios, con los ítems pendientes marcados', async ({ page }) => {
  await entrarConContrasena(page, 'investigador@usal.es')
  await page.goto('/investigador/cuestionarios')
  await expect(page.getByRole('heading', { name: 'Cuestionario inicial' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Cuestionario final' })).toBeVisible()
  await expect(page.getByText('[PENDIENTE: ítems de la escala validada]').first()).toBeVisible()
  await sinErroresDeAccesibilidad(page)
})

test('el estudiante consulta qué oposiciones puede preparar con sus estudios', async ({ page }, info) => {
  await entrarConContrasena(page, 'ana@usal.es')
  // Está en el menú, justo debajo de Puente al doctorado.
  await abrirMenuSiMovil(page)
  const menu = page.getByRole('complementary', { name: 'Menú principal' })
  const textos = (await menu.getByRole('link').allInnerTexts()).map((x) => x.trim())
  expect(textos.indexOf('Oposiciones')).toBe(textos.indexOf('Puente al doctorado') + 1)
  await menu.getByRole('link', { name: 'Oposiciones' }).click()
  await expect(page.getByRole('heading', { name: 'Oposiciones', level: 1 })).toBeVisible()

  // El mismo caso que la hoja de cálculo: Pedagogía, con el Máster del Profesorado.
  await page.getByLabel('Nivel de estudios más alto').selectOption({ label: 'Grado universitario o Licenciatura' })
  await page.getByLabel('Tu titulación de grado').selectOption('Pedagogía')
  await page.getByRole('radio', { name: 'Sí', exact: true }).check({ force: true })
  await expect(page.locator('[data-recuento]')).toHaveText('34 oposiciones para tu perfil')
  const afines = page.locator('[data-encaje="afin"] li')
  await expect(afines).toHaveCount(2)
  await expect(afines.first()).toContainText('Secundaria, especialidad Orientación Educativa')
  await expect(page.locator('[data-encaje="general"] li').first()).toContainText('970')

  // Sin el Máster, desaparecen las de Secundaria y se dice cuántas abriría.
  await page.getByRole('radio', { name: 'No', exact: true }).check({ force: true })
  await expect(page.locator('[data-recuento]')).toHaveText('32 oposiciones para tu perfil')
  await expect(page.getByText('podrías presentarte a 2 más')).toBeVisible()

  // Filtro por ámbito.
  await page.getByRole('radio', { name: 'Castilla y León' }).check({ force: true })
  await expect(page.locator('[data-recuento]')).toHaveText('4 oposiciones para tu perfil')

  await sinErroresDeAccesibilidad(page)
  await sinRayasLargas(page)
  if (process.env.CAPTURA_OPOSICIONES) {
    await page.getByRole('radio', { name: 'Todos' }).check({ force: true })
    await page.getByRole('radio', { name: 'Sí', exact: true }).check({ force: true })
    await page.screenshot({ path: `.local/oposiciones-${info.project.name}.png`, fullPage: true })
  }
})
