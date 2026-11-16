# Vídeo explicativo de SINTONÍA

El vídeo está hecho con **Remotion**: cada escena es un archivo de texto (código) y no un montaje hecho a mano. Así, cambiar una frase o una duración es cambiar una línea y volver a exportar.

## Estado

- [x] Fase 1: storyboard en imágenes fijas (`STORYBOARD.pdf`).
- [x] Fase 2: animación escena a escena (sin voz ni música todavía).
- [ ] Fase 3: vídeo completo (horizontal y vertical), locución, música y subtítulos.

## Dónde está cada cosa

| Qué quieres cambiar | Archivo |
| --- | --- |
| Frases en pantalla, locución y tiempos de cada escena | `src/guion.ts` |
| Colores y tipografía | `src/marca.ts` |
| Las pantallas del móvil (preguntas, nombres de estudiantes) | `src/componentes/Movil.tsx` |
| El dibujo y el movimiento de cada escena (los segundos en que aparece cada cosa) | `src/escenas/` |
| Los subtítulos (se calculan solos a partir de la locución) | `src/subtitulos.ts` |
| El logo | `../public/brand/` |

## Cómo se usa

La primera vez, dentro de la carpeta `video`:

```bash
npm install
```

Para ver las escenas en el navegador mientras cambias textos:

```bash
npm run ver
```

Para volver a generar el storyboard en PDF:

```bash
npm run storyboard
```

Para exportar el vídeo completo a `out/sintonia.mp4` (tarda unos minutos):

```bash
npm run exportar
```

Para exportar solo una escena, por ejemplo la 4, a `out/escena-04.mp4`:

```bash
npm run exportar 4
```

## Cómo cambiar un tiempo

En cada escena, los números como `en={3.4}` son el segundo (contado desde que empieza esa escena) en que aparece ese elemento. La duración de cada escena está en `src/guion.ts` (`inicio` y `fin`).
