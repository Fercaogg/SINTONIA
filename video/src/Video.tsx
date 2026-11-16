import React from 'react'
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import { GUION } from './guion'
import { pistas } from './subtitulos'
import { Subtitulo } from './componentes/Base'
import { FUENTE } from './marca'
import { E01, E02, E03 } from './escenas/E01a03'
import { E04, E05 } from './escenas/E04a05'
import { E06, E07, E08, E09, E10 } from './escenas/E06a10'

const ESCENAS = [E01, E02, E03, E04, E05, E06, E07, E08, E09, E10]
const FUNDIDO = 14 // fotogramas que dura el paso de una escena a la siguiente

// Cada escena entra fundiéndose sobre la anterior: no hay cortes bruscos.
const Paso: React.FC<{ children: React.ReactNode; primera: boolean }> = ({ children, primera }) => {
  const f = useCurrentFrame()
  const p = primera ? 1 : interpolate(f, [0, FUNDIDO], [0, 1], { extrapolateRight: 'clamp' })
  return <AbsoluteFill style={{ opacity: p }}>{children}</AbsoluteFill>
}

const PISTAS = pistas()
const Subtitulos: React.FC = () => {
  const { fps } = useVideoConfig()
  const t = useCurrentFrame() / fps
  const p = PISTAS.find((x) => t >= x.inicio && t < x.fin)
  return p ? <AbsoluteFill style={{ fontFamily: FUENTE }}><Subtitulo>{p.texto}</Subtitulo></AbsoluteFill> : null
}

// escena = número de una sola escena (para verla suelta); sin número, el vídeo entero.
export const Video: React.FC<{ escena?: number; subtitulos?: boolean }> = ({ escena, subtitulos = true }) => {
  const { fps } = useVideoConfig()
  const base = escena ? GUION[escena - 1].inicio : 0
  return (
    <AbsoluteFill style={{ background: '#fff' }}>
      {GUION.map((e, i) => {
        if (escena && e.n !== escena) return null
        const E = ESCENAS[i]
        const ultima = i === GUION.length - 1 || Boolean(escena)
        return (
          <Sequence key={e.n} from={Math.round((e.inicio - base) * fps)} durationInFrames={Math.round((e.fin - e.inicio) * fps) + (ultima ? 0 : FUNDIDO)}>
            <Paso primera={i === 0 || Boolean(escena)}><E /></Paso>
          </Sequence>
        )
      })}
      {subtitulos ? <Sequence from={Math.round(-base * fps)}><Subtitulos /></Sequence> : null}
    </AbsoluteFill>
  )
}
