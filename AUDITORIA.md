# Auditoría de SINTONÍA

Fecha: 13 de noviembre de 2026. Revisado: el repositorio (rama `main`, versión `ce706ae`), su historial completo de git y la web publicada en https://sintonia360-ferca.vercel.app, que corresponde exactamente a esa versión.

Cómo leer la gravedad:

- **Crítico:** impide usar SINTONÍA o hace que la web diga algo que hoy no es verdad.
- **Alto:** un riesgo real de seguridad o privacidad, o algo importante que no funciona.
- **Medio:** conviene arreglarlo antes del piloto.
- **Bajo:** mejora menor.

---

## Resumen en cinco líneas

1. **La web publicada no está conectada a ninguna base de datos.** El proyecto de Vercel no tiene ninguna variable configurada, así que el registro, el acceso y los paneles no pueden funcionar. Por tanto, tampoco hay ningún proyecto de Supabase cuya región se pueda comprobar.
2. **Las tareas automáticas del servidor fallan al arrancar** (cierre de semana, sorteo, recordatorios y borrados) por un error de programación mío que los tests no detectaban.
3. **No hay ningún secreto** ni en el código que llega al navegador ni en todo el historial de git.
4. **La protección de los datos en la base de datos es sólida:** las 32 tablas públicas tienen RLS, nadie puede escribir directamente y el bienestar va cifrado.
5. **Faltan cinco de las seis cabeceras de seguridad, las páginas legales y los límites de intentos**, y en /como-funciona se ven dos "[PENDIENTE]".

---

## 1. Rutas, componentes y pila técnica

| Elemento | Situación |
|---|---|
| Pila | Vue 3 + Vite + Tailwind (no Next.js). Base de datos y acceso: Supabase. Servidor: funciones de Vercel en `api/`. Las cabeceras, por tanto, se configuran en `vercel.json` (no hay `next.config`) |
| Rutas públicas | `/`, `/como-funciona`, `/acceso`, `/registro`, `/acceso/confirmar` y página 404 propia |
| Rutas privadas | `/estudiante/*`, `/tutor/*`, `/direccion/*`, `/investigacion/*`, `/calendario`, `/cuenta`, `/consentimiento` |
| Funciones del servidor | `api/cerrar-semana` (diaria, 00:15), `api/recordatorios` (diaria, 08:15), `api/notificar-apoyo` |
| Proyectos de Vercel | Hay **cuatro** proyectos conectados al mismo repositorio: `sintonia360-ferca`, `sintonia360`, `sintonia360-mecti-tcue` y `sintonia360-app`. Cada cambio se publica cuatro veces y cada uno programa sus propias tareas diarias |
| Repositorio | Es **público** en GitHub. No es un problema (no contiene secretos y aporta transparencia, útil para el apartado CTS), pero conviene saberlo |

## 2. Secretos

| Comprobación | Resultado |
|---|---|
| Código que llega al navegador (los 43 archivos de la web publicada) | **Ningún secreto.** Ni clave `service_role`, ni `sb_secret`, ni claves de Resend o Anthropic. Solo aparecen textos de la librería de Supabase |
| Todo el historial de git (19 versiones, 9 ramas) | **Ningún secreto.** Busqué claves JWT, `sb_secret_`, claves de Anthropic (`sk-ant-`), Resend (`re_`), GitHub, AWS, claves privadas y cadenas de conexión con contraseña. El único archivo `.env` del historial es `.env.example`, que está vacío a propósito |
| Uso de la clave `service_role` | Solo la leen las funciones del servidor (`api/`), nunca el navegador. Correcto |
| Secreto del simulador local (`scripts/local/servidor-local.mjs`) | Es un texto fijo que solo sirve para el simulador de tu ordenador y no da acceso a nada real. Correcto, se deja así |

**No hace falta cambiar ninguna clave.**

## 3. Protección de cada tabla (RLS)

Comprobado sobre una instalación local creada con las 12 migraciones del repositorio, que son las mismas que se instalarían en Supabase.

- **Las 32 tablas del esquema público tienen RLS activada.** Los usuarios identificados solo tienen permiso de lectura, y cada lectura pasa por una regla. Nadie (ni siquiera el investigador) puede escribir directamente: todo cambio pasa por funciones que comprueban quién lo pide.
- Tres tablas tienen RLS pero ninguna regla de lectura, así que nadie las lee desde la aplicación: `cierres_semana`, `correos_enviados` y `puente_cambios` (solo las usa el servidor).
- Los usuarios anónimos solo pueden usar tres funciones: comprobar un código, leer la configuración pública y saber si la instalación es de demostración.

