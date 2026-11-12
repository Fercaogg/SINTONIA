import { readFileSync } from 'node:fs'
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
}

export async function abrirMenuSiMovil(page: Page) {
  const boton = page.getByRole('button', { name: 'Abrir el menú' })
  if (await boton.isVisible()) await boton.click()
}

export async function sinRayasLargas(page: Page) {
  const texto = await page.locator('body').innerText()
  expect(texto).not.toContain('—')
}
