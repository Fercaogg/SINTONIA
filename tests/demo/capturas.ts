// Capturas de TODAS las pantallas, en modo demostración, en móvil y en
// escritorio (npm run capturas). Se guardan en docs/capturas/<movil|escritorio>.
// No es un test: recorre las pantallas y las fotografía.

import pg from 'pg'
import { test, type Page } from '@playwright/test'
import { entrarComo } from './ayudantes'

const carpeta = 'docs/capturas'

async function foto(page: Page, nombre: string, proyecto: string, completa = true) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  await page.mouse.move(0, 0)
  // En una captura de página completa, los elementos fijos (cabecera del móvil,
  // botón de envío) aparecerían a mitad de imagen: se dejan en su sitio normal.
  if (completa) await page.addStyleTag({ content: '.sticky { position: static !important; }' })
  await page.screenshot({ path: `${carpeta}/${proyecto}/${nombre}.png`, fullPage: completa })
}

async function salir(page: Page) {
  await page.evaluate(() => localStorage.clear())
}

async function bd<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const c = new pg.Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/sintonia_demo' })
  await c.connect()
  try {
    return (await c.query(sql, params)).rows
  } finally {
    await c.end()
  }
}

test('pantallas públicas', async ({ page }, info) => {
  const p = info.project.name
  await page.goto('/')
  await page.locator('#demostracion').getByLabel('Estudiante').fill('5')
  await page.locator('#demostracion').getByLabel('Tutor/a').fill('2')
  await foto(page, '01-inicio', p)
  await page.goto('/')
  await foto(page, '01b-inicio-primera-pantalla', p, false)
  await page.goto('/como-funciona')
  await foto(page, '02-como-funciona-y-tus-datos', p)
  await page.goto('/acceso')
  await page.getByRole('heading', { name: 'Entrar en la demostración' }).waitFor()
  await foto(page, '03-acceso-demostracion', p)
  await page.goto('/registro')
  await page.getByLabel('Código de acceso').fill('ZZZZZZZZZZZZ')
  await page.getByLabel('Tu nombre').fill('Nombre de ejemplo')
  await page.getByLabel('Correo institucional').fill('ejemplo@sintonia.example')
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByRole('alert').waitFor()
  await foto(page, '04-registro-codigo-no-valido', p)
})

test('consentimiento informado', async ({ page }, info) => {
  // Para enseñar la pantalla, se retira temporalmente el consentimiento de una cuenta.
  const email = 'estudiante02@sintonia.example'
  await bd(`update public.consentimientos set retirado_at = now() where user_id = (select id from auth.users where email = $1)`, [email])
  try {
    await page.goto('/acceso')
    await page.getByRole('button', { name: /Entrar con contraseña/ }).click()
    await page.getByLabel('Correo institucional').fill(email)
    await page.getByLabel('Contraseña').fill('demo-sintonia')
    await page.getByRole('button', { name: 'Entrar', exact: true }).click()
    await page.getByRole('heading', { name: 'Consentimiento informado' }).waitFor()
    await foto(page, '05-consentimiento-informado', info.project.name)
  } finally {
    await bd(`update public.consentimientos set retirado_at = null where user_id = (select id from auth.users where email = $1)`, [email])
  }
})

test('estudiante', async ({ page }, info) => {
  const p = info.project.name
  await entrarComo(page, 'Estudiante')
  await page.locator('[data-agenda="preguntas"]').waitFor()
  await foto(page, '06-estudiante-inicio', p)

  await page.goto('/estudiante/checkin')
  await page.getByRole('heading', { name: /Check-in de la semana/ }).waitFor()
  await foto(page, '07-estudiante-checkin', p)
  const grupos = page.getByRole('radiogroup')
  await grupos.nth(0).getByRole('radio', { name: '3' }).click()
  await grupos.nth(1).getByRole('radio', { name: '4' }).click()
  await grupos.nth(2).getByRole('radio', { name: /^5/ }).click()
  await grupos.nth(3).getByRole('radio', { name: '2' }).click()
  await foto(page, '08-estudiante-checkin-bienestar-bajo', p)
  await page.getByRole('button', { name: /^(Enviar|Guardar cambios)$/ }).click()
  await page.getByRole('heading', { name: 'Check-in guardado' }).waitFor()
  await foto(page, '09-estudiante-checkin-guardado', p)

  await page.goto('/estudiante/historial')
  await page.getByRole('heading', { name: 'Semana 1' }).waitFor()
  await foto(page, '10-estudiante-historico', p)
  await page.goto('/estudiante/puente')
  await page.getByRole('switch').waitFor()
  await foto(page, '11-estudiante-puente-al-doctorado', p)
  await page.goto('/estudiante/cuestionario/pretest')
  await page.getByRole('heading', { name: 'Cuestionario inicial' }).waitFor()
  await foto(page, '12-estudiante-cuestionario-inicial', p)
  await page.goto('/estudiante/apoyo')
  await page.getByRole('heading', { name: 'Necesito apoyo' }).waitFor()
  await foto(page, '13-estudiante-necesito-apoyo', p)
  await page.goto('/cuenta')
  await page.getByRole('heading', { name: 'Mi cuenta' }).waitFor()
  await foto(page, '14-estudiante-mi-cuenta', p)
  if (p === 'movil') {
    await page.getByRole('button', { name: 'Abrir el menú' }).click()
    await page.waitForTimeout(400)
    await foto(page, '15-estudiante-menu-movil', p, false)
  }
})