| Tabla | Estudiante | Tutor/a | Dirección | Investigador |
|---|---|---|---|---|
| `bienestar` (cifrado) | Solo la suya | No | No | No (solo dentro de la exportación, registrada) |
| `respuestas_estudiante` | Las suyas | No | No | Todas, seudónimas |
| `respuestas_tutor` | No | Las suyas | No | Todas, seudónimas |
| `identidades` (nombre y correo) | La suya | La suya | La suya | La suya |
| `perfiles`, `parejas` | Los suyos | Los suyos | El suyo | Todos, seudónimos |
| `avisos_apoyo` | Los suyos | No | Solo mediante función, con nombre solo si el estudiante lo autoriza | No |
| `desajustes`, `sorteos` | No | No | No | Sí, seudónimos |
| `agendas` | La suya | Las de sus parejas | No | Sí |
| `eventos` (calendario) | Los suyos, los de su pareja y los del máster | Igual | Solo los del máster | Solo los del máster |
| `auditoria` | No | No | No | Sí |

La tabla completa está en ARQUITECTURA.md, apartado 3.

**Los cinco casos que pides ya tienen test automático**: el tutor no lee el bienestar; la dirección no lee filas individuales; un estudiante no ve a otro; un anónimo no lee nada, y la dirección no obtiene cifras con menos de 5 personas llamando a la API. Están en `tests/bd/permisos.test.ts` y `tests/bd/fase6.test.ts`, y todos pasan. En la Fase 2 los reuniré en un archivo propio, con los nombres de tus cinco casos, para que se puedan citar en la memoria.

## 4. Región de Supabase

**No se puede confirmar, porque la web publicada no está conectada a ningún proyecto de Supabase.** La página "Cómo funciona y tus datos" afirma que los datos se guardan en la Unión Europea y que las reglas están en la base de datos. Hoy esas frases no son falsas (no hay ningún dato guardado), pero **no están respaldadas** por una instalación real. Ver el hallazgo C2.

Además, en los registros de Vercel las funciones aparecen ejecutándose en **iad1 (Washington, Estados Unidos)**, aunque `vercel.json` pide **fra1 (Fráncfort)**. Ver el hallazgo A3.

## 5. Registro y acceso

| Pregunta | Respuesta |
|---|---|
| ¿Cómo se generan los códigos? | 8 caracteres al azar (generador criptográfico) con un alfabeto de 32 letras y números sin caracteres confusos. Hay unos 1,1 billones de combinaciones |
| ¿Caducan? | Solo si quien los crea pone fecha. **Por defecto, no caducan** |
| ¿Usos máximos? | Un solo uso. No se pueden configurar más usos |
| ¿Se pueden revocar? | **No hay forma de anular un código** desde la aplicación |
| ¿Se pueden probar códigos sin límite? | **Sí.** La comprobación del código está abierta a cualquiera y no tiene límite de intentos. Por el número de combinaciones es difícil acertar, pero no imposible con muchos intentos automáticos |
| ¿El mensaje de error revela algo? | **Sí, en dos sitios.** Al registrarse, el error "usa tu correo institucional" solo aparece si el código es válido, así que confirma que un código existe. Y en /acceso, el mensaje "No encontramos una cuenta con ese correo" confirma si un correo está registrado |
| ¿Se puede registrar un correo no institucional? | **No.** La base de datos lo rechaza al crear la cuenta (por defecto solo `usal.es`, configurable en la tabla `configuracion`). Correcto |
| ¿Dirección e investigador solo por invitación? | Sí. El investigador debe estar autorizado de antemano en la base de datos; la dirección necesita un código que crea el investigador. Correcto |
| ¿Enlace de acceso de un solo uso? | Sí (lo garantiza Supabase). La duración la fija el panel de Supabase: por defecto, 1 hora |
| ¿Cerrar sesión en todos los dispositivos? | Sí: la orden que usa la aplicación cierra todas las sesiones de esa cuenta |

## 6. Dependencias (npm audit)

