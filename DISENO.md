# Sistema visual de SINTONÍA (heredado de WORKWELL360)

Este documento recoge el sistema visual de WORKWELL360, extraído directamente de su código fuente, y explica cómo se convierte en los tokens de diseño de SINTONÍA.

Las rutas de origen se refieren a la carpeta `workwell360/` del código que me entregaste. Cuando cito "main.css:15" quiero decir "archivo `src/assets/main.css`, línea 15".

Estado: **borrador de la Fase 1, pendiente de tu aprobación.** Las propuestas que se apartan de WORKWELL360 están marcadas como **PROPUESTA** y no se aplicarán sin tu visto bueno.

---

## 1. Paleta de colores

### 1.1. Colores de marca (verde agua)

| Token SINTONÍA | Valor | Uso en WORKWELL360 | Origen |
|---|---|---|---|
| `--color-primary` | `#34C6A3` | Color principal: botones, barra de progreso, enlace activo del menú, borde de la opción elegida | main.css:15 · tailwind.config.js:12 y 13 (`brand-500`, `brand-600`) |
| `--color-primary-hover` | `#2FB393` | Botón principal al pasar el ratón | main.css:16 · tailwind.config.js:14 (`brand-700`) |
| `--color-primary-light` | `#4ED7C2` | Tercera parte del logotipo ("360"), cifras destacadas | main.css:17 · tailwind.config.js:11 (`brand-400`) |
| `--color-primary-dark` | `#248a73` | Texto verde sobre fondo claro | tailwind.config.js:15 (`brand-800`) |
| `--color-primary-darker` | `#1d7060` | Texto verde intenso | tailwind.config.js:16 (`brand-900`) |
| `--color-primary-tint-08` | `rgba(52,198,163,0.08)` | Fondo de la opción elegida, hover de botón secundario | tailwind.config.js:8 (`brand-50`) · main.css:84 y 158 |
| `--color-primary-tint-15` | `rgba(52,198,163,0.15)` | Círculos de icono, anillo de foco de los campos | tailwind.config.js:9 (`brand-100`) · main.css:119 |
| `--color-primary-tint-40` | `rgba(52,198,163,0.4)` | Bordes de avisos de éxito y de etiquetas verdes | tailwind.config.js:10 (`brand-200`) · main.css:129 |

### 1.2. Neutros (superficies y texto)

| Token SINTONÍA | Valor | Uso en WORKWELL360 | Origen |
|---|---|---|---|
| `--color-heading` | `#0A4A6C` | Títulos, texto principal, azul marino de la marca ("WORK" del logo), menú lateral del administrador | main.css:18 · tailwind.config.js:24 (`surface-900`) · AppLogo.vue |
| `--color-label` | `#3A4A54` | Etiquetas de formulario | main.css:19 · tailwind.config.js:23 (`surface-800`) |
| `--color-body` | `#5A6B75` | Texto de párrafo, marcadores de posición | main.css:20 |
| `--color-muted` | `#8A9BA5` | Texto secundario muy suave | tailwind.config.js:22 (`surface-300`) |
| `--color-bg` | `#F5F7F6` | Fondo general de la página | main.css:21 y 34 · tailwind.config.js:19 (`surface-50`) |
| `--color-surface-alt` | `#F0F4F3` | Fondo de la pista de la barra de progreso | tailwind.config.js:20 (`surface-100`) |
| `--color-border` | `#E3EAEA` | Bordes de tarjetas y campos | main.css:22 · tailwind.config.js:21 (`surface-200`) |
| `--color-white` | `#FFFFFF` | Fondo de tarjetas | main.css:48 (`.card` usa `bg-white`) |

### 1.3. Colores de estado

WORKWELL360 no define colores de estado propios: usa la paleta estándar de Tailwind.

| Estado | Clases usadas | Valores | Origen |
|---|---|---|---|
| Error | `bg-red-50`, `border-red-200`, `text-red-700` | `#FEF2F2`, `#FECACA`, `#B91C1C` | LoginView.vue (aviso de error), CheckInView.vue |
| Peligro (botón) | `bg-red-600`, hover `bg-red-700` | `#DC2626`, `#B91C1C` | main.css:96 a 104 (`.btn-danger`) |
| Advertencia | `bg-amber-100`, `text-amber-700` | `#FEF3C7`, `#B45309` | main.css:131 (`.badge-amber`) |
| Éxito | fondo `brand-50`, borde `brand-200`, texto `brand-800` | ver 1.1 | WeeklySurveyView.vue (aviso "Respuestas guardadas") |
| Información | `.badge-sky`: `rgba(78,215,194,0.15)` con texto `#0A4A6C` | ver 1.1 | main.css:133 a 136 |

