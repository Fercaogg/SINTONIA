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

### Gráficos de SINTONÍA (panel de la dirección)

Colores comprobados con el validador de paletas (luminosidad, croma, separación para los tres tipos de daltonismo y contraste con el fondo). Se usan solo colores de la paleta de WORKWELL360:

| Serie | Color | Origen |
|---|---|---|
| Estudiantes (o serie única) | `#0A4A6C` azul marino | WW360 main.css:18 |
| Tutores (o serie única) | `#248a73` verde oscuro | WW360 tailwind.config.js:15 |

Resultado del validador para esta pareja: separación con daltonismo ΔE 20,3 (aprobado, mínimo 8), visión normal ΔE 20,6 (aprobado) y contraste con el fondo de al menos 3:1 en los dos (aprobado). Las comprobaciones de "banda de luminosidad" y "croma mínimo" no se superan porque la paleta de WORKWELL360 es de tonos apagados a propósito. Para compensarlo, cada gráfico lleva leyenda, etiqueta directa del último valor y una tabla con todos los datos. La pareja de WORKWELL360 (`#34C6A3` con `#0A4A6C`) se descartó porque el verde claro solo tiene un contraste de 2,1:1 con el fondo.

Especificaciones de las marcas: líneas de 2 px, marcadores de 8 px con anillo blanco de 2 px, barras de 24 px como máximo con el extremo redondeado (4 px) y la base recta, y cuadrícula de 1 px en `#E3EAEA`. Sin semáforos.

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

---

## 11. Rediseño de la web pública (Fase 4 del encargo de blindaje)

Fernando delegó el diseño ("decide la mejor opción; si no me gusta, lo cambio", 14/11/2026). Por eso no se presentaron dos direcciones: se aplicó una sola, descrita aquí.

### 11.1. La idea: dos ondas que entran en sintonía

Una sola idea visual recorre la portada: dos ondas, la del estudiante (verde `#34C6A3`) y la del tutor/a (azul marino `#0A4A6C`).

| Momento | Dónde | Qué explica |
|---|---|---|
| Las ondas se separan o se juntan al mover las dos miradas | Demostración del inicio | Que el desajuste es una distancia entre dos miradas |
| Al leer los tres pasos, las ondas pasan de desfasadas a alineadas | "Cómo funciona" | Que la agenda acerca las dos miradas |
| Las ondas, ya en sintonía, con "En sintonía." | Cierre, antes del pie | El final de la historia |

Componente: `src/components/portada/OndasSintonia.vue`. El desfase se dibuja moviendo (transform) la onda del tutor/a; nada más se anima.

### 11.2. Composición editorial

- **Inicio a dos columnas desiguales (7/5):** titular grande (hasta 72 px), entradilla, un dato duro ("Unos 60 segundos a la semana. Sin notas, sin rankings.") y la demostración, que es el propio producto.
- **Cada apartado tiene su composición**, sin repetir ninguna:

| Apartado | Composición |
|---|---|
| Cifras | Banda azul marino a sangre, números grandes |
| El problema | Columnas 4/8, primer párrafo en tamaño de titular |
| Cómo funciona | Panel fijo con las ondas y pasos numerados 01, 02, 03 |
| Para cada perfil | Pestañas |
| Puente al doctorado | Recorrido horizontal de tres tramos |
| Privacidad y ética | Una afirmación grande y su desarrollo |
| Para quién es | Banda azul marino, solo tipografía y filetes |
| Dirección | Dos tarjetas idénticas |
| Preguntas | Título fijo a la izquierda, lista desplegable a la derecha |
| Contacto | Dos columnas: texto y formulario |
| Cierre | Ondas en sintonía y titular centrado |

- **Tipografía:** Fira Sans (la de WORKWELL360) con más escala y tracking negativo en los titulares; números tabulares en las cifras.

### 11.3. Qué se aplica de la skill de Emil Kowalski

| Principio | Dónde |
|---|---|
| Cada animación tiene un propósito; si se ve muy a menudo, no se anima | Ondas (explican), preguntas que llegan una a una (explican), candado (dato protegido). Los menús y las pestañas no se animan: cambian al instante |
| Curvas fuertes: `ease-out` para entrar, `ease-in-out` para moverse en pantalla, nunca `ease-in` | Tokens `--ease-out` y `--ease-in-out` en `tokens.css` |
| Duraciones cortas: microinteracciones de 160 ms, interfaz de 220 ms, entrada del inicio de 420 ms | Tokens `--dur-micro`, `--dur-ui`, `--dur-entrada` |
| Botones que se hunden al pulsar (`scale(0.97)`) | `.btn-primary`, `.btn-secondary`, `.btn-danger` |
| Solo transform y opacity en lo que se mueve | Ondas, entrada del inicio, preguntas y candado. Los cambios de color al pasar el ratón no mueven nada |
| Escalonado corto (60 ms) | Las tres preguntas de la demostración |
| Nada aparece desde `scale(0)` | El candado entra desde `scale(0.9)` |
| Reducir movimiento: menos movimiento, no menos información | Con `prefers-reduced-motion`, todo se ve en su estado final |

