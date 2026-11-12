# Registro de decisiones

Decisiones menores tomadas durante el desarrollo, con su motivo. Las decisiones importantes se consultan antes con Fernando.

| Fecha | Fase | Decisión | Motivo | Estado |
|---|---|---|---|---|
| 2026-11-12 | 1 | La interfaz se construye con Vue 3 + Vite + Tailwind, como WORKWELL360, en lugar de Next.js. | El encargo pide reutilizar la pila de WORKWELL360 si es distinta. Así se pueden reutilizar sus componentes. | Pendiente de aprobación |
| 2026-11-12 | 1 | El acceso y la base de datos se hacen con Supabase, no con el JWT propio y el `pg` directo de WORKWELL360. | El encargo exige permisos aplicados en la base de datos (RLS) y alojamiento en la UE. | Pendiente de aprobación |
| 2026-11-12 | 1 | Los botones principales usan `#1d7060` en lugar de `#34C6A3`. | El blanco sobre `#34C6A3` tiene un contraste de 2,15:1 y no cumple WCAG 2.1 AA. `#1d7060` ya está en la paleta de WORKWELL360. | Pendiente de aprobación |
| 2026-11-12 | 1 | El check-in de SINTONÍA muestra las 4 preguntas en una sola pantalla con un único botón de envío. | El encargo pide un solo botón. WORKWELL360 iba pregunta a pregunta. | Pendiente de aprobación |
| 2026-11-12 | 1 | La escala usa números del 1 al 5 con palabras en los extremos, sin emojis. | Los emojis sugieren emociones en preguntas que son sobre el trabajo. | Pendiente de aprobación |
| 2026-11-12 | 1 | Tamaño mínimo de texto: 12 px (WORKWELL360 usaba 9 a 11 px en algunos sitios). | Legibilidad y accesibilidad. | Pendiente de aprobación |
| 2026-11-12 | 1 | Fira Sans se sirve desde el propio sitio, con el peso 600 añadido. | Privacidad (no llamar a Google en cada visita) y evitar la seminegrita simulada. | Pendiente de aprobación |