### 1.4. Colores que NO se heredan

- **Panel "master" (investigación)**: usa un degradado azul muy oscuro (`#062035` a `#082e4a`, fondo `#07243a`) y acentos violeta (`violet-500`, `violet-600`, `#8b5cf6`). Origen: MasterLayout.vue:39, 46, 54, 68 y 80. Es un estilo aparte que no aparece en el resto del producto. **PROPUESTA**: no usarlo; el panel del investigador de SINTONÍA usará el mismo menú azul marino (`#0A4A6C`) que el panel de administración de WORKWELL360 (AdminLayout.vue:111).
- **Semáforo verde, ámbar y rojo de puntuaciones** (AdminDashboardView.vue:73 y 74, HistoryView.vue): **no se usará** en SINTONÍA, porque el encargo prohíbe semáforos, notas y comparaciones.
- **Grises "slate" de los gráficos** (`#64748B`, `#475569`, `rgba(15,23,42,0.92)`): AdminDashboardView.vue:108, 111, 130 y 136. **PROPUESTA**: sustituirlos por los neutros de la marca (`#5A6B75`, `#3A4A54` y `#0A4A6C`) para no añadir colores nuevos.

### 1.5. Problema de accesibilidad detectado (importante)

He medido el contraste de la paleta con la fórmula de las WCAG 2.1. La norma AA exige **4,5:1** para el texto normal y **3:1** para el texto grande y los elementos gráficos.

| Combinación | Contraste | ¿Cumple AA? |
|---|---|---|
| Texto blanco sobre `#34C6A3` (botón principal de WORKWELL360) | **2,15** | No |
| Texto blanco sobre `#2FB393` (botón al pasar el ratón) | 2,63 | No |
| `#34C6A3` como color de texto o enlace sobre blanco | 2,15 | No |
| `#8A9BA5` (texto suave) sobre blanco | 2,87 | No |
| Texto blanco sobre `#248a73` | 4,24 | Solo para texto grande |
| Texto blanco sobre `#1d7060` | **5,93** | Sí |
| `#0A4A6C` sobre blanco | 9,51 | Sí |
| `#5A6B75` sobre blanco | 5,53 | Sí |
| `#3A4A54` sobre blanco | 9,18 | Sí |

**PROPUESTA (no añade colores, solo reparte los que ya existen):**
1. `#34C6A3` sigue siendo el color de identidad: logotipo, barra de progreso, borde y fondo de la opción elegida, iconos grandes y detalles decorativos.
2. Los botones principales pasan a fondo `#1d7060` (el `brand-900` de WORKWELL360) con texto blanco, y `#0A4A6C` al pasar el ratón.
3. Los enlaces y el texto verde usan `#1d7060`.
4. El texto suave usa `#5A6B75` en lugar de `#8A9BA5`. Este último queda solo para elementos decorativos sin texto.
5. El botón "neutro" de WORKWELL360 (`rgba(16,16,16,0.3)`, main.css:91) no se hereda, porque su contraste es muy bajo.

---

## 2. Tipografía

| Elemento | Valor | Origen |
|---|---|---|
| Familia única | **Fira Sans**, con `system-ui` y `sans-serif` como respaldo | tailwind.config.js:33 y 34 · index.html:9 |
| Pesos cargados | 400 (normal), 500 (medio) y 700 (negrita) | index.html:9 |
| Carga | Google Fonts con `display=swap` | index.html:9 |
| Números en tablas y cifras | `font-variant-numeric: tabular-nums` | main.css:43 a 45 |
| Suavizado | `antialiased` en el `<body>` | index.html:12 |

**Observación:** WORKWELL360 usa la clase `font-semibold` (peso 600) en 149 sitios, pero ese peso no se carga, así que el navegador lo simula. **PROPUESTA**: cargar también el peso 600 de Fira Sans, que es la misma tipografía, para que la seminegrita se vea bien. En SINTONÍA, Fira Sans se servirá desde el propio sitio para no depender de Google en cada visita, lo que además es más respetuoso con la privacidad.

### Escala de tamaños (los más usados en WORKWELL360)

