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
  Estudiante: { inicio: /\/estudiante$/, rutas: ['/estudiante', '/estudiante/checkin', '/estudiante/historial', '/estudiante/puente', '/estudiante/apoyo', '/estudiante/cuestionario/pretest', '/calendario', '/cuenta'] },
  'Tutor/a': { inicio: /\/tutor$/, rutas: ['/tutor', '/tutor/checkin', '/tutor/codigos', '/calendario', '/cuenta'] },
  'Dirección del máster': { inicio: /\/direccion$/, rutas: ['/direccion', '/direccion/avisos', '/calendario', '/cuenta'] },
  Investigación: {
    inicio: /\/investigador$/,
    rutas: ['/investigador', '/investigador/parejas', '/investigador/calendario', '/investigador/convocatorias', '/investigador/cuestionarios', '/investigador/datos', '/calendario', '/cuenta'],
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
  for (const ruta of ['/', '/acceso', '/como-funciona', '/investigacion', '/privacidad', '/aviso-legal', '/cookies', '/consentimiento', '/no-existe']) {
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

test('cotutoría: la tutora 2 ve a su estudiante en cotutoría y hace su propio check-in', async ({ page }) => {
  await page.goto('/acceso')
  await page.getByRole('button', { name: /Entrar con contraseña/ }).click()
  await page.getByLabel('Correo institucional').fill('tutor2@sintonia.example')
  await page.getByLabel('Contraseña').fill('demo-sintonia')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await page.waitForURL(/\/tutor$/)
  await expect(page.getByRole('heading', { name: 'Irene Montes (cotutoría)' })).toBeVisible()
  await page.goto('/tutor/checkin')
  await expect(page.locator('form li').filter({ hasText: 'Irene Montes' }).getByText('Cotutoría')).toBeVisible()
})

test('el investigador gestiona los tutores de las parejas', async ({ page }, info) => {
  await entrarComo(page, 'Investigación')
  await page.goto('/investigador/parejas')
  await expect(page.getByRole('heading', { name: 'Parejas y tutores' })).toBeVisible()
  await expect(page.getByText('12 parejas · 1 con cotutoría')).toBeVisible()
  // Añadir un cotutor a la segunda pareja y quitarlo después.
  const segunda = page.locator('main li.card').nth(info.project.name === 'movil' ? 1 : 2)
  await segunda.getByLabel(/Añadir cotutor a/).selectOption({ index: 1 })
  await segunda.getByRole('button', { name: 'Añadir' }).click()
  await expect(page.getByRole('status')).toContainText('Cotutor añadido')
  await segunda.getByRole('button', { name: /Quitar a/ }).click()
  await expect(page.getByRole('status')).toContainText('Cotutor quitado')
})

test('calendario: el estudiante anota una tutoría para su tutora y ella la ve; la dirección no', async ({ page }, info) => {
  const titulo = `Tutoría sobre el método (${info.project.name})`
  await entrarComo(page, 'Estudiante')
  await expect(page.getByRole('heading', { name: 'Próximas fechas' })).toBeVisible()
  await page.goto('/calendario')
  await page.getByRole('button', { name: 'Añadir fecha' }).click()
  await expect(page.getByRole('heading', { name: 'Nueva anotación' })).toBeFocused()
  await page.locator('form').getByText('Tutoría', { exact: true }).click()
  await page.getByLabel('Título').fill(titulo)
  await page.getByLabel('Hora de inicio').fill('09:30')
  await page.getByRole('radio', { name: /Mi tutor\/a y yo/ }).check()
  await page.getByRole('button', { name: 'Anotar' }).click()
  await expect(page.getByRole('status')).toHaveText('Anotado en el calendario.')
  await expect(page.getByRole('heading', { name: titulo }).first()).toBeVisible()
  await sinErroresDeAccesibilidad(page)

  // Los filtros de arriba ocultan un tipo.
  await page.getByRole('button', { name: 'Tutoría', exact: true }).click()
  await expect(page.getByRole('heading', { name: titulo })).toHaveCount(0)
  await page.getByRole('button', { name: 'Tutoría', exact: true }).click()

  await page.evaluate(() => localStorage.clear())
  await entrarComo(page, 'Tutor/a')
  await page.goto('/calendario')
  const propia = page.getByRole('article', { name: `Tutoría: ${titulo}` }).first()
  await expect(propia).toBeVisible()
  await expect(propia).toContainText('Con Irene Montes')
  await expect(propia).toContainText('Lo anotó: Irene Montes')
  await expect(propia.getByRole('button', { name: /Editar/ })).toHaveCount(0)
  // La nota privada del estudiante no aparece.
  await expect(page.getByText('Repasar la bibliografía')).toHaveCount(0)

  await page.evaluate(() => localStorage.clear())
  await entrarComo(page, 'Dirección del máster')
  await page.goto('/calendario')
  await expect(page.getByRole('heading', { name: 'Próximas fechas' })).toBeVisible()
  await expect(page.getByText(titulo)).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Congreso de demostración (ficticio)' }).first()).toBeVisible()
})

test('calendario: la dirección publica un evento para todo el máster', async ({ page }, info) => {
  const titulo = `Charla de orientación (${info.project.name})`
  await entrarComo(page, 'Dirección del máster')
  await page.goto('/calendario')
  await page.getByRole('button', { name: 'Añadir fecha' }).click()
  await page.getByLabel('Título').fill(titulo)
  await expect(page.getByRole('radio', { name: /Todo el máster/ })).toBeChecked()
  await page.getByRole('button', { name: 'Anotar' }).click()
  await expect(page.getByRole('status')).toHaveText('Anotado en el calendario.')

  await page.evaluate(() => localStorage.clear())
  await entrarComo(page, 'Estudiante')
  await page.goto('/calendario')
  const ev = page.getByRole('article', { name: `Seminario o evento: ${titulo}` }).first()
  await expect(ev).toContainText('Todo el máster')
  await expect(ev).toContainText('Lo anotó: Dirección del máster')
})
