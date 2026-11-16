// Piezas comunes de los guiones de exportación.
import { bundle } from '@remotion/bundler'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const local = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell'
export const browserExecutable = process.env.NAVEGADOR || (existsSync(local) ? local : undefined)
export const empaquetar = () => bundle({ entryPoint: path.join(raiz, 'src/index.ts') })
