// Configuración de Tailwind con los tokens «Tinta y lumbre» de LUMBRA360 (ver DISENO.md).
// Los nombres "brand" y "surface" se conservan para no tocar las pantallas:
// solo cambia su valor (src/assets/tokens.css).

/** @type {import('tailwindcss').Config} */
export default {
  // El hover de Tailwind solo con ratón: en pantallas táctiles no se queda pegado (skill mobile-native).
  future: { hoverOnlyWhenSupported: true },
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Tinta y lumbre (LUMBRA360). Valores en tokens.css; cambian en oscuro.
          50: 'rgb(var(--rgb-b50) / <alpha-value>)', // tinta 50: selección
          100: 'rgb(var(--rgb-b100) / <alpha-value>)', // tinta 100: círculos de icono
          200: 'rgb(var(--rgb-b200) / <alpha-value>)', // piedra 300: bordes suaves
          400: 'rgb(var(--rgb-b400) / <alpha-value>)', // lumbre 300: acento sobre tinta
          500: 'rgb(var(--rgb-b500) / <alpha-value>)', // lumbre 400: el único acento
          600: 'rgb(var(--rgb-b500) / <alpha-value>)',
          700: 'rgb(var(--rgb-b700) / <alpha-value>)',
          800: 'rgb(var(--rgb-b800) / <alpha-value>)', // tinta 800: rellenos con texto blanco
          900: 'rgb(var(--rgb-b900) / <alpha-value>)', // tinta 900: acción
        },
        surface: {
          50: 'rgb(var(--rgb-s50) / <alpha-value>)', // lienzo blanco
          100: 'rgb(var(--rgb-s100) / <alpha-value>)', // piedra 50: alterna secciones
          200: 'rgb(var(--rgb-s200) / <alpha-value>)', // filetes
          300: 'rgb(var(--rgb-s300) / <alpha-value>)', // filete fuerte, sin texto
          600: 'rgb(var(--rgb-s600) / <alpha-value>)', // texto secundario
          800: 'rgb(var(--rgb-s800) / <alpha-value>)', // etiquetas
          900: 'rgb(var(--rgb-s900) / <alpha-value>)', // tinta: texto y titulares
        },
        // Fondo de tarjetas (blanco en claro).
        papel: 'rgb(var(--rgb-papel) / <alpha-value>)',
        // Bloques oscuros de la marca (tinta 900). El nombre se conserva por compatibilidad.
        marino: 'rgb(var(--rgb-marino) / <alpha-value>)',
        lumbre: {
          DEFAULT: 'rgb(var(--rgb-b500) / <alpha-value>)',
          texto: 'var(--color-lumbre-texto)',
          suave: 'var(--color-lumbre-suave)',
        },
      },
      fontFamily: {
        display: ['"Instrument Sans"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        body: ['"Instrument Sans"', 'system-ui', '"Segoe UI"', 'sans-serif'],
        // Sin tipografía de ancho fijo: la familia "mono" también es Instrument Sans (DECISIONES.md, 26/11/2026).
        mono: ['"Instrument Sans"', 'system-ui', '"Segoe UI"', 'sans-serif'],
      },
      // Las utilidades rounded-* van un escalón por debajo de los tokens (las usan
      // piezas pequeñas); tarjetas y paneles usan --radius-md/--radius-lg en main.css.
      borderRadius: {
        sm: 'var(--radius-xs)',
        md: 'var(--radius-sm)',
        lg: 'var(--radius-md)',
        panel: 'var(--radius-lg)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
        overlay: 'var(--shadow-overlay)',
      },
      // Interletraje de titulares de LUMBRA360: cerrado.
      letterSpacing: {
        tight: 'var(--tracking-titular)',
        tighter: 'var(--tracking-heroe)',
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
