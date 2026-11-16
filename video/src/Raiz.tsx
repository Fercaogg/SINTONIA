import React from 'react'
import { Composition, useCurrentFrame } from 'remotion'
import '@fontsource/fira-sans/300.css'
import '@fontsource/fira-sans/400.css'
import '@fontsource/fira-sans/500.css'
import '@fontsource/fira-sans/600.css'
import '@fontsource/fira-sans/700.css'
import { FOTOGRAMAS } from './storyboard'

// Storyboard: cada fotograma de esta composición es una imagen fija de una escena.
const Storyboard: React.FC = () => {
  const f = useCurrentFrame()
  const F = FOTOGRAMAS[Math.min(f, FOTOGRAMAS.length - 1)].componente
  return <F />
}

export const Raiz: React.FC = () => (
  <Composition id="Storyboard" component={Storyboard} width={1920} height={1080} fps={30} durationInFrames={FOTOGRAMAS.length} />
)
