import { readFileSync } from 'node:fs'
import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, type TestInfo } from '@playwright/test'

export const API = 'http://localhost:54322'
export const CONTRASENA = 'sintonia-local'

export function codigosLibres(): string[] {
  return JSON.parse(readFileSync('.local/codigos-e2e.json', 'utf8')).estudiante
}

/** Un valor distinto para cada proyecto (móvil o escritorio), para no chocar. */
export function porProyecto<T>(info: TestInfo, valores: T[]): T {
  return valores[info.project.name === 'movil' ? 0 : 1]
}

export async function ultimoEnlace(email: string): Promise<string> {
  const r = await fetch(`${API}/__local/ultimo-enlace?email=${encodeURIComponent(email)}`)
  const { enlace } = await r.json()
  if (!enlace) throw new Error(`No hay enlace para ${email}`)
  return enlace
}

export async function entrarConContrasena(page: Page, email: string) {
  await page.goto('/acceso')
  await page.getByRole('button', { name: /Entrar con contraseña/ }).click()
  await page.getByLabel('Correo institucional').fill(email)
  await page.getByLabel('Contraseña').fill(CONTRASENA)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await page.waitForURL((url) => !url.pathname.startsWith('/acceso'))
}

export async function abrirMenuSiMovil(page: Page) {
  const boton = page.getByRole('button', { name: 'Abrir el menú' })
  if (await boton.isVisible()) await boton.click()
}

export async function sinRayasLargas(page: Page) {
  const texto = await page.locator('body').innerText()
  expect(texto).not.toContain('\u2014')
}

/**
 * Simula que las peticiones llegan desde una IP distinta. El servidor limita
 * los intentos de registro y acceso por IP, y todos los tests salen de la
 * misma máquina.
 */
export async function ipNueva(page: Page) {
  const n = () => Math.floor(Math.random() * 250) + 1
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': `10.${n()}.${n()}.${n()}` })
}

/** Registra un estudiante con un código y acepta el consentimiento. */
export async function registrarEstudiante(page: Page, codigo: string, email: string, nombre: string) {
  await ipNueva(page)
  await page.goto('/registro')
  await page.getByLabel('Código de acceso').fill(codigo)
  await page.getByLabel('Tu nombre').fill(nombre)
  await page.getByLabel('Correo institucional').fill(email)
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page.getByRole('heading', { name: 'Revisa tu correo' })).toBeVisible()
  await page.goto(await ultimoEnlace(email))
  await page.getByLabel(/He leído el texto y acepto participar/).check()
  await page.getByRole('button', { name: 'Aceptar y continuar' }).click()
  await expect(page).toHaveURL(/\/estudiante$/)
}

export async function salir(page: Page) {
  await page.evaluate(() => localStorage.clear())
}

/** Revisión automática de accesibilidad (WCAG 2.0, 2.1 y 2.2, A y AA) con axe. */
export async function sinErroresDeAccesibilidad(page: Page) {
  // El logotipo queda fuera: las WCAG (1.4.3) no exigen contraste a los logotipos.
  const r = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .exclude('[data-logotipo]')
    .analyze()
  expect(r.violations.map((v) => `${v.id}: ${v.help} -> ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
}
