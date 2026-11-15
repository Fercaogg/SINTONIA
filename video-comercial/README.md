# sintonia-spot

Spot comercial de SINTONÍA: 60 s exactos, 1920×1080, 60 fps. Con música «Inspired» (Kevin MacLeod, CC BY 4.0) y locución castellana. Composición HyperFrames (HTML + GSAP), una escena por archivo.

## Requisitos

- Node.js 22+
- FFmpeg

Comprobar: `npx hyperframes doctor`

## Música

«Inspired», de Kevin MacLeod (incompetech.com), licencia **CC BY 4.0**: gratuita, uso comercial permitido con atribución. El crédito ya aparece al final del vídeo; si publicas el vídeo, añádelo también a la descripción:

> Música: «Inspired», Kevin MacLeod (incompetech.com). Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/

La pista va a 120 BPM exactos, la misma rejilla del montaje, así que cada aparición cae en un golpe. `assets/music/sintonia-bgm.mp3` son sus primeros 60 s (original en `musica/fuentes/`), con fundido final y nivelada a −15 LUFS:

```bash
ffmpeg -y -i musica/fuentes/Inspired-KevinMacLeod.mp3 -t 60 -af "afade=t=out:st=57.5:d=2.5,loudnorm=I=-15:TP=-1.5:LRA=9" -ar 48000 -b:a 256k assets/music/sintonia-bgm.mp3
```

(`musica/componer.py` conserva la versión rage sintetizada como alternativa; si la usas, cambia `BPM = 140` en `assets/js/sx.js` y `musica/tiempos.py`.)

## Voz

Voz castellana neutra de Microsoft Edge (`es-ES-AlvaroNeural`), gratuita y sin cuenta, generada con `edge-tts`: una frase por plano en `assets/voice/`, normalizadas a −16 LUFS. La música baja a 0,32 mientras habla la voz (automatización de volumen en `#music`). Para cambiar el texto o la voz (`es-ES-ElviraNeural`, `es-ES-XimenaNeural`), edita `LINES` / `VOICE` en `musica/voz.py` y ejecuta:

```bash
pip install edge-tts
```

```bash
python3 musica/voz.py
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
musica/voz.py               genera y coloca la locución
musica/tiempos.py           réplica de la rejilla de tiempos (SX.QM)
assets/voice/               locución, una frase por plano
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

Un golpe cada 0,5 s (60 s = 120 golpes). Las escenas se escriben en el tiempo del corte original de 45 s; `SX.QM()` (en `assets/js/sx.js`, con réplica en `musica/tiempos.py`) añade las pausas de lectura y lleva cada aparición al tiempo de 140 BPM más cercano, conservando su anticipación (una salida 0,25 s antes de un corte sigue 0,25 s antes).

