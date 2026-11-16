import React from 'react'
import { Escena, Caja, Frase, Etiqueta, Linea, Crono } from '../componentes/Base'
import { BustoLucia, TutorCaminando } from '../componentes/Figuras'
import { Movil, PantallaAviso, PantallaPregunta, PantallaFinal, PantallaTutor } from '../componentes/Movil'
import { AZUL, VERDE, FONDO, BORDE, GRIS, PIZARRA } from '../marca'

// 4A. Lucía en el autobús recibe el aviso.
export const E04A: React.FC<{ subtitulo?: string }> = ({ subtitulo }) => (
  <Escena subtitulo={subtitulo} fondo={FONDO}>
    <Caja x={110} y={110} w={1060} h={800} style={{ borderRadius: 40, overflow: 'hidden', background: '#E4ECEF' }}>
      {/* ventanilla con la ciudad pasando */}
      <div style={{ position: 'absolute', left: 50, top: 60, width: 960, height: 400, borderRadius: 36, background: '#F4F9FB', overflow: 'hidden', border: '10px solid #fff' }}>
        <svg width={960} height={400} viewBox="0 0 960 400">
          <circle cx="800" cy="90" r="44" fill="#fff" />
          {[[0, 150, 250], [130, 90, 190], [240, 170, 280], [430, 110, 210], [560, 190, 300], [770, 120, 230], [880, 100, 180]].map(([x, w, h], i) => (
            <g key={i}><rect x={x} y={400 - h} width={w} height={h} rx="10" fill={i % 2 ? '#C3D3DB' : '#D3DFE5'} />
              {[0, 1, 2].map((r) => <rect key={r} x={x + 18} y={400 - h + 26 + r * 44} width={w - 36} height="14" rx="7" fill="#fff" opacity="0.7" />)}</g>
          ))}
          <rect x="714" y="330" width="12" height="70" fill="#9FB3BD" /><circle cx="720" cy="320" r="42" fill={VERDE} opacity="0.6" />
        </svg>
      </div>
      {/* barra y asideros */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 26, height: 12, background: '#B9C9D1' }} />
      {[250, 560, 870].map((x) => <div key={x} style={{ position: 'absolute', left: x, top: 38, width: 10, height: 44, background: '#B9C9D1', borderRadius: 6 }} />)}
      {/* asiento y Lucía */}
      <div style={{ position: 'absolute', left: 300, top: 430, width: 460, height: 420, borderRadius: '60px 60px 0 0', background: PIZARRA, opacity: 0.55 }} />
      <div style={{ position: 'absolute', left: 325, top: 330 }}><BustoLucia size={410} movil /></div>
    </Caja>
    <Caja x={150} y={150}><Etiqueta style={{ fontSize: 32 }}>Lunes · 8:15</Etiqueta></Caja>
    <Caja x={1340} y={90}><Movil w={400} cabecera={false}><PantallaAviso /></Movil></Caja>
  </Escena>
)

// 4B. Primer plano del móvil: la pregunta que solo ve ella.
export const E04B: React.FC<{ subtitulo?: string; n?: number }> = ({ subtitulo, n = 4 }) => (
  <Escena subtitulo={subtitulo}>
    <Caja x={0} y={0} w={840} h={1080} style={{ background: FONDO }} />
    <Caja x={250} y={70}><Movil w={420}><PantallaPregunta n={n} /></Movil></Caja>
    <Caja x={600} y={110}><Crono>0:52</Crono></Caja>
    <Caja x={960} y={280} style={{ display: 'grid', gap: 44 }}>
      <Linea size={68}>Una pregunta por pantalla.</Linea>
      <Linea size={68}>Con una mano.</Linea>
      <Linea size={68}>Aunque no haya cobertura.</Linea>
    </Caja>
  </Escena>
)

// 4C. Solo para el storyboard: las cinco pantallas seguidas.
export const E04C: React.FC = () => (
  <Escena fondo={FONDO}>
    <Caja x={0} y={50} w={1920} style={{ textAlign: 'center' }}><Frase size={46}>El móvil de Lucía, pantalla a pantalla</Frase></Caja>
    {[1, 2, 3, 4, 5].map((i) => (
      <Caja key={i} x={70 + (i - 1) * 362} y={160}>
        <Movil w={332}>{i < 5 ? <PantallaPregunta n={i} /> : <PantallaFinal />}</Movil>
        <div style={{ textAlign: 'center', fontSize: 28, fontWeight: 600, marginTop: 26, color: GRIS }}>{i < 5 ? `Pregunta ${i}` : 'Final'}</div>
      </Caja>
    ))}
  </Escena>
)

// 5. El tutor, entre dos clases.
export const E05: React.FC<{ subtitulo?: string }> = ({ subtitulo }) => (
  <Escena subtitulo={subtitulo} fondo={FONDO}>
    <Caja x={110} y={90} w={1040} h={570} style={{ borderRadius: 40, overflow: 'hidden', background: '#EDF2F4' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 110, background: '#DCE5E9' }} />
      {[60, 400, 740].map((x, i) => (
        <div key={x} style={{ position: 'absolute', left: x, top: 90, width: 230, height: 370, borderRadius: '14px 14px 0 0', background: '#fff', border: `6px solid ${BORDE}`, boxSizing: 'border-box' }}>
          <div style={{ margin: '28px auto 0', width: 110, height: 120, borderRadius: 10, background: '#E4ECEF' }} />
          <div style={{ position: 'absolute', right: 22, top: 200, width: 14, height: 40, borderRadius: 8, background: '#B9C9D1' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: -58, textAlign: 'center', fontSize: 24, fontWeight: 600, color: GRIS }}>Aula {i + 1}</div>
        </div>
      ))}
      <div style={{ position: 'absolute', left: 520, top: 110 }}><TutorCaminando size={440} /></div>
    </Caja>
    <Caja x={110} y={710} w={1100}>
      <Frase size={64}>Todos sus estudiantes.<br />Una pantalla. 30 segundos.</Frase>
    </Caja>
    <Caja x={1350} y={70}><Movil w={420}><PantallaTutor /></Movil></Caja>
    <Caja x={1690} y={110}><Crono>0:28</Crono></Caja>
  </Escena>
)