### 11.4. Qué se aplica de la skill de Taste

| Principio | Dónde |
|---|---|
| La primera pantalla dice qué es, para quién y un dato duro | Inicio |
| Mostrar el producto de verdad, no un adorno | La demostración del inicio es SINTONÍA funcionando |
| El inicio entra una sola vez; uno o dos "momentos" por página | Entrada del inicio; el momento es "Cómo funciona" |
| Nada se mueve por hacer scroll, salvo el momento dentro de su apartado | Solo las ondas de "Cómo funciona" |
| Un solo sistema: un par de botones, un estilo de tarjeta, un radio | Tokens de WORKWELL360 |
| Bordes iguales a izquierda y derecha; todo en la misma retícula (1180 px) | Todas las secciones |
| Titulares que nombran cosas; botones con verbo | "Tengo un código", "Ver la demostración", "Leer la investigación" |
| Nada de violeta | El tipo "Congreso" del calendario pasa de violeta a `#0e7490` |
| Controles de 44 px como mínimo | Toda la web |

### 11.5. Lo que manda el encargo sobre las skills

| La skill dice | Se hace | Por qué |
|---|---|---|
| Taste: fotografías reales o de archivo en cada pantalla | Ninguna fotografía | El encargo prohíbe fotos de stock; la "foto" es el propio producto |
| Taste: una sección por pantalla, como mucho dos | Secciones de altura natural | Prima la lectura cómoda y el contenido real; en el móvil sería imposible |
| Taste: efectos y escenas en páginas de tecnología | Ninguno | El encargo pide movimiento con propósito |
| Taste: nada aparece al hacer scroll | Solo los números de las cifras cuentan hasta su valor la primera vez que se ven | Lo pide el encargo ("contadores animados con datos reales") |
| Emil: muelles y gestos | No se usan | No hay gestos en esta web |

### 11.6. Modo oscuro

Según la preferencia del sistema (`prefers-color-scheme`). Los neutros se invierten (fondo `#09181F`, tarjetas `#0E2530`, texto `#EAF3F6`); el azul marino `#0A4A6C` de las bandas y el verde `#34C6A3` no cambian; el verde de los enlaces se aclara a `#5FE0C8` para mantener el contraste. Las clases `bg-papel` (tarjetas) y `bg-marino` (bandas fijas) sustituyen a `bg-white` y `bg-surface-900`.

### 11.7. Otros

- **Logotipo:** sobre fondo claro, el "ÍA" usa `#248a73` (contraste suficiente); sobre azul marino o en oscuro, `#34C6A3`.
- **Imagen para compartir** (`public/og.png`, 1200 × 630): las dos ondas, el nombre y el titular sobre `#0A4A6C`. Se regenera con `node scripts/generar-og.mjs`.
- **Cambio de página:** fundido corto con View Transitions donde el navegador lo admite.

### 11.8. El efecto del inicio: "campo de sintonía"

A petición de Fernando ("que se mueva y sea una pasada", 14/11/2026), el inicio tiene el único efecto de la página, como permite la skill de Taste en una web de software (`src/components/portada/CampoSintonia.vue`):

- **Qué es:** un campo de hilos de luz en WebGL, a sangre detrás del inicio, en dos familias: verde (estudiante) y azul marino o azul claro en oscuro (tutor/a).
- **Qué cuenta:** cuando las dos miradas de la demostración se separan, la familia del tutor/a se desfasa, se inclina y vibra; cuando coinciden, todo se ordena en una sola corriente. El puntero deja una onda suave. Los cambios se suavizan con un "muelle" (skill de Emil Kowalski) para que nada salte.
- **Lectura:** detrás del titular, el campo se calma casi del todo.
- **Cuidados:**
  - un solo lienzo, que solo se dibuja mientras se ve;
  - se para al cambiar de pestaña;
  - botón "Pausar el fondo" (WCAG 2.2.2);
  - con "reducir movimiento", o en aparatos sin aceleración gráfica, es un fotograma quieto;
  - si los fotogramas van lentos, baja la resolución y, si sigue igual, se queda quieto;
  - se carga aparte, sin retrasar la primera pantalla;
  - sin WebGL, no aparece y la portada sigue igual.
- **Segundo momento (cierre):** el titular "En sintonía." llega en dos copias, verde y azul, separadas como las dos miradas, y se funde en una sola al verse. Las ondas del cierre se juntan a la vez.
- **Medido:** Lighthouse en móvil, 91 en rendimiento, 100 en accesibilidad, 93 en buenas prácticas y 100 en SEO; sin saltos de maquetación (CLS 0).