test('tutor/a', async ({ page }, info) => {
  const p = info.project.name
  await entrarComo(page, 'Tutor/a')
  await page.getByRole('heading', { name: 'Agendas para las tutorías' }).waitFor()
  await foto(page, '16-tutor-inicio-y-agendas', p)
  await page.goto('/tutor/checkin')
  await page.getByRole('heading', { name: /Check-in de la semana/ }).waitFor()
  const tarjetas = page.locator('form li')
  await tarjetas.nth(0).getByRole('radiogroup').first().getByRole('radio', { name: '3' }).click()
  await foto(page, '17-tutor-checkin', p)
  await page.goto('/tutor/codigos')
  await page.getByRole('heading', { name: 'Códigos para tus estudiantes' }).waitFor()
  await foto(page, '18-tutor-codigos', p)
})

test('dirección del máster', async ({ page }, info) => {
  const p = info.project.name
  await entrarComo(page, 'Dirección del máster')
  await page.getByRole('heading', { name: 'Todos los datos' }).waitFor()
  await foto(page, '19-direccion-resumen-del-master', p)
  await page.goto('/direccion/avisos')
  await page.getByRole('heading', { name: 'Avisos de apoyo' }).waitFor()
  await foto(page, '20-direccion-avisos-de-apoyo', p)
})

test('investigación', async ({ page }, info) => {
  const p = info.project.name
  await entrarComo(page, 'Investigación')
  await page.getByRole('heading', { name: 'Códigos de este máster' }).waitFor()
  await foto(page, '21-investigacion-masters-y-codigos', p)
  await page.goto('/investigador/calendario')
  await page.getByRole('heading', { name: 'Sorteos por semana' }).waitFor()
  await foto(page, '22-investigacion-calendario-y-sorteos', p)
  await page.goto('/investigador/convocatorias')
  await page.getByRole('heading', { name: 'Convocatorias' }).waitFor()
  await foto(page, '23-investigacion-convocatorias', p)
  await page.goto('/investigador/cuestionarios')
  await page.getByRole('heading', { name: 'Cuestionario inicial' }).waitFor()
  await foto(page, '24-investigacion-cuestionarios', p)
  await page.goto('/investigador/datos')
  await page.getByRole('heading', { name: 'Registro de auditoría' }).waitFor()
  await foto(page, '25-investigacion-datos-y-auditoria', p)
  await salir(page)
})

test('cotutoría y gestión de tutores', async ({ page }, info) => {
  const p = info.project.name
  await entrarComo(page, 'Investigación')
  await page.goto('/investigador/parejas')
  await page.getByRole('heading', { name: 'Parejas y tutores' }).waitFor()
  await foto(page, '26-investigacion-parejas-y-tutores', p)
  await salir(page)

  await page.goto('/acceso')
  await page.getByRole('button', { name: /Entrar con contraseña/ }).click()
  await page.getByLabel('Correo institucional').fill('tutor2@sintonia.example')
  await page.getByLabel('Contraseña').fill('demo-sintonia')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await page.getByRole('heading', { name: 'Agendas para las tutorías' }).waitFor()
  await foto(page, '27-cotutora-inicio-y-agendas', p)
})

test('calendario', async ({ page }, info) => {
  const p = info.project.name
  await entrarComo(page, 'Estudiante')
  await page.goto('/calendario')
  await page.getByRole('heading', { name: 'Próximas fechas' }).waitFor()
  await foto(page, '28-estudiante-calendario', p)
  await page.getByRole('button', { name: 'Añadir fecha' }).click()
  await page.getByRole('heading', { name: 'Nueva anotación' }).waitFor()
  await page.getByLabel('Título').fill('Tutoría para revisar el marco teórico')
  await page.getByLabel('Hora de inicio').fill('10:00')
  await foto(page, '29-estudiante-calendario-nueva-anotacion', p)
  await salir(page)

  await entrarComo(page, 'Tutor/a')
  await page.goto('/calendario')
  await page.getByRole('heading', { name: 'Próximas fechas' }).waitFor()
  await foto(page, '30-tutor-calendario', p)
  await salir(page)

  await entrarComo(page, 'Dirección del máster')
  await page.goto('/calendario')
  await page.getByRole('heading', { name: 'Próximas fechas' }).waitFor()
  await foto(page, '31-direccion-calendario-del-master', p)
})

test('páginas legales y registro seguro', async ({ page }, info) => {
  const p = info.project.name
  for (const [ruta, nombre, titulo] of [
    ['/privacidad', '32-privacidad', 'Política de privacidad'],
    ['/aviso-legal', '33-aviso-legal', 'Aviso legal'],
    ['/cookies', '34-cookies', 'Cookies'],
    ['/consentimiento', '35-consentimiento-publico', 'Consentimiento informado'],
    ['/investigacion', '36-investigacion-publica', 'La investigación'],
  ]) {
    await page.goto(ruta)
    await page.getByRole('heading', { name: titulo, level: 1 }).waitFor()
    await foto(page, nombre, p)
  }
})
