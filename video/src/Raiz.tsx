import React from 'react'
import { Composition } from 'remotion'
import '@fontsource/fira-sans/300.css'
import '@fontsource/fira-sans/400.css'
import '@fontsource/fira-sans/500.css'
import '@fontsource/fira-sans/600.css'
import '@fontsource/fira-sans/700.css'
import { Video } from './Video'
import { GUION, FPS, DURACION_TOTAL } from './guion'

const total = Math.round(DURACION_TOTAL * FPS)
// Para incrustar los subtítulos en la imagen, cambia false por true.
const SUBTITULOS = false

export const Raiz: React.FC = () => (
  <>
    <Composition id="Video" component={Video} width={1920} height={1080} fps={FPS} durationInFrames={total} defaultProps={{ subtitulos: SUBTITULOS }} />
    <Composition id="Vertical" component={Video} width={1080} height={1920} fps={FPS} durationInFrames={total} defaultProps={{ subtitulos: SUBTITULOS, vertical: true }} />
    {GUION.map((e) => (
      <Composition key={e.n} id={`Escena${String(e.n).padStart(2, '0')}`} component={Video} width={1920} height={1080} fps={FPS} durationInFrames={Math.round(e.dur * FPS)} defaultProps={{ escena: e.n, subtitulos: SUBTITULOS }} />
    ))}
  </>
)
