#!/usr/bin/env bash
# Convierte los clips grabados por tests/demo/clips.ts (.local/clips) al
# formato de la portada, en public/clips: WebM (VP9), MP4 (H.264) de respaldo
# y una imagen fija WebP para quien prefiere menos movimiento.
# Se recorta el primer segundo (carga de la página). Requiere ffmpeg.
set -euo pipefail
cd "$(dirname "$0")/.."
for r in estudiante tutor direccion; do
  origen=".local/clips/$r.webm"
  ffmpeg -v error -y -ss 1 -i "$origen" -an -vf "scale=360:720,fps=24" -c:v libvpx-vp9 -b:v 0 -crf 42 -row-mt 1 "public/clips/$r.webm"
  ffmpeg -v error -y -ss 1 -i "$origen" -an -vf "scale=360:720,fps=24" -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p -movflags +faststart "public/clips/$r.mp4"
  ffmpeg -v error -y -ss 2.5 -i "$origen" -frames:v 1 -c:v libwebp -quality 80 "public/clips/$r.webp"
  echo "public/clips/$r: $(du -k public/clips/$r.webm | cut -f1) KB (WebM), $(du -k public/clips/$r.mp4 | cut -f1) KB (MP4)"
done
