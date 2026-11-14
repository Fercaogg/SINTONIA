# sintonia-video

Vídeo de presentación de SINTONÍA (40 s, 1920×1080, 30 fps, sin audio). Composición HyperFrames: HTML + GSAP, renderizada a MP4 con el CLI `hyperframes`.

## Requisitos

- **Node.js 22+** — https://nodejs.org/
- **FFmpeg** — `brew install ffmpeg` (macOS) · `sudo apt install ffmpeg` (Debian/Ubuntu) · https://ffmpeg.org/download.html (Windows)

Comprobar: `npx hyperframes doctor`

## Previsualizar

```bash
npx hyperframes preview
```

Abre HyperFrames Studio en `http://localhost:3002`.

## Refinar con Claude Code

```bash
npx skills add heygen-com/hyperframes
npx hyperframes lint
npx hyperframes preview
```

## Renderizar

Desde esta carpeta (la que contiene `index.html`):

```bash
npx hyperframes render -o sintonia.mp4 --fps 30
```
