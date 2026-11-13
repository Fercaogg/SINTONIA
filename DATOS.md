# Diccionario de datos

Variables de los archivos que se descargan en **Investigación > Datos y auditoría**. Todos los archivos son CSV separados por comas, en UTF-8, con punto decimal y `NA` cuando falta un valor. Las fechas y horas están en formato ISO 8601 con zona horaria (por ejemplo, `2027-02-03T10:00:00+00:00`).

Nadie aparece con su nombre: cada persona y cada pareja tiene un código seudónimo que no cambia durante el estudio (`P-` pareja, `E-` estudiante, `T-` tutor/a). La tabla que une códigos y nombres está separada y el investigador no tiene acceso a ella.

El script `analisis/analisis_ejemplo.R` carga el archivo semanal y ajusta un modelo multinivel de ejemplo.

---

## 1. Datos semanales (`sintonia_semanal_AAAA-MM-DD.csv`)

Formato largo: **una fila por pareja y semana**, desde la semana 1 hasta la última semana que ha empezado (la semana en curso aparece con los datos que haya hasta ese momento). Las parejas de estudiantes que se han retirado sin borrar sus datos siguen apareciendo (`estudiante_retirado = 1`). Las de quienes pidieron el borrado ya no existen.

### Identificación

| Variable | Tipo | Valores | Descripción |
|---|---|---|---|
| `id_pareja` | texto | `P-XXXXXX` | Código seudónimo de la pareja estudiante y tutor/a. |
| `id_estudiante` | texto | `E-XXXXXX` | Código seudónimo del estudiante. |
| `id_tutor` | texto | `T-XXXXXX` o `NA` | Código seudónimo del tutor/a. `NA` si el tutor/a borró su cuenta. |
| `master` | texto | nombre del máster | Máster al que pertenece la pareja. |
| `tipo_trabajo` | texto | `TFG`, `TFM`, `TESIS` | Tipo de trabajo académico. |
| `semana` | entero | 1 a la duración del estudio | Semana del estudio. |

### Check-in del estudiante

| Variable | Tipo | Valores | Descripción |
|---|---|---|---|
| `est_avance` | entero | 1 a 5 o `NA` | "¿Cuánto has avanzado en tu trabajo esta semana?" (texto provisional). `NA`: no respondió. |
| `est_siguiente_paso` | entero | 1 a 5 o `NA` | "¿Tienes claro tu siguiente paso?" |
| `est_apoyo` | entero | 1 a 5 o `NA` | "¿Te sientes apoyado/a por tu tutor/a?" |
| `est_bienestar` | entero | 1 a 5 o `NA` | "¿Cómo estás tú esta semana?" **Dato especialmente protegido**: solo aparece en este archivo. |
| `est_respondido_at` | fecha y hora | | Última vez que el estudiante guardó su check-in de esa semana. |

### Check-in del tutor/a

| Variable | Tipo | Valores | Descripción |
|---|---|---|---|
| `tut_avance` | entero | 1 a 5 o `NA` | "¿Cuánto ha avanzado esta semana?" |
| `tut_siguiente_paso` | entero | 1 a 5 o `NA` | "¿Tiene claro su siguiente paso?" (opcional para el tutor/a). |
| `tut_respondido_at` | fecha y hora | | Última vez que el tutor/a guardó su check-in. |
| `n_cotutores` | entero | 0 a 2 | Cotutores que tenía la pareja esa semana, además del tutor principal. |
| `cotutores_respondieron` | entero | 0 a 2 | Cotutores que hicieron su check-in esa semana. Sus respuestas están en el archivo de tutores (apartado 3). |

Las columnas `id_tutor`, `tut_*` y `dif_*` corresponden al **tutor principal**: quien respondió como principal esa semana o, si no respondió nadie, el tutor principal actual.

### Desajuste (calculado al cerrar la semana)

