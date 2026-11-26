# Datos públicos comprobados en fuentes oficiales

Información que no depende de Fernando ni de sus directores y que se ha comprobado leyendo las páginas oficiales (consulta del 15 de noviembre de 2026; el apartado 4, del 25 de noviembre). Si algo cambia, manda la página oficial.

## 1. Servicio de atención psicológica de la USAL

- **Página oficial:** https://asuntossociales.usal.es/atencion-psicologica/ (Servicio de Asuntos Sociales).
- Es "gratuita" y está "dirigida a la comunidad universitaria".
- **Cómo pedir cita:** escribir a psicologia@usal.es identificándose como miembro de la USAL, o llamar al 923 294 500, extensión 3292. Después envían un formulario y asignan una primera cita.
- **Confidencialidad:** según la página, los datos de quien acude "NO se utilizarán para actividades de investigación".
- **Urgencias:** "En situaciones de especial gravedad, se deben utilizar los recursos normalizados de urgencias y/o del servicio 112".

**En SINTONÍA:** es el enlace del mensaje que ve el estudiante cuando su bienestar es 1 o 2 (`configuracion > url_servicio_psicologico`). El mensaje añade que es gratuito y que, si es una urgencia, se llame al 112.

## 2. Convocatorias predoctorales

| Convocatoria | Organismo | Estado y plazos comprobados | Página oficial |
|---|---|---|---|
| FPU 2026 (Formación de Profesorado Universitario) | Agencia Estatal de Investigación (por primera vez; antes, el Ministerio) | Abierta. Personas participantes: del 20/10/2026 al 12/11/2026 a las 14:00 (ya cerrado). Entidades: hasta el 20/11/2026 a las 14:00. En la USAL había además un plazo interno hasta el 5 de noviembre | https://www.aei.gob.es/convocatorias/buscador-convocatorias/ayudas-formacion-profesorado-universitario-fpu-2026 y, para la USAL, https://convocatoriasinvestigacion.usal.es/convocatoria-contratos-predoctorales-fpu-2026/ |
| FPI 2026 de la USAL (contratos predoctorales ligados a proyectos PID 2025) | Universidad de Salamanca (Agencia de Gestión de la Investigación) | Solicitudes del 26/10/2026 al 15/11/2026, ampliado hasta el 17/11/2026 por una incidencia en la Sede Electrónica (comprobado el 25/11/2026) | https://convocatoriasinvestigacion.usal.es/contratos-predoctorales-fpi-2026/ |
| Proyectos de Generación de Conocimiento y formación de personal investigador predoctoral 2026 | Agencia Estatal de Investigación | La piden los grupos de investigación (no los estudiantes): del 03/11/2026 al 24/11/2026. Los contratos predoctorales asociados se convocan después | https://www.aei.gob.es/convocatorias/buscador-convocatorias/proyectos-generacion-conocimiento-actuaciones-formacion-7 |
| Contratos predoctorales propios de la USAL | Universidad de Salamanca | No se ha encontrado la convocatoria de 2026 (la última vista es la de 2025) | https://convocatoriasinvestigacion.usal.es/ |
| Contratos predoctorales de la Junta de Castilla y León | Consejería de Educación | El 25/11/2026 la web sí respondió, pero solo muestra la convocatoria de 2019 (ver apartado 4.4) | https://www.educa.jcyl.es/universidad/es |

**Para el piloto (enero a junio de 2027):** casi todas estas convocatorias de 2026 ya habrán cerrado. Las que interesan son las de 2027, que todavía no están publicadas. Sus fechas se meten en el panel de Investigación > Convocatorias cuando salgan, y nunca antes (no se inventan).

## 3. Tutor y director de tesis en el doctorado

