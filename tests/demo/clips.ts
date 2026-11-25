// Graba los clips de la portada («Para cada perfil») en modo demostración,
// con datos ficticios: npm run clips. Los vídeos en bruto se guardan en
// .local/clips y scripts/convertir-clips.sh los deja en public/clips
// (WebM VP9, MP4 de respaldo e imagen fija WebP, 360 x 720).
// No es un test: recorre cada pantalla como lo haría una persona.

import { mkdirSync, renameSync } from 'node:fs'
import { test, type Browser, type Page } from '@playwright/test'
import { entrarComo, type Perfil } from './ayudantes'

const carpeta = '.local/clips'
const TAMANO = { width: 360, height: 720 }

async function grabar(browser: Browser, perfil: Perfil, nombre: string, recorrido: (page: Page) => Promise<void>) {
  // Primero se entra sin grabar; luego se graba solo la pantalla, ya con sesión.
  const previo = await browser.newContext({ viewport: TAMANO, deviceScaleFactor: 1, locale: 'es-ES', timezoneId: 'Europe/Madrid' })
  const p0 = await previo.newPage()
  await entrarComo(p0, perfil)
  const estado = await previo.storageState()
  await previo.close()

  const ctx = await browser.newContext({
    viewport: TAMANO,
    deviceScaleFactor: 1,
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
    reducedMotion: 'no-preference',
    storageState: estado,
    recordVideo: { dir: carpeta, size: TAMANO },
  })
  const page = await ctx.newPage()
  await recorrido(page)
  const video = page.video()
  await ctx.close()
  if (video) renameSync(await video.path(), `${carpeta}/${nombre}.webm`)
}

async function preparar(page: Page, ruta: string) {
  await page.goto(ruta)
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  // La banda de demostración y el saltar al contenido no salen en el clip.
  await page.addStyleTag({ content: '[data-banda-entorno], .banda-entorno { display: none !important }' })
  await page.waitForTimeout(700)
}

async function desplazar(page: Page, hasta: number, ms: number) {
  await page.evaluate(
    ({ hasta, ms }) =>
      new Promise<void>((fin) => {
        const desde = window.scrollY
        const t0 = performance.now()
        const paso = (t: number) => {
          const v = Math.min(1, (t - t0) / ms)
          const e = v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2
          window.scrollTo(0, desde + (hasta - desde) * e)
          if (v < 1) requestAnimationFrame(paso)
          else fin()
        }
        requestAnimationFrame(paso)
      }),
    { hasta, ms },
  )
}

test('clips de la portada', async ({ browser }) => {
  test.setTimeout(120_000)
  mkdirSync(carpeta, { recursive: true })

  await grabar(browser, 'Estudiante', 'estudiante', async (page) => {
    await preparar(page, '/estudiante/checkin')
    const grupos = page.getByRole('radiogroup')
    const elegir = [['4'], ['3'], [/^5/]] as const
    for (let i = 0; i < elegir.length; i++) {
      const g = grupos.nth(i)
      await g.scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)
      await g.getByRole('radio', { name: elegir[i][0] }).click()
      await page.waitForTimeout(900)
    }
    await page.waitForTimeout(800)
  })

  await grabar(browser, 'Tutor/a', 'tutor', async (page) => {
    await preparar(page, '/tutor/checkin')
    const tarjetas = page.locator('main li.card').filter({ has: page.getByRole('radiogroup') })
    const n = Math.min(3, await tarjetas.count())
    for (let i = 0; i < n; i++) {
      const grupos = tarjetas.nth(i).getByRole('radiogroup')
      await grupos.first().scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)
      await grupos.first().getByRole('radio', { name: ['4', '3', '2'][i] }).click()
      await page.waitForTimeout(500)
      if ((await grupos.count()) > 1) {
        await grupos.nth(1).getByRole('radio', { name: ['3', '4', '3'][i] }).click()
        await page.waitForTimeout(700)
      }
    }
    await page.waitForTimeout(800)
  })

  await grabar(browser, 'Dirección del máster', 'direccion', async (page) => {
    await preparar(page, '/direccion')
    await page.waitForTimeout(600)
    await desplazar(page, 420, 1800)
    await page.waitForTimeout(800)
    await desplazar(page, 1100, 1800)
    await page.waitForTimeout(1000)
  })
})
