import React from 'react'
import { interpolateColors } from 'remotion'
import { Escena, Caja, Tarjeta, Frase, Etiqueta, Punto, onda, COLOR_LUCIA, COLOR_TUTOR } from '../componentes/Base'
import { Nombre, PIEZA_ARRIBA, PIEZA_CENTRO, PIEZA_ABAJO } from '../componentes/Logo'
import { BustoLucia, BustoTutor } from '../componentes/Figuras'
import { Entra, useT, rampa, mezcla, VAIVEN } from '../anim'
import { AZUL, VERDE, FONDO, BORDE, GRIS, PIZARRA, GRIS_CLARO } from '../marca'

// El símbolo, pieza a pieza: cada una entra con su propio avance (0 a 1).
export const SimboloAnimado: React.FC<{ x: number; y: number; size: number; arriba: number; centro: number; abajo: number; desdeArriba: number; desdeAbajo: number; colorArriba?: string }> = ({ x, y, size, arriba, centro, abajo, desdeArriba, desdeAbajo, colorArriba = AZUL }) => {
  const k = size / 1340
  const pieza = (cx: number, cy: number, p: number, desde: number) =>
    `translate(${cx + (1 - p) * desde} ${cy}) scale(${mezcla(0.55, 1, p)} ${mezcla(0.05, 1, p)}) translate(${-cx} ${-cy})`
  return (
    <g transform={`translate(${x} ${y}) scale(${k}) translate(-330 -291)`}>
      <path d={PIEZA_ARRIBA} fill={colorArriba} opacity={Math.min(1, arriba * 6)} transform={pieza(1255, 532.5, arriba, desdeArriba)} />
      <path d={PIEZA_ABAJO} fill={AZUL} opacity={Math.min(1, abajo * 6)} transform={pieza(745, 1389.5, abajo, desdeAbajo)} />
      <path d={PIEZA_CENTRO} fill={VERDE} opacity={centro} transform={`translate(1000 960.5) scale(${mezcla(0.7, 1, centro)} ${mezcla(0.3, 1, centro)}) translate(-1000 -960.5)`} />
    </g>
  )
}

// 1. La construcción del logo.
export const E01: React.FC = () => {
  const t = useT()
  const cabeza = rampa(t, 0.2, 3.0, VAIVEN) // hasta dónde ha llegado cada línea
  const calma = 1 - rampa(t, 1.8, 3.5, VAIVEN) // las ondas se van calmando
  const acorde = rampa(t, 1.2, 3.2, VAIVEN) // y sus ritmos se igualan
  const lineas = 1 - rampa(t, 3.5, 3.9)
  const arriba = rampa(t, 3.5, 4.3)
  const abajo = rampa(t, 3.6, 4.4)
  return (
    <Escena>
      <svg width={1920} height={1080} style={{ position: 'absolute' }} fill="none" strokeLinecap="round">
        <path d={onda(0, mezcla(0, 800, cabeza), 538, 78 * calma, mezcla(300, 230, acorde), -t * 2.4)} stroke={COLOR_LUCIA} strokeWidth={12} opacity={lineas} />
        <path d={onda(1920, mezcla(1920, 1120, cabeza), 282, 60 * calma, mezcla(150, 230, acorde), t * 4.2)} stroke={COLOR_TUTOR} strokeWidth={12} opacity={lineas} />
        <SimboloAnimado x={760} y={210} size={400} arriba={arriba} abajo={abajo} centro={rampa(t, 4.3, 5.0)} desdeArriba={260} desdeAbajo={-260} colorArriba={interpolateColors(arriba, [0, 1], [PIZARRA, AZUL])} />
      </svg>
      <Caja x={0} y={690} w={1920} style={{ textAlign: 'center' }}><Entra en={5.2} dur={0.8}><Nombre size={128} /></Entra></Caja>
    </Escena>
  )
}

const Barra: React.FC<{ titulo: string; pct: number; color: string; nota: string; notaP: number }> = ({ titulo, pct, color, nota, notaP }) => (
  <Tarjeta style={{ padding: '26px 30px', width: 620 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 28, fontWeight: 600 }}>
      <span>{titulo}</span><span style={{ color: GRIS, fontWeight: 500, opacity: notaP }}>{nota}</span>
    </div>
    <div style={{ height: 26, borderRadius: 26, background: '#E6EDEC', marginTop: 18, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 26, background: color }} />
    </div>
  </Tarjeta>
)

