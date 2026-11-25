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
| 3.1 | /investigacion completa | **Hecho** | Índice y apartados: pregunta, H1 a H3, diseño, garantías (Comité y OSF), calendario, participar, cómo citar y las 7 referencias. Todo el contenido está en `src/contenido/investigacion.ts`: lo que aún no existe (pregunta, hipótesis, Comité, OSF, parte del calendario) sale con el texto digno y se publica solo al rellenarlo allí. El enlace de OSF no aparece hasta que exista | |
| 3.2 | "Cómo citar SINTONÍA" | **Hecho** | Cita en APA 7 (software) con la versión y el año de la versión actual, y botón para copiar | |
| 3.3 | "Publicaciones y difusión" | **Hecho** | Lista vacía en `src/contenido/investigacion.ts`; la sección (y su entrada en el índice) aparece sola con la primera entrada. Lo comprueba una prueba | |
| 3.4 | Kit para participantes en PDF | **Hecho** | /participantes con hoja informativa, consentimiento y preguntas frecuentes, para leer o descargar en PDF (generados desde la web con `npm run pdf`). Cada documento lleva el aviso de borrador del Comité; lo que es del Comité (texto del consentimiento, riesgos y beneficios, base jurídica) sale con el texto digno | |

## Fase 4. Instituciones, TCUE y empresas

| # | Punto | Estado | Qué hay hoy | Qué haré |
|---|---|---|---|---|
| 4.1 | Página /instituciones | **Hecho** | /instituciones: el problema, la implantación en 4 pasos (alta del máster, tutores, códigos para estudiantes y calendario, tal como funciona el panel), qué necesita la universidad, qué ve cada perfil, en qué punto está y "Solicitar una demostración" (campo trampa, límite de envíos y aviso de privacidad). Si el servidor no puede enviar correos, ofrece escribir con el mensaje preparado | |
| 4.2 | Dosier de una página en PDF | **Hecho** | `public/dosier/sintonia-dosier.pdf`, una página A4 generada desde /dosier/imprimir con `npm run pdf`: qué es, cómo funciona, garantías éticas, estado, dirección (Luis y Ana iguales, en orden alfabético) y contacto. Descargable desde /instituciones | |
| 4.3 | Hoja de ruta (/hoja-de-ruta) | **Hecho** | Tres columnas: "Hecho" (solo lo que funciona), "Durante el piloto" y "Después (TFG y tesis)", solo con lo planificado en el proyecto | |

## Fase 5. Acabado profesional

