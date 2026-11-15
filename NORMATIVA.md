# Normativa y SINTONÍA

Relación entre la normativa de la Universidad de Salamanca sobre TFG, TFM y doctorado y las decisiones de diseño de SINTONÍA. Útil para el apartado CTS del TFM y para la memoria del Comité de Ética.

**Documentos leídos** (facilitados por Fernando el 13 de noviembre de 2026):

- **Reglamento de Trabajos de Fin de Grado de la USAL.** Consejo de Gobierno de 27 de mayo de 2022, modificado el 24 de marzo de 2023. En adelante, **RTFG**.
- **Reglamento de Trabajos de Fin de Máster de la USAL.** Consejo de Gobierno de 27 de mayo de 2022, modificado el 24 de marzo de 2023 y el 25 de julio de 2024. En adelante, **RTFM**.

La normativa de doctorado (apartado 4) se cita por sus enlaces oficiales, pero **no se ha leído**: conviene revisarla antes de usar SINTONÍA con tesis doctorales.

---

## 1. El papel de quien tutela: acompañar, no controlar

| Normativa | Qué dice | Cómo lo refleja SINTONÍA |
|---|---|---|
| RTFM art. 4.6 | "La responsabilidad tutorial será, exclusivamente, la de asistir y orientar al estudiante en su desarrollo, velar por el cumplimiento de los objetivos fijados y, en su caso, de las actividades formativas ligadas al trabajo." | El tutor no ve las respuestas ni el bienestar del estudiante: solo responde por su parte y recibe la misma agenda. SINTONÍA apoya la orientación, no la supervisión. |
| RTFG art. 4.2 | El tutor es responsable "exclusivamente de asistir y orientar al estudiante en su desarrollo autónomo". | Igual que arriba. El check-in insiste en el desarrollo autónomo: es el estudiante quien decide qué comparte. |
| RTFM art. 6.2 | Para presentar el TFM, el estudiante "en ningún caso deberá contar con el visto bueno del tutor o tutores". | SINTONÍA no da al tutor ningún poder de aprobación ni de control sobre el estudiante. |
| RTFM art. 6.6 y RTFG art. 6.5 | La comisión "podrá requerir al tutor un informe o evaluación sobre el proceso y resultado". | **Riesgo**: que los datos de SINTONÍA acaben en ese informe. El tutor no tiene ningún dato del estudiante en SINTONÍA, pero sí sus propias respuestas. **Recomendación** para el Comité de Ética: que el consentimiento diga expresamente que los datos de SINTONÍA no forman parte de la evaluación del trabajo ni de ningún informe. Queda en [PENDIENTES.md](PENDIENTES.md). |

Para el apartado CTS: la normativa ya define la tutoría como acompañamiento. SINTONÍA traduce esa definición a decisiones técnicas sobre quién ve qué dato (ver [ARQUITECTURA.md](ARQUITECTURA.md)).

## 2. Quién tutela: cotutoría y cambio de tutor

| Normativa | Qué dice | Cómo lo refleja SINTONÍA |
|---|---|---|
| RTFM art. 4.3 | Se permite un segundo profesor como cotutor. | **Cotutoría.** Cada pareja tiene un tutor principal y hasta dos cotutores. Cada cotutor hace su propio check-in y ve la misma agenda. El desajuste se calcula entre el estudiante y cada tutor. |
| RTFM art. 4.7 | Excepcionalmente, un tercer tutor. | Hasta dos cotutores además del principal (tres en total). |
| RTFG art. 4.3 | Excepcionalmente, un segundo tutor. | Igual que en el TFM. |
| RTFM art. 4.9; RTFG art. 7.3 | El estudiante puede pedir, de forma motivada, un cambio de tutor en los cinco días naturales siguientes a la publicación de la asignación. | **Cambio de tutor.** El investigador lo refleja en "Parejas y tutores". Queda registrado (y se exporta) y las respuestas del tutor anterior se conservan. |
| RTFM art. 4.10; RTFG art. 4.6 | La asignación de tutor vale solo para el curso académico, aunque puede mantenerse en cursos posteriores. | El piloto dura un cuatrimestre. Para usar SINTONÍA varios cursos, habrá que cerrar las parejas al terminar cada curso (mejora futura). |
| RTFM art. 4.1; RTFG art. 4.1 | El trabajo es único para cada estudiante; excepcionalmente, compartido con calificación individual. | Cada estudiante tiene su propia pareja, también en un trabajo compartido. |

## 3. Otros aspectos

| Normativa | Qué dice | Cómo lo refleja SINTONÍA |
|---|---|---|
| RTFM art. 6.2; RTFG art. 6.2 | En la difusión pública del trabajo, el nombre del tutor solo aparece si lo autoriza. | SINTONÍA no muestra nombres de tutores fuera de la pareja: la dirección solo ve cifras agregadas, sin datos por tutor; el investigador, solo códigos. |
| RTFM art. 2.4; RTFG art. 2.5 | Propiedad intelectual del trabajo. | SINTONÍA no guarda ningún contenido del trabajo, solo respuestas de 1 a 5. |
| RTFM art. 2.2 y 6.8 | Cada comisión académica fija su calendario de entrega y defensa. | El calendario del estudio se configura. Para el piloto es común a los dos másteres; si se generaliza, convendría un calendario por máster. |
| RTFG art. 7.2 | La asignación de tutores se publica, como tarde, en la semana diez del primer semestre. | El piloto (febrero a abril de 2027) empieza con las asignaciones ya hechas. |
| Disposición adicional única (ambos) | Referencias de género. | La interfaz usa formas inclusivas ("tutor/a", "apoyado/a"). |

