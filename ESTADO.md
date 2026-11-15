# Estado de las mejoras profesionales

Revisión del repositorio (rama `main`, commit `aa97772`) y de la web publicada (https://sintonia360-ferca.vercel.app), 15 de noviembre de 2026.

- **Hecho:** existe y funciona. No se toca salvo para corregir errores.
- **A medias:** existe una parte. Se completa.
- **No existe:** se crea.

En la columna "Qué hay hoy" está lo que he comprobado. En "Qué haré", lo que falta. Si algo depende de un dato tuyo o del Comité de Ética, lo marco con **(dato tuyo)**: en la web saldrá el texto digno y el dato irá a PENDIENTES.md.

## Fase 1. Confianza

| # | Punto | Estado | Qué hay hoy | Qué haré |
|---|---|---|---|---|
| 1.1 | Página /seguridad | **A medias** | No hay página /seguridad. Las piezas existen en otros sitios: la región está confirmada en Supabase (eu-central-1, Fráncfort) y ya se dice en /como-funciona; el bienestar se guarda cifrado con la clave en Supabase Vault; la tabla "Quién ve qué" está en /como-funciona; el borrado se pide desde Mi cuenta | Crear /seguridad reuniendo todo, con "Última revisión" y enlaces. Copias de seguridad: dependen del plan de Supabase, que no puedo comprobar desde aquí **(dato tuyo)**; mientras tanto, texto digno |
| 1.2 | Declaración de accesibilidad (/accesibilidad) | **No existe** | Sí hay base para escribirla: revisión automática (axe) sin errores en todas las páginas públicas y del panel, en claro y en oscuro, y Lighthouse 100 en accesibilidad en la portada | Crear la página con el nivel real (WCAG 2.2 AA, "parcialmente conforme" mientras no haya una revisión manual completa), limitaciones conocidas y contacto ferca@usal.es |
| 1.3 | Página /novedades | **No existe** | El historial de git tiene 44 cambios con fecha desde el 12/11/2026; la versión es la 0.1.0 | Crear la página con el historial real agrupado por fecha y versión, una línea por mejora |
| 1.4 | Página /estado | **No existe** | No hay ninguna comprobación de salud del servidor | Crear `api/estado` (comprueba la función y la base de datos sin datos personales) y la página /estado que la consulta. Sin servicios externos |

## Fase 2. Entender el producto sin explicarlo

| # | Punto | Estado | Qué hay hoy | Qué haré |
|---|---|---|---|---|
| 2.1 | Demostración guiada (/demo/recorrido) | **A medias** | En /demo se entra en la demostración real con cuatro perfiles. En la portada hay una demo del desajuste (dos deslizadores y tres preguntas) y un recorrido animado de cuatro pasos. No hay un recorrido guiado de unos 60 segundos en el que el visitante haga el check-in | Crear /demo/recorrido en 4 pasos interactivos (check-in del estudiante, pantalla del tutor/a, desajuste y 3 preguntas, vista de la dirección con solo agregados), con datos ficticios y la banda "Demostración" |
| 2.2 | Clip en bucle por perfil | **No existe** | No hay vídeos en la web | Grabar 3 clips de la demostración real (WebM y MP4, sin sonido, ligeros) y, con "reducir movimiento", una imagen fija |
| 2.3 | Calculadora de tiempo | **No existe** | El dato de 60 s y 30 s está en la portada | Crear la calculadora (estudiantes × 60 s + tutores × 30 s), solo cálculo |
| 2.4 | Comparativa en tres columnas | **No existe** |  | Crear la comparativa sin marcas: tutoría sin seguimiento, SINTONÍA y herramientas que vigilan |

## Fase 3. Credibilidad académica

| # | Punto | Estado | Qué hay hoy | Qué haré |
|---|---|---|---|---|
| 3.1 | /investigacion completa | **A medias** | Hechos: el diseño (mixto, 10 semanas, microensayo con p = 0,5, pretest, postest y 8 a 10 entrevistas) y las 7 referencias aprobadas. Faltan la pregunta CTS, H1 a H3, el resultado del Comité, el enlace de OSF y qué se hace en enero y en mayo y junio de 2027 **(dato tuyo)**: hoy salen con el texto digno | Ordenar la página según la lista y dejar cada hueco listo para rellenarse en un solo sitio. El enlace de OSF solo aparece cuando exista |
| 3.2 | "Cómo citar SINTONÍA" | **No existe** |  | Bloque en APA 7 con versión y año, y botón para copiar |
| 3.3 | "Publicaciones y difusión" | **No existe** |  | Lista vacía y oculta que se muestra sola al añadir la primera entrada |
| 3.4 | Kit para participantes en PDF | **A medias** | Existe /consentimiento, pero su texto es del Comité de Ética y está pendiente. No hay hoja informativa ni PDF descargables | Crear el kit (hoja informativa, consentimiento y preguntas frecuentes) en PDF generado desde la web. Los textos que no existen saldrán con el aviso digno, y el kit irá marcado como pendiente de revisión por el Comité **(dato del Comité)** |

## Fase 4. Instituciones, TCUE y empresas

| # | Punto | Estado | Qué hay hoy | Qué haré |
|---|---|---|---|---|
| 4.1 | Página /instituciones | **A medias** | No hay página. Sí existen el formulario de contacto (con campo trampa contra programas, límite de intentos y aviso de uso del correo) y la explicación de quién ve qué | Crear /instituciones con el problema, los pasos de implantación (alta del máster, invitación de tutores, códigos para estudiantes y calendario), qué necesita la universidad, datos por perfil y el formulario "Solicitar una demostración" |
| 4.2 | Dosier de una página en PDF | **No existe** |  | Página imprimible generada desde la web y su PDF descargable. La dirección (Luis y Ana) aparece en igualdad, con los datos ya aprobados |
| 4.3 | Hoja de ruta (/hoja-de-ruta) | **No existe** |  | Tres columnas: "Hecho" (sacado de lo que existe de verdad), "Durante el piloto (febrero a abril de 2027)" y "Después (TFG y tesis)", solo con lo planificado en el proyecto |

## Fase 5. Acabado profesional

| # | Punto | Estado | Qué hay hoy | Qué haré |
|---|---|---|---|---|
| 5.1 | Imagen Open Graph por página | **A medias** | Hay una sola imagen (`og.png`, 1200 × 630) para toda la web, puesta en `index.html` | Una imagen por página principal (las dos ondas, el título y #0A4A6C), con sus etiquetas por página, y comprobar cómo se ve al compartir |
| 5.2 | Preparación para dominio propio | **A medias** | `robots.txt` y `sitemap.xml` existen, pero con `vercel.app` escrito a mano; no hay URL canónica | Dirección base en un solo sitio, URL canónica por página, sitemap generado al publicar y redirección lista. Te explico los pasos para el día que compres el dominio |
| 5.3 | Modo oscuro | **Hecho** | Sigue la preferencia del sistema; hay una prueba automática de contraste AA en oscuro para las páginas públicas y del panel | Solo revisar las páginas nuevas |
| 5.4 | Versión en inglés (/en) | **No existe** | Todo está en español | Páginas públicas en inglés bajo /en, con selector de idioma. La aplicación interna sigue en español |
| 5.5 | Microcopia | **A medias** | El tono general es cercano y sin culpa, pero nunca se ha revisado todo de forma sistemática (errores, estados vacíos, confirmaciones y correos) | Revisión completa, con una lista de cambios |
| 5.6 | Página 404 propia | **A medias** | Existe, pero es genérica: "Esta página no existe" | Las dos ondas desajustadas, "Esta página no está en sintonía" y un botón al inicio |
| 5.7 | Lighthouse móvil ≥ 90 y teclado | **A medias** | En la portada: accesibilidad 100, buenas prácticas 96, SEO 100 y rendimiento entre 83 y 93 según la ejecución. No está medido en el resto de páginas. Hay pruebas de teclado en algunas partes (pestañas, check-in), no una navegación completa | Medir todas las páginas públicas en móvil, subir rendimiento a 90 o más de forma estable y añadir una prueba de navegación completa por teclado |

## Lo que NO se añade (comprobado)

| Regla | Estado hoy |
|---|---|
| Logotipos de la USAL o de empresas sin permiso | Cumple: no hay ninguno |
| Contadores de usuarios, testimonios o casos de éxito | Cumple: no hay ninguno |
| Chats de IA o reclamos de "IA" | Cumple: el programa de redacción no tiene interfaz visible y la web no usa la palabra "IA" como reclamo |
| Cookies de seguimiento o analítica de terceros | Cumple: no hay ninguna (lo garantiza también la política de seguridad de contenidos) |

## Resumen

| Estado | Puntos |
|---|---|
| Hecho | 1 (modo oscuro) |
| A medias | 10 |
| No existe | 11 |

**Orden propuesto:** las fases en el orden de la lista. Al terminar cada una: pruebas, revisión en móvil (360 px) y escritorio, capturas en docs/capturas y tu visto bueno.

**Espero tu aprobación de este documento antes de empezar la Fase 1.**
