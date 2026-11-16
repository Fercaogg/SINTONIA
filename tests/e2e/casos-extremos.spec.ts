// Casos extremos: un nombre de 120 caracteres (el máximo que admite la base
// de datos), con palabras muy largas sin espacios, no puede romper ninguna
// pantalla en el móvil (360 px) ni en el escritorio.
import { expect, test, type Page } from '@playwright/test'
import { codigosLibres, entrarConContrasena, porProyecto, registrarEstudiante, salir } from './ayudantes'

const NOMBRE_LARGO = ('María de los Ángeles Wolfeschlegelsteinhausenbergerdorff ' + 'Fernández-Villaverde-Montenegro-Santibáñez').padEnd(120, 'x').slice(0, 120)

async function sinDesborde(page: Page, ruta: string) {
  await page.goto(ruta)
  await page.waitForLoadState('networkidle')
  const desborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(desborde, `${ruta} se sale por los lados con un nombre muy largo`).toBeLessThanOrEqual(0)
}

test('un nombre de 120 caracteres no rompe ninguna pantalla', async ({ page }, info) => {
  test.setTimeout(120_000)
  const codigo = porProyecto(info, codigosLibres().slice(5))
  const email = porProyecto(info, ['nombre-largo-1@usal.es', 'nombre-largo-2@usal.es'])
  await registrarEstudiante(page, codigo, email, NOMBRE_LARGO)
  for (const ruta of ['/estudiante', '/estudiante/checkin', '/estudiante/historial', '/estudiante/apoyo', '/cuenta']) await sinDesborde(page, ruta)
  await expect(page.locator('#c-nombre')).toHaveValue(NOMBRE_LARGO)

  // La tutora ve el nombre en su panel y en su check-in.
  await salir(page)
  await entrarConContrasena(page, 'tutora@usal.es')
  for (const ruta of ['/tutor/codigos', '/tutor', '/tutor/checkin']) await sinDesborde(page, ruta)

  await expect(page.getByText(NOMBRE_LARGO.slice(0, 20)).first()).toBeVisible()
})
