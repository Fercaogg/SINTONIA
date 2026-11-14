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
          900: 'rgb(var(--rgb-b900) / <alpha-value>)', // #1d7060, WW360 tailwind.config.js:16 (en oscuro se aclara; tokens.css)
        },
        surface: {
          // Valores en tokens.css (claro: los de WW360; oscuro: invertidos).
          50: 'rgb(var(--rgb-s50) / <alpha-value>)', // #F5F7F6 fondo
          100: 'rgb(var(--rgb-s100) / <alpha-value>)', // #F0F4F3
          200: 'rgb(var(--rgb-s200) / <alpha-value>)', // #E3EAEA bordes
          300: 'rgb(var(--rgb-s300) / <alpha-value>)', // #8A9BA5 solo decoración, sin texto
          600: 'rgb(var(--rgb-s600) / <alpha-value>)', // #5A6B75 texto de párrafo
          800: 'rgb(var(--rgb-s800) / <alpha-value>)', // #3A4A54 etiquetas
          900: 'rgb(var(--rgb-s900) / <alpha-value>)', // #0A4A6C títulos, azul marino
        },
        // Fondo de tarjetas (blanco en claro).
        papel: 'rgb(var(--rgb-papel) / <alpha-value>)',
        // Azul marino de la marca, fijo en los dos modos (bandas, avatares, pestaña activa).
        marino: '#0A4A6C',
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
