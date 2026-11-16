# Vídeo explicativo de SINTONÍA

El vídeo está hecho con **Remotion**: cada escena es un archivo de texto (código) y no un montaje hecho a mano. Así, cambiar una frase o una duración es cambiar una línea y volver a exportar.

## Qué hay aquí

| Archivo | Qué es |
| --- | --- |
| `STORYBOARD.pdf` | El storyboard aprobado (primera fase). |
| `LOCUCION.md` | El texto de la voz, frase a frase, con sus tiempos. |
| `SUBTITULOS.srt` | Los subtítulos en archivo aparte. |
| `entrega/` | Los vídeos terminados (horizontal y vertical) y los subtítulos. |
| `out/sintonia.mp4` | El vídeo horizontal recién exportado. Se crea al exportar. |
| `out/sintonia-vertical.mp4` | El vídeo vertical recién exportado. Se crea al exportar. |

## Dónde se cambia cada cosa

| Qué quieres cambiar | Archivo |
| --- | --- |
| Frases en pantalla, locución y duración de cada escena | `src/guion.ts` |
| Colores y tipografía | `src/marca.ts` |
| Las pantallas del móvil (preguntas, nombres de estudiantes) | `src/componentes/Movil.tsx` |
| El dibujo y el movimiento de cada escena | `src/escenas/` |
| Cómo se recoloca cada escena en vertical | `src/Video.tsx` (lista `VENTANAS`) |
| El volumen de la música y de la voz | `src/Video.tsx` (`MUSICA_SOLA`, `MUSICA_BAJO_VOZ` y `VOLUMEN_VOZ`) |
| El logo | `../public/brand/` |

## Cómo se usa

La primera vez, dentro de la carpeta `video`:

```bash
npm install
```

Para ver el vídeo en el navegador mientras cambias cosas:

```bash
npm run ver
```

Para exportar el vídeo horizontal (tarda unos minutos):

```bash
npm run exportar
```

Para exportar el vídeo vertical:

```bash
npm run exportar vertical
```

## Si cambias la locución

1. Cambia la frase en `src/guion.ts` (campo `locucion`).
2. Vuelve a generar la voz. Necesita edge-tts, que se instala una vez con `pip install edge-tts`, y conexión a internet:

```bash
npm run voz
```

3. Lee lo que escribe: te dice en qué segundo acaba la voz en cada escena. Si no cabe, sube `dur` en esa escena; si una frase pisa a la anterior, retrasa su segundo en `voz`.
4. Actualiza subtítulos y LOCUCION.md, y exporta:

```bash
npm run textos
```

## Cómo cambiar un tiempo

- `dur` en `src/guion.ts` es lo que dura cada escena, en segundos.
- `voz` es en qué segundo de la escena empieza cada frase de la locución.
- En `src/escenas/`, los números como `en={3.4}` son el segundo (contado desde que empieza esa escena) en que aparece ese elemento.

## Voz, música y subtítulos

- **Voz:** Álvaro (`es-ES-AlvaroNeural`), masculina, castellano de España. Se genera con edge-tts, un programa gratuito de Python que usa las voces de "Leer en voz alta" de Microsoft Edge. No necesita cuenta ni clave. Para probar otra voz: `VOZ=es-ES-ElviraNeural npm run voz`.
- **Subtítulos:** el vídeo no los lleva incrustados; van aparte en `SUBTITULOS.srt`. Para incrustarlos, cambia `SUBTITULOS = false` por `true` en `src/Raiz.tsx` y exporta.
- **Música:** creada por ordenador para este vídeo con `scripts/musica.py` (`npm run musica`). No usa grabaciones ni muestras de nadie.
- **Tipografía:** Fira Sans, de uso libre (licencia SIL Open Font).

Si prefieres grabar tú la voz, sustituye los archivos de `public/voz/` por los tuyos con el mismo nombre y ajusta los tiempos en `src/voz.json`.
