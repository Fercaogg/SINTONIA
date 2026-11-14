# sintonia-spot

Spot comercial de SINTONÍA: 60 s exactos, 1920×1080, 60 fps. Con banda sonora original a 120 BPM, sintetizada a medida (sin licencias de terceros). Composición HyperFrames (HTML + GSAP), una escena por archivo.

## Requisitos

- Node.js 22+
- FFmpeg

Comprobar: `npx hyperframes doctor`

## Música

`assets/music/sintonia-bgm.mp3` es una pista original de 60 s a 120 BPM (La menor → Do mayor), generada por `musica/componer.py` (Python + numpy, sin samples). Cada impacto, whoosh y subida está colocado sobre los cortes de la tabla de abajo. Para regenerarla:

```bash
python3 musica/componer.py
```

```bash
ffmpeg -y -i assets/music/sintonia-bgm.wav -af loudnorm=I=-16:TP=-1.5 -b:a 256k assets/music/sintonia-bgm.mp3
```

## Alternativa: pista del catálogo HeyGen

Desde esta carpeta (la que contiene `index.html`):

```bash
npx hyperframes auth login
```

```bash
node anadir-musica.mjs
```

```bash
npx hyperframes render --output sintonia-spot.mp4 --fps 60
```

- `auth login` abre el navegador para iniciar sesión en HeyGen (gratis; da acceso a más de 10.000 pistas).
- `anadir-musica.mjs` busca una pista, la copia a `assets/music/`, la coloca en `index.html` (60 s, fundido final de 2 s) y comprueba su tempo. Si avisa de que no va a 120 BPM o no te gusta, prueba otra con una descripción distinta: `node anadir-musica.mjs "cinematic tech, 120 BPM, piano and pulse"`. Cada ejecución sustituye la pista anterior.
- Antes de renderizar puedes revisarla con `npx hyperframes preview`; el Studio muestra la rejilla de golpes de la pista.

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
anadir-musica.mjs           sustituye la música por una del catálogo HeyGen (opcional)
musica/componer.py          compositor de la banda sonora original
assets/music/               sintonia-bgm.mp3
index.html                  raíz: fuentes, GSAP, helpers y las 8 escenas montadas
assets/js/gsap.min.js       GSAP 3.14.2 (local, sin CDN)
assets/js/sx.js             helpers compartidos: máscaras, count-up, trazos, cámara, ondas
assets/fonts/               Fira Sans 400 · 600 · 700 · 800 (woff2, latin)
compositions/bg.html        fondo vivo (0–60 s): ondas verde agua en dos capas con parallax
compositions/hook.html      1 · Gancho (0–4 s)
compositions/datos.html     2 · El dato que duele (4–18 s)
compositions/reveal.html    3 · Reveal (18–23 s)
compositions/funciona.html  4 · Cómo funciona (23–37 s)
compositions/confianza.html 5 · Confianza (37–47 s)
compositions/perfiles.html  6 · Para cada perfil (47–53 s)
compositions/cierre.html    7 · Cierre (53–60 s)
```

## Rejilla de música (120 BPM)

Un golpe cada 0,5 s (30 frames a 60 fps). Las pausas de lectura (15 s en total) son golpes enteros, así que cortes y entradas siguen cayendo en la rejilla. Están en `assets/js/sx.js` (`HOLDS`): cada escena se escribe en el tiempo del corte original de 45 s y `SX.M()` lo pasa al tiempo final.

| s    | golpe | evento |
|------|------:|--------|
| 0 | 1 | "Mismo trabajo." |
| 1 | 3 | corte vertical, "Dos miradas." |
| 2 | 5 | "¿Quién tiene razón?" |
| 3.5 | 8 | "Nadie." (las mitades chocan) |
| 4 | 9 | wipe diagonal → datos |
| 4.5 | 10 | barras crecen |
| 8 | 17 | whip pan → 32 % |
| 11.5 | 24 | match cut silueta → reloj |
| 14.5 | 30 | frase de consecuencia |
| 18 | 37 | dos ondas |
| 19 | 39 | las ondas se acompasan |
| 19.5 | 40 | flash + wordmark |
| 20 / 20.5 | 41 / 42 | píldora / lema |
| 23 | 47 | zoom a través → móvil |
| 23.75–24.5 | — | cuatro pulsaciones (medio golpe) |
| 26 | 53 | whip pan → tutor/a |
| 28.5 | 58 | 4 y 2 vuelan |
| 29.5 | 60 | sello DESAJUSTE |
| 32.5 | 66 | agenda; tarjetas en 33 · 33.5 · 34 |
| 37 | 75 | iris → confianza |
| 38 · 38.5 · 39 | — | filas con snap |
| 41 · 41.5 · 42 | 83 / 84 / 85 | Sin notas. · Sin rankings. · Sin vigilar. |
| 43 | 87 | "No deduce emociones." |
| 47 | 95 | whip vertical → perfiles |
| 49.5 | 100 | zoom a través de la tarjeta Estudiante |
| 50 · 50.5 · 51 | — | pasos 1 · 2 · 3 |
| 53 | 107 | "Para másteres, programas y escuelas de doctorado." |
| 55 | 111 | la onda cruza → "En sintonía." |
| 56.5 | 114 | wordmark + URL |