const Portatil: React.FC = () => (
  <svg width={360} height={230} viewBox="0 0 360 230">
    <rect x="50" y="10" width="260" height="176" rx="14" fill="#C9D6DC" /><circle cx="180" cy="98" r="12" fill="#B4C5CD" />
    <rect x="10" y="186" width="340" height="18" rx="9" fill="#AEBFC8" />
  </svg>
)

// 2. El problema.
export const E02: React.FC = () => {
  const t = useT()
  const choque = t > 13.2 && t < 13.9 ? Math.sin((t - 13.2) * 40) * 7 * (1 - (t - 13.2) / 0.7) : 0
  return (
    <Escena>
      <Caja x={960} y={0} w={960} h={1080} style={{ background: FONDO, clipPath: `inset(0 ${(1 - rampa(t, 0, 0.8)) * 100}% 0 0)` }} />
      {/* Lucía */}
      <Caja x={170} y={84} style={{ transform: `translateX(${choque}px)` }}><Entra en={1.4}><Barra titulo="El TFM, según Lucía" pct={82 * rampa(t, 2.0, 3.6, VAIVEN)} color={COLOR_LUCIA} nota="casi listo" notaP={rampa(t, 3.5, 3.9)} /></Entra></Caja>
      <Caja x={330} y={290}><Entra en={0.3}><BustoLucia size={300} /></Entra></Caja>
      <Caja x={300} y={500}><Entra en={0.4}><Portatil /></Entra></Caja>
      <Caja x={130} y={700} w={700} h={10} style={{ background: BORDE, borderRadius: 10, opacity: rampa(t, 0.2, 0.7) }} />
      <Caja x={130} y={750} w={700} style={{ textAlign: 'center' }}><Entra en={3.4}><Frase size={56}>Ella cree que va bien.</Frase></Entra></Caja>
      {/* Tutor */}
      <Caja x={1130} y={84} style={{ transform: `translateX(${-choque}px)` }}><Entra en={4.4}><Barra titulo="El TFM, según su tutor" pct={45 * rampa(t, 4.9, 6.2, VAIVEN)} color={COLOR_TUTOR} nota="a medias" notaP={rampa(t, 6.1, 6.5)} /></Entra></Caja>
      <Caja x={1560} y={300}><Entra en={1.0}>
        <svg width={300} height={260} viewBox="0 0 300 260">
          <rect x="0" y="120" width="300" height="10" rx="5" fill="#C9D6DC" /><rect x="0" y="250" width="300" height="10" rx="5" fill="#C9D6DC" />
          {[[20, 44, AZUL], [70, 30, PIZARRA], [106, 52, GRIS_CLARO], [164, 36, VERDE], [206, 46, AZUL]].map(([x, w, c], i) => <rect key={i} x={x as number} y={30 + (i % 2) * 14} width={w as number} height={90 - (i % 2) * 14} rx="6" fill={c as string} opacity={c === VERDE ? 1 : 0.55} />)}
          {[[30, 50, PIZARRA], [86, 40, AZUL], [220, 44, GRIS_CLARO]].map(([x, w, c], i) => <rect key={i} x={x as number} y={166} width={w as number} height={84} rx="6" fill={c as string} opacity={0.5} />)}
        </svg>
      </Entra></Caja>
      <Caja x={1230} y={340}><Entra en={0.8}><BustoTutor size={300} /></Entra></Caja>
      <Caja x={1090} y={592}><Entra en={0.9}>
        <svg width={220} height={120} viewBox="0 0 220 120">
          <rect x="10" y="78" width="200" height="30" rx="6" fill="#A9BECA" /><rect x="26" y="50" width="170" height="28" rx="6" fill="#3F7391" /><rect x="18" y="24" width="150" height="26" rx="6" fill="#C9D6DC" />
        </svg>
      </Entra></Caja>
      <Caja x={1090} y={700} w={700} h={10} style={{ background: '#D5DEE2', borderRadius: 10, opacity: rampa(t, 0.6, 1.1) }} />
      <Caja x={1090} y={750} w={700} style={{ textAlign: 'center' }}><Entra en={5.8}><Frase size={56}>Él cree que va retrasada.</Frase></Entra></Caja>
      {/* Calendario: las semanas pasan hasta la entrega */}
      <Caja x={810} y={300} w={300}><Entra en={8.8} escala={0.92}>
        <Tarjeta style={{ overflow: 'hidden' }}>
          <div style={{ background: AZUL, color: '#fff', fontSize: 26, fontWeight: 600, padding: '12px 0', textAlign: 'center' }}>Junio</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, padding: 16 }}>
            {Array.from({ length: 28 }).map((_, i) => {
              const entrega = i === 24
              const pasado = i < 21 && t > 9.8 + i * 0.16
              const late = entrega ? 1 + 0.12 * Math.max(0, Math.sin((t - 13.2) * 5)) * (t > 13.2 ? 1 : 0) : 1
              return <div key={i} style={{ height: 30, borderRadius: 8, fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', background: entrega ? VERDE : pasado ? '#EEF2F3' : '#fff', color: entrega ? AZUL : pasado ? '#B6C3CA' : AZUL, border: entrega ? 'none' : `1px solid ${BORDE}`, textDecoration: pasado ? 'line-through' : 'none', transform: `scale(${late})` }}>{i + 1}</div>
            })}
          </div>
          <div style={{ textAlign: 'center', fontSize: 22, fontWeight: 600, paddingBottom: 14 }}>Entrega: día 25</div>
        </Tarjeta>
      </Entra></Caja>
      <Caja x={0} y={856} w={1920} style={{ textAlign: 'center' }}>
        <Entra en={7.6} style={{ display: 'inline-block' }}><Etiqueta style={{ fontSize: 44, fontWeight: 700, padding: '14px 40px' }}>Y nadie lo dice a tiempo.</Etiqueta></Entra>
      </Caja>
    </Escena>
  )
}