- **Lo que se publica en la web: 0 vulnerabilidades.**
- Herramientas de desarrollo: 2 críticas y 1 alta, en `vitest`, `vite` (su servidor de desarrollo) y `tinypool`. Solo afectan a quien ejecuta los tests o el servidor de desarrollo en su ordenador, nunca a la web publicada. Se arreglan actualizando esas herramientas a su versión mayor siguiente.

## 7. Accesibilidad, Lighthouse y textos

**Lighthouse en móvil** (web publicada):

| Página | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|
| `/` | 96 | 95 | 96 | 91 |
| `/como-funciona` | 96 | 95 | 96 | 91 |
| `/acceso` | 99 | 95 | 96 | 91 |

Ya están por encima de 90. Lo que resta puntos:

- **Accesibilidad:** el "ÍA" verde del logotipo tiene un contraste de 2:1 sobre el fondo claro. Las normas WCAG eximen a los logotipos, pero Lighthouse lo cuenta igualmente.
- **SEO:** `robots.txt` y `sitemap.xml` no existen; la web devuelve en su lugar la página principal, y Lighthouse cuenta 16 errores.
- **Buenas prácticas:** errores en la consola porque la web intenta conectarse a una base de datos en `localhost` (consecuencia de C1).

**Textos:**

- **Rayas largas:** ninguna en las páginas públicas.
- **"[PENDIENTE]" visibles:** dos, en /como-funciona: la política de privacidad y el responsable del tratamiento.
- **Inglés:** solo "check-in", que se usa en toda la aplicación.
- **Afirmaciones sin respaldo hoy:** "los datos se guardan en la Unión Europea" (ver C2).
- **Ancho en móvil a 360 px:** sin desbordes.

**Otros:**

- No hay imagen Open Graph.
- Las páginas privadas no llevan `noindex`.
- No hay cookies de seguimiento, analítica ni fuentes de terceros: las fuentes van incluidas en la propia web. Supabase guarda la sesión en el almacenamiento local del navegador (no es una cookie), y es imprescindible para funcionar.

---

## 8. Hallazgos y arreglos

### Críticos

| # | Hallazgo | Arreglo |
|---|---|---|
| C1 | La web no tiene base de datos: 0 variables en Vercel, y el navegador intenta conectarse a `localhost:54321`. No se puede registrar ni entrar nadie | Crear el proyecto de Supabase en Fráncfort, instalar `supabase/instalacion-completa.sql` y poner las variables en Vercel (README, apartado 3). Necesita una acción tuya (ver "Qué necesito de ti") |
| C2 | La web afirma que los datos están en la UE sin una instalación que lo respalde | Tras C1, comprobar la región en el panel de Supabase, guardar la prueba en VERIFICACION.md y no publicar la frase hasta entonces |

### Altos

| # | Hallazgo | Arreglo |
|---|---|---|
| A1 | Las tres funciones del servidor fallan al arrancar (`ERR_MODULE_NOT_FOUND`): Vercel no encuentra los archivos de `servidor/` porque las importaciones no llevan la extensión `.js`. El cierre de semana, el sorteo, la agenda, los recordatorios y los borrados de cuentas **nunca se ejecutarían** | Corregir las importaciones y añadir un test que compile las funciones igual que Vercel, para que no vuelva a pasar |
| A2 | Solo existe la cabecera HSTS. Faltan Content-Security-Policy, X-Frame-Options/frame-ancestors, X-Content-Type-Options, Referrer-Policy y Permissions-Policy. Además, el HTML se sirve con `Access-Control-Allow-Origin: *` | Añadirlas en `vercel.json`. La CSP puede ser estricta (sin `unsafe-eval` ni `unsafe-inline`): la web no tiene código en línea y Vue aplica los estilos dinámicos sin necesitarlo |
| A3 | Las funciones aparecen ejecutándose en Estados Unidos (iad1), no en Fráncfort. Manejan correos electrónicos | Fijar Fráncfort en el proyecto de Vercel (Settings > Functions) y comprobarlo en los registros |
| A4 | Dos "[PENDIENTE]" visibles en /como-funciona | En páginas públicas, mostrar el texto digno: "En elaboración. Pendiente de revisión por el Comité de Ética de la Universidad de Salamanca." |
| A5 | Códigos sin caducidad por defecto, de 8 caracteres, no revocables, sin límite de intentos, y el error confirma si un código existe | Códigos de 12 caracteres, caducidad por defecto (propongo 30 días, configurable), número máximo de usos, revocación desde el panel de investigación, límite de intentos por IP y por correo, y un único mensaje de error |
| A6 | /acceso revela si un correo está registrado | Mismo mensaje siempre: "Si hay una cuenta con ese correo, te llegará un enlace." |
| A7 | No existen /privacidad, /aviso-legal, /cookies ni /consentimiento públicas | Crearlas con la estructura completa y el texto digno donde falte contenido |