| Variable | Tipo | Valores | Descripción |
|---|---|---|---|
| `dif_avance` | entero | −4 a 4 o `NA` | `est_avance − tut_avance` (con el tutor principal). Positivo: el estudiante ve más avance que el tutor/a. `NA` si falta alguna respuesta o la semana no se ha cerrado. |
| `dif_siguiente_paso` | entero | −4 a 4 o `NA` | Lo mismo para el siguiente paso. `NA` también si el tutor/a no respondió ese ítem. |
| `relevante_avance` | 0/1 | | 1 si el desajuste en el avance es relevante según la regla. |
| `relevante_siguiente_paso` | 0/1 | | Lo mismo para el siguiente paso. |
| `motivo_avance` | texto | `absoluto`, `persistente` o `NA` | `absoluto`: diferencia de 2 o más. `persistente`: diferencia de 1 o más con el mismo signo dos semanas seguidas. |
| `motivo_siguiente_paso` | texto | igual | |
| `regla_version` | texto | `v1` | Versión de la regla aplicada (tabla `reglas_desajuste`). |

### Sorteo del microensayo aleatorizado

| Variable | Tipo | Valores | Descripción |
|---|---|---|---|
| `sorteo_elegible` | 0/1 o `NA` | | 1 si respondieron el estudiante y al menos uno de sus tutores, y la pareja entró en el sorteo. `NA` si la semana aún no se ha cerrado. |
| `sorteo_motivo_no_elegible` | texto | `falta_estudiante`, `falta_tutor`, `faltan_ambos`, `sin_tutor`, `retirado` o `NA` | Por qué no hubo sorteo. |
| `sorteo_probabilidad` | decimal | 0 a 1 | Probabilidad de recibir agenda (0,5 por defecto). |
| `sorteo_valor` | decimal | 0 a 1 | Número aleatorio de la pareja: HMAC-SHA256(semilla, "pareja:semana") convertido a [0, 1). |
| `sorteo_resultado` | 0/1 o `NA` | | 1 si recibió agenda (`sorteo_valor < sorteo_probabilidad`). Es la variable de tratamiento. |
| `sorteo_semilla` | texto | 64 caracteres hexadecimales | Semilla de la semana: con ella se puede repetir y comprobar el sorteo. |
| `sorteo_algoritmo` | texto | `hmac-sha256-v1` | Versión del algoritmo de sorteo. |
| `sorteo_at` | fecha y hora | | Momento del sorteo (siempre anterior a la agenda). |

### Agenda

| Variable | Tipo | Valores | Descripción |
|---|---|---|---|
| `agenda` | 0/1 o `NA` | | 1 si se generó la agenda. Coincide con `sorteo_resultado`. |
| `agenda_origen` | texto | `modelo`, `banco` o `NA` | Quién redactó las preguntas. |
| `agenda_motivo_banco` | texto | `sin_modelo`, `error_modelo`, `validacion` o `NA` | Por qué se usó el banco de preguntas. |
| `agenda_version_prompt` | texto | `agenda-prompt-v1` o `NA` | Versión de las instrucciones dadas al modelo. |
| `agenda_modelo` | texto | por ejemplo `claude-opus-5-5` o `NA` | Modelo de lenguaje usado. |
| `agenda_vista_estudiante` | 0/1 o `NA` | | 1 si el estudiante abrió su panel y vio la agenda. |
| `agenda_vista_tutor` | 0/1 o `NA` | | 1 si el tutor/a la vio. |

### Puente al doctorado

| Variable | Tipo | Valores | Descripción |
|---|---|---|---|
| `puente_activado` | 0/1 o `NA` | | 1 si el estudiante tenía Puente activado al cerrar la semana. |
| `puente_linea` | 0/1 o `NA` | | 1 si la agenda de esa semana incluyó la línea "Se acerca el plazo de...". Se registra aunque no hubiera agenda de desajuste. |
| `puente_vista_estudiante` | 0/1 o `NA` | | 1 si el estudiante vio la línea. |
| `puente_vista_tutor` | 0/1 o `NA` | | 1 si el tutor/a la vio. |

### Estado

| Variable | Tipo | Valores | Descripción |
|---|---|---|---|
| `estudiante_retirado` | 0/1 | | 1 si el estudiante se ha retirado del estudio (conservando sus respuestas anteriores). |

