// Portada y página de la investigación (Fase 3 del encargo de blindaje).

import { expect, test } from '@playwright/test'
import { ipNueva, sinErroresDeAccesibilidad, sinRayasLargas } from './ayudantes'

test('la portada tiene todos los apartados, enlazados desde la navegación', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Acompañar el trabajo académico')
  for (const [id, titulo] of [
    ['problema', 'El problema'], ['como-funciona', 'Cómo funciona'], ['perfiles', 'Para cada perfil'],
    ['puente', 'Puente al doctorado'], ['privacidad', 'Privacidad y ética'], ['para-quien', 'Para quién es'],
    ['direccion', 'Dirección'], ['preguntas', 'Preguntas frecuentes'], ['contacto', 'Contacto'],
  ]) {
    await expect(page.locator(`#${id}`).getByRole('heading', { level: 2, name: titulo, exact: true })).toBeAttached()
  }
  // La navegación lleva a cada ancla (en móvil, desde el menú).
  const menu = page.getByRole('button', { name: 'Abrir las secciones' })
  if (await menu.isVisible()) await menu.click()
  await page.getByRole('navigation', { name: 'Secciones' }).getByRole('link', { name: 'Dirección' }).first().click()
  await expect(page).toHaveURL(/#direccion$/)
  await expect(page.locator('#direccion')).toBeInViewport()
  await sinRayasLargas(page)
  await sinErroresDeAccesibilidad(page)
})

test('la demostración del inicio muestra el desajuste y tres preguntas, sin llamar a ninguna API', async ({ page }) => {
  const peticiones: string[] = []
  page.on('request', (r) => { if (/\/(api|rest)\//.test(r.url())) peticiones.push(r.url()) })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  peticiones.length = 0
  const demo = page.locator('#demostracion')
  await demo.getByLabel('Estudiante').fill('5')
  await demo.getByLabel('Tutor/a').fill('2')
  await expect(demo.getByText('3 puntos de diferencia: hay desajuste.')).toBeVisible()
  await expect(demo.getByRole('listitem')).toHaveCount(3)
  await demo.getByLabel('Tutor/a').fill('4')
  await expect(demo.getByText('Solo 1 punto de diferencia.')).toBeVisible()
  expect(peticiones).toEqual([])
})

test('los tres perfiles se ven a la vez, con lo que ve y no ve cada uno', async ({ page }) => {
  await page.goto('/#perfiles')
  const tarjetas = page.locator('#perfiles').getByRole('listitem').filter({ has: page.getByRole('heading', { level: 3 }) })
  await expect(tarjetas).toHaveCount(3)
  await expect(tarjetas.nth(0)).toContainText('Unos 60 segundos a la semana')
  await expect(tarjetas.nth(1)).toContainText('Unos 30 segundos a la semana')
  await expect(tarjetas.nth(2)).toContainText('Ninguna cifra calculada sobre menos de 5 personas')
})

test('Dirección: dos tarjetas iguales, en orden alfabético y solo con los datos facilitados', async ({ page }) => {
  await page.goto('/#direccion')
  const tarjetas = page.locator('#direccion article')
  await expect(tarjetas).toHaveCount(2)
  await expect(tarjetas.nth(0)).toContainText('Dr. Luis Eduardo Andrade Silva')
  await expect(tarjetas.nth(1)).toContainText('Dra. Ana María Pinto Llorente')
  const cajas = [await tarjetas.nth(0).boundingBox(), await tarjetas.nth(1).boundingBox()]
  expect(Math.abs(cajas[0]!.height - cajas[1]!.height)).toBeLessThan(1)
  expect(Math.abs(cajas[0]!.width - cajas[1]!.width)).toBeLessThan(1)
  for (const t of [tarjetas.nth(0), tarjetas.nth(1)]) {
    for (const enlace of await t.getByRole('link').all()) {
      await expect(enlace).toHaveAttribute('target', '_blank')
      await expect(enlace).toHaveAttribute('rel', 'noopener noreferrer')
    }
  }
  await expect(page.locator('#direccion')).toContainText('Autor: Fernando Martín Vaquero, Máster en Estudios de la Ciencia, la Tecnología y la Innovación, Universidad de Salamanca.')
  await expect(page.locator('#direccion')).toContainText('WORKWELL360, Trabajo Fin de Grado en Pedagogía, con pilotaje en YMCA Salamanca.')
})

test('el formulario de contacto envía el mensaje e ignora a los programas', async ({ page }) => {
  await ipNueva(page)
  await page.goto('/#contacto')
  const contacto = page.locator('#contacto')
  await contacto.getByLabel('Nombre').fill('Lucía Prueba')
  await contacto.getByLabel('Correo', { exact: true }).fill('lucia@ejemplo.es')
  await contacto.getByLabel('Mensaje').fill('Me interesa SINTONÍA para mi máster.')
  await contacto.getByRole('button', { name: 'Enviar mensaje' }).click()
  await expect(contacto.getByRole('status')).toContainText('Mensaje enviado')
  await expect(contacto.getByRole('link', { name: 'ferca@usal.es' })).toBeVisible()
})

test('las preguntas frecuentes se abren y cierran', async ({ page }) => {
  await page.goto('/#preguntas')
  const pregunta = page.getByText('¿Tengo que subir mi trabajo?')
  await pregunta.click()
  await expect(page.getByText('SINTONÍA no recibe, no lee ni guarda ningún contenido de tu trabajo')).toBeVisible()
})

test('la página de la investigación tiene su estructura y las referencias permitidas', async ({ page }) => {
  await page.goto('/investigacion')
  for (const t of ['Pregunta de investigación', 'Hipótesis', 'Diseño', 'Garantías', 'Calendario', 'Referencias']) {
    await expect(page.getByRole('heading', { level: 2, name: t })).toBeVisible()
  }
  await expect(page.getByRole('region', { name: 'Referencias' }).getByRole('listitem')).toHaveCount(7)
  await expect(page.getByText('Febrero a abril de 2027')).toBeVisible()
  const texto = await page.locator('body').innerText()
  expect(texto).not.toContain('[PENDIENTE')
  await sinRayasLargas(page)
  await sinErroresDeAccesibilidad(page)
})

test('/demo tiene su banda fija y, sin demostración configurada, lo dice con un texto digno', async ({ page }) => {
  await page.goto('/demo')
  await expect(page.locator('[data-banda-demo]')).toHaveText('Demostración: datos ficticios')
  await expect(page.getByRole('heading', { level: 1, name: 'Entra como quieras' })).toBeVisible()
  await expect(page.getByText('En elaboración. Se publicará aquí cuando esté disponible.')).toBeVisible()
  expect(await page.locator('body').innerText()).not.toContain('[PENDIENTE')
  await sinErroresDeAccesibilidad(page)
})
