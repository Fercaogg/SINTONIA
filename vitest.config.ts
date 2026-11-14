import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    testTimeout: 30000,
    hookTimeout: 60000,
    // Lo de la aplicación (src/) se prueba en un navegador simulado; el resto, en Node.
    projects: [
      { extends: true, test: { name: 'aplicacion', include: ['src/**/*.test.ts'], environment: 'jsdom' } },
      { extends: true, test: { name: 'servidor', include: ['tests/**/*.test.ts', 'servidor/**/*.test.ts'], environment: 'node' } },
    ],
  },
})
