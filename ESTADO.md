# Estado de las mejoras profesionales

Revisión del repositorio (rama `main`, commit `aa97772`) y de la web publicada (https://sintonia360-ferca.vercel.app), 15 de noviembre de 2026.

- **Hecho:** existe y funciona. No se toca salvo para corregir errores.
- **A medias:** existe una parte. Se completa.
- **No existe:** se crea.

En la columna "Qué hay hoy" está lo que he comprobado. En "Qué haré", lo que falta. Si algo depende de un dato tuyo o del Comité de Ética, lo marco con **(dato tuyo)**: en la web saldrá el texto digno y el dato irá a PENDIENTES.md.

## Fase 1. Confianza

| # | Punto | Estado | Qué hay hoy | Qué haré |
|---|---|---|---|---|
| 1.1 | Página /seguridad | **Hecho** | /seguridad: región en la UE (comprobada), cifrado, quién accede a qué (enlace a "Quién ve qué"), cómo se entra, borrado paso a paso y "Última revisión". Las copias de seguridad salen con el texto digno hasta confirmar el plan de Supabase (PENDIENTES.md) | |
| 1.2 | Declaración de accesibilidad (/accesibilidad) | **Hecho** | /accesibilidad: "parcialmente conforme" con WCAG 2.2 AA, cómo se ha revisado, qué está pensado, limitaciones conocidas y contacto. La revisión automática incluye ahora también los criterios de WCAG 2.2 | |
| 1.3 | Página /novedades | **Hecho** | /novedades con versiones 0.1.0 a 0.4.0 sacadas del historial de git; la versión actual es la de package.json (lo comprueba un test) y sale en el pie | |
| 1.4 | Página /estado | **Hecho** | `api/estado` comprueba servidor, base de datos (función `servicio_estado`, sin datos) y acceso; /estado lo muestra y permite volver a comprobar. Sin servicios externos | |

## Fase 2. Entender el producto sin explicarlo

| # | Punto | Estado | Qué hay hoy | Qué haré |
|---|---|---|---|---|
| 2.1 | Demostración guiada (/demo/recorrido) | **Hecho** | /demo/recorrido en 4 pasos: check-in del estudiante (mismas preguntas y escala que el real), pantalla del tutor/a, desajuste y 3 preguntas (misma regla y banco) y vista de la dirección con cifras inventadas y marcadas. Banda "Demostración", sin llamadas a ninguna API. Enlazada desde la portada y /demo | |
| 2.2 | Clip en bucle por perfil | **Hecho** | 3 clips grabados de la demostración real (WebM y MP4, sin sonido, de 40 a 100 KB), en las tarjetas de "Para cada perfil". Se cargan y reproducen solo al verse; con "reducir movimiento", imagen fija | |
| 2.3 | Calculadora de tiempo | **Hecho** | Apartado "04 · Tiempo" de la portada: estudiantes × 60 s + tutores × 30 s, en minutos por semana, con el desglose. Solo cálculo | |
| 2.4 | Comparativa en tres columnas | **Hecho** | Apartado "06 · Comparación": tutoría sin seguimiento, SINTONÍA y herramientas que vigilan, sin marcas, con una fila de límites de SINTONÍA. Tabla en escritorio y tarjetas en el móvil | |

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
| Hecho | 9 (Fases 1 y 2 completas, y modo oscuro) |
| A medias | 8 |
| No existe | 5 |

**Orden propuesto:** las fases en el orden de la lista. Al terminar cada una: pruebas, revisión en móvil (360 px) y escritorio, capturas en docs/capturas y tu visto bueno.

**Fases 1 y 2 terminadas el 15/11/2026.** Pruebas y capturas en docs/capturas (movil y escritorio, prefijos `fase1-` y `fase2-`). Pendiente de tu visto bueno antes de la Fase 3.
