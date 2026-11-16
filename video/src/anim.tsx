import React from 'react'
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'

// Curvas de movimiento (criterios de Emil Kowalski): salida rápida y frenada suave.
export const SALIDA = Easing.bezier(0.23, 1, 0.32, 1)
export const VAIVEN = Easing.bezier(0.77, 0, 0.175, 1)

// Segundos transcurridos dentro de la escena.
export function useT(): number {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  return f / fps
}

// De 0 a 1 entre los segundos a y b.
export const rampa = (t: number, a: number, b: number, curva: (n: number) => number = SALIDA) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: curva })

export const mezcla = (a: number, b: number, p: number) => a + (b - a) * p

// Un toque del dedo en el segundo T: el círculo aparece un instante antes y la opción queda marcada.
export function toque(t: number, T: number) {
  return { p: rampa(t, T, T + 0.18), anillo: rampa(t, T - 0.3, T - 0.05) * (1 - rampa(t, T + 0.05, T + 0.4)) }
}

// Hace aparecer algo en el segundo "en": sube un poco, se aclara y crece casi nada.
export const Entra: React.FC<{ en: number; dur?: number; x?: number; y?: number; escala?: number; fuera?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ en, dur = 0.6, x = 0, y = 26, escala = 0.97, fuera, style, children }) => {
  const t = useT()
  const p = rampa(t, en, en + dur)
  const q = fuera === undefined ? 0 : rampa(t, fuera, fuera + 0.3)
  return (
    <div style={{ opacity: p * (1 - q), transform: `translate(${(1 - p) * x}px, ${(1 - p) * y - q * 14}px) scale(${mezcla(escala, 1, p)})`, ...style }}>{children}</div>
  )
}

// Formato del vídeo: horizontal (por defecto) o vertical.
export const Formato = React.createContext<'horizontal' | 'vertical'>('horizontal')
export const useVertical = () => React.useContext(Formato) === 'vertical'
// En vertical, cada escena se dibuja en varias "ventanas"; esto dice en cuál estamos.
export const VentanaActual = React.createContext(-1)
