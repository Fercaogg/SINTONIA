# sintonia-spot

Spot comercial de SINTONÍA: 60 s exactos, 1920×1080, 60 fps. Con banda sonora original a 120 BPM, sintetizada a medida (sin licencias de terceros). Composición HyperFrames (HTML + GSAP), una escena por archivo.

## Requisitos

- Node.js 22+
- FFmpeg

Comprobar: `npx hyperframes doctor`

## Música

`assets/music/sintonia-bgm.mp3` es una pista original estilo rage / UK underground: 140 BPM en half-time, Fa menor, −14,5 LUFS. La genera `musica/componer.py` (Python + numpy, sin samples ni melodías de terceros):

- Lead: supersaw de 7 voces desafinadas, abierta en estéreo, bucle de 2 compases con notas repetidas y reverb larga y oscura.
- Capa frágil: campana FM una octava arriba, doblando el 2.º compás del bucle.
- 808 largo con glide y saturación fuerte (lo que más pesa); bombo con el 808, clap seca en el 3, hi-hats en corcheas con redobles de tresillos y fusas.
- Cada aparición del vídeo: golpe de 808 + campana corta o click metálico.
- Antes de cada sección, corte total de medio compás con solo la cola de reverb; intro de 2 compases con el lead filtrado que se abre.

Para regenerarla:

```bash
python3 musica/componer.py
```

```bash
ffmpeg -y -i assets/music/sintonia-bgm.wav -af loudnorm=I=-15:TP=-1.2:LRA=7 -ar 48000 -b:a 256k assets/music/sintonia-bgm.mp3
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

## Rejilla de música (140 BPM, half-time)

Un tiempo cada 0,4286 s (60 s = 140 tiempos). Las escenas se escriben en el tiempo del corte original de 45 s; `SX.QM()` (en `assets/js/sx.js`, con réplica en `musica/tiempos.py`) añade las pausas de lectura y lleva cada aparición al tiempo de 140 BPM más cercano, conservando su anticipación (una salida 0,25 s antes de un corte sigue 0,25 s antes).

Entradas de sección (golpe con todo, tras medio compás de corte): 3,857 · 18,000 · 23,143 · 36,857 · 47,143 · 53,143 s.
