import React from 'react'
import { AbsoluteFill } from 'remotion'
import { AZUL, VERDE, VERDE_OSCURO, FUENTE, GRIS, BORDE, SOMBRA, PIZARRA } from '../marca'

// Marco común de todas las escenas: fondo y subtítulo.
export const Escena: React.FC<{ children: React.ReactNode; fondo?: string; subtitulo?: string }> = ({ children, fondo = '#FFFFFF', subtitulo }) => (
  <AbsoluteFill style={{ background: fondo, fontFamily: FUENTE, color: AZUL }}>
    {children}
    {subtitulo ? <Subtitulo>{subtitulo}</Subtitulo> : null}
  </AbsoluteFill>
)

export const Subtitulo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 44, display: 'flex', justifyContent: 'center' }}>
    <div style={{ background: 'rgba(10,74,108,0.94)', color: '#fff', fontSize: 34, fontWeight: 500, padding: '14px 30px', borderRadius: 14, maxWidth: 1500, textAlign: 'center', lineHeight: 1.3 }}>
      {children}
    </div>
  </div>
)

export const Caja: React.FC<{ x: number; y: number; w?: number; h?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, style, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, ...style }}>{children}</div>
)

export const Tarjeta: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ background: '#fff', border: `1px solid ${BORDE}`, borderRadius: 20, boxShadow: SOMBRA, ...style }}>{children}</div>
)

export const Frase: React.FC<{ size?: number; color?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ size = 60, color = AZUL, style, children }) => (
  <div style={{ fontSize: size, fontWeight: 700, color, lineHeight: 1.12, letterSpacing: '-0.01em', ...style }}>{children}</div>
)

export const Etiqueta: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = AZUL, style }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#fff', border: `1px solid ${BORDE}`, borderRadius: 999, padding: '10px 22px', fontSize: 28, fontWeight: 600, color, boxShadow: SOMBRA, ...style }}>{children}</div>
)

export const Punto: React.FC<{ color: string; size?: number }> = ({ color, size = 16 }) => (
  <span style={{ width: size, height: size, borderRadius: size, background: color, display: 'inline-block', flexShrink: 0 }} />
)

// Línea de lista con una marca verde pequeña (el verde, solo para detalles).
export const Linea: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 58 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
    <span style={{ width: 14, height: size * 0.72, borderRadius: 8, background: VERDE, flexShrink: 0 }} />
    <Frase size={size}>{children}</Frase>
  </div>
)

// Iconos sencillos de trazo.
type IconoProps = { size?: number; color?: string }
export const Candado: React.FC<IconoProps> = ({ size = 24, color = AZUL }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
)
export const Visto: React.FC<IconoProps> = ({ size = 24, color = VERDE_OSCURO }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
)
export const Ojo: React.FC<IconoProps> = ({ size = 24, color = AZUL }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
)
export const Crono: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <Etiqueta style={{ fontSize: 34, fontVariantNumeric: 'tabular-nums', ...style }}>
    <svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke={VERDE_OSCURO} strokeWidth={2.2} strokeLinecap="round"><circle cx="12" cy="13.5" r="7.5" /><path d="M12 13.5V9.5M9.5 3h5M12 3v3" /></svg>
    {children}
  </Etiqueta>
)

// Onda que se calma al acercarse a uno de sus extremos: las dos miradas.
export function onda(x0: number, x1: number, y: number, amp: number, largo: number, fase: number, calma: 'fin' | 'no' = 'fin'): string {
  const pasos = 120
  let d = ''
  for (let i = 0; i <= pasos; i++) {
    const t = i / pasos
    const x = x0 + (x1 - x0) * t
    const a = calma === 'fin' ? amp * (1 - t) ** 1.5 : amp
    const yy = y + Math.sin((x / largo) * Math.PI * 2 + fase) * a
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${yy.toFixed(1)} `
  }
  return d
}
export const COLOR_LUCIA = AZUL
export const COLOR_TUTOR = PIZARRA
export { GRIS }
