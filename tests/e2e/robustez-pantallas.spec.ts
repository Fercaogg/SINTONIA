// Robustez por dentro, bloque 2: "Reintentar", semana que se cierra con la
// página abierta, menú del móvil, foco al cambiar de pantalla y "Mi cuenta".
// Ver DECISIONES.md (25/11/2026).

import { expect, test, type Page, type Route } from '@playwright/test'
import { entrarConContrasena, sinErroresDeAccesibilidad } from './ayudantes'

const RPC = (f: string) => `**/rest/v1/rpc/${f}`
const valor = (n: number) => ({ name: new RegExp(`^${n}(,|$)`) })

/** mi_checkin responde como si la semana abierta se hubiera cerrado. */
async function semanaCerrada(r: Route) {
  const respuesta = await r.fetch()
  const j = await respuesta.json()
  const abre = new Date(Date.now() + 3 * 86_400_000).toISOString()
  j.calendario = { estado: 'entre', semana: j.calendario.semana, proxima: j.calendario.semana + 1, abre, semanas: j.calendario.semanas }
  await r.fulfill({ response: respuesta, json: j })
}

async function marcarCheckin(page: Page) {
  await page.goto('/estudiante/checkin')
  await expect(page.getByRole('heading', { name: /Check-in de la semana/ })).toBeVisible()
  const grupos = page.getByRole('radiogroup')
  for (let i = 0; i < 4; i++) await grupos.nth(i).getByRole('radio', valor(3)).click()
}

test('si falla la carga de una pantalla, "Reintentar" la vuelve a pedir sin recargar', async ({ page }) => {
  await entrarConContrasena(page, 'ana@usal.es')
  await page.route(RPC('mi_historial'), (r) => r.abort('internetdisconnected'))
  await page.goto('/estudiante/historial')
  await expect(page.getByRole('alert')).toContainText('No hay conexión')
  await page.unroute(RPC('mi_historial'))
  await page.getByRole('button', { name: 'Reintentar' }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Mi histórico' })).toBeVisible()
})

test('si la semana se cierra con el check-in abierto, no se envía a otra semana y se explica', async ({ page }) => {
  await entrarConContrasena(page, 'ana@usal.es')
  await marcarCheckin(page)
  let guardados = 0
  await page.route(RPC('guardar_checkin_estudiante'), (r) => {
    guardados++
    return r.continue()
  })
  await page.route(RPC('mi_checkin'), semanaCerrada)
  await page.getByRole('button', { name: /^(Enviar|Guardar cambios)$/ }).click()
  await expect(page.getByText(/se cerró mientras tenías la página abierta, y lo que no habías enviado no se ha guardado/)).toBeVisible()
  await expect(page.getByRole('heading', { name: /ya se ha cerrado/ })).toBeVisible()
  expect(guardados).toBe(0)
  await sinErroresDeAccesibilidad(page)
})

test('al volver a la pestaña tras un rato, el check-in comprueba si la semana sigue abierta', async ({ page }) => {
  await page.clock.install()
  await entrarConContrasena(page, 'ana@usal.es')
  await marcarCheckin(page)
  await page.route(RPC('mi_checkin'), semanaCerrada)

  const visibilidad = (estado: 'hidden' | 'visible') =>
    page.evaluate((e) => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => e })
      document.dispatchEvent(new Event('visibilitychange'))
    }, estado)
  await visibilidad('hidden')
  await page.clock.fastForward('02:00')
  await visibilidad('visible')
  await expect(page.getByText(/se cerró mientras tenías la página abierta/)).toBeVisible()
})

test.describe('menú del móvil', () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== 'movil', 'Solo en el móvil'))

  test('el foco entra, no se escapa, Esc cierra y vuelve al botón; cerrado no se puede tabular', async ({ page }) => {
    await entrarConContrasena(page, 'ana@usal.es')
    const boton = page.getByRole('button', { name: 'Abrir el menú' })

    // Cerrado: el tabulador no pasa por los enlaces del menú, que no se ven.
    await boton.focus()
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => !!document.activeElement?.closest('#menu-lateral'))).toBe(false)
    }

    await boton.click()
    await expect(page.getByRole('button', { name: 'Cerrar el menú' })).toBeFocused()
    // 30 tabulaciones después, el foco sigue dentro del menú.
    for (let i = 0; i < 30; i++) await page.keyboard.press('Tab')
    expect(await page.evaluate(() => !!document.activeElement?.closest('#menu-lateral'))).toBe(true)
    await page.keyboard.press('Escape')
    await expect(boton).toBeFocused()
    await expect(boton).toHaveAttribute('aria-expanded', 'false')

    // El botón de cerrar también funciona.
    await boton.click()
    await page.getByRole('button', { name: 'Cerrar el menú' }).click()
    await expect(boton).toBeFocused()
  })
})

test('al cambiar de pantalla, el foco pasa al contenido y se anuncia el título', async ({ page }) => {
  await entrarConContrasena(page, 'ana@usal.es')
  await page.locator('main').getByRole('link', { name: /Mi histórico/ }).click()
  await expect(page.getByRole('heading', { name: 'Mi histórico' })).toBeVisible()
  await expect(page.locator('main#contenido')).toBeFocused()
  await expect(page.locator('[data-anuncio-pantalla]')).toHaveText('Mi histórico')
})

test('Mi cuenta: la descarga dice que está lista y un aviso no se mezcla con un error anterior', async ({ page }) => {
  await entrarConContrasena(page, 'ana@usal.es')
  await page.goto('/cuenta')

  await page.route(RPC('mis_datos'), (r) => r.abort('internetdisconnected'))
  await page.getByRole('button', { name: /Descargar/ }).click()
  await expect(page.getByRole('alert')).toContainText('No hay conexión')
  await page.unroute(RPC('mis_datos'))

  const descarga = page.waitForEvent('download')
  await page.getByRole('button', { name: /Descargar/ }).click()
  expect((await descarga).suggestedFilename()).toBe('mis-datos-sintonia.json')
  await expect(page.getByText('Descarga lista')).toBeVisible()
  await expect(page.getByRole('alert')).toHaveCount(0)
})
