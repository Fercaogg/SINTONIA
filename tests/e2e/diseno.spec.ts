// Diseño de la Fase 4: modo oscuro, movimiento con propósito y sin saltos de
// maquetación, ondas que responden a la demostración y tabla interactiva.

import { expect, test } from '@playwright/test'
import { entrarConContrasena, sinErroresDeAccesibilidad } from './ayudantes'

test.describe('modo oscuro', () => {
  test.use({ colorScheme: 'dark' })

  test('las páginas públicas y las del panel cumplen el contraste en oscuro', async ({ page }) => {
    for (const ruta of ['/', '/como-funciona', '/investigacion', '/privacidad', '/acceso', '/registro']) {
      await page.goto(ruta)
      await page.waitForLoadState('networkidle')
      const fondo = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
      expect(fondo, ruta).toBe('rgb(9, 24, 31)')
      await sinErroresDeAccesibilidad(page)
    }
    await entrarConContrasena(page, 'ana@usal.es')
    for (const ruta of ['/estudiante', '/calendario', '/cuenta']) {
      await page.goto(ruta)
      await page.waitForLoadState('networkidle')
      await sinErroresDeAccesibilidad(page)
    }
  })
})

test('con "reducir movimiento" todo se ve en su estado final', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('#como-funciona').getByText('En sintonía')).toBeAttached()
  await expect(page.getByLabel('SINTONÍA en cifras')).toContainText('60')
  const animacion = await page.locator('.entrada').first().evaluate((el) => getComputedStyle(el).animationName)
  expect(animacion).toBe('none')
})

test('sin "reducir movimiento", las ondas se mueven solo con transform y la página no salta', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.addInitScript(() => {
    ;(window as any).__cls = 0
    new PerformanceObserver((lista) => {
      for (const e of lista.getEntries() as any[]) if (!e.hadRecentInput) (window as any).__cls += e.value
    }).observe({ type: 'layout-shift', buffered: true })
  })
  await page.goto('/')
  const tutor = page.locator('#demostracion .ondas-tutor')
  const antes = await tutor.evaluate((el) => (el as SVGGElement).style.transform)
  await page.locator('#demostracion').getByLabel('Tutor/a').fill('4')
  await expect.poll(() => tutor.evaluate((el) => (el as SVGGElement).style.transform)).not.toBe(antes)
  expect(await tutor.evaluate((el) => getComputedStyle(el).transitionProperty)).toBe('transform')
  // Recorrer la página entera.
  for (let i = 0; i < 12; i++) {
    await page.mouse.wheel(0, 700)
    await page.waitForTimeout(80)
  }
  const cls = await page.evaluate(() => (window as any).__cls)
  expect(cls).toBeLessThan(0.1)
})

test('la tabla "Quién ve qué" ilumina quién ve un dato y cierra el candado donde no', async ({ page }, info) => {
  await page.goto('/como-funciona')
  if (info.project.name === 'movil') {
    const tarjeta = page.getByRole('button', { name: /Tu respuesta de bienestar/ })
    await tarjeta.click()
    await expect(tarjeta).toHaveAttribute('aria-pressed', 'true')
    await expect(tarjeta.locator('.celda[data-acceso="no"][data-activa="true"]')).toHaveCount(2)
  } else {
    const fila = page.locator('tr', { has: page.getByRole('button', { name: 'Tu respuesta de bienestar' }) })
    await fila.hover()
    await expect(fila).toHaveAttribute('data-activa', 'true')
    await expect(fila.locator('.celda[data-acceso="no"] .candado')).toHaveCount(2)
    await expect(fila.locator('.celda[data-acceso="si"]')).toHaveCount(1)
  }
  await sinErroresDeAccesibilidad(page)
})

test('la imagen para compartir existe y mide 1200 x 630', async ({ page, request }) => {
  await page.goto('/')
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og\.png$/)
  const r = await request.get('/og.png')
  expect(r.headers()['content-type']).toBe('image/png')
  const b = await r.body()
  expect([b.readUInt32BE(16), b.readUInt32BE(20)]).toEqual([1200, 630])
})

test.describe('efecto del inicio (campo de ondas)', () => {
  test('se dibuja con WebGL, responde a la demostración y se puede pausar', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/')
    const campo = page.locator('canvas.campo')
    await expect(campo).toHaveAttribute('aria-hidden', 'true')
    const webgl = await campo.getAttribute('data-webgl')
    test.skip(webgl !== 'true', 'Este navegador de pruebas no tiene WebGL: la portada se ve sin el efecto')
    // Sin aceleración gráfica (como en este navegador de pruebas), el fondo es un fotograma quieto.
    test.skip((await campo.getAttribute('data-estado')) === 'quieto', 'Sin aceleración gráfica: el fondo queda quieto, sin botón de pausa')
    await expect(campo).toHaveAttribute('data-estado', 'en-marcha')
    const pausa = page.getByRole('button', { name: 'Pausar el fondo' })
    await pausa.click()
    await expect(campo).toHaveAttribute('data-estado', 'pausado')
    await page.getByRole('button', { name: 'Reanudar el fondo' }).click()
    await expect(campo).toHaveAttribute('data-estado', 'en-marcha')
  })

  test('con "reducir movimiento" es un fotograma quieto y no hay botón de pausa', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const campo = page.locator('canvas.campo')
    const webgl = await campo.getAttribute('data-webgl')
    test.skip(webgl !== 'true', 'Sin WebGL en este navegador de pruebas')
    await expect(campo).toHaveAttribute('data-estado', 'quieto')
    await expect(page.getByRole('button', { name: /el fondo/ })).toHaveCount(0)
  })

  test('el titular del cierre queda unido y legible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/')
    const titulo = page.getByRole('heading', { name: 'En sintonía.' })
    await titulo.scrollIntoViewIfNeeded()
    await expect(titulo).toHaveAttribute('data-unido', 'true')
    await expect(titulo.locator('.texto-real')).toHaveCSS('opacity', '1', { timeout: 3000 })
  })
})
