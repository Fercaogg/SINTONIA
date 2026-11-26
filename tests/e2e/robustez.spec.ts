// Robustez por dentro: sesión caducada, red caída, perfil que no carga y
// versión nueva publicada con la pestaña abierta. Ver DECISIONES.md (25/11/2026).

import { expect, test, type Page } from '@playwright/test'
import { entrarConContrasena, sinErroresDeAccesibilidad } from './ayudantes'

const RPC = (f: string) => `**/rest/v1/rpc/${f}`
// Los extremos de la escala se anuncian como "1, Nada" o "5, Mucho".
const valor = (n: number) => ({ name: new RegExp(`^${n}(,|$)`) })

async function irAlCheckin(page: Page) {
  await page.getByRole('link', { name: /Hacer el check-in|Revisar/ }).click()
  await expect(page.getByRole('heading', { name: /Check-in de la semana/ })).toBeVisible()
}

test('si la sesión caduca al enviar el check-in, no se pierde nada y se vuelve a la misma pantalla', async ({ page }) => {
  await entrarConContrasena(page, 'ana@usal.es')
  await irAlCheckin(page)

  const grupos = page.getByRole('radiogroup')
  // Valores que no coinciden con lo que ya pudiera estar enviado (checkin.spec.ts usa 4, 2, 5, 2).
  await grupos.nth(0).getByRole('radio', valor(1)).click()
  await grupos.nth(1).getByRole('radio', valor(3)).click()
  await grupos.nth(2).getByRole('radio', valor(3)).click()
  await grupos.nth(3).getByRole('radio', valor(4)).click()

  // Así responde Supabase cuando el token ya no vale.
  await page.route(RPC('guardar_checkin_estudiante'), (r) =>
    r.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ code: 'PGRST303', message: 'JWT expired', hint: null, details: null }) }),
  )
  await page.getByRole('button', { name: /^(Enviar|Guardar cambios)$/ }).click()

  await page.waitForURL(/\/acceso\?motivo=sesion/)
  await expect(page.getByText('Tu sesión ha terminado. Vuelve a entrar y seguirás donde lo dejaste.')).toBeVisible()
  await sinErroresDeAccesibilidad(page)
  // El token se ha borrado de este navegador.
  expect(await page.evaluate(() => Object.keys(localStorage).filter((k) => k.includes('auth-token')))).toEqual([])
  // El bienestar (pregunta privada) no se ha guardado en el navegador.
  const borrador = await page.evaluate(() => Object.entries(localStorage).find(([k]) => k.startsWith('sintonia:borrador:estudiante:'))?.[1])
  expect(JSON.parse(borrador!).valores).toEqual({ avance: 1, siguiente_paso: 3, apoyo: 3, bienestar: null })

  await page.unroute(RPC('guardar_checkin_estudiante'))
  await entrarConContrasena(page, 'ana@usal.es')

  // De vuelta en el check-in, con lo marcado.
  await expect(page).toHaveURL(/\/estudiante\/checkin$/)
  await expect(page.getByText('Hemos recuperado lo que marcaste y no llegaste a enviar.')).toBeVisible()
  // El bienestar no viene del borrador: si ya había un check-in enviado, sale
  // lo enviado; si no, está vacío y se pide responderlo de nuevo.
  const notaBienestar = page.getByText('La pregunta sobre tu bienestar no se guarda en este dispositivo')
  if (await page.getByText('Revísalo y pulsa «Enviar»').isVisible()) {
    await expect(notaBienestar).toBeVisible()
    await expect(grupos.nth(3).locator('[aria-checked="true"]')).toHaveCount(0)
  } else {
    await expect(notaBienestar).toHaveCount(0)
  }
  await expect(grupos.nth(0).getByRole('radio', valor(1))).toHaveAttribute('aria-checked', 'true')
  await expect(grupos.nth(1).getByRole('radio', valor(3))).toHaveAttribute('aria-checked', 'true')
  await expect(grupos.nth(2).getByRole('radio', valor(3))).toHaveAttribute('aria-checked', 'true')
  await sinErroresDeAccesibilidad(page)

  // Al cerrar sesión no queda ningún borrador en el navegador.
  if (await page.getByRole('button', { name: 'Abrir el menú' }).isVisible()) await page.getByRole('button', { name: 'Abrir el menú' }).click()
  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  await page.waitForURL((u) => u.pathname === '/')
  expect(await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('sintonia:borrador:')))).toEqual([])
})

test('sin conexión, el aviso lo dice (antes salía "Algo no ha ido bien")', async ({ page }) => {
  await entrarConContrasena(page, 'ana@usal.es')
  await page.route(RPC('mi_checkin'), (r) => r.abort('internetdisconnected'))
  await page.getByRole('link', { name: /Hacer el check-in|Revisar/ }).click()
  await expect(page.getByRole('alert')).toContainText('No hay conexión. Comprueba tu red e inténtalo de nuevo.')
})

test('si el perfil no carga, no se manda a iniciar sesión: se ofrece reintentar', async ({ page }) => {
  await entrarConContrasena(page, 'tutora@usal.es')
  await page.route(RPC('mi_perfil'), (r) => r.abort('internetdisconnected'))
  await page.reload()
  await expect(page.getByRole('heading', { name: 'No hemos podido cargar tu cuenta' })).toBeVisible()
  await expect(page).toHaveURL(/\/tutor$/)
  await sinErroresDeAccesibilidad(page)

  await page.unroute(RPC('mi_perfil'))
  await page.getByRole('button', { name: 'Reintentar' }).click()
  await expect(page.getByRole('heading', { name: /^Hola, / })).toBeVisible()
})

test('con una versión nueva publicada y la pestaña abierta, la pantalla se recarga sola', async ({ page }) => {
  await entrarConContrasena(page, 'ana@usal.es')
  // El archivo de la pantalla ya no existe (la primera vez).
  let veces = 0
  await page.route(/\/assets\/HistorialView-[^/]+\.js$/, (r) => (veces++ === 0 ? r.fulfill({ status: 404, body: '' }) : r.continue()))
  await page.locator('main').getByRole('link', { name: /Mi histórico/ }).click()
  await expect(page).toHaveURL(/\/estudiante\/historial$/)
  await expect(page.getByRole('heading', { name: 'Mi histórico' })).toBeVisible()
  expect(veces).toBe(2)
})