**Real Decreto 99/2011, artículo 11.3** (https://www.boe.es/buscar/act.php?id=BOE-A-2011-2541): a cada doctorando se le asigna un director o directora de tesis y un tutor o tutora. El tutor "velará por la interacción" del doctorando con la Comisión académica, y "podrá ser coincidente o no" con el director.

**Reglamento de Doctorado de la USAL** (BOCyL de 15 de diciembre de 2025, https://bocyl.jcyl.es/boletines/2025/12/15/pdf/BOCYL-D-15122025-31.pdf):

- **Artículo 13.5:** si el director forma parte del programa y tiene contrato con la USAL, "desempeñará las funciones de tutora o tutor". Si no, se asigna un tutor aparte.
- **Artículo 13.6:** en codirección, el tutor es quien aparece primero en el Plan de Investigación.
- **Artículo 13.7.c:** el tutor asesora "sobre los servicios de apoyo a la investigación que ofrece la Universidad (becas, movilidad, idiomas...)". Encaja con Puente al doctorado.
- **Artículo 14.5:** puede haber hasta tres directores.

**Qué supone para SINTONÍA:**

1. Tratar como "director/a" a quien acompaña la tesis es coherente con la USAL: en el caso habitual, director y tutor son la misma persona (art. 13.5).
2. Cuando el tutor es otra persona, puede añadirse como cotutor.
3. SINTONÍA admite hoy dos personas en la dirección (dirección y codirección); el reglamento permite hasta tres. Solo importa si se usa con tesis de tres directores.

## 4. Doctorado en la USAL y ayudas predoctorales (consulta del 25 de noviembre de 2026)

Todo lo de este apartado se ha leído en la página oficial indicada el **25/11/2026** (con `curl` y, donde falló, con un lector web). Lo que no se pudo abrir queda como **pendiente** al final. En SINTONÍA está en `src/contenido/doctorado.ts` y se muestra en Puente al doctorado (componente `src/components/puente/GuiaDoctorado.vue`).

### 4.1. Programas de doctorado

**Fuente:** https://doctorado.usal.es/es/doctorados ("Oferta académica de Doctorado").

- **45 programas en 6 ramas:** Arte y Humanidades (11), Ciencias (10), Ciencias de la Salud (9), Ciencias Sociales y Jurídicas (10), Ingeniería y Arquitectura (4) y Programas Multidisciplinares (1). La lista completa, con el nombre exacto y el enlace a cada ficha, está copiada de la página en `src/contenido/doctorado.ts` (`RAMAS`).
- **Afines al TFM por el nombre** (hay que leer las líneas de cada ficha): Lógica, Filosofía de la Ciencia y Estudios Sociales de la Ciencia; Formación en la Sociedad del Conocimiento; Educación; Ciencias Sociales (incluye línea de investigación en "Traducción y mediación intercultural"); Psicología; Filosofía.

### 4.2. Requisitos de acceso

**Fuente:** https://doctorado.usal.es/es/requisitos-acceso

- Vía habitual: "títulos oficiales españoles de Grado, o equivalente, y de Máster Universitario, o equivalente, siempre que se hayan superado, al menos, 300 créditos ECTS en el conjunto de estas dos enseñanzas".
- Otras vías: títulos españoles de 300 ECTS con nivel 3 del MECES; títulos del EEES de nivel 7 del Marco Europeo que den acceso al doctorado en su país; títulos de fuera del EEES tras comprobación de la universidad; otro doctorado; Licenciatura, Arquitectura o Ingeniería con Suficiencia Investigadora o DEA; dos años de formación sanitaria especializada.
- **Admisión:** la Comisión Académica de cada programa aplica sus requisitos y criterios; puede exigir complementos de formación. El último listado de admitidos se publica "a partir del 18 de septiembre".

### 4.3. Preinscripción y matrícula, curso 2026/27

**Fuente:** https://doctorado.usal.es/es/preinscripcion-matricula

| Trámite | Plazo oficial 2026/27 |
|---|---|
| Preinscripción (aplicación: https://www.usal.es/acceso-autopreinscripcion-doctorado) | Del 1 de marzo al 7 de septiembre de 2026 |
| Acceso con título de fuera del EEES | Del 1 de marzo al 7 de septiembre de 2026 |
| Listados de admitidos | 1.º a partir del 15 de junio de 2026; 2.º a partir del 18 de septiembre de 2026 |
| Matrícula de nuevo ingreso | Del 3 al 17 de julio y del 21 de septiembre al 9 de octubre de 2026, de 9 a 13:30 |
| Matrícula de segundo año y siguientes (automatrícula) | Del 3 al 17 de julio y del 1 al 30 de septiembre de 2026 |
| Anulación de matrícula (sin devolución de tasas) | Hasta el 30 de diciembre de 2026 |

- **Documentos de la preinscripción:** DNI o pasaporte; títulos de Máster y de Grado (o Licenciatura) y sus certificados de asignaturas con nota media; currículum; "compromiso de un investigador del programa de ejercer las funciones de tutor, director o codirector de tesis" (vale un correo o el impreso de aceptación); y la documentación que pida cada programa. Se puede preinscribir quien aún no cumple los requisitos (por ejemplo, en el último curso del máster).
- **Matrícula:** preferentemente por correo postal a la Administración de las Escuelas de Doctorado (Patio de Escuelas Menores, 37008 Salamanca) o en persona con cita previa.
- **Tasas** (https://doctorado.usal.es/es/precios-publicos): rige el "DECRETO 8/2024, de 30 de mayo, por el que se fijan los precios públicos para el curso académico 2024-25 prorrogados para el curso 2026-27".
- **Preguntas frecuentes** (https://doctorado.usal.es/es/faq): el plazo de preinscripción "suele abrirse en marzo-mayo".
- El curso 2027/28 (el que interesa a quien termina el máster en 2027) **no está publicado** a 25/11/2026.

### 4.4. Ayudas predoctorales

| Ayuda | Cuantía | Duración | Requisitos principales | Plazo 2026 | Fuente |
|---|---|---|---|---|---|
| **FPU 2026** (Agencia Estatal de Investigación) | 32.500 € al año para el contrato (salario bruto mínimo 25.457 € al año), 3.350 € de indemnización y 10.000 € para estancias y matrícula | Hasta 4 años, con hasta 12 meses de orientación postdoctoral | Matriculado o admitido en un doctorado para 2026/27 (o estarlo al firmar); no haber tenido FPU, no ser doctor ni haber tenido más de 12 meses de contrato predoctoral (art. 6). Evaluación: trayectoria académica 0-75 con umbral 60 (50 en el turno de discapacidad) y equipo 0-25 (anexo I). La nota media no incluye el máster (anexo III.2) | Cerrada. Participantes: 20/10/2026 a 12/11/2026, 14:00. Entidades: hasta el 20/11/2026, 14:00 | https://www.aei.gob.es/convocatorias/buscador-convocatorias/ayudas-formacion-profesorado-universitario-fpu-2026 y la convocatoria firmada (Resolución de 25/09/2026, BOE-B-2026-31266, BDNS 918659) |
| **FPU en la USAL** (requisitos internos) | La de la FPU | La de la FPU | Preadmisión o matrícula en un programa de la USAL; director con vínculo con la USAL e incluido en el programa; equipo liderado por un investigador de la USAL | Documentación a agipersonal@usal.es hasta el 5 de noviembre | https://convocatoriasinvestigacion.usal.es/convocatoria-contratos-predoctorales-fpu-2026/ |
| **FPI 2026 de la USAL** (15 contratos ligados a proyectos PID 2025) | 31.100 € al año, 3.215 € de indemnización y 7.000 € para estancias y matrícula (art. 6.2) | Hasta 4 años, con hasta 12 meses de orientación postdoctoral | Título de acceso al doctorado; matrícula a tiempo completo o admisión en un doctorado de la USAL para 2026/27, o preadmisión firmada por el coordinador; no ser doctor (art. 3). Nota media hasta 35 puntos; se valoran publicaciones, congresos y movilidad | Cerrada: del 26/10/2026 al 15/11/2026, ampliado al 17/11/2026 | https://convocatoriasinvestigacion.usal.es/contratos-predoctorales-fpi-2026/ (convocatoria en PDF enlazada allí) |
| **Becas Santander**, ayuda económica para personal investigador predoctoral 2026 (curso 2026/27) | Pendiente (PDF en posgrado.usal.es) | Pendiente | Matrícula de nuevo ingreso en 2026/27 en un doctorado de la USAL; Máster Universitario Oficial cursado y terminado en la USAL; residencia en España | Cerrada: del 7/5/2026 al 1/10/2026. Resolución publicada el 18/11/2026 | https://doctorado.usal.es/es/convocatorias |
| **Contratos predoctorales propios de la USAL** | Pendiente | Pendiente | Pendiente | No se ha encontrado la de 2026 en el buscador de convocatoriasinvestigacion.usal.es | https://convocatoriasinvestigacion.usal.es/ |
| **Contratos predoctorales de la Junta de Castilla y León** | Pendiente | El portal muestra la edición de 2019: "La duración máxima de las ayudas será de 4 años"; 90 contratos | Pendiente | No se ha encontrado la de 2026: el portal de la Junta solo muestra la convocatoria de 2019 (Orden de 12 de diciembre de 2019; resuelta por la Orden EDU/601/2020) | https://www.educa.jcyl.es/universidad/es/fondos-europeos/fondo-social-europeo-2021-2027-fse/ayudas-financiar-contratacion-predoctoral-personal-investig |
| **INPhINIT «la Caixa»** (Incoming y Retaining) | Pendiente | Pendiente | Pendiente | Pendiente | fundacionlacaixa.org y lacaixafoundation.org **no se pudieron abrir** desde este entorno (la conexión se cortó) |

**Contacto para FPU y FPI en la USAL** (Agencia de Gestión de la Investigación): agipersonal@usal.es, 923 294 777 y 923 294 500, ext. 1267.

Las ventajas y desventajas que muestra la aplicación se deducen de estas bases (se cita el artículo o anexo): por ejemplo, el peso de la nota media en la FPU (anexo I) o que la FPI solo se pide para los proyectos de su anexo II.

### 4.5. Contacto de la Escuela de Doctorado "Studii Salamantini"

**Fuente:** pie de todas las páginas de https://doctorado.usal.es/es y https://doctorado.usal.es/es/organigrama

| Para | Teléfono | Correo |
|---|---|---|
| Doctorado | +34 923 29 44 00, ext. 5485 | n.doctor@usal.es |
| Tesis | +34 923 29 44 00, ext. 1182 | tesis@usal.es |
| Unidad Económica | +34 923 29 44 00, ext. 1248 | economia.doctorado@usal.es |

Dirección: Patio de Escuelas Menores, 37008 Salamanca. El organigrama añade el correo de la dirección (dir.doctorado@usal.es) y el de formación transversal (formacion.doctorado@usal.es).

**Horario de atención:** la web no lo publica (ni en el pie, ni en el organigrama, ni en las preguntas frecuentes). Solo dice que la matrícula se atiende de 9 a 13:30 en sus plazos y que la atención en persona para la matrícula es con cita previa.

### 4.6. Lo que no se pudo comprobar (pendiente)

| Dato | Motivo |
|---|---|
| Grupos de investigación de la USAL (https://produccioncientifica.usal.es/grupos) | El portal no respondió el 25/11/2026: conexión cortada con `curl` y error 503 con el lector web, en dos intentos cada uno |
| Importes de la matrícula 2026-27, calendario oficial del curso 2026-27 (aprobado el 12/01/2026) y cuantía de las Becas Santander | Los PDF están en posgrado.usal.es, que este entorno no puede abrir (bloqueado por la red con `curl`; el lector web no resuelve el nombre) |
| INPhINIT «la Caixa», Incoming y Retaining | fundacionlacaixa.org y lacaixafoundation.org no se pudieron abrir |
| Contratos predoctorales propios de la USAL y de la Junta de Castilla y León de 2026 o 2027 | No se han encontrado en las páginas oficiales |
| Horario de atención de la Escuela de Doctorado | No figura en su web |
| Plazos del curso 2027/28 y convocatorias de 2027 | No publicados a 25/11/2026 |

**En la base de datos** (migración `20261125000100_convocatorias_comprobadas.sql`, copiada en `supabase/actualizaciones.sql`): las filas de la tabla `convocatorias` llevan ya el organismo, el enlace oficial y un estado que resume la convocatoria de 2026 y deja como pendiente la de 2027. Las fechas siguen vacías: se rellenan en Investigación > Convocatorias cuando salgan las de 2027. Se añade la fila de las Becas Santander.
