// Comprobaciones finales con la instalación de demostración: accesos rápidos,
// accesibilidad de todas las pantallas y criterios de aceptación.

import { expect, test } from '@playwright/test'
import { abrirMenuSiMovil, entrarComo, objetivosTactiles, sinDesbordeLateral, sinErroresDeAccesibilidad, sinRayasLargas, type Perfil } from './ayudantes'

test('la demostración está marcada como tal y no ofrece registrarse', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-banda-entorno]')).toHaveText('Demostración: todos los datos y nombres son ficticios.')
  await expect(page.getByRole('link', { name: 'Registrarme' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Entrar en la demostración' })).toBeVisible()
})

const RUTAS: Record<Perfil, { inicio: RegExp; rutas: string[] }> = {
  Estudiante: { inicio: /\/estudiante$/, rutas: ['/estudiante', '/estudiante/checkin', '/estudiante/historial', '/estudiante/puente', '/estudiante/apoyo', '/estudiante/cuestionario/pretest', '/cuenta'] },
  'Tutor/a': { inicio: /\/tutor$/, rutas: ['/tutor', '/tutor/checkin', '/tutor/codigos', '/cuenta'] },
  'Dirección del máster': { inicio: /\/direccion$/, rutas: ['/direccion', '/direccion/avisos', '/cuenta'] },
  Investigación: {
    inicio: /\/investigacion$/,
    rutas: ['/investigacion', '/investigacion/calendario', '/investigacion/convocatorias', '/investigacion/cuestionarios', '/investigacion/datos', '/cuenta'],
  },
}

for (const [perfil, { inicio, rutas }] of Object.entries(RUTAS) as [Perfil, (typeof RUTAS)[Perfil]][]) {
  test(`${perfil}: el acceso rápido funciona y todas sus pantallas son accesibles`, async ({ page }) => {
    await entrarComo(page, perfil)
    await expect(page).toHaveURL(inicio)
    for (const ruta of rutas) {
      await page.goto(ruta)
      await expect(page.locator('main h1').first()).toBeVisible()
      await page.waitForLoadState('networkidle')
      await sinErroresDeAccesibilidad(page)
      await sinDesbordeLateral(page)
      await objetivosTactiles(page)
      await sinRayasLargas(page)
    }
  })
}

test('las pantallas públicas son accesibles', async ({ page }) => {
  for (const ruta of ['/', '/acceso', '/como-funciona', '/no-existe']) {
    await page.goto(ruta)
    await page.waitForLoadState('networkidle')
    await sinErroresDeAccesibilidad(page)
    await sinDesbordeLateral(page)
    await sinRayasLargas(page)
  }
})

test('con el teclado: el primer tabulador lleva a "Saltar al contenido"', async ({ page }, info) => {
  test.skip(info.project.name === 'movil', 'El teclado se comprueba en escritorio')
  await entrarComo(page, 'Estudiante')
  await page.goto('/estudiante')
  await page.locator('main h1').waitFor()
  await page.keyboard.press('Tab')
  const salto = page.getByRole('link', { name: 'Saltar al contenido' })
  await expect(salto).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#contenido$/)
  await expect(page.locator('main#contenido')).toBeFocused()
})

test('el estudiante de la demostración ve su agenda con la línea de Puente', async ({ page }) => {
  await entrarComo(page, 'Estudiante')
  await expect(page.locator('[data-agenda="preguntas"] li')).toHaveCount(3)
  await expect(page.locator('[data-agenda="puente"]')).toContainText('Convocatoria de demostración (ficticia)')
})

test('la dirección ve los datos de estudiantes y, con 4 tutores, nada calculado sobre tutores', async ({ page }) => {
  await entrarComo(page, 'Dirección del máster')
  const fila = page.locator('tbody tr').first()
  await expect(fila.locator('td').nth(0)).toHaveText('12')
  await expect(fila.locator('td').nth(2)).toHaveText('Datos insuficientes para garantizar el anonimato')
  await expect(fila.locator('td').nth(4)).toHaveText('Datos insuficientes para garantizar el anonimato')
})

test('el menú del móvil se abre, se recorre y se cierra con Escape', async ({ page }, info) => {
  test.skip(info.project.name !== 'movil', 'Solo en el móvil')
  await entrarComo(page, 'Tutor/a')
  await abrirMenuSiMovil(page)
  await expect(page.getByRole('link', { name: 'Check-in semanal' })).toBeVisible()
  await page.getByRole('link', { name: 'Check-in semanal' }).click()
  await expect(page).toHaveURL(/\/tutor\/checkin$/)
})
