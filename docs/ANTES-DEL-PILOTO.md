# Antes del piloto: lista de comprobación

Lista para repasar antes de abrir SINTONÍA a estudiantes y tutores reales. Cada punto dice quién lo hace. Los datos que faltan están también en PENDIENTES.md.

## 1. Lo que tiene que estar aprobado

- [ ] Resolución favorable del Comité de Ética de la USAL. **Fernando.**
- [ ] Textos del Comité en la web: consentimiento, riesgos y beneficios, base jurídica y conservación de los datos (`src/contenido/participantes.ts`). Después, `npm run pdf` para regenerar el kit. **Fernando, con Claude.**
- [ ] Pregunta de investigación, hipótesis y calendario completo en `src/contenido/investigacion.ts`. **Fernando.**
- [ ] Preregistro en OSF y su enlace en el mismo archivo. **Fernando.**

## 2. Servicios

- [ ] Cuenta de un servicio de correo (Resend u otro) con un dominio verificado. Sin él, los enlaces de acceso, los recordatorios y los formularios no envían correos. **Fernando.**
- [ ] Remitente de los correos (`CORREO_REMITENTE` en Vercel). **Fernando.**
- [ ] En Supabase: dirección de la web en "Site URL" y "Redirect URLs", y el enlace de acceso de 15 minutos. **Fernando.**
- [ ] Copias de seguridad de la base de datos según el plan de Supabase, y anotarlas en /seguridad. **Fernando, con Claude.**
- [ ] Dominio propio, si se quiere. Los pasos están en docs/DOMINIO.md. **Fernando compra; Claude cambia.**

## 3. Pasar de demostración a real

- [ ] Vaciar los datos ficticios y poner `VITE_MODO_DEMO` y `MODO_DEMO` a `false`. **Claude, cuando Fernando lo diga.**
- [ ] Admitir solo correos de `usal.es` (o los dominios que se decidan). **Fernando decide; Claude lo configura.**
- [ ] Mantener la demostración pública en un proyecto aparte, si se quiere seguir enseñando. **Fernando, con Claude.**

## 4. Pruebas con personas

- [ ] Una semana completa con una cuenta real: registro con el enlace del correo, check-in del estudiante y del tutor/a, las tres preguntas cuando no coinciden y el cierre automático de la semana. **Fernando, con Claude.**
- [ ] Borrar esa cuenta de prueba desde "Mi cuenta" y comprobar que no queda nada. **Fernando.**
- [ ] Revisión con lector de pantalla: VoiceOver (iPhone o Mac) o NVDA (Windows), y TalkBack (Android). Al terminar, actualizar /accesibilidad. **Fernando (o el servicio de accesibilidad de la USAL), con Claude.**
- [ ] Que dos o tres estudiantes y un tutor/a lean los textos de la web y digan qué no se entiende. **Fernando.**
- [ ] Revisión del inglés de /en por una persona con inglés nativo o académico. **Fernando.**

## 5. Lo último, el día antes

- [ ] Abrir /estado: los tres puntos deben salir en verde.
- [ ] Compartir un enlace por WhatsApp, LinkedIn y el correo de la USAL y ver que sale la imagen correcta.
- [ ] Revisar que el mensaje de bienestar bajo enlaza al Servicio de Atención Psicológica de la USAL y recuerda el 112.
- [ ] Tener a mano el correo de contacto (ferca@usal.es) para las dudas de los participantes.

## Lo que ya está comprobado (no hace falta repetirlo)

Seguridad de la base de datos (reglas en todas las tablas), cabeceras de seguridad, datos en la Unión Europea, accesibilidad automática en claro y en oscuro, navegación con teclado en todas las pantallas, nota de Lighthouse en móvil, enlaces internos y casos extremos (nombres muy largos). El detalle está en VERIFICACION.md.
