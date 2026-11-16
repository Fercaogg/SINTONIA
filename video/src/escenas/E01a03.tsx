import React from 'react'
import { Escena, Caja, Tarjeta, Frase, Etiqueta, Punto, onda, COLOR_LUCIA, COLOR_TUTOR } from '../componentes/Base'
import { Simbolo, Nombre } from '../componentes/Logo'
import { BustoLucia, BustoTutor } from '../componentes/Figuras'
import { AZUL, VERDE, FONDO, BORDE, GRIS, PIZARRA, GRIS_CLARO } from '../marca'

export const E01: React.FC = () => (
  <Escena>
    <svg width={1920} height={1080} style={{ position: 'absolute' }} fill="none" strokeLinecap="round">
      <path d={onda(0, 700, 590, 70, 260, 0)} stroke={COLOR_LUCIA} strokeWidth={12} opacity={0.22} />
      <path d={onda(1920, 1215, 322, 60, 170, 1.4)} stroke={COLOR_TUTOR} strokeWidth={12} opacity={0.3} />
    </svg>
    <Caja x={760} y={210}><Simbolo size={400} /></Caja>
    <Caja x={0} y={690} w={1920} style={{ textAlign: 'center' }}><Nombre size={128} /></Caja>
  </Escena>
)

const Barra: React.FC<{ titulo: string; pct: number; color: string; nota: string }> = ({ titulo, pct, color, nota }) => (
  <Tarjeta style={{ padding: '26px 30px', width: 620 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 28, fontWeight: 600 }}>
      <span>{titulo}</span><span style={{ color: GRIS, fontWeight: 500 }}>{nota}</span>
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

export const E02: React.FC<{ subtitulo?: string }> = ({ subtitulo }) => (
  <Escena subtitulo={subtitulo}>
    <Caja x={960} y={0} w={960} h={1080} style={{ background: FONDO }} />
    {/* Lucía */}
    <Caja x={170} y={84}><Barra titulo="El TFM, según Lucía" pct={82} color={COLOR_LUCIA} nota="casi listo" /></Caja>
    <Caja x={330} y={290}><BustoLucia size={300} /></Caja>
    <Caja x={300} y={500}><Portatil /></Caja>
    <Caja x={130} y={700} w={700} h={10} style={{ background: BORDE, borderRadius: 10 }} />
    <Caja x={130} y={750} w={700} style={{ textAlign: 'center' }}><Frase size={56}>Ella cree que va bien.</Frase></Caja>
    {/* Tutor */}
    <Caja x={1130} y={84}><Barra titulo="El TFM, según su tutor" pct={45} color={COLOR_TUTOR} nota="a medias" /></Caja>
    <svg width={300} height={260} viewBox="0 0 300 260" style={{ position: 'absolute', left: 1560, top: 300 }}>
      <rect x="0" y="120" width="300" height="10" rx="5" fill="#C9D6DC" /><rect x="0" y="250" width="300" height="10" rx="5" fill="#C9D6DC" />
      {[[20, 44, AZUL], [70, 30, PIZARRA], [106, 52, GRIS_CLARO], [164, 36, VERDE], [206, 46, AZUL]].map(([x, w, c], i) => <rect key={i} x={x as number} y={30 + (i % 2) * 14} width={w as number} height={90 - (i % 2) * 14} rx="6" fill={c as string} opacity={c === VERDE ? 1 : 0.55} />)}
      {[[30, 50, PIZARRA], [86, 40, AZUL], [220, 44, GRIS_CLARO]].map(([x, w, c], i) => <rect key={i} x={x as number} y={166} width={w as number} height={84} rx="6" fill={c as string} opacity={0.5} />)}
    </svg>
    <Caja x={1230} y={340}><BustoTutor size={300} /></Caja>
    <svg width={220} height={120} viewBox="0 0 220 120" style={{ position: 'absolute', left: 1090, top: 592 }}>
      <rect x="10" y="78" width="200" height="30" rx="6" fill="#A9BECA" /><rect x="26" y="50" width="170" height="28" rx="6" fill="#3F7391" /><rect x="18" y="24" width="150" height="26" rx="6" fill="#C9D6DC" />
    </svg>
    <Caja x={1090} y={700} w={700} h={10} style={{ background: '#D5DEE2', borderRadius: 10 }} />
    <Caja x={1090} y={750} w={700} style={{ textAlign: 'center' }}><Frase size={56}>Él cree que va retrasada.</Frase></Caja>
    {/* Calendario en el centro */}
    <Caja x={810} y={300} w={300}>
      <Tarjeta style={{ overflow: 'hidden' }}>
        <div style={{ background: AZUL, color: '#fff', fontSize: 26, fontWeight: 600, padding: '12px 0', textAlign: 'center' }}>Junio</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, padding: 16 }}>
          {Array.from({ length: 28 }).map((_, i) => {
            const entrega = i === 24
            return <div key={i} style={{ height: 30, borderRadius: 8, fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', background: entrega ? VERDE : i < 21 ? '#EEF2F3' : '#fff', color: entrega ? AZUL : i < 21 ? '#B6C3CA' : AZUL, border: entrega ? 'none' : `1px solid ${BORDE}`, textDecoration: i < 21 ? 'line-through' : 'none' }}>{i + 1}</div>
          })}
        </div>
        <div style={{ textAlign: 'center', fontSize: 22, fontWeight: 600, paddingBottom: 14 }}>Entrega: día 25</div>
      </Tarjeta>
    </Caja>
    <Caja x={0} y={856} w={1920} style={{ textAlign: 'center' }}>
      <Etiqueta style={{ fontSize: 44, fontWeight: 700, padding: '14px 40px' }}>Y nadie lo dice a tiempo.</Etiqueta>
    </Caja>
  </Escena>
)

export const E03: React.FC<{ subtitulo?: string }> = ({ subtitulo }) => {
  const marcas = Array.from({ length: 12 })
  return (
    <Escena subtitulo={subtitulo}>
      <svg width={1920} height={1080} style={{ position: 'absolute' }} fill="none" strokeLinecap="round">
        <path d={onda(0, 1920, 770, 34, 420, 0, 'no')} stroke={COLOR_LUCIA} strokeWidth={14} />
        <path d={onda(0, 1920, 840, 34, 300, 2, 'no')} stroke={COLOR_TUTOR} strokeWidth={14} />
      </svg>
      <Caja x={150} y={190} w={900}>
        <Frase size={124}>Un minuto<br />a la semana.</Frase>
        <div style={{ display: 'flex', gap: 20, marginTop: 50 }}>
          <Etiqueta><Punto color={COLOR_LUCIA} /> Lucía: un minuto</Etiqueta>
          <Etiqueta><Punto color={COLOR_TUTOR} /> Su tutor: treinta segundos</Etiqueta>
        </div>
      </Caja>
      <svg width={460} height={460} viewBox="0 0 460 460" style={{ position: 'absolute', left: 1240, top: 140 }}>
        <circle cx="230" cy="230" r="205" fill="#fff" stroke={BORDE} strokeWidth="18" />
        <circle cx="230" cy="230" r="205" fill="none" stroke={VERDE} strokeWidth="18" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 205 * 0.92} 2000`} transform="rotate(-90 230 230)" />
        {marcas.map((_, i) => <rect key={i} x="226" y="50" width="8" height={i % 3 === 0 ? 30 : 16} rx="4" fill={i % 3 === 0 ? AZUL : GRIS_CLARO} transform={`rotate(${i * 30} 230 230)`} />)}
        <rect x="223" y="92" width="14" height="150" rx="7" fill={AZUL} transform="rotate(331 230 230)" />
        <circle cx="230" cy="230" r="18" fill={AZUL} />
        <text x="230" y="330" textAnchor="middle" fontFamily="Fira Sans" fontWeight="700" fontSize="44" fill={AZUL}>1:00</text>
      </svg>
    </Escena>
  )
}
