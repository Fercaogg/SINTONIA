import React from 'react'
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { GUION, DURACION_TOTAL } from './guion'
import { pistas } from './subtitulos'
import VOZ from './voz.json'
import { Formato, VentanaActual, rampa, useT, VAIVEN } from './anim'
import { FUENTE, FONDO } from './marca'
import { E01, E02, E03 } from './escenas/E01a03'
import { E04, E05 } from './escenas/E04a05'
import { E06, E07, E08, E09, E10 } from './escenas/E06a10'

const ESCENAS = [E01, E02, E03, E04, E05, E06, E07, E08, E09, E10]
const FUNDIDO = 14 // fotogramas que dura el paso de una escena a la siguiente

// Volumen de la música: presente en el logo y en el cierre, baja bajo la voz.
const MUSICA_SOLA = 0.5
const MUSICA_BAJO_VOZ = 0.14
const ULTIMA_VOZ = VOZ[VOZ.length - 1].inicio + VOZ[VOZ.length - 1].dur

// Cada escena entra fundiéndose sobre la anterior: no hay cortes bruscos.
const Paso: React.FC<{ children: React.ReactNode; primera: boolean }> = ({ children, primera }) => {
  const f = useCurrentFrame()
  const p = primera ? 1 : interpolate(f, [0, FUNDIDO], [0, 1], { extrapolateRight: 'clamp' })
  return <AbsoluteFill style={{ opacity: p }}>{children}</AbsoluteFill>
}

const PISTAS = pistas()
const Subtitulos: React.FC<{ vertical: boolean }> = ({ vertical }) => {
  const { fps } = useVideoConfig()
  const t = useCurrentFrame() / fps
  const p = PISTAS.find((x) => t >= x.inicio && t < x.fin)
  if (!p) return null
  return (
    <AbsoluteFill style={{ fontFamily: FUENTE }}>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: vertical ? 150 : 44, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(10,74,108,0.94)', color: '#fff', fontSize: vertical ? 44 : 34, fontWeight: 500, padding: vertical ? '18px 34px' : '14px 30px', borderRadius: 14, maxWidth: vertical ? 960 : 1500, textAlign: 'center', lineHeight: 1.3 }}>{p.texto}</div>
      </div>
    </AbsoluteFill>
  )
}

// --- Versión vertical -------------------------------------------------------
// Cada escena se recompone con "ventanas": trozos de la escena horizontal que se
// recolocan y se agrandan en el lienzo vertical (1080 × 1920).
interface Ventana { x: number; y: number; w: number; h: number; dx: number; dy: number; k: number; ver?: (t: number) => number }
const antes = (t: number) => 1 - rampa(t, 4.6, 5.3, VAIVEN)
const despues = (t: number) => rampa(t, 4.9, 5.6, VAIVEN)
const VENTANAS: Record<number, { fondo: string; v: Ventana[] }> = {
  1: { fondo: '#fff', v: [{ x: 560, y: 150, w: 800, h: 750, dx: 0, dy: 420, k: 1.35 }] },
  2: { fondo: '#fff', v: [
    { x: 100, y: 60, w: 760, h: 770, dx: 40, dy: 60, k: 0.9 },
    { x: 1060, y: 60, w: 820, h: 770, dx: 302, dy: 780, k: 0.9 },
    { x: 800, y: 290, w: 320, h: 290, dx: 760, dy: 250, k: 0.9 },
    { x: 660, y: 846, w: 600, h: 96, dx: 150, dy: 1465, k: 1.3 },
  ] },
  3: { fondo: '#fff', v: [
    { x: 120, y: 160, w: 940, h: 460, dx: 70, dy: 140, k: 1 },
    { x: 1220, y: 120, w: 500, h: 500, dx: 215, dy: 660, k: 1.3 },
    { x: 0, y: 700, w: 1080, h: 210, dx: 0, dy: 1370, k: 1 },
  ] },
  4: { fondo: FONDO, v: [
    { x: 110, y: 110, w: 1060, h: 800, dx: 10, dy: 60, k: 1, ver: antes },
    { x: 1320, y: 70, w: 440, h: 890, dx: 360, dy: 890, k: 0.82, ver: antes },
    { x: 220, y: 50, w: 560, h: 910, dx: 218, dy: 50, k: 1.15, ver: despues },
    { x: 940, y: 260, w: 960, h: 420, dx: 60, dy: 1150, k: 1, ver: despues },
  ] },
  5: { fondo: FONDO, v: [
    { x: 110, y: 90, w: 1040, h: 570, dx: 72, dy: 50, k: 0.9 },
    { x: 1330, y: 50, w: 530, h: 910, dx: 288, dy: 590, k: 0.95 },
    { x: 110, y: 700, w: 890, h: 160, dx: 160, dy: 1480, k: 0.85 },
  ] },
  6: { fondo: '#fff', v: [
    { x: 500, y: 60, w: 920, h: 380, dx: 34, dy: 60, k: 1.1 },
    { x: 510, y: 436, w: 910, h: 344, dx: 30, dy: 500, k: 1.12 },
    { x: 420, y: 790, w: 1080, h: 110, dx: 27, dy: 905, k: 0.95 },
    { x: 60, y: 90, w: 370, h: 800, dx: 240, dy: 1030, k: 0.72 },
    { x: 1490, y: 90, w: 370, h: 800, dx: 574, dy: 1030, k: 0.72 },
  ] },
  7: { fondo: '#fff', v: [
    { x: 90, y: 60, w: 540, h: 800, dx: 42, dy: 60, k: 0.9 },
    { x: 690, y: 60, w: 540, h: 800, dx: 552, dy: 60, k: 0.9 },
    { x: 1290, y: 60, w: 540, h: 800, dx: 297, dy: 800, k: 0.9 },
  ] },
  8: { fondo: FONDO, v: [
    { x: 80, y: 130, w: 1150, h: 690, dx: 5, dy: 60, k: 0.93 },
    { x: 1290, y: 190, w: 610, h: 640, dx: 190, dy: 760, k: 1.15 },
  ] },
  9: { fondo: '#fff', v: [
    { x: 760, y: 70, w: 400, h: 90, dx: 300, dy: 40, k: 1.2 },
    { x: 70, y: 190, w: 580, h: 640, dx: 15, dy: 170, k: 0.9 },
    { x: 670, y: 190, w: 580, h: 640, dx: 543, dy: 170, k: 0.9 },
    { x: 1270, y: 190, w: 580, h: 640, dx: 279, dy: 780, k: 0.9 },
  ] },
  10: { fondo: '#fff', v: [{ x: 420, y: 60, w: 1080, h: 960, dx: 0, dy: 380, k: 1 }] },
}