| Uso | Clase | Tamaño | Veces usada |
|---|---|---|---|
| Texto auxiliar, etiquetas pequeñas | `text-xs` | 12 px | 213 |
| Texto de interfaz y párrafos | `text-sm` | 14 px | 276 |
| Botones | `text-base` | 16 px | 12 (y `.btn-*`, main.css:60) |
| Pregunta del check-in en móvil | `text-lg` | 18 px | 13 |
| Pregunta del check-in en escritorio y títulos de tarjeta | `text-xl` | 20 px | 38 |
| Título de página en móvil | `text-2xl` | 24 px | 47 |
| Título de página en escritorio, cifras grandes | `text-3xl` | 30 px | 40 |

Los títulos de página usan `font-display text-2xl sm:text-3xl tracking-tight` en color `#0A4A6C` (HistoryView.vue, WeeklySurveyView.vue). Las etiquetas de las cifras van en mayúsculas, 12 px y espaciado 0,05em (main.css:145 a 148, `.stat-label`).

**Observación:** WORKWELL360 usa tamaños de 9, 10 y 11 px en 27 sitios. **PROPUESTA**: 12 px como mínimo en SINTONÍA, por legibilidad.

---

## 3. Espaciado, radios y sombras

### Espaciado (escala de Tailwind, múltiplos de 4 px)
- Tarjetas: relleno `p-5` (20 px) en móvil y `p-8` (32 px) en escritorio en el check-in (CheckInView.vue); `p-6` (24 px) en las tarjetas de cifras (main.css:139).
- Botones: 18 px en horizontal y 10 px en vertical (main.css:60, `px-[18px] py-[10px]`).
- Campos: 16 px en horizontal y 12 px en vertical (main.css:107, `px-4 py-3`).
- Contenido principal: `p-4` (16 px) en móvil y `p-8` (32 px) en escritorio, con un ancho máximo de `max-w-6xl` (AppLayout.vue).
- Check-in: columna centrada de `max-w-lg` (512 px) (CheckInView.vue, primera línea de la plantilla).

### Radios de borde

| Token | Valor | Uso | Origen |
|---|---|---|---|
| `--radius-sm` | 4 px | Etiquetas (badges) | main.css:28 y 124 |
| `--radius-md` | 6 px | Tarjetas, botones y campos | main.css:29, 51, 64 y 110 |
| `--radius-lg` | 8 px | Definido, apenas usado | main.css:30 |
| `rounded-xl` | 12 px | Avisos de error y éxito, contenedores de iconos (99 usos) | LoginView.vue, SupportView.vue |
| `rounded-2xl` | 16 px | Botones de la escala del check-in, iconos grandes (62 usos) | CheckInView.vue:158 |
| `rounded-full` | círculo | Avatares, barra de progreso, círculo de éxito (73 usos) | CheckInView.vue:139 |

**Observación:** WORKWELL360 mezcla radios pequeños (6 px en tarjetas y botones) con radios grandes (12 y 16 px en avisos y botones de escala). Lo mantengo tal cual, porque es parte de su aspecto: tarjetas sobrias y escalas táctiles más redondeadas.

### Sombras

| Token | Valor | Uso | Origen |
|---|---|---|---|
| `--shadow-soft` | `0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(10,74,108,0.06)` | Elementos discretos | main.css:24 |
| `--shadow-card` | `rgba(10,74,108,0.15) 0px 20px 40px -20px, rgba(0,0,0,0.08) 0px 10px 20px -10px` | Todas las tarjetas | main.css:25 y 52 |
| `--shadow-elevated` | `rgba(10,74,108,0.15) 0px 20px 40px -12px, rgba(0,0,0,0.08) 0px 10px 20px -8px` | Tarjeta al pasar el ratón | main.css:26 y 56 |
| Opción elegida en la escala | `shadow-lg shadow-brand-500/20` | Botón de escala seleccionado | CheckInView.vue:160 |

---

## 4. Iconografía

- Iconos SVG de trazo, dibujados en línea (estilo Heroicons, versión 1, "outline"), dentro de un único componente `AppIcon` (AppIcon.vue).
- Cuadrícula de 24 × 24, sin relleno, trazo `currentColor` de **1,75** de grosor, con extremos y uniones redondeados (AppIcon.vue:62).
- Tamaños habituales: 16 px dentro de botones, 18 px en el menú y 20 a 32 px en los iconos destacados.
- Los iconos destacados van dentro de un círculo o un cuadrado redondeado con fondo `brand-100` o `brand-50` e icono `brand-600` (CheckInView.vue, pantalla de éxito; SupportView.vue).
- **Reutilizaré el mismo componente y los mismos trazados.** Para lo que SINTONÍA necesita y WORKWELL360 no tiene (candado del bienestar, birrete de Puente al doctorado), tomaré iconos de la misma familia y del mismo grosor. Los añadiré y te los enseñaré.

