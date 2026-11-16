# Vídeo explicativo de SINTONÍA

El vídeo está hecho con **Remotion**: cada escena es un archivo de texto (código) y no un montaje hecho a mano. Así, cambiar una frase o una duración es cambiar una línea y volver a exportar.

## Estado

- [x] Fase 1: storyboard en imágenes fijas (`STORYBOARD.pdf`).
- [ ] Fase 2: animación escena a escena.
- [ ] Fase 3: vídeo completo (horizontal y vertical), locución, música y subtítulos.

## Dónde está cada cosa

| Qué quieres cambiar | Archivo |
| --- | --- |
| Frases en pantalla, locución y tiempos de cada escena | `src/guion.ts` |
| Colores y tipografía | `src/marca.ts` |
| Las pantallas del móvil (preguntas, nombres de estudiantes) | `src/componentes/Movil.tsx` |
| El dibujo de cada escena | `src/escenas/` |
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