const Recompuesta: React.FC<{ n: number; children: React.ReactNode }> = ({ n, children }) => {
  const t = useT()
  const { fondo, v } = VENTANAS[n]
  return (
    <AbsoluteFill style={{ background: fondo }}>
      {v.map((w, i) => (
        <div key={i} style={{ position: 'absolute', left: w.dx, top: w.dy, width: w.w * w.k, height: w.h * w.k, overflow: 'hidden', borderRadius: 28, opacity: w.ver ? w.ver(t) : 1 }}>
          <div style={{ position: 'absolute', width: 1920, height: 1080, transformOrigin: '0 0', transform: `scale(${w.k}) translate(${-w.x}px, ${-w.y}px)` }}><VentanaActual.Provider value={i}>{children}</VentanaActual.Provider></div>
        </div>
      ))}
    </AbsoluteFill>
  )
}

// escena = número de una sola escena (para verla suelta); sin número, el vídeo entero.
export const Video: React.FC<{ escena?: number; subtitulos?: boolean; vertical?: boolean; sonido?: boolean }> = ({ escena, subtitulos = true, vertical = false, sonido = true }) => {
  const { fps } = useVideoConfig()
  const base = escena ? GUION[escena - 1].inicio : 0
  return (
    <Formato.Provider value={vertical ? 'vertical' : 'horizontal'}>
      <AbsoluteFill style={{ background: '#fff' }}>
        {GUION.map((e, i) => {
          if (escena && e.n !== escena) return null
          const E = ESCENAS[i]
          const ultima = i === GUION.length - 1 || Boolean(escena)
          return (
            <Sequence key={e.n} from={Math.round((e.inicio - base) * fps)} durationInFrames={Math.round(e.dur * fps) + (ultima ? 0 : FUNDIDO)}>
              <Paso primera={i === 0 || Boolean(escena)}>{vertical ? <Recompuesta n={e.n}><E /></Recompuesta> : <E />}</Paso>
            </Sequence>
          )
        })}
        {subtitulos ? <Sequence from={Math.round(-base * fps)}><Subtitulos vertical={vertical} /></Sequence> : null}
        {sonido && !escena ? (
          <>
            <Audio src={staticFile('musica.mp3')} volume={(f) => {
              const t = f / fps
              const sube = interpolate(t, [VOZ[0].inicio - 1.2, VOZ[0].inicio], [MUSICA_SOLA, MUSICA_BAJO_VOZ], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              const cierre = interpolate(t, [ULTIMA_VOZ, ULTIMA_VOZ + 0.8], [0, MUSICA_SOLA - MUSICA_BAJO_VOZ], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              const fin = interpolate(t, [DURACION_TOTAL - 1.4, DURACION_TOTAL], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              return (sube + cierre) * fin
            }} />
            {VOZ.map((v) => <Sequence key={v.archivo} from={Math.round(v.inicio * fps)}><Audio src={staticFile(v.archivo)} /></Sequence>)}
          </>
        ) : null}
      </AbsoluteFill>
    </Formato.Provider>
  )
}