Con cotutoría, el sorteo y la agenda son uno por estudiante: hay desajuste relevante si lo hay con cualquiera de sus tutores (`relevante_*` y `motivo_*` de este archivo se refieren al tutor principal; los de cada tutor están en el archivo de tutores).

---

## 2. Pretest y postest (`sintonia_pretest_AAAA-MM-DD.csv` y `sintonia_postest_AAAA-MM-DD.csv`)

Formato ancho: **una fila por estudiante** que haya respondido, una columna por ítem.

| Variable | Tipo | Valores | Descripción |
|---|---|---|---|
| `id_estudiante` | texto | `E-XXXXXX` | Código seudónimo del estudiante (el mismo que en el archivo semanal). |
| `id_pareja` | texto | `P-XXXXXX` | Código de su pareja. |
| `master` | texto | | Máster. |
| `cuestionario` | texto | `pretest` o `postest` | |
| `respondido_at` | fecha y hora | | Última respuesta guardada. |
| `escala_item_1` | entero | 1 a 5 | [PENDIENTE: ítems de la escala validada]. Se añadirá una columna por ítem. |
| `h3_orientacion_doctorado` | 0/1 | | "¿Cuentas con alguna persona del ámbito académico, distinta de tu tutor/a, que te oriente sobre el doctorado?" (1 = sí). |
| `conocimiento_1` | texto | una de las opciones | [PENDIENTE: pregunta de conocimiento sobre las convocatorias predoctorales]. |

Las variables de los cuestionarios se definen en la tabla `cuestionario_items` (columna `variable`). Si se añaden ítems, aparecen como columnas nuevas en el mismo orden.

---

## 3. Respuestas de cada tutor (`sintonia_tutores_AAAA-MM-DD.csv`)

Formato largo: **una fila por pareja, semana y tutor que respondió** (tutor principal y cotutores). Sirve para analizar la cotutoría.

| Variable | Tipo | Valores | Descripción |
|---|---|---|---|
| `id_pareja`, `id_estudiante`, `id_tutor`, `master`, `semana` | | | Como en el archivo semanal; `id_tutor` es quien respondió. |
| `tutor_principal` | 0/1 | | 1 si respondió como tutor principal; 0, como cotutor. |
| `tut_avance`, `tut_siguiente_paso` | entero | 1 a 5 o `NA` | Sus respuestas. |
| `dif_avance`, `dif_siguiente_paso` | entero | −4 a 4 o `NA` | Diferencia entre el estudiante y este tutor. |
| `relevante_avance`, `relevante_siguiente_paso`, `motivo_avance`, `motivo_siguiente_paso`, `regla_version` | | | Desajuste con este tutor (como en el archivo semanal). |
| `tut_respondido_at` | fecha y hora | | Última vez que guardó su check-in. |

## 4. Cambios de tutor (`sintonia_cambios_tutor_AAAA-MM-DD.csv`)

| Variable | Tipo | Descripción |
|---|---|---|
| `id_pareja` | texto | Pareja. |
| `id_tutor_anterior` | texto | Tutor principal anterior (`NA` si ya no existe). |
| `id_tutor_nuevo` | texto | Nuevo tutor principal. |
| `cambiado_at` | fecha y hora | Momento del cambio. |

---

## 5. Notas para el análisis

- **Tratamiento:** `sorteo_resultado` (aleatorizado cada semana entre las parejas elegibles). Las parejas con `sorteo_elegible = 0` no participan en el sorteo de esa semana.
- **Resultado proximal sugerido:** el desajuste de la semana siguiente (por ejemplo, `abs(dif_avance)` en `semana + 1`), como hace el script de ejemplo.
- **Moderador disponible:** `relevante_avance` / `relevante_siguiente_paso` de la semana del sorteo.
- **Hipótesis 3:** `puente_activado`, `puente_linea` y `puente_vista_*` en el archivo semanal; `h3_orientacion_doctorado` en el pretest y el postest.
- **Calendario:** las anotaciones del calendario no se exportan ni forman parte de los datos del estudio.
- **Bienestar:** úsalo solo para los análisis previstos en el protocolo aprobado por el Comité de Ética, y guarda el archivo cifrado.