---

## 5. Componentes

### Botones (main.css:58 a 104)
- **Principal** (`.btn-primary`): fondo de color de marca, texto blanco, peso 500, 16 px, radio de 6 px y transición de 200 ms. Ver la propuesta de contraste en 1.5.
- **Secundario** (`.btn-secondary`): fondo transparente con borde y texto del color de marca. Al pasar el ratón, fondo `rgba(52,198,163,0.08)`.
- **Peligro** (`.btn-danger`): rojo 600, con rojo 700 al pasar el ratón.
- Botón desactivado: `opacity-50 cursor-not-allowed` (CheckInView.vue).
- Botón cargando: icono giratorio blanco y el texto "Enviando..." o "Accediendo..." (LoginView.vue).

### Tarjetas (main.css:47 a 57)
Fondo blanco, borde de 1 px `#E3EAEA`, radio de 6 px y `--shadow-card`. Al pasar el ratón cambian a `--shadow-elevated` con una transición de 300 ms.

### Formularios (main.css:105 a 120)
- Campo `.input-field`: ancho completo, fondo blanco, 14 px, borde de 1 px `#E3EAEA`, radio de 6 px y texto `#0A4A6C`.
- Foco: borde `#34C6A3` más un anillo de 2 px `rgba(52,198,163,0.15)`.
- Etiqueta: `text-sm font-medium` en `#3A4A54`, encima del campo y separada 6 px (LoginView.vue).

### Etiquetas o badges (main.css:122 a 136)
12 px, peso 500 y radio de 4 px. Variantes verde, ámbar, roja y celeste.

### Menú lateral (main.css:150 a 164 y AppLayout.vue)
- Menú de 256 px de ancho. En móvil se oculta tras un botón de hamburguesa y aparece con un velo `bg-black/30`.
- Enlace: 14 px y peso 500. El enlace activo lleva fondo de color de marca y texto blanco.
- Pie del menú: avatar con iniciales en un círculo `brand-100` y el botón "Cerrar sesión" en rojo.
- Cabecera móvil fija con efecto translúcido (`bg-white/80 backdrop-blur-md`).
- Panel del administrador: el mismo menú, pero con fondo azul marino `#0A4A6C` (AdminLayout.vue:111).

### Pantalla de acceso (LoginView.vue)
Dos columnas en escritorio: a la izquierda, un panel azul marino con dos manchas difuminadas de color de marca, el logotipo en blanco, el titular y tres cifras; a la derecha, el formulario. En móvil solo aparece el formulario, con el logotipo encima.

### Gráficos (AdminDashboardView.vue, Chart.js 4 con vue-chartjs)
- Barras de color de marca semitransparente (`rgba(52,198,163,0.55)`) con borde `#34C6A3`, radio de 6 px y línea de tendencia azul marino `#0A4A6C` con puntos blancos (líneas 70 a 100).
- Sin cuadrícula vertical. Cuadrícula horizontal muy suave. Leyenda arriba a la derecha y textos de 11 px.
- En SINTONÍA solo se usarán en el panel de la dirección y en el histórico del propio estudiante: barras y líneas de color de marca y azul marino, nunca semáforos.

---

## 6. Estados de pantalla

| Estado | Cómo lo resuelve WORKWELL360 | Origen |
|---|---|---|
| **Carga** | Icono giratorio de 32 px en color de marca, centrado y con margen vertical amplio (`py-20`) | HistoryView.vue:47 a 52 |
| **Vacío** | Tarjeta centrada con un icono gris de 40 px, un título de 20 px ("Sin registros aún") y una frase que invita a actuar | HistoryView.vue:54 a 58 |
| **Error** | Recuadro `bg-red-50`, borde `red-200`, texto `red-700`, radio de 12 px y 14 px, con un icono de aviso a la izquierda | LoginView.vue |
| **Éxito** | Círculo de 64 px `brand-100` con un icono de verificación, título "¡Check-in completado!" y una frase de agradecimiento debajo ("Gracias por cuidar de ti.") | CheckInView.vue, pantalla de éxito |
| **Aviso amable** | Tarjeta `bg-brand-50` con borde `brand-200` y un icono de corazón en un cuadrado blanco | SupportView.vue |

