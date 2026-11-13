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
| Textos definitivos de los 4 ítems del estudiante y los 2 del tutor (ahora provisionales) | Check-ins | tabla `items` | Fernando y sus directores |
| Ítems de la escala validada del pretest y del postest | Cuestionarios | tabla `cuestionario_items` | Fernando |
| Pregunta (y opciones) de conocimiento sobre las convocatorias predoctorales | Cuestionarios | tabla `cuestionario_items` | Fernando |
| Instrucciones del cuestionario inicial y del final | Cuestionarios | tabla `cuestionarios` | Fernando |
| Revisión del banco de 14 preguntas provisionales de la agenda | Agenda sin modelo | tabla `banco_preguntas` | Fernando y sus directores |
| Plan de análisis definitivo (modelo, covariables, datos que faltan) | `analisis/analisis_ejemplo.R` es solo una plantilla | | Fernando y sus directores |

## Datos de la Universidad y del piloto

| Dato | Dónde se usa | Dónde se cambia | Quién lo aporta |
|---|---|---|---|
| URL oficial del servicio de atención psicológica de la USAL | Mensaje del check-in cuando el bienestar es 1 o 2 | `configuracion > url_servicio_psicologico` | Fernando |
| Convocatorias (FPU, FPI, contratos predoctorales de la USAL y de la Junta de Castilla y León, admisión al doctorado): organismo, fechas, enlace oficial y estado | Puente al doctorado | Investigación > Convocatorias | Fernando |
| Fecha de inicio del piloto y días de apertura y cierre de cada semana | Calendario | Investigación > Calendario del estudio | Fernando |
| Nombres de los dos másteres del piloto | Alta de másteres | Investigación > Másteres y códigos | Fernando |
| Dominios de correo admitidos (ahora solo `usal.es`; ¿hay otro para estudiantes?) | Registro | `configuracion > dominios_permitidos` | Fernando |
| Correo de la persona investigadora que administrará SINTONÍA | Alta inicial | README, apartado 4.1 | Fernando |
| Revisar la normativa de doctorado antes de usar SINTONÍA con tesis (en especial, la figura del tutor frente a la del director) | Uso con tesis doctorales | NORMATIVA.md, apartado 4 | Fernando |

## Servicios y despliegue

| Dato | Dónde se usa | Quién lo aporta |
|---|---|---|
| **Proyecto real de Supabase en Fráncfort, conectado a Vercel** (hoy la web publicada no tiene base de datos: AUDITORIA C1) | Todo | Fernando, o Claude con un token de Supabase |
| Confirmar la región de Supabase (y guardar la prueba en VERIFICACION.md) antes de volver a afirmar que los datos están en la UE | /como-funciona | Fernando, con Claude |
| En Supabase: enlace de acceso de 15 minutos (Authentication > Providers > Email > Email OTP Expiration = 900) y copias de seguridad (según el plan) | Acceso y restauración | Fernando |
| Cerrar `connect-src` de la CSP a la dirección exacta del proyecto de Supabase | `vercel.json` | Claude, cuando exista el proyecto |
| Dominio definitivo de la web (hoy `sintonia360-ferca.vercel.app`, también en `public/sitemap.xml` y `public/robots.txt`) | Buscadores | Fernando |
| Cuenta de Resend (u otro proveedor) y dominio verificado desde el que enviar los correos | Recordatorios, avisos y enlaces de acceso | Fernando |
| Remitente de los correos (dirección y nombre) | Variable `CORREO_REMITENTE` en Vercel | Fernando |
| Decidir si se usa el modelo de lenguaje en el piloto y quién paga la clave de la API | Variable `AGENDA_MODO` | Fernando |
| Proyectos de Supabase (real y demostración) y de Vercel | Publicación (README, apartados 3 y 5) | Fernando |
| Primera prueba en el proyecto real de Supabase: registro con enlace por correo, borrado de una cuenta de prueba y una semana completa con el cierre automático | Comprobación final antes del piloto | Fernando, con Claude |

## Diseño

| Dato | Dónde se usa | Quién lo aporta |
|---|---|---|
| Logotipo definitivo (el actual es tipográfico y provisional) | Toda la interfaz | Fernando |
