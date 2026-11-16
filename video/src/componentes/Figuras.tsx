import React from 'react'
import { AZUL, PIZARRA, PIEL, GRIS_CLARO } from '../marca'

// Figuras planas, sin rasgos de cara. Lucía viste de azul; el Dr. Ruiz, de azul suave y con gafas.
export const BustoLucia: React.FC<{ size: number; movil?: boolean }> = ({ size, movil }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 200 240">
    <path d="M52 100 C44 30 156 30 148 100 L156 168 C120 176 80 176 44 168 Z" fill="#083A55" />
    <path d="M14 240 C14 176 58 156 100 156 C142 156 186 176 186 240 Z" fill={AZUL} />
    <rect x="86" y="120" width="28" height="44" rx="12" fill={PIEL} />
    <circle cx="100" cy="92" r="42" fill={PIEL} />
    <path d="M54 98 C46 34 154 34 146 98 C128 90 112 74 104 62 C92 80 74 92 54 98 Z" fill="#083A55" />
    {movil ? (<g><rect x="78" y="182" width="44" height="58" rx="8" fill="#0B2A3A" /><rect x="82" y="187" width="36" height="53" rx="4" fill="#DFF3EE" /><circle cx="74" cy="222" r="13" fill={PIEL} /><circle cx="126" cy="222" r="13" fill={PIEL} /></g>) : null}
  </svg>
)

export const BustoTutor: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 200 240">
    <path d="M14 240 C14 176 58 156 100 156 C142 156 186 176 186 240 Z" fill={PIZARRA} />
    <path d="M78 158 L100 196 L122 158 Z" fill="#fff" />
    <rect x="86" y="120" width="28" height="44" rx="12" fill={PIEL} />
    <circle cx="100" cy="92" r="42" fill={PIEL} />
    <path d="M57 86 C54 38 146 38 143 86 C128 66 72 66 57 86 Z" fill={GRIS_CLARO} />
    <g fill="none" stroke={AZUL} strokeWidth="4"><circle cx="83" cy="96" r="13" /><circle cx="117" cy="96" r="13" /><path d="M96 96h8" /></g>
  </svg>
)

// El Dr. Ruiz caminando con el móvil, de cuerpo entero.
export const TutorCaminando: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size * 0.6} height={size} viewBox="0 0 240 400">
    <g stroke="#3A5566" strokeWidth="30" strokeLinecap="round" fill="none"><path d="M112 232 L84 356" /><path d="M128 232 L172 350" /></g>
    <g fill="#083A55"><rect x="56" y="350" width="52" height="20" rx="10" /><rect x="150" y="344" width="52" height="20" rx="10" transform="rotate(-14 176 354)" /></g>
    <rect x="74" y="104" width="92" height="150" rx="38" fill={PIZARRA} />
    <path d="M104 106 L120 140 L136 106 Z" fill="#fff" />
    <path d="M150 140 L176 196 L140 176" stroke={PIZARRA} strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <rect x="128" y="146" width="26" height="42" rx="5" fill="#0B2A3A" transform="rotate(-12 141 167)" />
    <circle cx="140" cy="178" r="11" fill={PIEL} />
    <rect x="109" y="82" width="22" height="30" rx="9" fill={PIEL} />
    <circle cx="120" cy="62" r="34" fill={PIEL} />
    <path d="M85 58 C82 18 158 18 155 58 C142 42 98 42 85 58 Z" fill={GRIS_CLARO} />
    <g fill="none" stroke={AZUL} strokeWidth="3.5"><circle cx="112" cy="66" r="10" /><circle cx="138" cy="66" r="10" /></g>
  </svg>
)

// Una persona vista desde arriba, para la mesa de tutoría.
export const DesdeArriba: React.FC<{ quien: 'lucia' | 'tutor'; size: number; giro?: number }> = ({ quien, size, giro = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{ transform: `rotate(${giro}deg)` }}>
    <ellipse cx="100" cy="92" rx="88" ry="46" fill={quien === 'lucia' ? AZUL : PIZARRA} />
    {quien === 'lucia' ? <ellipse cx="100" cy="62" rx="26" ry="20" fill="#062C41" stroke="#fff" strokeWidth="4" /> : null}
    <circle cx="100" cy="100" r="40" fill={quien === 'lucia' ? '#062C41' : GRIS_CLARO} stroke="#fff" strokeWidth="4" />
    {quien === 'lucia' ? null : <circle cx="100" cy="112" r="22" fill={PIEL} />}
    <circle cx="30" cy="130" r="15" fill={PIEL} /><circle cx="170" cy="130" r="15" fill={PIEL} />
  </svg>
)