### Medios

| # | Hallazgo | Arreglo |
|---|---|---|
| M1 | 3 tablas internas (`private.ajustes`, `private.borrados_pendientes`, `private.investigadores_autorizados`) no tienen RLS. Hoy son inaccesibles (ni están expuestas ni tienen permisos), pero pides RLS en todas | Activarla, y un test que falle si alguna tabla no la tiene |
| M2 | 7 funciones internas conservan el permiso de ejecución por defecto. No se pueden llamar desde la API, pero conviene cerrarlo | Retirar ese permiso, con un test |
| M3 | 3 vulnerabilidades graves en herramientas de desarrollo | Actualizar `vite` y `vitest` |
| M4 | Faltan `robots.txt`, `sitemap.xml`, `noindex` en las páginas privadas e imagen Open Graph | Crearlos |
| M5 | Las entradas del servidor se validan a mano y en la base de datos, pero sin un esquema (Zod) | Zod en todas las funciones de `api/` |
| M6 | Ni el registro ni el acceso tienen límite de intentos propio: solo cuentan los límites generales de Supabase. Tampoco hay formulario de contacto | Pasar el registro, el acceso y el contacto por funciones del servidor con límites por IP y por correo |
| M7 | Copias de seguridad sin documentar. Según el plan de Supabase, puede no haber copias restaurables | Comprobar el plan, activar o programar copias y documentar cómo restaurarlas |
| M8 | El enlace de acceso dura 1 hora (valor por defecto de Supabase) | Bajarlo a 15 minutos en el panel de Supabase y documentarlo |
| M9 | Cuatro proyectos de Vercel publican el mismo repositorio | Que decidas cuáles borrar. Propongo quedarnos solo con `sintonia360-ferca` |
| M10 | La demostración es hoy una instalación aparte. Pides /demo dentro de la web, separada y con reinicio diario | Un segundo proyecto de Supabase solo para la demostración, al que se conecta /demo, y una tarea diaria que lo reinicia |

### Bajos

| # | Hallazgo | Arreglo |
|---|---|---|
| B1 | Contraste del "ÍA" del logotipo (2:1) | Mantenerlo como excepción de logotipo, o usar en el logotipo el verde oscuro de los botones (#1d7060). Te lo enseño en la Fase 4 |
| B2 | "Check-in" es un anglicismo | Decidir si se mantiene (es corto y conocido) o se cambia por "Registro semanal" |
| B3 | 68 KB de código que la portada no usa | Se reducirá con la nueva portada |

---

## 9. Plan propuesto

**Fase 2. Blindaje** (sin cambios visibles en el diseño):

1. **A1:** corregir las funciones del servidor y añadir un test que las compile como Vercel.
2. **A2:** las seis cabeceras en `vercel.json`, con CSP estricta, y comprobación con securityheaders.com.
3. **A5, A6 y M6:** códigos nuevos (12 caracteres, caducidad, usos máximos y revocación); registro, acceso y contacto a través del servidor, con Zod, límites por IP y por correo y mensajes que no revelan nada.
4. **M1 y M2:** RLS en todas las tablas y permisos cerrados, con tests que fallen si alguien lo olvida. Un archivo de tests con tus cinco casos.
5. **A7 y A4:** /privacidad, /aviso-legal, /cookies y /consentimiento, con el texto digno donde falte contenido. Pie con "Prototipo del Trabajo Fin de Máster de Fernando Martín Vaquero · Universidad de Salamanca".
6. **M4, M3 y M5:** `robots.txt`, `sitemap.xml`, `noindex`, actualización de dependencias y Zod.
7. **Comprobar** que descargar mis datos, retirarme y borrar la cuenta funcionan de verdad. Esto solo se puede hacer con C1 resuelto.
8. **C1, C2, A3, M7 y M8:** instalación real en Supabase (Fráncfort), variables en Vercel y región de las funciones. Necesita lo que te pido abajo.

**Fase 3. Apartados públicos:** primero contenido y estructura (problema, cómo funciona, perfiles, Puente, privacidad, /investigacion, para quién es, Dirección, preguntas frecuentes, contacto y pie), con la composición provisional actual.

**Fase 4. Diseño.** Antes de programarlo:

- leo completas las skills de Emil Kowalski y de Taste y resumo en DISENO.md qué aplico de cada una;
- te presento **dos direcciones de diseño** con capturas de la portada en móvil y escritorio;
- tú eliges, y entonces desarrollo las ondas, la demostración del hero, la tabla interactiva, el modo oscuro y la imagen Open Graph.

Nota: Taste está pensada para webs comerciales con fotografías. Donde choque con el encargo (sin fotos de stock, identidad #0A4A6C, accesibilidad), manda el encargo, y lo anotaré.

**Fase 5. Demostración** en /demo, con un segundo proyecto de Supabase y reinicio diario.

Al final de cada fase: tests, revisión en el navegador (360 px y escritorio) y capturas.

## 10. Qué necesito de ti

1. **Supabase.** Para resolver C1 hay dos caminos:
   - **a) Lo hago yo:** creas una cuenta en supabase.com y me das un token de acceso mediante un formulario seguro (nunca en el chat). Con él creo los dos proyectos (real y demostración) en Fráncfort, instalo la base de datos, compruebo la región y pongo las variables en Vercel.
   - **b) Lo haces tú**, siguiendo el README (apartado 3), y me avisas.
