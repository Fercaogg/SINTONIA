// Configuración de Tailwind con los tokens de WORKWELL360 (ver DISENO.md).
// Los nombres "brand" y "surface" son los mismos que en WORKWELL360 para poder
// reutilizar sus componentes con cambios mínimos.

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'rgba(52,198,163,0.08)', // WW360 tailwind.config.js:8
          100: 'rgba(52,198,163,0.15)', // WW360 tailwind.config.js:9
          200: 'rgba(52,198,163,0.4)', // WW360 tailwind.config.js:10
          400: '#4ED7C2', // WW360 tailwind.config.js:11
          500: '#34C6A3', // WW360 tailwind.config.js:12 (color de identidad)
          600: '#34C6A3', // WW360 tailwind.config.js:13
          700: '#2FB393', // WW360 tailwind.config.js:14
          800: '#248a73', // WW360 tailwind.config.js:15
          900: '#1d7060', // WW360 tailwind.config.js:16 (botones y enlaces, contraste 5,93:1)
        },
        surface: {
          50: '#F5F7F6', // WW360 tailwind.config.js:19 (fondo)
          100: '#F0F4F3', // WW360 tailwind.config.js:20
          200: '#E3EAEA', // WW360 tailwind.config.js:21 (bordes)
          300: '#8A9BA5', // WW360 tailwind.config.js:22 (solo decoración, sin texto)
          600: '#5A6B75', // WW360 main.css:20 (texto de párrafo)
          800: '#3A4A54', // WW360 tailwind.config.js:23 (etiquetas)
          900: '#0A4A6C', // WW360 tailwind.config.js:24 (títulos, azul marino)
        },
      },
      fontFamily: {
        display: ['"Fira Sans"', 'system-ui', 'sans-serif'],
        body: ['"Fira Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
      },
      minHeight: {
        tactil: '44px',
      },
      minWidth: {
        tactil: '44px',
      },
    },
  },
  plugins: [],
}
