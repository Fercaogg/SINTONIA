import React from 'react'
import { Escena, Caja, Frase, Etiqueta, Linea, Crono } from '../componentes/Base'
import { BustoLucia } from '../componentes/Figuras'
import { Movil, PantallaAviso, PantallaPregunta, PantallaFinal, PantallaTutor, ESTUDIANTES } from '../componentes/Movil'
import { Entra, useT, rampa, mezcla, toque, VAIVEN } from '../anim'
import { AZUL, VERDE, FONDO, BORDE, GRIS, PIZARRA, PIEL, GRIS_CLARO } from '../marca'

const reloj = (s: number) => `0:${String(Math.round(s)).padStart(2, '0')}`

const EDIFICIOS = [[0, 150, 250], [130, 90, 190], [240, 170, 280], [430, 110, 210], [560, 190, 300], [770, 120, 230], [880, 100, 180], [1000, 160, 260], [1180, 100, 200]]
const Ciudad: React.FC<{ x: number }> = ({ x }) => (
  <g transform={`translate(${x} 0)`}>
    {EDIFICIOS.map(([bx, w, h], i) => (
      <g key={i}><rect x={bx} y={400 - h} width={w} height={h} rx="10" fill={i % 2 ? '#C3D3DB' : '#D3DFE5'} />
        {[0, 1, 2].map((r) => <rect key={r} x={bx + 18} y={400 - h + 26 + r * 44} width={w - 36} height="14" rx="7" fill="#fff" opacity="0.7" />)}</g>
    ))}
    <rect x="714" y="330" width="12" height="70" fill="#9FB3BD" /><circle cx="720" cy="320" r="42" fill={VERDE} opacity="0.6" />
  </g>
)

// Momentos de la escena 4 (en segundos desde que empieza).
const AVISO = 1.9 // llega el aviso
const TOCA_AVISO = 4.2
const TOQUES = [7.4, 8.9, 10.4, 16.4] // cuándo toca cada respuesta
const INICIO_CRONO = 5.6

// 4. Lunes, 8:15, en el autobús.
export const E04: React.FC = () => {
  const t = useT()
  const cambio = rampa(t, 4.6, 5.6, VAIVEN) // del autobús al primer plano del móvil
  const pos = TOQUES.reduce((s, T) => s + rampa(t, T + 0.55, T + 1.0, VAIVEN), 0) // qué pantalla se ve
  const vaiven = Math.sin(t * 5) * 2.5
  const ciudad = -((t * 90) % 1340)
  const avisoP = rampa(t, AVISO, AVISO + 0.6)
  const pulsa = toque(t, TOCA_AVISO)
  const crono = Math.min(52, Math.max(0, ((t - INICIO_CRONO) / (TOQUES[3] + 0.8 - INICIO_CRONO)) * 52))
  return (
    <Escena fondo={FONDO}>
      <Caja x={0} y={0} w={1920} h={1080} style={{ background: '#fff', clipPath: `inset(0 0 0 ${mezcla(100, 43.75, cambio)}%)` }} />
      {/* El autobús */}
      <Caja x={110} y={110} w={1060} h={800} style={{ borderRadius: 40, overflow: 'hidden', background: '#E4ECEF', opacity: rampa(t, 0, 0.5) * (1 - cambio), transform: `translate(${-cambio * 160}px, ${vaiven}px)` }}>
        <div style={{ position: 'absolute', left: 50, top: 60, width: 960, height: 400, borderRadius: 36, background: '#F4F9FB', overflow: 'hidden', border: '10px solid #fff' }}>
          <svg width={960} height={400} viewBox="0 0 960 400"><circle cx="800" cy="90" r="44" fill="#fff" /><Ciudad x={ciudad} /><Ciudad x={ciudad + 1340} /></svg>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 26, height: 12, background: '#B9C9D1' }} />
        {[250, 560, 870].map((x, i) => <div key={x} style={{ position: 'absolute', left: x, top: 38, width: 10, height: 44, background: '#B9C9D1', borderRadius: 6, transformOrigin: '50% 0', transform: `rotate(${Math.sin(t * 2.4 + i) * 5}deg)` }} />)}
        <div style={{ position: 'absolute', left: 300, top: 430, width: 460, height: 420, borderRadius: '60px 60px 0 0', background: '#A9BECA' }} />
        <div style={{ position: 'absolute', left: 325, top: 330, transform: `translateY(${-vaiven * 0.6}px)` }}><BustoLucia size={410} movil /></div>
      </Caja>
      <Caja x={150} y={150} style={{ opacity: 1 - cambio }}><Entra en={0.4}><Etiqueta style={{ fontSize: 32 }}>Lunes · 8:15</Etiqueta></Entra></Caja>
      {/* El móvil: primero el aviso; luego, en primer plano, las preguntas */}
      <Caja x={mezcla(1340, 250, cambio)} y={mezcla(90, 70, cambio)}>
        <Entra en={0.9} y={90} dur={0.8}>
          <Movil w={mezcla(400, 420, cambio)}>
            <div style={{ position: 'relative', height: 724, overflow: 'hidden' }}>
              {[0, 1, 2, 3, 4].map((i) => Math.abs(i - pos) < 1 ? (
                <div key={i} style={{ position: 'absolute', inset: 0, transform: `translateX(${(i - pos) * 390}px)` }}>
                  {i < 4 ? <PantallaPregunta n={i + 1} sel={toque(t, TOQUES[i]).p} anillo={toque(t, TOQUES[i]).anillo} /> : <PantallaFinal />}
                </div>
              ) : null)}
            </div>
            {cambio < 1 ? <div style={{ position: 'absolute', inset: 0, opacity: 1 - rampa(t, 4.8, 5.4) }}><PantallaAviso p={avisoP} pulsa={pulsa.anillo} /></div> : null}
          </Movil>
        </Entra>
      </Caja>
      <Caja x={600} y={110} style={{ opacity: cambio }}><Crono>{reloj(crono)}</Crono></Caja>
      <Caja x={960} y={280} style={{ display: 'grid', gap: 44 }}>
        <Entra en={6.2} x={40} y={0}><Linea size={68}>Una pregunta por pantalla.</Linea></Entra>
        <Entra en={8.6} x={40} y={0}><Linea size={68}>Con una mano.</Linea></Entra>
        <Entra en={20.2} x={40} y={0}><Linea size={68}>Aunque no haya cobertura.</Linea></Entra>
      </Caja>
    </Escena>
  )
}