2. **Proyectos de Vercel sobrantes (M9):** ¿borro `sintonia360`, `sintonia360-mecti-tcue` y `sintonia360-app`?
3. **"Check-in" (B2):** ¿se queda o lo cambiamos?
4. **Correo para avisos del formulario de contacto:** usaré ferca@usal.es, como indicas. Para enviar correos desde la web hace falta Resend (u otro servicio) con un dominio verificado, que ya está en PENDIENTES.md.

## 11. Cómo se ha comprobado

- **Web publicada:** cabeceras con `curl`; código del navegador descargado y analizado; accesibilidad con axe (WCAG 2.1 AA) a 360 px; Lighthouse 12 en modo móvil; registros de las funciones con la herramienta de Vercel.
- **Repositorio:** búsqueda de patrones de claves en las 19 versiones de todas las ramas; consulta de RLS, permisos y reglas en una instalación local con las 12 migraciones; `npm audit`.
- **securityheaders.com** rechaza las consultas automáticas desde aquí. La nota se comprobará al terminar la Fase 2, a mano o desde tu navegador.

---

## 12. Estado tras la Fase 2 (13 de noviembre de 2026)

| Hallazgo | Estado |
|---|---|
| C1. Sin base de datos | **Pendiente de ti** (crear el proyecto de Supabase) |
| C2. Afirmación de la UE | Frase cambiada a "está preparada para..."; se confirmará con C1 |
| A1. Funciones que no arrancan | Resuelto, con test |
| A2. Cabeceras de seguridad | Resuelto, con tests (falta la nota de securityheaders.com al publicar) |
| A3. Región de las funciones | Resuelto: el proyecto de Vercel usa Fráncfort (fra1) desde la próxima publicación |
| A4. "[PENDIENTE]" públicos | Resuelto, con test |
| A5. Códigos | Resuelto: 12 caracteres, caducidad, usos máximos y anulación |
| A6. Enumeración de cuentas | Resuelto |
| A7. Páginas legales | Resuelto: estructura completa; el contenido que falta, "En elaboración" |
| M1, M2. RLS y permisos | Resuelto, con tests |
| M3. Dependencias | Resuelto: 0 altas y 0 críticas |
| M4. robots, sitemap, noindex | Resuelto (la imagen Open Graph, en la Fase 4) |
| M5. Zod | Resuelto en las funciones nuevas (registro, acceso y contacto) |
| M6. Límite de intentos | Resuelto (el formulario de contacto visible llega en la Fase 3) |
| M7, M8. Copias y duración del enlace | Documentado en el README; lo ajustas en el panel de Supabase |
| M9. Proyectos de Vercel | Resuelto: borrados los tres sobrantes |
| M10. Demostración en /demo | Fase 5 |
| B1. Contraste del logotipo | Fase 4 |
| B2. "Check-in" | Se mantiene (DECISIONES.md) |