## 4. Doctorado

Para que SINTONÍA sirva también en tesis doctorales:

- **Términos.** Cuando el programa es de doctorado (tipo de trabajo `TESIS`), la interfaz dice "director/a de tesis" en lugar de "tutor/a", "doctorando/a" en lugar de "estudiante" y "codirección" en lugar de "cotutoría". **Revisado el 15/11/2026** (docs/FUENTES-OFICIALES.md, apartado 3): el Real Decreto 99/2011 distingue entre tutor y director de tesis, pero en la USAL, si el director forma parte del programa y tiene contrato con la Universidad, hace también de tutor (Reglamento de Doctorado, art. 13.5). Por eso SINTONÍA trata como "director/a" a quien acompaña la investigación; si el tutor es otra persona, puede añadirse como cotutor. El reglamento admite hasta tres directores (art. 14.5); SINTONÍA, dos.
- **Puente al doctorado.** La pantalla muestra la normativa oficial del doctorado, y el organismo de la convocatoria de admisión es la Universidad de Salamanca (Escuela de Doctorado "Studii Salamantini"). Los enlaces se cambian en la tabla `enlaces_normativa`.

Normativa de doctorado facilitada (enlaces oficiales, sin leer):

| Norma | Enlace |
|---|---|
| Real Decreto 99/2011, de 28 de enero, por el que se regulan las enseñanzas oficiales de doctorado (texto consolidado con el Real Decreto 576/2023) | https://www.boe.es/buscar/pdf/2011/BOE-A-2011-2541-consolidado.pdf |
| Real Decreto 534/2013, de 12 de julio | http://www.boe.es/boe/dias/2013/07/13/pdfs/BOE-A-2013-7710.pdf |
| Real Decreto 822/2021, de 28 de septiembre, de organización de las enseñanzas universitarias | https://www.boe.es/eli/es/rd/2021/09/28/822/dof/spa/pdf |
| Acuerdo 45/2014, de 22 de mayo, de la Junta de Castilla y León (Escuelas de Doctorado) | http://bocyl.jcyl.es/boletines/2014/05/26/pdf/BOCYL-D-26052014-14.pdf |
| Real Decreto 889/2022, de 18 de octubre (homologación y equivalencia de títulos extranjeros) | https://www.boe.es/eli/es/rd/2022/10/18/889/dof/spa/pdf |
| Real Decreto 195/2016, de 13 de mayo (Suplemento Europeo al Título de Doctor) | http://posgrado.usal.es/NORMATIVA/RD195_2016.pdf |
| Reglamento de Doctorado de la Universidad de Salamanca (Consejo de Gobierno de 18 de julio de 2025; BOCyL de 15 de diciembre de 2025) | https://bocyl.jcyl.es/boletines/2025/12/15/pdf/BOCYL-D-15122025-31.pdf |
| Reglamento de Régimen Interno de la Escuela de Doctorado "Studii Salamantini" (BOCyL de 15 de diciembre de 2025) | https://bocyl.jcyl.es/boletines/2025/12/15/pdf/BOCYL-D-15122025-32.pdf |
| Reglamento de la Comisión de Doctorado y Posgrado | http://posgrado.usal.es/NORMATIVA/9199-Reglamento_Comision_Doctorado_y_Postgrado.pdf |
| Guía de Buenas Prácticas para la Gestión Académica de los Programas de Doctorado (25 de julio de 2019) | http://posgrado.usal.es/DOCTORADO%2099/GuiaBuenasPracticas.pdf |
| Guía de Buenas Prácticas, Anexo I (modelos de documentos) | http://posgrado.usal.es/DOCTORADO%2099/Guia%20Buenas%20Practicas%20Doctorado.%20Anexo%20I%20Modelos%20Documentos.pdf |
| Directrices para la coordinación de titulaciones (modificadas el 22 de diciembre de 2020) | http://posgrado.usal.es/DOCTORADO%2099/Directrices%20Coordinacion%20de%20Titulaciones.pdf |
| Sistema de Garantía Interna de Calidad de las enseñanzas de Doctorado (30 de marzo de 2017) | http://secretaria.usal.es/boletines/consulta/files/8641-P12_Sistema_Garantia_Calidad_Ensenyanzas_Doctorado.pdf |
| Procedimiento para la Mención Internacional en el Título de Doctor (12 de julio de 2024) | http://posgrado.usal.es/TESIS%20NUEVA%202012/Proc_Dr_Inter_2024.pdf |
| Procedimiento para la presentación de tesis por compendio de artículos (12 de julio de 2024) | http://posgrado.usal.es/TESIS%20NUEVA%202012/Proc_compendio%20arti_2024.pdf |
| Normativa de la Comisión Ejecutiva de la Escuela de Doctorado | https://doctorado.usal.es/es/comisi%C3%B3n-ejecutiva-a%C3%B1o-2023 |