// 3. La idea.
export const E03: React.FC = () => {
  const t = useT()
  const vuelta = rampa(t, 2.2, 8.6, (n) => n) // el reloj da una vuelta: un minuto
  const largo = 2 * Math.PI * 205
  const seg = Math.round(vuelta * 60)
  const trazo = rampa(t, 0, 1.4, VAIVEN) * 1920
  return (
    <Escena>
      <svg width={1920} height={1080} style={{ position: 'absolute' }} fill="none" strokeLinecap="round">
        <path d={onda(0, trazo, 770, 34, 420, -t * 1.2, 'no')} stroke={COLOR_LUCIA} strokeWidth={14} />
        <path d={onda(0, trazo, 840, 34, 300, 2 - t * 1.9, 'no')} stroke={COLOR_TUTOR} strokeWidth={14} />
      </svg>
      <Caja x={150} y={190} w={900}>
        <Entra en={0.4}><Frase size={124}>Un minuto</Frase></Entra>
        <Entra en={0.6}><Frase size={124}>a la semana.</Frase></Entra>
        <div style={{ display: 'flex', gap: 20, marginTop: 50 }}>
          <Entra en={8.4}><Etiqueta><Punto color={COLOR_LUCIA} /> Lucía: un minuto</Etiqueta></Entra>
          <Entra en={9.8}><Etiqueta><Punto color={COLOR_TUTOR} /> Su tutor: treinta segundos</Etiqueta></Entra>
        </div>
      </Caja>
      <Caja x={1240} y={140}><Entra en={1.0} escala={0.9}>
        <svg width={460} height={460} viewBox="0 0 460 460">
          <circle cx="230" cy="230" r="205" fill="#fff" stroke={BORDE} strokeWidth="18" />
          {vuelta > 0 ? <circle cx="230" cy="230" r="205" fill="none" stroke={VERDE} strokeWidth="18" strokeLinecap="round" strokeDasharray={`${largo * vuelta} ${largo}`} transform="rotate(-90 230 230)" /> : null}
          {Array.from({ length: 12 }).map((_, i) => <rect key={i} x="226" y="50" width="8" height={i % 3 === 0 ? 30 : 16} rx="4" fill={i % 3 === 0 ? AZUL : GRIS_CLARO} transform={`rotate(${i * 30} 230 230)`} />)}
          <rect x="223" y="92" width="14" height="150" rx="7" fill={AZUL} transform={`rotate(${vuelta * 360} 230 230)`} />
          <circle cx="230" cy="230" r="18" fill={AZUL} />
          <text x="230" y="330" textAnchor="middle" fontFamily="Fira Sans" fontWeight="700" fontSize="44" fill={AZUL}>{seg === 60 ? '1:00' : `0:${String(seg).padStart(2, '0')}`}</text>
        </svg>
      </Entra></Caja>
    </Escena>
  )
}