| # | Punto | Estado | Qué hay hoy | Qué haré |
|---|---|---|---|---|
| 5.1 | Imagen Open Graph por página | **Hecho** | Una imagen propia (1200 × 630, las dos ondas, el título y #0A4A6C) para cada página principal, en español y en inglés, en `public/og` (`node scripts/generar-og.mjs`). Cada página tiene su propio HTML con título, descripción, imagen y URL canónica, para que al compartir el enlace se vea la página correcta | |
| 5.2 | Preparación para dominio propio | **Hecho** | La dirección se cambia en un solo sitio (`VITE_URL_SITIO`); de ahí salen la URL canónica, las etiquetas para compartir, `robots.txt` y `sitemap.xml`, que se generan al publicar. Los pasos para el día del dominio están en docs/DOMINIO.md | |
| 5.3 | Modo oscuro | **Hecho** | Sigue la preferencia del sistema. La prueba de contraste AA en oscuro incluye ahora también las páginas nuevas: confianza, instituciones, hoja de ruta, participantes, recorrido, las 9 de /en y la 404 | |
| 5.4 | Versión en inglés (/en) | **Hecho** | 9 páginas de presentación en /en (inicio, cómo funciona, investigación, instituciones, seguridad, accesibilidad, hoja de ruta, estado y novedades), con selector de idioma en la cabecera y `lang` y `hreflang` correctos. La aplicación interna y los textos legales siguen en español (los legales, hasta que los apruebe el Comité) | |
| 5.5 | Microcopia | **Hecho** | Revisados errores, estados vacíos, confirmaciones y correos. Cinco textos cambiados para que no culpen ni metan prisa y digan qué hacer después (lista en DECISIONES.md, 16/11/2026) | |
| 5.6 | Página 404 propia | **Hecho** | Las dos ondas desajustadas, "Esta página no está en sintonía", botón al inicio y otro para avisar del enlace roto. Cualquier dirección que no sea una página ni una pantalla de la aplicación recibe el código 404 de verdad (`404.html`) y no se indexa | |
| 5.7 | Lighthouse móvil ≥ 90 y teclado | **Hecho** | Medidas las 27 páginas públicas en móvil: rendimiento entre 92 y 99, accesibilidad 100, buenas prácticas 100 en la web publicada y SEO 100 (la 404 no se indexa, como debe ser). El fondo animado del inicio espera a que la página esté lista. Enlace "Saltar al contenido" en todas las páginas y prueba automática de navegación completa con el teclado en 18 páginas, en móvil y escritorio | |

## Lo que NO se añade (comprobado)

| Regla | Estado hoy |
|---|---|
| Logotipos de la USAL o de empresas sin permiso | Cumple: no hay ninguno |
| Contadores de usuarios, testimonios o casos de éxito | Cumple: no hay ninguno |
| Chats de IA o reclamos de "IA" | Cumple: el programa de redacción no tiene interfaz visible y la web no usa la palabra "IA" como reclamo |
| Cookies de seguimiento o analítica de terceros | Cumple: no hay cookies. Las estadísticas de visitas (24/11/2026) no usan cookies, se sirven desde el propio dominio y solo cuentan páginas públicas |

## Resumen

| Estado | Puntos |
|---|---|
| Hecho | 22 (las cinco fases completas) |
| A medias | 0 |
| No existe | 0 |

**Orden propuesto:** las fases en el orden de la lista. Al terminar cada una: pruebas, revisión en móvil (360 px) y escritorio, capturas en docs/capturas y tu visto bueno.

**Fases 1 a 4 terminadas el 15/11/2026.** Pruebas y capturas en docs/capturas (prefijos `fase1-` a `fase4-`). Pendiente de tu visto bueno antes de la Fase 5.

**Fase 5 terminada el 16/11/2026.** Pruebas y capturas en docs/capturas (prefijo `fase5-`). Lo que queda depende de datos tuyos o del Comité: está en PENDIENTES.md.

## Lista de acabado web (24 de noviembre de 2026)

| Punto | Estado | Qué hay |
|---|---|---|
| Aviso legal | **Hecho, falta un dato** | Titular, objeto, propiedad intelectual, responsabilidad, enlaces y legislación aplicable. Falta el NIF y el domicilio del titular (PENDIENTES.md) |
| Política de privacidad | **Hecho, falta lo del Comité** | Nuevo apartado "Si solo visitas la web" (estadísticas sin cookies, formularios, WhatsApp y registros técnicos). Base jurídica y conservación siguen pendientes del Comité |
| Aviso de cookies | **Hecho** | /cookies explica por qué no hay aviso: no hay cookies; solo la sesión en el almacenamiento local, que es imprescindible (art. 22.2 LSSI) |
| Forzar HTTPS | **Hecho** | Vercel redirige a HTTPS; HSTS de 2 años con `preload` y `upgrade-insecure-requests` en la CSP |
| Meta títulos y descripciones | **Hecho** | Propios por página (`paginas.json`), con prueba de unicidad y longitud |
| Datos estructurados | **Hecho** | JSON-LD en cada página: sitio, página, migas y, en la portada, aplicación y proyecto de investigación |
| Sitemap y robots.txt | **Hecho** | Se generan al publicar; el sitemap incluye ahora hreflang |
| Ficha de Google | **No aplica** | Google no admite fichas de proyectos solo en línea. Guía de Search Console en docs/FICHA-GOOGLE.md |
| Favicon | **Hecho** | SVG (con modo oscuro), favicon.ico, icono de Apple, iconos de 192 y 512 px y manifiesto |
| Texto alternativo | **Hecho** | La única imagen (fija de los clips) es decorativa, con `alt=""` y su texto en la tarjeta; los gráficos llevan tabla de datos |
| Imágenes comprimidas | **Hecho** | Imágenes para compartir a 256 colores (2,4 MB a 1 MB); clips de 40 a 100 KB en WebM y MP4 |
| Velocidad de carga | **Hecho** | Lighthouse móvil 92 a 99; ahora además caché de un año para `/assets` |
| Contraste de colores | **Hecho** | Revisión AA automática en claro y en oscuro; el botón de WhatsApp tiene 5,3:1 |
| Se ve bien en el móvil | **Hecho** | Pruebas a 360 px sin desbordamiento |
| Página 404 | **Hecho** | Propia, con código 404 de verdad |
| Enlaces rotos | **Hecho** | `npm run enlaces`: 27 páginas y 104 enlaces, ningún enlace interno roto. Los externos no se pudieron comprobar desde aquí |
| Formularios contra spam | **Hecho** | Campo trampa, tiempo mínimo, límite de enlaces, límite de envíos y sin saltos de línea en el asunto |
| Botón de WhatsApp | **Hecho, falta el número** | Aparece en cuanto se pone `VITE_WHATSAPP` |
| Analítica | **Hecho, falta activarla** | Código listo; se activa en Vercel > Analytics |
| Una sola llamada a la acción | **Hecho** | Un único botón en la portada; lo demás, enlaces de texto |
