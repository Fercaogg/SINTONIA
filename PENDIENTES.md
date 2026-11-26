# Datos pendientes

Todo lo que SINTONÍA necesita y que no se puede inventar. En la aplicación, cada uno aparece como "[PENDIENTE: …]" sobre fondo amarillo hasta que se rellena. El apartado 6 del [README](README.md#6-cambiar-textos-y-ajustes) explica dónde se cambia cada cosa.

## Textos legales y éticos

| Dato | Dónde se usa | Dónde se cambia | Quién lo aporta |
|---|---|---|---|
| Consentimiento informado (versión 1). **Recomendación:** que diga que los datos de SINTONÍA no forman parte de la evaluación del trabajo ni de ningún informe del tutor (ver NORMATIVA.md, apartado 1) | Registro de estudiantes y tutores | tabla `consentimiento_textos` | Comité de Ética de la USAL |
| Política de privacidad (texto completo) y, en /privacidad, base jurídica, conservación y destinatarios (contratos con los servicios técnicos) | /privacidad y "Cómo funciona y tus datos" | `configuracion > texto_politica_privacidad` y `src/views/legal/PrivacidadView.vue` | Comité de Ética de la USAL |
| Aviso legal: datos identificativos del titular, propiedad intelectual, responsabilidad y legislación aplicable | /aviso-legal | `src/views/legal/AvisoLegalView.vue` | Fernando y la USAL |
| Responsable del tratamiento y datos de contacto (RGPD) | "Cómo funciona y tus datos" | `configuracion > responsable_tratamiento` | Fernando y la USAL |

## Contenido del estudio

| Dato | Dónde se usa | Dónde se cambia | Quién lo aporta |
|---|---|---|---|
| Pregunta de investigación (CTS) e hipótesis H1, H2 y H3 | /investigacion | `src/views/InvestigacionPublicaView.vue` | Fernando |
| Qué se hace en enero y en mayo y junio de 2027 (calendario) | /investigacion | `src/views/InvestigacionPublicaView.vue` | Fernando |
| Enlace del preregistro en OSF | /investigacion | `src/views/InvestigacionPublicaView.vue` | Fernando |
| Compromiso por escrito de que los datos no cuentan para la nota (pregunta frecuente "¿Cuenta para la nota?") | Portada y consentimiento | `src/contenido/portada.ts` | Comité de Ética de la USAL |
| Textos definitivos de los 4 ítems del estudiante y los 2 del tutor (ahora provisionales) | Check-ins | tabla `items` | Fernando y sus directores |
| Ítems de la escala validada del pretest y del postest | Cuestionarios | tabla `cuestionario_items` | Fernando |
| Pregunta (y opciones) de conocimiento sobre las convocatorias predoctorales | Cuestionarios | tabla `cuestionario_items` | Fernando |
| Instrucciones del cuestionario inicial y del final | Cuestionarios | tabla `cuestionarios` | Fernando |
| Revisión del banco de 14 preguntas provisionales de la agenda | Agenda sin modelo | tabla `banco_preguntas` | Fernando y sus directores |
| Plan de análisis definitivo (modelo, covariables, datos que faltan) | `analisis/analisis_ejemplo.R` es solo una plantilla | | Fernando y sus directores |

## Datos de la Universidad y del piloto

| Dato | Dónde se usa | Dónde se cambia | Quién lo aporta |
|---|---|---|---|
| Convocatorias de 2027 (FPU, FPI, Becas Santander, contratos predoctorales de la USAL y de la Junta de Castilla y León, admisión al doctorado 2027/28): fechas cuando se publiquen. Organismo, enlace y estado de 2026 ya están en la tabla (comprobados el 25/11/2026, docs/FUENTES-OFICIALES.md, apartado 4) | Puente al doctorado | Investigación > Convocatorias | Fernando (Claude puede comprobarlas cuando salgan) |
| Fecha de inicio del piloto y días de apertura y cierre de cada semana | Calendario | Investigación > Calendario del estudio | Fernando |
| Nombres de los dos másteres del piloto | Alta de másteres | Investigación > Másteres y códigos | Fernando |
| Dominios de correo admitidos (ahora solo `usal.es`; ¿hay otro para estudiantes?) | Registro | `configuracion > dominios_permitidos` | Fernando |
| Correo de la persona investigadora que administrará SINTONÍA | Alta inicial | README, apartado 4.1 | Fernando |

## Servicios y despliegue

| Dato | Dónde se usa | Quién lo aporta |
|---|---|---|
| **Antes del piloto:** pasar la instalación publicada de demostración a real (vaciarla, `VITE_MODO_DEMO` y `MODO_DEMO` a `false`, dominios `usal.es`) | Todo | Claude, cuando Fernando lo diga |
| Proyecto de Supabase y de Vercel para la **demostración** (Fase 5), con `VITE_URL_DEMO` en el real | /demo | Fernando, o Claude con un token de Supabase |
| En Supabase: Site URL y Redirect URLs con la dirección de la web | Enlaces de acceso | Fernando |
| En Supabase: enlace de acceso de 15 minutos (Authentication > Providers > Email > Email OTP Expiration = 900) y copias de seguridad (según el plan) | Acceso y restauración | Fernando |
| Dominio definitivo de la web (hoy `sintonia360-ferca.vercel.app`). Todo está preparado: se cambia en un solo sitio (`VITE_URL_SITIO`) y los pasos están en docs/DOMINIO.md | Buscadores, redes y enlaces de acceso | Fernando compra el dominio; Claude hace el cambio |
| Cuenta de Resend (u otro proveedor) y dominio verificado desde el que enviar los correos | Recordatorios, avisos y enlaces de acceso | Fernando |
| Remitente de los correos (dirección y nombre) | Variable `CORREO_REMITENTE` en Vercel | Fernando |
| Decidir si se usa el modelo de lenguaje en el piloto y quién paga la clave de la API | Variable `AGENDA_MODO` | Fernando |
| Proyectos de Supabase (real y demostración) y de Vercel | Publicación (README, apartados 3 y 5) | Fernando |
| Primera prueba en el proyecto real de Supabase: registro con enlace por correo, borrado de una cuenta de prueba y una semana completa con el cierre automático | Comprobación final antes del piloto | Fernando, con Claude |

## Confianza (Fase 1 de las mejoras)

| Dato | Dónde se usa | Quién lo aporta |
|---|---|---|
| Copias de seguridad de la base de datos: frecuencia y cuánto tiempo se guardan (depende del plan de Supabase) | /seguridad, apartado "Copias de seguridad" | Fernando |
| Revisión manual de accesibilidad con lectores de pantalla (NVDA o VoiceOver, y TalkBack en el móvil) antes del piloto; al hacerla, actualizar /accesibilidad | /accesibilidad | Fernando (o el servicio de accesibilidad de la USAL), con Claude |
| Volver a revisar /seguridad y /accesibilidad cuando cambie algo y actualizar su fecha | `src/contenido/confianza.ts` | Claude |

## Credibilidad académica (Fase 3 de las mejoras)

| Dato | Dónde se cambia | Quién lo aporta |
|---|---|---|
| Pregunta de investigación, hipótesis H1 a H3, calendario de enero y de mayo y junio de 2027, resolución del Comité de Ética y enlace del preregistro en OSF | `src/contenido/investigacion.ts` (se publica solo al rellenarlo) | Fernando |
| Revisión del kit para participantes: hoja informativa, consentimiento (texto legal), riesgos y beneficios, base jurídica y conservación de los datos | `src/contenido/participantes.ts`; después, `npm run pdf` para regenerar los PDF | Comité de Ética de la USAL |
| Publicaciones y difusión (cuando haya alguna) | `src/contenido/investigacion.ts`, lista `PUBLICACIONES` | Fernando |

## Instituciones (Fase 4 de las mejoras)

| Dato | Dónde se usa | Quién lo aporta |
|---|---|---|
| Servicio de correo (Resend u otro) para que los formularios de contacto y de solicitud de demostración envíen de verdad. Mientras no exista, la web ofrece escribir a ferca@usal.es con el mensaje preparado | /instituciones y portada | Fernando |
| Volver a generar el dosier y el kit (`npm run pdf`) cuando cambie su contenido | public/dosier y public/kit | Claude |

## Diseño

| Dato | Dónde se usa | Quién lo aporta |
|---|---|---|

## Acabado profesional (Fase 5 de las mejoras)

| Dato | Dónde se usa | Quién lo aporta |
|---|---|---|
| Revisión de la versión en inglés por una persona con inglés nativo o académico (las 9 páginas de /en) | /en | Fernando (o el servicio de idiomas de la USAL) |
| Traducir los textos legales y el kit para participantes, solo cuando el Comité de Ética apruebe la versión en español | /en (hoy enlazan a la versión en español) | Comité de Ética, después Fernando |
| Probar cómo se ve un enlace al compartirlo en WhatsApp, LinkedIn y el correo de la USAL, una vez con el dominio definitivo | Imágenes para compartir (public/og) | Fernando |


## Acabado web (24/11/2026)

| Dato | Dónde se usa | Quién lo aporta |
|---|---|---|
| NIF y domicilio del titular (los exige el artículo 10 de la LSSI) | /aviso-legal, apartado "Titular" (`src/views/legal/AvisoLegalView.vue`) | Fernando |
| Número de WhatsApp de contacto. Sin él, el botón no aparece | Variable `VITE_WHATSAPP` en Vercel (por ejemplo, `34600000000`) y volver a publicar | Fernando |
| Activar Web Analytics en Vercel (proyecto `sintonia360-ferca` > Analytics > Enable). El código ya está; sin activarlo no se cuenta nada | Estadísticas de visitas | Fernando |
| Alta en Google Search Console y envío del sitemap (pasos en docs/FICHA-GOOGLE.md) | Buscadores | Fernando, con Claude para la etiqueta de verificación |
| Comprobar los enlaces externos (ORCID, DOI, USAL) con `npm run enlaces -- http://localhost:4173 --externos` desde un ordenador con internet. Los internos ya están comprobados | Portada e /investigacion | Fernando o Claude |

## Puente al doctorado: guía del doctorado (25/11/2026)

Datos de la guía de Puente al doctorado que no se han podido comprobar en la página oficial. Se cambian en `src/contenido/doctorado.ts`; el detalle de cada intento está en docs/FUENTES-OFICIALES.md, apartado 4.6.

| Dato | Por qué falta | Quién lo aporta |
|---|---|---|
| Grupos de investigación de las áreas cercanas al TFM (`GRUPOS_CERCANOS`) | produccioncientifica.usal.es no respondió (error 503) | Claude, cuando el portal responda (o Fernando, con la lista) |
| Importes de la matrícula de doctorado 2026-27 (`TASAS.importes`) y calendario oficial del curso | Los PDF están en posgrado.usal.es, bloqueado en el entorno de Claude | Fernando, o Claude desde un entorno que permita posgrado.usal.es |
| Cuantía y duración de las Becas Santander para personal investigador predoctoral | Igual: la convocatoria está en posgrado.usal.es | Igual |
| INPhINIT «la Caixa», Incoming y Retaining: cuantía, duración, requisitos y plazos | fundacionlacaixa.org y lacaixafoundation.org no se pudieron abrir | Claude, con acceso a esos dominios |
| Contratos predoctorales propios de la USAL y de la Junta de Castilla y León (2026 o 2027) | No se han encontrado publicados | Claude, cuando salgan |
| Horario de atención de la Escuela de Doctorado | La web de la Escuela no lo publica | Fernando (preguntando a n.doctor@usal.es) |
| Plazos de preinscripción y matrícula del curso 2027/28 (`PLAZOS_2027_28`) | Sin publicar | Claude, cuando salgan (la Escuela dice que el plazo "suele abrirse en marzo-mayo") |