Animaciones: `fade-in` (0,4 s, sube 8 px) al entrar en una página y `slide-up` (0,5 s, sube 24 px) en las tarjetas del check-in y la pantalla de éxito (main.css:166 a 180). **PROPUESTA**: se desactivarán si la persona tiene activada la preferencia "reducir movimiento" en su sistema, como pide la accesibilidad.

---

## 7. El check-in de WORKWELL360 (lo que funcionó)

Origen: CheckInView.vue.

- Columna estrecha y centrada (512 px).
- Arriba, el nombre del cuestionario a la izquierda, el contador "1 / 6" a la derecha y una barra de progreso fina (8 px) de color de marca.
- **Una pregunta por tarjeta**, con un emoji grande encima (36 px) y el texto de la pregunta en 18 a 20 px.
- **Escala táctil de 5 botones** de 48 px en móvil y 56 px en escritorio, separados de 8 a 12 px, con radio de 16 px y borde de 2 px. La opción elegida se agranda un 10 %, toma borde y fondo de color de marca y gana una sombra suave.
- Debajo aparece una palabra que describe la opción elegida ("Bajo", "Normal", "Bien"...).
- Botones "Anterior" y "Siguiente", y "Enviar check-in" en el último paso.

**Importante:** el check-in de WORKWELL360 **no es de un solo botón**: va pregunta a pregunta con "Siguiente". Tu encargo pide "preguntas cortas, escalas táctiles y un solo botón de envío". **PROPUESTA** para SINTONÍA: las 4 preguntas en una sola pantalla, cada una en su tarjeta con la misma escala táctil de WORKWELL360 (mismos tamaños, radios y estado de selección) y un único botón "Enviar" al final. Con 4 ítems es más rápido (menos de 60 segundos) y el tutor puede usar el mismo patrón con sus 8 estudiantes. Mantendría la barra de progreso, que se iría llenando a medida que se responde.

**Emojis:** WORKWELL360 usa emojis como opciones de la escala. **PROPUESTA**: en SINTONÍA, números del 1 al 5 con una palabra en cada extremo ("Nada" y "Mucho"), sin emojis. Las caras sugieren estados de ánimo en preguntas que son sobre el trabajo, no sobre las emociones.

---

## 8. Tono de los textos

Rasgos de WORKWELL360 que se mantienen:
- Tuteo, cercano y cálido: "Gracias por cuidar de ti.", "Sin presión. Puedes escribir lo que sientas o dejarlo en blanco.", "Pedir apoyo es un acto de cuidado."
- Frases cortas e instrucciones claras: "Haz tu primer check-in para empezar a ver tu historial."
- Lenguaje inclusivo con barra: "Agotado/a", "Motivado/a".
- Transparencia sobre la privacidad junto al propio formulario: "Tu mensaje llega solo a personas autorizadas".

Rasgos que **no** se mantienen en SINTONÍA:
- El tono comercial y de venta ("Desde 1 €/usuario/mes", "Prueba gratis 30 días").
- Las exclamaciones de euforia ("¡A tope!") y los emojis en los mensajes ("Gracias por compartir 💚").
- Las rayas largas (WORKWELL360 tiene 83, por ejemplo en el título de index.html:5).
- Cualquier expresión de vigilancia, como "detecta señales tempranas" o "visibilidad de quién participa".

---

## 9. Logotipo

WORKWELL360 usa un logotipo solo tipográfico (AppLogo.vue): Fira Sans en negrita, con "WORK" en azul marino `#0A4A6C` (o en blanco sobre fondo oscuro), "WELL" en `#34C6A3` y "360" en `#4ED7C2`.

**Logotipo provisional de SINTONÍA**, siguiendo esa misma lógica: "SINTON" en `#0A4A6C` (o en blanco sobre fondo oscuro) e "ÍA" en `#34C6A3`, en Fira Sans 700. La idea es que el color marque la sintonía de las dos miradas. Estará marcado como **provisional** en el código y en este documento.

El favicon de WORKWELL360 (public/favicon.svg) usa un verde (`#16a34a`) que no pertenece a su paleta. El de SINTONÍA será una "S" blanca sobre un círculo `#0A4A6C`.

---

## 10. Tokens

En la Fase 2, todo lo anterior se convertirá en:
- variables CSS en `src/assets/tokens.css` (`--color-*`, `--radius-*`, `--shadow-*`), y
- la configuración de Tailwind (`brand`, `surface`), con los mismos nombres que WORKWELL360, para poder copiar componentes con cambios mínimos.

Ninguna pantalla de SINTONÍA escribirá un color directamente: todas usarán estos tokens.
