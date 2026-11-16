import React from 'react'
import { Composition } from 'remotion'
import '@fontsource/fira-sans/300.css'
import '@fontsource/fira-sans/400.css'
import '@fontsource/fira-sans/500.css'
import '@fontsource/fira-sans/600.css'
import '@fontsource/fira-sans/700.css'
import { Video } from './Video'
import { GUION, FPS, DURACION_TOTAL } from './guion'

export const Raiz: React.FC = () => (
  <>
    <Composition id="Video" component={Video} width={1920} height={1080} fps={FPS} durationInFrames={DURACION_TOTAL * FPS} defaultProps={{ subtitulos: true }} />
    {GUION.map((e) => (
      <Composition key={e.n} id={`Escena${String(e.n).padStart(2, '0')}`} component={Video} width={1920} height={1080} fps={FPS} durationInFrames={(e.fin - e.inicio) * FPS} defaultProps={{ escena: e.n, subtitulos: true }} />
    ))}
  </>
)
