// Fase 2 de las mejoras profesionales: entender el producto sin explicarlo.

import { expect, test } from '@playwright/test'
import { sinErroresDeAccesibilidad, sinRayasLargas } from './ayudantes'

test('demostración guiada: check-in, tutor/a, desajuste con 3 preguntas y dirección, sin llamar a ninguna API', async ({ page }) => {
  const peticiones: string[] = []
  page.on('request', (r) => { if (/\/(api|rest|auth)\//.test(r.url())) peticiones.push(r.url()) })
  await page.goto('/demo/recorrido')
  await expect(page.getByRole('note')).toContainText('Demostración')
  const siguiente = page.getByRole('button', { name: 'Siguiente' })
  await expect(siguiente).toBeDisabled()
  const g = page.getByRole('radiogroup')
  for (const [i, v] of [[0, '4'], [1, '3'], [2, '4'], [3, '3']] as const) await g.nth(i).getByRole('radio', { name: new RegExp(`^${v}`) }).click()
  await sinErroresDeAccesibilidad(page)
  await siguiente.click()
  await expect(page.getByRole('heading', { level: 1, name: 'Responde por Alex' })).toBeFocused()
  await page.getByRole('radiogroup').first().getByRole('radio', { name: /^2/ }).click()
  await siguiente.click()
  await expect(page.getByText('2 puntos de diferencia: hay desajuste.')).toBeVisible()
  await expect(page.locator('ol.list-decimal li')).toHaveCount(3)
  await sinErroresDeAccesibilidad(page)
  await siguiente.click()
  await expect(page.getByText('Grupo con 3 estudiantes: datos insuficientes')).toBeVisible()
  await expect(page.getByText('Estas son inventadas para la demostración.', { exact: false })).toBeVisible()
  await sinErroresDeAccesibilidad(page)
  await page.getByRole('button', { name: 'Terminar' }).click()
  await expect(page.getByRole('link', { name: 'Entrar en la demostración completa' })).toBeVisible()
  await sinRayasLargas(page)
  expect(peticiones).toEqual([])
})

test('demostración guiada: sin desajuste, se puede ver qué pasaría con otra mirada', async ({ page }) => {
  await page.goto('/demo/recorrido')
  const g = page.getByRole('radiogroup')
  for (let i = 0; i < 4; i++) await g.nth(i).getByRole('radio', { name: /^3/ }).click()
  await page.getByRole('button', { name: 'Siguiente' }).click()
  await page.getByRole('radiogroup').first().getByRole('radio', { name: /^3/ }).click()
  await page.getByRole('button', { name: 'Siguiente' }).click()
  await expect(page.getByText('Veis el avance igual.')).toBeVisible()
  await page.getByRole('button', { name: 'Ver qué pasa si el tutor/a lo ve distinto' }).click()
  await expect(page.getByText('2 puntos de diferencia: hay desajuste.')).toBeVisible()
})

test('calculadora de tiempo: 60 s por estudiante y 30 s por tutor/a', async ({ page }) => {
  await page.goto('/#tiempo')
  const calc = page.locator('#tiempo')
  await expect(calc).toContainText('34 min')
  await calc.getByLabel('Estudiantes del máster').fill('10')
  await calc.getByLabel('Tutores y tutoras').fill('3')
  await expect(calc).toContainText('11,5 min')
  await calc.getByLabel('Estudiantes del máster').fill('')
  await expect(calc).toContainText('1,5 min')
})

test('comparativa honesta: tres columnas y sin marcas', async ({ page }) => {
  await page.goto('/#comparativa')
  const comp = page.locator('#comparativa')
  for (const c of ['Tutoría sin seguimiento', 'SINTONÍA', 'Herramientas que vigilan']) await expect(comp.getByText(c).first()).toBeAttached()
  await expect(comp.getByText('Límites').first()).toBeAttached()
  await sinErroresDeAccesibilidad(page)
})

test('clips por perfil: vídeos ligeros que solo se cargan al verse', async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  for (const rol of ['estudiante', 'tutor', 'direccion']) {
    for (const ext of ['webm', 'mp4', 'webp']) {
      const r = await request.get(`/clips/${rol}.${ext}`)
      expect(r.status(), `${rol}.${ext}`).toBe(200)
      expect((await r.body()).length, `${rol}.${ext} pesa demasiado`).toBeLessThan(200_000)
    }
  }
  await page.goto('/')
  const videos = page.locator('#perfiles video')
  await expect(videos).toHaveCount(3)
  expect(await videos.first().evaluate((v) => (v as HTMLVideoElement).muted)).toBe(true)
  await expect(videos.first().locator('source')).toHaveCount(0)
  await videos.first().scrollIntoViewIfNeeded()
  await expect(videos.first().locator('source')).toHaveCount(2)
})

test('clips por perfil: con "reducir movimiento", imagen fija', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('#perfiles video')).toHaveCount(0)
  await expect(page.locator('#perfiles img[src^="/clips/"]')).toHaveCount(3)
})
