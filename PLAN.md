# Plan de trabajo de SINTONÍA

Estado: **las 7 fases están terminadas.** El plan se aprobó el 12 de noviembre de 2026 (Vue + Tailwind como WORKWELL360, con Supabase). Lo que queda por hacer está en PENDIENTES.md.

Hoy es 12 de noviembre de 2026 y el sistema tiene que estar estable en enero de 2027. Eso deja unas 7 semanas, así que propongo cerrar las fases 2 a 6 antes de las vacaciones de Navidad y dejar la Fase 7 (demo, capturas, despliegue) y un margen de pruebas para la primera mitad de enero.

## 1. Tecnología

Tu encargo dice: "salvo que WORKWELL360 use otra pila; en ese caso, reutiliza la suya". WORKWELL360 usa:

| Capa | WORKWELL360 |
|---|---|
| Interfaz | Vue 3 + Vite + Pinia + Vue Router |
| Estilos | Tailwind CSS 3 |
| Servidor | Funciones de Vercel (carpeta `api/`) |
| Base de datos | PostgreSQL con conexión directa (`pg`) |
| Acceso | Contraseña + token JWT propio |

**Propuesta:** reutilizar toda la parte visible y la forma de desplegar, y cambiar solo el acceso y la base de datos por Supabase:

| Capa | SINTONÍA | Por qué |
|---|---|---|
| Interfaz | **Vue 3 + Vite + Pinia + Vue Router** (como WORKWELL360) | Permite copiar sus componentes (iconos, botones, menú, check-in) casi sin cambios. Next.js obligaría a reescribirlos en otro lenguaje de componentes. |
| Estilos | **Tailwind CSS 3** con los tokens de DISENO.md | Igual que WORKWELL360. |
| Servidor | **Funciones de Vercel** en `api/` (como WORKWELL360) | Para lo que nunca debe hacer el navegador: el sorteo, la agenda, el modelo de lenguaje, los correos y las exportaciones. |
| Base de datos y acceso | **Supabase** (PostgreSQL en la UE, acceso por enlace al correo, reglas RLS) | En WORKWELL360, los permisos se comprueban en el código del servidor. Tu encargo exige que se apliquen en la propia base de datos (RLS), y Supabase está diseñado para eso: cada consulta sabe quién la hace y la base de datos decide qué filas puede ver. |
| Correo | Proveedor sencillo (propongo **Resend**), configurable | Para los recordatorios. Los enlaces de acceso los envía Supabase. |
| Modelo de lenguaje | Configurable por variable de entorno (por ejemplo, la API de Claude), con modo "banco de preguntas" sin modelo | Como pide el encargo. |
| Tests | **Vitest** (lógica) y **Playwright** (flujos en el navegador) | Como pide el encargo. |

En lenguaje sencillo: SINTONÍA se verá y se desplegará como WORKWELL360, pero la "cerradura" de los datos estará en la propia base de datos y no solo en el programa. Si un día alguien se equivoca al programar una pantalla, la base de datos seguirá sin entregar el bienestar de un estudiante a su tutor.

## 2. Cómo se protege cada dato (resumen)

- **Identidades separadas de respuestas.** Una tabla guarda el nombre y el correo. Las respuestas solo llevan un código seudónimo. Solo el servidor (para enviar correos) y la propia persona pueden unir ambas.
- **Bienestar.** Tabla propia, cifrada, que solo puede leer su autor. El investigador lo recibe únicamente dentro de la exportación seudonimizada. Nunca entra en ningún cálculo que vea otra persona.
- **Dirección.** No puede leer ninguna tabla de respuestas. Solo puede consultar unas "vistas resumen" que ya aplican la regla de las 5 personas dentro de la base de datos.
- **Sorteo y agenda.** Los hace solo el servidor, y el sorteo se guarda antes de generar nada.
- **Auditoría.** Cada lectura de datos sensibles y cada descarga quedan anotadas.

El diagrama completo de quién ve qué irá en ARQUITECTURA.md (Fase 2, y se completa en la 7).

## 3. Fases

Al final de cada fase te enseñaré capturas y el resultado de los tests, y esperaré tu visto bueno.

### Fase 1. Análisis y plan (esta)
- DISENO.md, PLAN.md, DECISIONES.md y PENDIENTES.md.

### Fase 2. Base del proyecto, acceso, perfiles y permisos
- Proyecto Vue + Vite + Tailwind con los tokens de WORKWELL360 y el logotipo provisional.
- Esquema de base de datos: másteres, parejas, identidades, participantes, semanas del estudio, ítems, respuestas, bienestar, sorteos, agendas, convocatorias, cuestionarios, avisos de apoyo, consentimientos y auditoría.
- Reglas RLS para los cuatro perfiles.
- Registro con correo institucional y código de pareja; acceso por enlace al correo; consentimiento versionado.
- **Tests de permisos**: un tutor no lee el bienestar, la dirección no lee filas individuales y un estudiante no ve a otro.
- Primera versión de ARQUITECTURA.md.

### Fase 3. Check-ins con la identidad visual
- Check-in del estudiante (4 ítems, candado en el bienestar, mensaje y enlace al servicio de atención psicológica si responde 1 o 2, editable hasta el cierre).
- Check-in del tutor (todos sus estudiantes en una pantalla y un solo botón).
- Histórico del estudiante, botón "Necesito apoyo", retirada del estudio y borrado de datos.
- Calendario del estudio (zona horaria Europe/Madrid).

### Fase 4. Desajuste, sorteo y agenda
- Módulo puro de desajuste, con umbrales versionados y tests.
- Sorteo en el servidor con semilla registrada, guardado antes de todo, y registro del motivo cuando no hay sorteo.
- Agenda con el banco de preguntas; después, con el modelo de lenguaje (solo datos no personales, salida JSON validada y vuelta al banco si falla).

### Fase 5. Puente al doctorado, cuestionarios y recordatorios
- Calendario de convocatorias editable (todo con "[PENDIENTE]") y la línea "Se acerca el plazo...", registrando si se mostró.
- Pretest (semana 0) y postest (semana 11) configurables, con el ítem de H3.
- Recordatorios por correo, desactivables por cada persona.

### Fase 6. Panel de dirección y datos de investigación
- Panel agregado con supresión por debajo de 5 personas y avisos de "Necesito apoyo".
- Exportaciones CSV (semanal en formato largo, pretest y postest), DATOS.md y script de R con un modelo multinivel.

### Fase 7. Demostración, accesibilidad, documentación y despliegue
- Modo demo separado (1 máster, 4 tutores, 12 estudiantes y 6 semanas simuladas) con accesos rápidos.
- Revisión de accesibilidad (teclado, contraste, etiquetas, tamaños táctiles) y de rendimiento en móvil.
- README para personas que no programan, despliegue en Vercel y Supabase paso a paso, y capturas de todas las pantallas en móvil y escritorio.
