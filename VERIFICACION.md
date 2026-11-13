# Verificación

Cómo se comprueba cada criterio de aceptación del encargo y qué resultado dio la última ejecución (13 de noviembre de 2026, rama `fase-2-blindaje`).

## Resumen de las comprobaciones automáticas

| Orden | Resultado |
|---|---|
| `npm test` (lógica, base de datos y R) | 340 tests superados, 0 fallidos |
| `npm run test:e2e` (navegador, móvil y escritorio) | 64 recorridos superados, 0 fallidos, con la aplicación compilada y sus cabeceras de seguridad (CSP incluida) |
| `npm run test:demo` (demostración, accesibilidad de todas las pantallas) | 26 comprobaciones superadas, 0 fallidas, en móvil a 360 px y en escritorio |
| `npm run rendimiento` | Check-in listo en 1,9 s en un móvil con conexión 3G y procesador lento |
| `npm run typecheck` y `npm run build` | Sin errores |

**Qué no se ha podido comprobar aquí:** el proyecto real de Supabase (en este entorno se usa PostgreSQL con un simulador de Supabase y las mismas reglas), el envío real de correos y la llamada real al modelo de lenguaje (probados con simuladores). Están en [PENDIENTES.md](PENDIENTES.md), en "Primera prueba en el proyecto real".

## Criterios de aceptación (apartado 12 del encargo)

| # | Criterio | Cómo se comprueba | Resultado |
|---|---|---|---|
| 1 | Un estudiante completa su check-in en menos de 60 segundos en el móvil | `tests/e2e/checkin.spec.ts`: 4 toques y 1 botón, en un móvil simulado, cronometrado | Cumple (4 toques + 1 envío). Falta cronometrarlo con personas reales |
| 2 | Un tutor con 8 estudiantes completa el suyo en menos de 60 segundos | `tests/e2e/checkin.spec.ts`: 8 toques y 1 botón | Cumple (8 toques + 1 envío). Falta cronometrarlo con personas reales |
| 3 | La respuesta de bienestar no es accesible para el tutor ni para la dirección (tests de RLS) | `tests/bd/permisos.test.ts` (y una prueba que desactiva la regla a propósito y comprueba que los tests fallan) | Cumple |
| 4 | La dirección nunca ve una cifra calculada sobre menos de 5 personas | `tests/bd/fase6.test.ts`: la base de datos suprime la cifra y no envía ni el número de personas; `tests/demo/demo.spec.ts` en pantalla | Cumple |
| 5 | El sorteo queda registrado antes de mostrar la agenda y su proporción global es cercana a 0,5 en la simulación | `servidor/cierre-semana.test.ts` y `tests/bd/cierre.test.ts` (orden y clave foránea agenda → sorteo); `tests/r/analisis.test.ts` (simulación) | Cumple: 25 de 57 sorteos con agenda (0,44) en la demostración; la simulación grande de R da una proporción cercana a 0,5 |
| 6 | La agenda funciona sin modelo de lenguaje | Modo `banco` por defecto; todos los recorridos y la demostración usan el banco | Cumple |
| 7 | Ningún dato personal se envía al modelo de lenguaje | `servidor/logica/agenda.test.ts` (lista cerrada de campos) y `servidor/logica/modelo.test.ts` (la petición) | Cumple |
| 8 | El CSV de investigación se carga en R con el script de ejemplo sin errores | `tests/r/analisis.test.ts`: genera la demostración, exporta y ejecuta `Rscript analisis/analisis_ejemplo.R` | Cumple |
| 9 | Toda la interfaz en español, sin rayas largas, con la identidad de WORKWELL360 | Comprobación de rayas en cada recorrido; búsqueda en todo el código; tokens de DISENO.md | Cumple |
| 10 | Todo lo no confirmado aparece como [PENDIENTE] y está en PENDIENTES.md | Búsqueda de todas las marcas en el código, contrastada con PENDIENTES.md | Cumple |

## Calidad (apartado 9 del encargo)

| Requisito | Dónde |
|---|---|
| Tests unitarios del desajuste, sorteo, supresión, validación del modelo y Puente | `servidor/logica/*.test.ts`, `tests/bd/fase6.test.ts` |
| Tests de RLS: tutor sin bienestar, dirección sin filas individuales, estudiante sin ver a otro | `tests/bd/permisos.test.ts` y siguientes |
| Tests de extremo a extremo de los tres check-ins y de la agenda | `tests/e2e/checkin.spec.ts`, `agenda.spec.ts`, `fase5.spec.ts` |
| Accesibilidad: teclado, contraste, etiquetas y tamaños táctiles | axe (WCAG 2.1 A y AA) en todas las pantallas de los cuatro perfiles, tamaño mínimo de 44 px, navegación con teclado y enlace "Saltar al contenido" (`tests/demo/demo.spec.ts`) |
| Rendimiento en móvil con conexión lenta | `npm run rendimiento`: 1,9 s hasta poder responder; 102 KB comprimidos de código principal |
| Sin secretos en el código, todo documentado en `.env.example` | Las únicas claves en el código son la del simulador local (solo sirve en el ordenador de desarrollo) y la contraseña pública de la demostración (solo existe en bases de datos marcadas como demostración) |

## Problemas que encontraron las comprobaciones (y se corrigieron)

- El interruptor de Puente al doctorado medía 32 px de alto (menos de 44 px).
- Algunas pantallas no tenían título principal cuando estaban "cerradas" (lectores de pantalla).
- Las tablas que se desplazan en el móvil no se podían recorrer con el teclado.
- La pantalla de másteres era más ancha que el móvil.
- Tras enviar un check-in, "Revisar mis respuestas" mostraba "Enviar" en lugar de "Guardar cambios".
- Un estudiante que pedía apoyo sin nombre no podía añadirlo después.
- La exportación era unas 50 veces más lenta de lo necesario por el modo de cifrado.

## Encargo de blindaje: Fase 2

| Criterio | Cómo se comprueba | Resultado |
|---|---|---|
| Las 6 cabeceras de seguridad | `tests/e2e/seguridad.spec.ts` (presencia y CSP sin `unsafe-inline` ni `unsafe-eval`; ningún recurso bloqueado en ninguna pantalla de ningún perfil) | Cumple en local. La nota de securityheaders.com se comprobará al publicar |
| RLS en todas las tablas y los 5 casos del encargo | `tests/bd/blindaje.test.ts` | Cumple |
| Códigos de 12 caracteres, caducidad, usos máximos y anulación | `tests/bd/alta.test.ts` | Cumple |
| Límite de intentos y mensajes que no revelan nada | `servidor/acceso-publico.test.ts`, `tests/bd/alta.test.ts` y `tests/e2e/acceso.spec.ts` | Cumple |
| Las funciones del servidor arrancan como en Vercel | `tests/funciones.test.ts` | Cumple |
| Ningún "[PENDIENTE]" en páginas públicas; páginas legales enlazadas | `tests/e2e/acceso.spec.ts` | Cumple |
| robots.txt, sitemap.xml y noindex en páginas privadas | `tests/e2e/seguridad.spec.ts` y `tests/e2e/acceso.spec.ts` | Cumple |
| npm audit sin vulnerabilidades altas ni críticas | `npm audit` | Cumple (0 altas, 0 críticas; 7 moderadas en herramientas de desarrollo) |
| Región de Supabase en la UE | Panel de Supabase | **Pendiente**: la web publicada no tiene todavía base de datos (AUDITORIA C1) |
