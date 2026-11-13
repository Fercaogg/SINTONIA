# Datos pendientes

Todo lo que SINTONÍA necesita y que no se puede inventar. En la aplicación, cada uno aparece como "[PENDIENTE: …]" sobre fondo amarillo hasta que se rellena. El apartado 6 del [README](README.md#6-cambiar-textos-y-ajustes) explica dónde se cambia cada cosa.

## Textos legales y éticos

| Dato | Dónde se usa | Dónde se cambia | Quién lo aporta |
|---|---|---|---|
| Consentimiento informado (versión 1) | Registro de estudiantes y tutores | tabla `consentimiento_textos` | Comité de Ética de la USAL |
| Política de privacidad | "Cómo funciona y tus datos" | `configuracion > texto_politica_privacidad` | Comité de Ética de la USAL |
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

## Servicios y despliegue

| Dato | Dónde se usa | Quién lo aporta |
|---|---|---|
| Cuenta de Resend (u otro proveedor) y dominio verificado desde el que enviar los correos | Recordatorios, avisos y enlaces de acceso | Fernando |
| Remitente de los correos (dirección y nombre) | Variable `CORREO_REMITENTE` en Vercel | Fernando |
| Decidir si se usa el modelo de lenguaje en el piloto y quién paga la clave de la API | Variable `AGENDA_MODO` | Fernando |
| Proyectos de Supabase (real y demostración) y de Vercel | Publicación (README, apartados 3 y 5) | Fernando |
| Primera prueba en el proyecto real de Supabase: registro con enlace por correo, borrado de una cuenta de prueba y una semana completa con el cierre automático | Comprobación final antes del piloto | Fernando, con Claude |

## Diseño

| Dato | Dónde se usa | Quién lo aporta |
|---|---|---|
| Logotipo definitivo (el actual es tipográfico y provisional) | Toda la interfaz | Fernando |