// El Dr. Ruiz caminando: las piernas se mueven al paso.
const Caminante: React.FC<{ size: number; t: number }> = ({ size, t }) => {
  const paso = Math.sin(t * 6.2) * 20
  return (
    <svg width={size * 0.6} height={size} viewBox="0 0 240 400" style={{ transform: `translateY(${Math.abs(Math.cos(t * 6.2)) * -6}px)` }}>
      {[paso, -paso].map((a, i) => (
        <g key={i} transform={`rotate(${a} 120 236)`}>
          <path d="M120 236 L120 352" stroke={i ? '#3A5566' : '#31495A'} strokeWidth="30" strokeLinecap="round" />
          <rect x="100" y="346" width="54" height="20" rx="10" fill="#083A55" />
        </g>
      ))}
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
}

// 5. El tutor, entre dos clases.
const FILAS = [4.0, 4.8, 5.6, 6.4, 7.2]
const ENVIAR = 8.3
export const E05: React.FC = () => {
  const t = useT()
  const pasillo = -((t * 120) % 340)
  const crono = Math.min(28, Math.max(0, ((t - 1.6) / (ENVIAR - 1.6)) * 28))
  return (
    <Escena fondo={FONDO}>
      <Caja x={110} y={90} w={1040} h={570}><Entra en={0.1} style={{ width: 1040, height: 570, borderRadius: 40, overflow: 'hidden', background: '#EDF2F4', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 110, background: '#DCE5E9' }} />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ position: 'absolute', left: 60 + i * 340 + pasillo, top: 90, width: 230, height: 370, borderRadius: '14px 14px 0 0', background: '#fff', border: `6px solid ${BORDE}`, boxSizing: 'border-box' }}>
            <div style={{ margin: '28px auto 0', width: 110, height: 120, borderRadius: 10, background: '#E4ECEF' }} />
            <div style={{ position: 'absolute', right: 22, top: 200, width: 14, height: 40, borderRadius: 8, background: '#B9C9D1' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: -58, textAlign: 'center', fontSize: 24, fontWeight: 600, color: GRIS }}>Aula</div>
          </div>
        ))}
        <div style={{ position: 'absolute', left: 400, top: 110 }}><Caminante size={440} t={t} /></div>
      </Entra></Caja>
      <Caja x={110} y={710} w={1100}>
        <Entra en={3.9}><Frase size={64}>Todos sus estudiantes.</Frase></Entra>
        <Entra en={8.9}><Frase size={64}>Una pantalla. 30 segundos.</Frase></Entra>
      </Caja>
      <Caja x={1350} y={70}><Entra en={0.7} y={90} dur={0.8}><Movil w={420}><PantallaTutor toques={ESTUDIANTES.map((_, i) => toque(t, FILAS[i]))} enviar={rampa(t, ENVIAR, ENVIAR + 0.3)} /></Movil></Entra></Caja>
      <Caja x={1690} y={110}><Entra en={1.4}><Crono>{reloj(crono)}</Crono></Entra></Caja>
    </Escena>
  )
}
