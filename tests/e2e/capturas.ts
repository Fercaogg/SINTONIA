// Genera las capturas de pantalla de docs/capturas (npm run capturas).
// No es un test: solo recorre las pantallas y las fotografía.

import { test, type Page } from '@playwright/test'
import { codigosLibres, entrarConContrasena, porProyecto, ultimoEnlace } from './ayudantes'

const carpeta = 'docs/capturas'

async function foto(page: Page, nombre: string, proyecto: string) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  // En una captura de página completa, los elementos fijos (cabecera del móvil,
  // botón de envío) aparecerían a mitad de imagen: se dejan en su sitio normal.
  await page.addStyleTag({ content: '.sticky { position: static !important; }' })
  await page.screenshot({ path: `${carpeta}/${proyecto}/${nombre}.png`, fullPage: true })
}

test('pantallas públicas y de acceso', async ({ page }, info) => {
  const p = info.project.name
  await page.goto('/')
  await foto(page, '01-inicio', p)
  await page.goto('/como-funciona')
  await foto(page, '02-como-funciona', p)
  await page.goto('/acceso')
  await foto(page, '03-acceso', p)
  await page.goto('/registro')
  await page.getByLabel('Código de acceso').fill('ZZZZZZZZ')
  await page.getByLabel('Tu nombre').fill('Marta')
  await page.getByLabel('Correo institucional').fill('marta@usal.es')
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByRole('alert').waitFor()
  await foto(page, '04-registro-error', p)

  const email = porProyecto(info, ['marta.m@usal.es', 'marta.e@usal.es'])
  await page.getByLabel('Código de acceso').fill(porProyecto(info, codigosLibres()))
  await page.getByLabel('Correo institucional').fill(email)
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByRole('heading', { name: 'Revisa tu correo' }).waitFor()
  await foto(page, '05-registro-revisa-correo', p)

  await page.goto(await ultimoEnlace(email))
  await page.getByRole('heading', { name: 'Consentimiento informado' }).waitFor()
  await foto(page, '06-consentimiento', p)
  await page.getByLabel(/He leído el texto/).check()
  await page.getByRole('button', { name: 'Aceptar y continuar' }).click()
  await page.getByRole('heading', { name: /Hola/ }).waitFor()
  await foto(page, '07-estudiante-inicio', p)
})

test('pantallas de tutora, dirección e investigación', async ({ page }, info) => {
  const p = info.project.name
  await entrarConContrasena(page, 'tutora@usal.es')
  await page.waitForURL(/\/(consentimiento|tutor)$/)
  if (page.url().endsWith('/consentimiento')) {
    await page.getByLabel(/He leído el texto/).check()
    await page.getByRole('button', { name: 'Aceptar y continuar' }).click()
  }
  await page.getByRole('heading', { name: 'Agendas para las tutorías' }).waitFor()
  await foto(page, '08-tutor-inicio', p)
  await page.goto('/tutor/codigos')
  await page.getByRole('heading', { name: 'Códigos para tus estudiantes' }).waitFor()
  await foto(page, '09-tutor-codigos', p)
  if (p === 'movil') {
    await page.getByRole('button', { name: 'Abrir el menú' }).click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${carpeta}/${p}/10-tutor-menu-movil.png` })
    await page.keyboard.press('Escape')
  }

  await page.context().clearCookies()
  await page.evaluate(() => localStorage.clear())
  await entrarConContrasena(page, 'direccion@usal.es')
  await page.getByRole('heading', { name: 'Resumen del máster' }).waitFor()
  await foto(page, '11-direccion-inicio', p)

  await page.evaluate(() => localStorage.clear())
  await entrarConContrasena(page, 'investigador@usal.es')
  await page.getByRole('heading', { name: 'Másteres y códigos' }).waitFor()
  await page.getByRole('heading', { name: 'Códigos de este máster' }).waitFor()
  await foto(page, '12-investigacion-masters', p)
})

test('pantallas de los check-ins y de la cuenta', async ({ page }, info) => {
  const p = info.project.name
  await entrarConContrasena(page, 'ana@usal.es')
  await page.getByRole('heading', { name: 'Hola, Ana' }).waitFor()
  await foto(page, '13-estudiante-inicio-semana-abierta', p)

  await page.goto('/estudiante/checkin')
  await page.getByRole('heading', { name: /Check-in de la semana/ }).waitFor()
  await foto(page, '14-estudiante-checkin-vacio', p)
  const grupos = page.getByRole('radiogroup')
  await grupos.nth(0).getByRole('radio', { name: '3' }).click()
  await grupos.nth(1).getByRole('radio', { name: '4' }).click()
  await grupos.nth(2).getByRole('radio', { name: /^5/ }).click()
  await grupos.nth(3).getByRole('radio', { name: '2' }).click()
  await foto(page, '15-estudiante-checkin-bienestar-bajo', p)
  await page.getByRole('button', { name: /^(Enviar|Guardar cambios)$/ }).click()
  await page.getByRole('heading', { name: 'Check-in guardado' }).waitFor()
  await foto(page, '16-estudiante-checkin-guardado', p)

  await page.goto('/estudiante/historial')
  await page.getByRole('heading', { name: 'Semana 1' }).waitFor()
  await foto(page, '17-estudiante-historico', p)
  await page.goto('/estudiante/apoyo')
  await page.getByRole('heading', { name: 'Necesito apoyo' }).waitFor()
  await foto(page, '18-estudiante-apoyo', p)
  await page.getByRole('button', { name: 'Enviar aviso a la dirección' }).click()
  await page.getByText('Aviso enviado').waitFor()
  await page.goto('/cuenta')
  await page.getByRole('heading', { name: 'Mi cuenta' }).waitFor()
  await foto(page, '19-cuenta', p)

  await page.evaluate(() => localStorage.clear())
  await entrarConContrasena(page, 'tutor8@usal.es')
  await page.goto('/tutor/checkin')
  await page.getByRole('heading', { name: /Check-in de la semana/ }).waitFor()
  const tarjetas = page.locator('form li')
  for (let i = 0; i < 3; i++) await tarjetas.nth(i).getByRole('radiogroup').first().getByRole('radio', { name: String(i + 2) }).click()
  await foto(page, '20-tutor-checkin', p)

  await page.goto('/tutor')
  await page.getByRole('heading', { name: 'Agendas para las tutorías' }).waitFor()
  await foto(page, '23-tutor-agendas', p)

  await page.evaluate(() => localStorage.clear())
  await entrarConContrasena(page, 'direccion@usal.es')
  await page.goto('/direccion/avisos')
  await page.getByRole('heading', { name: 'Avisos de apoyo' }).waitFor()
  await foto(page, '21-direccion-avisos', p)

  await page.evaluate(() => localStorage.clear())
  await entrarConContrasena(page, 'investigador@usal.es')
  await page.goto('/investigacion/calendario')
  await page.getByRole('heading', { name: 'Sorteos por semana' }).waitFor()
  await foto(page, '22-investigacion-calendario', p)
})
