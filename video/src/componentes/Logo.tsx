import React from 'react'
import { AZUL, VERDE, FUENTE } from '../marca'

// Las tres piezas del símbolo, con las medidas del logo original (lienzo de 2000).
export const PIEZA_ARRIBA = 'M925 686 A307 307 0 0 1 1232 379 L1585 379 A307 307 0 0 1 1278 686 Z'
export const PIEZA_CENTRO = 'M415 807 L1278 807 A307 307 0 0 1 1585 1114 L722 1114 A307 307 0 0 1 415 807 Z'
export const PIEZA_ABAJO = 'M415 1543 A307 307 0 0 1 722 1236 L1075 1236 A307 307 0 0 1 768 1543 Z'

export const Simbolo: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  // Se recorta el margen vacío del original para poder centrarlo bien.
  <svg width={size} height={size} viewBox="330 291 1340 1340" style={style}>
    <path d={PIEZA_ARRIBA} fill={AZUL} />
    <path d={PIEZA_CENTRO} fill={VERDE} />
    <path d={PIEZA_ABAJO} fill={AZUL} />
  </svg>
)

// La palabra SINTONÍA: siempre completa y siempre en el mismo azul.
export const Nombre: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <span style={{ fontFamily: FUENTE, fontWeight: 700, fontSize: size, color: AZUL, letterSpacing: '0.02em', lineHeight: 1, ...style }}>
    SINTONÍA
  </span>
)
