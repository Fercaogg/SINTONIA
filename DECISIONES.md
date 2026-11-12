# Registro de decisiones

Decisiones menores tomadas durante el desarrollo, con su motivo. Las decisiones importantes se consultan antes con Fernando.

| Fecha | Fase | Decisión | Motivo | Estado |
|---|---|---|---|---|
| 2026-11-12 | 1 | La interfaz se construye con Vue 3 + Vite + Tailwind, como WORKWELL360, en lugar de Next.js. | El encargo pide reutilizar la pila de WORKWELL360 si es distinta. Así se pueden reutilizar sus componentes. | Aprobada |
| 2026-11-12 | 1 | El acceso y la base de datos se hacen con Supabase, no con el JWT propio y el `pg` directo de WORKWELL360. | El encargo exige permisos aplicados en la base de datos (RLS) y alojamiento en la UE. | Aprobada |
| 2026-11-12 | 1 | Los botones principales usan `#1d7060` en lugar de `#34C6A3`. | El blanco sobre `#34C6A3` tiene un contraste de 2,15:1 y no cumple WCAG 2.1 AA. `#1d7060` ya está en la paleta de WORKWELL360. | Aprobada |
| 2026-11-12 | 1 | El check-in de SINTONÍA muestra las 4 preguntas en una sola pantalla con un único botón de envío. | El encargo pide un solo botón. WORKWELL360 iba pregunta a pregunta. | Aprobada |
| 2026-11-12 | 1 | La escala usa números del 1 al 5 con palabras en los extremos, sin emojis. | Los emojis sugieren emociones en preguntas que son sobre el trabajo. | Aprobada |
| 2026-11-12 | 1 | Tamaño mínimo de texto: 12 px (WORKWELL360 usaba 9 a 11 px en algunos sitios). | Legibilidad y accesibilidad. | Aprobada |
| 2026-11-12 | 1 | Fira Sans se sirve desde el propio sitio, con el peso 600 añadido. | Privacidad (no llamar a Google en cada visita) y evitar la seminegrita simulada. | Aprobada |
| 2026-11-12 | 2 | La aplicación accede a los datos solo mediante funciones de la base de datos (no lee tablas directamente). | Cada función comprueba quién llama, y además las tablas tienen RLS: doble protección. También facilita probarlo todo en local. | Tomada |
| 2026-11-12 | 2 | Un único sistema de códigos de acceso para tutores, dirección y estudiantes. El código de estudiante es el "código de pareja" y ya va asociado a su tutor. | Es lo más sencillo y evita que nadie tenga que buscar nombres para emparejar. | Tomada |
| 2026-11-12 | 2 | El investigador no ve nombres en ningún momento. Reconoce a los tutores por una etiqueta que él mismo pone al código (por ejemplo, "Tutor 3"). | El encargo pide que el investigador no vea nombres junto a respuestas; así no los ve en absoluto. | Tomada |
| 2026-11-12 | 2 | El tutor ve los códigos de pareja que le quedan libres, para poder dárselos a sus estudiantes. | El encargo dice que el código lo da el tutor o la coordinación. | Tomada |
| 2026-11-12 | 2 | El tutor NO ve las respuestas del estudiante (ni avance ni apoyo), solo la agenda. El estudiante tampoco ve las del tutor. | Minimización: ninguno necesita la puntuación del otro para usar la agenda, y así nadie "tiene razón". | Tomada |
| 2026-11-12 | 2 | El consentimiento informado lo aceptan estudiantes y tutores. La dirección y el investigador no participan como sujetos del estudio. | Solo estudiantes y tutores aportan datos de investigación. | Tomada |
| 2026-11-12 | 2 | El investigador se autoriza añadiendo su correo a una lista desde el panel de Supabase, sin código. | Hace falta una primera persona que cree los másteres y los códigos. | Tomada |
| 2026-11-12 | 2 | Acceso por enlace al correo, sin contraseñas. El enlace se puede abrir en un dispositivo distinto del que lo pidió. | Más sencillo para estudiantes, que suelen leer el correo en el móvil. | Tomada |
| 2026-11-12 | 2 | Si alguien pide un enlace con un correo no registrado, se le dice que no hay cuenta y se le invita a registrarse. | Claridad para el usuario. Contrapartida menor: permite saber si un correo está registrado. | Tomada |
| 2026-11-12 | 2 | La clave de cifrado del bienestar se genera automáticamente dentro de la base de datos y se guarda en Supabase Vault. | No hay ningún secreto en el código ni en las variables de entorno. Su límite está explicado en ARQUITECTURA.md. | Tomada |
| 2026-11-12 | 2 | Los campos de texto usan 16 px (WORKWELL360 usaba 14 px). | En los iPhone, un campo de menos de 16 px obliga a hacer zoom al escribir. | Tomada |
| 2026-11-12 | 2 | En local, Supabase se sustituye por PostgreSQL más un pequeño servidor que imita su API (scripts/local). | Este entorno no puede descargar Supabase completo. Las migraciones son las mismas que se aplicarán en Supabase. | Tomada |
| 2026-11-12 | 2 | Por defecto se admite el dominio de correo usal.es (configurable). | Es el dominio institucional de la USAL. Queda en PENDIENTES.md por si hay otros (por ejemplo, el de estudiantes). | Tomada |
