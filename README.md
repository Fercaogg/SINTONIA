# SINTONÍA

Prototipo del Trabajo Fin de Máster de Fernando Martín Vaquero (Máster en Estudios de la Ciencia, la Tecnología y la Innovación, Universidad de Salamanca, curso 2026/27).

SINTONÍA es un registro semanal muy breve de estudiante y tutor/a. El sistema detecta dónde no coinciden las dos miradas sobre el avance del trabajo y propone tres preguntas neutras para la siguiente tutoría. Su principio rector es **acompañar sin vigilar**.

> Este README se completará en la Fase 7 con la guía paso a paso para desplegar en Vercel y Supabase, con capturas. De momento explica cómo probarlo en un ordenador.

## Documentos del proyecto

| Documento | Contenido |
|---|---|
| [PLAN.md](PLAN.md) | Tecnología elegida y fases de trabajo |
| [DISENO.md](DISENO.md) | Sistema visual heredado de WORKWELL360 |
| [ARQUITECTURA.md](ARQUITECTURA.md) | Quién ve qué dato y cómo se protege |
| [DECISIONES.md](DECISIONES.md) | Registro de decisiones |
| [PENDIENTES.md](PENDIENTES.md) | Datos que faltan y no se pueden inventar |
| [docs/capturas](docs/capturas) | Capturas de las pantallas en móvil y escritorio |

## Probarlo en local

Necesitas Node.js 20 o posterior y PostgreSQL 16 en marcha en tu ordenador (usuario `postgres`, contraseña `postgres`).

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea la base de datos local con unas cuentas de prueba:

   ```bash
   npm run local:db
   ```

3. Arranca el servidor que imita a Supabase (déjalo abierto en una terminal):

   ```bash
   npm run local:servidor
   ```

4. En otra terminal, arranca la aplicación y abre http://localhost:5173:

   ```bash
   npm run dev
   ```

Cuentas de prueba (contraseña `sintonia-local`, botón "Entrar con contraseña"): `investigador@usal.es`, `tutora@usal.es`, `tutor8@usal.es` (con 8 estudiantes), `direccion@usal.es` y `ana@usal.es`. La base de datos local incluye una convocatoria **ficticia** para poder ver la línea de Puente al doctorado.

En local no se envían correos: el enlace de acceso aparece en la terminal del paso 3.

Para ejecutar a mano las tareas diarias del servidor (cierre de semanas, recordatorios y avisos), con el servidor local en marcha:

```bash
npm run local:tareas
```

Los correos se muestran en la terminal.

## Tests

```bash
npm test
```

```bash
npm run test:e2e
```

El primero comprueba los permisos en la base de datos. El segundo recorre la aplicación en un navegador, en móvil y en escritorio.