### 11.9. El interior de la aplicación (paneles)

Segunda pasada con las skills (14/11/2026), centrada en lo que verán estudiantes, tutores y dirección:

- **Tarjeta protagonista** en el inicio del estudiante y del tutor/a (`TarjetaSemana.vue`): azul marino a sangre, la semana o los estudiantes respondidos en grande, un anillo con el avance y las dos ondas de la marca, que se alinean cuando ya está hecho. El interior tiene así la misma identidad que la portada.
- **Títulos con más carácter** en todas las pantallas (36 px, negrita, tracking negativo) y **cifras grandes** en el resumen de la dirección; las cifras ocultas por anonimato llevan un candado.
- **Móvil** (skill *mobile-native* de Emil Kowalski): sin destello gris al tocar, sin el retraso de 300 ms, sin seleccionar el texto de los botones al mantenerlos pulsados, campos a 16 px para que el iPhone no amplíe la página, respeto a la muesca (`viewport-fit=cover` y `safe-area`), color de la barra del sistema según el modo claro u oscuro y estados de "pasar el ratón" solo con ratón (`hoverOnlyWhenSupported`).
- **Movimiento:**
  - el menú lateral del móvil entra con la curva de los cajones de iOS;
  - la barra de progreso del check-in crece con `transform`, no con `width`;
  - los números de la escala se hunden al tocarlos;
  - las tarjetas con enlace se elevan 2 px al pasar el ratón (Taste);
  - la navegación del menú, que se usa muchas veces, no se anima (Emil).

## 12. Portada reestructurada (14/11/2026)

Sustituye la composición de la portada del apartado 11 (se mantienen tokens, tipografía, ondas y campo de ondas del inicio).

**Orden, de más a menos importante para quien llega:**

1. Inicio: qué es, botones (entrar en la demostración o "Tengo un código") y tres garantías (60 segundos, sin notas, el bienestar solo lo ves tú). A la derecha, el recorrido animado del producto (`RecorridoProducto`): un móvil que pasa solo por las cuatro fases de cada semana (responde el estudiante, responde el tutor/a, se comparan las dos miradas, llega la agenda) con una guía de pasos al lado. Cada paso tiene su barra de tiempo; se puede pulsar cualquier paso o pausar, se para fuera de pantalla y, con "reducir movimiento", no avanza solo.
2. Para quién es: una franja con los cuatro destinatarios.
3. Entrar en la demostración (solo en modo demostración): los cuatro perfiles en una fila.
4. El problema, con las dos ondas como ilustración.
5. Cómo funciona: tres tarjetas, cada una con su ilustración.
6. Pruébalo: la demostración interactiva y las cifras, sobre azul marino.
7. Privacidad y ética, con el gráfico de quién ve el bienestar.
8. Para cada perfil: tres tarjetas iguales.
9. Puente al doctorado: recorrido vertical en tres pasos.
10. Dirección, preguntas frecuentes, contacto y cierre "En sintonía.".

**Reglas de composición** (skill ui-ux-pro-max, estilo suizo): retícula de 12 columnas en un ancho de 1180 px; todos los apartados empiezan igual (etiqueta numerada, título y, si hay, entradilla en las columnas 8 a 12, componente `CabeceraSeccion`); fondos alternos (claro y papel con bordes) y una sola banda azul marino; tarjetas de altura igual; iconos SVG de la casa, nunca emojis; movimiento solo en la entrada del inicio y en las ondas, y nada con "reducir movimiento".

**Componentes nuevos:** `RecorridoProducto`, `IlustracionPaso`, `QuienVeBienestar`, `TarjetasPerfiles`, `CabeceraSeccion`. Se retiran `PestanasPerfiles` y `ComoFuncionaOndas`.

### 12.1. Movimiento de la portada (de "El problema" hacia abajo)

Motor ligero en `src/lib/efectos.ts`; nada fija ni intercepta el scroll.

- **Aparecer al llegar** (`v-revelar`): cabeceras, tarjetas y bloques suben un poco y aparecen una sola vez, escalonados.
- **Ratón** (`v-cursor`, solo con ratón): una luz verde sigue al cursor en las tarjetas; las de pasos, perfiles y dirección además se inclinan levemente.
- **Ligado al desplazamiento:** barra de progreso de lectura bajo la cabecera; las ondas de "El problema" se acercan al leer; en la banda azul, ondas grandes de fondo se deslizan; la línea de Puente se dibuja y cada paso se enciende al llegar; las ondas del cierre coinciden al bajar.
- **Ilustraciones de "Cómo funciona":** al aparecer, se marcan las respuestas, llegan las preguntas y las ondas del paso 2 se acercan con el scroll.
- **Reglas:** solo transform y opacity (la luz solo cambia dos variables de una tarjeta); estilos aplicados desde código por la CSP; con "reducir movimiento", todo quieto y en su sitio.
