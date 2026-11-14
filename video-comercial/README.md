# sintonia-spot

Spot comercial de SINTONÍA: 45 s exactos, 1920×1080, 60 fps, sin audio. Composición HyperFrames (HTML + GSAP), una escena por archivo.

## Requisitos

- Node.js 22+
- FFmpeg

Comprobar: `npx hyperframes doctor`

## Renderizar

Desde esta carpeta (la que contiene `index.html`):

```bash
npx hyperframes render --output sintonia-spot.mp4 --fps 60
```

## Previsualizar

```bash
npx hyperframes preview
```

## Estructura

```
index.html                  raíz: fuentes, GSAP, helpers y las 8 escenas montadas
assets/js/gsap.min.js       GSAP 3.14.2 (local, sin CDN)
assets/js/sx.js             helpers compartidos: máscaras, count-up, trazos, cámara, ondas
assets/fonts/               Fira Sans 400 · 600 · 700 · 800 (woff2, latin)
compositions/bg.html        fondo vivo (0–45 s): ondas verde agua en dos capas con parallax
compositions/hook.html      1 · Gancho (0–4 s)
compositions/datos.html     2 · El dato que duele (4–13 s)
compositions/reveal.html    3 · Reveal (13–17 s)
compositions/funciona.html  4 · Cómo funciona (17–28 s)
compositions/confianza.html 5 · Confianza (28–35 s)
compositions/perfiles.html  6 · Para cada perfil (35–40 s)
compositions/cierre.html    7 · Cierre (40–45 s)
```

## Rejilla de música (120 BPM)

Un golpe cada 0,5 s (30 frames a 60 fps). Cortes y entradas caen en la rejilla:

| s    | golpe | evento |
|------|------:|--------|
| 0.0  | 1  | "Mismo trabajo." |
| 1.0  | 3  | corte vertical, "Dos miradas." |
| 2.0  | 5  | "¿Quién tiene razón?" |
| 3.5  | 8  | "Nadie." (las mitades chocan) |
| 4.0  | 9  | wipe diagonal → datos |
| 4.5  | 10 | barras crecen |
| 7.0  | 15 | whip pan → 32 % |
| 9.5  | 20 | match cut silueta → reloj |
| 11.5 | 24 | frase de consecuencia |
| 13.0 | 27 | dos ondas |
| 14.0 | 29 | las ondas se acompasan |
| 14.5 | 30 | flash + wordmark |
| 15.0 / 15.5 | 31 / 32 | píldora / lema |
| 17.0 | 35 | zoom a través → móvil |
| 17.75–18.5 | — | cuatro pulsaciones (medio golpe) |
| 20.0 | 41 | whip pan → tutor/a |
| 22.0 | 45 | 4 y 2 vuelan |
| 23.0 | 47 | sello DESAJUSTE |
| 25.0 | 51 | agenda; tarjetas en 25.5 · 26.0 · 26.5 |
| 28.0 | 57 | iris → confianza |
| 29.0 · 29.5 · 30.0 | — | filas con snap |
| 31.0 · 31.5 · 32.0 | 63–65 | Sin notas. · Sin rankings. · Sin vigilar. |
| 33.0 | 67 | "No deduce emociones." |
| 35.0 | 71 | whip vertical → perfiles |
| 37.0 | 75 | zoom a través de la tarjeta Estudiante |
| 37.5 · 38.0 · 38.5 | — | pasos 1 · 2 · 3 |
| 40.0 | 81 | "Para másteres, programas y escuelas de doctorado." |
| 42.0 | 85 | la onda cruza → "En sintonía." |
| 43.5 | 88 | wordmark + URL |
