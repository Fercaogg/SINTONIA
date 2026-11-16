import React from 'react'
import { Escena, Caja, Tarjeta, Frase, Etiqueta, Punto, Linea, Candado, Visto, Ojo, onda, COLOR_LUCIA, COLOR_TUTOR } from '../componentes/Base'
import { Nombre } from '../componentes/Logo'
import { DesdeArriba } from '../componentes/Figuras'
import { Movil, PantallaAgenda, PantallaDespues, TRES_PREGUNTAS, ListaPreguntas } from '../componentes/Movil'
import { SimboloAnimado } from './E01a03'
import { Entra, useT, rampa, mezcla, toque, useVertical, VAIVEN } from '../anim'
import { AZUL, VERDE, VERDE_OSCURO, FONDO, BORDE, GRIS, GRIS_CLARO, PIZARRA } from '../marca'

// 6. Cuando las miradas no coinciden.
const SALEN = [5.4, 6.4, 7.4] // cuándo sale cada pregunta del hueco
export const E06: React.FC = () => {
  const t = useT()
  const yDe = (v: number) => 400 - (v - 1) * 72 // altura de cada valor de la escala
  const lucia = rampa(t, 1.0, 2.0, VAIVEN)
  const tutor = rampa(t, 1.5, 2.5, VAIVEN)
  const hueco = rampa(t, 3.0, 3.8) * (0.2 + 0.06 * Math.sin(t * 3))
  const ver = SALEN.map((T) => rampa(t, T + 0.9, T + 1.4))
  return (
    <Escena>
      <Caja x={70} y={96} w={350} style={{ textAlign: 'center' }}><Entra en={4.4}><Etiqueta><Punto color={COLOR_LUCIA} /> Lucía</Etiqueta></Entra></Caja>
      <Caja x={70} y={176}><Entra en={4.4} x={-80} y={0} dur={0.8}><Movil w={350}><PantallaAgenda ver={ver} /></Movil></Entra></Caja>
      <Caja x={1500} y={96} w={350} style={{ textAlign: 'center' }}><Entra en={4.6}><Etiqueta><Punto color={COLOR_TUTOR} /> Dr. Ruiz</Etiqueta></Entra></Caja>
      <Caja x={1500} y={176}><Entra en={4.6} x={80} y={0} dur={0.8}><Movil w={350}><PantallaAgenda quien="tutor" ver={ver} /></Movil></Entra></Caja>
      {/* las dos líneas y el hueco entre ellas */}
      <svg width={920} height={380} viewBox="0 60 920 380" style={{ position: 'absolute', left: 500, top: 60, opacity: rampa(t, 0.2, 0.8) }}>
        {[1, 2, 3, 4, 5].map((v) => (
          <g key={v}><line x1="70" x2="900" y1={yDe(v)} y2={yDe(v)} stroke={BORDE} strokeWidth="3" strokeDasharray="4 10" />
            <text x="30" y={yDe(v) + 10} fontFamily="Fira Sans" fontSize="28" fontWeight="600" fill={GRIS_CLARO} textAnchor="middle">{v}</text></g>
        ))}
        <rect x="70" y={yDe(4)} width="830" height={yDe(2) - yDe(4)} fill={VERDE} opacity={hueco} rx="10" />
        {lucia > 0 ? <line x1="70" x2={70 + 830 * lucia} y1={yDe(4)} y2={yDe(4)} stroke={COLOR_LUCIA} strokeWidth="14" strokeLinecap="round" /> : null}
        {tutor > 0 ? <line x1="70" x2={70 + 830 * tutor} y1={yDe(2)} y2={yDe(2)} stroke={COLOR_TUTOR} strokeWidth="14" strokeLinecap="round" /> : null}
      </svg>
      <Caja x={620} y={105}><Entra en={1.6}><Etiqueta style={{ fontSize: 26 }}><Punto color={COLOR_LUCIA} /> Lucía ve su avance en un 4</Etiqueta></Entra></Caja>
      <Caja x={960} y={361}><Entra en={2.1}><Etiqueta style={{ fontSize: 26 }}><Punto color={COLOR_TUTOR} /> Su tutor lo ve en un 2</Etiqueta></Entra></Caja>
      {/* las tres preguntas salen del hueco */}
      {TRES_PREGUNTAS.map((q, i) => {
        const y = [446, 572, 674][i]
        const p = rampa(t, SALEN[i], SALEN[i] + 0.8)
        return (
          <Caja key={q} x={520 + i * 18} y={y} w={850} style={{ opacity: Math.min(1, p * 2.5), transform: `translateY(${(1 - p) * (256 - y - 50)}px) scale(${mezcla(0.55, 1, p)})` }}>
            <Tarjeta style={{ padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 22, borderLeft: `10px solid ${VERDE}` }}>
              <span style={{ width: 48, height: 48, borderRadius: 48, background: '#E0F5F0', fontWeight: 700, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontSize: 29, fontWeight: 600, lineHeight: 1.25 }}>{q}</span>
            </Tarjeta>
          </Caja>
        )
      })}
      <Caja x={420} y={796} w={1080} style={{ textAlign: 'center' }}>
        <Entra en={9.4}><Frase size={44}>Las mismas tres preguntas.</Frase></Entra>
        <Entra en={10.8}><Frase size={44}>Para los dos. Sin culpables.</Frase></Entra>
      </Caja>
    </Escena>
  )
}

// 7. Antes y después de la tutoría.
const MOMENTOS = [0.3, 4.9, 7.0]
const Panel: React.FC<{ i: number; x: number; titulo: string; children: React.ReactNode }> = ({ i, x, titulo, children }) => {
  const t = useT()
  const fin = MOMENTOS[i + 1] ?? 99
  const foco = Math.max(rampa(t, MOMENTOS[i], MOMENTOS[i] + 0.4) * (1 - rampa(t, fin, fin + 0.5)), rampa(t, 12.0, 12.6))
  return (
    <Entra en={MOMENTOS[i]} dur={0.8} style={{ position: 'absolute', left: x, top: 70, width: 540 }}>
      <div style={{ opacity: mezcla(0.4, 1, foco), transform: `scale(${mezcla(0.97, 1, foco)})` }}>
        <div style={{ textAlign: 'center' }}><Etiqueta>{titulo}</Etiqueta></div>
        <div style={{ position: 'relative', marginTop: 24, width: 540, height: 600, borderRadius: 36, background: FONDO, overflow: 'hidden' }}>{children}</div>
      </div>
    </Entra>
  )
}
export const E07: React.FC = () => {
  const t = useT()
  const punto = rampa(t, 2.6, 3.2)
  return (
    <Escena>
      <Panel i={0} x={90} titulo="La víspera">
        <div style={{ position: 'absolute', left: 40, top: 60, width: 460, height: 400, borderRadius: 22, background: '#0B2A3A', padding: 14, boxSizing: 'border-box' }}>
          <div style={{ background: '#fff', borderRadius: 10, height: '100%', padding: '20px 22px', boxSizing: 'border-box' }}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Para la próxima tutoría</div>
            <ListaPreguntas size={15.5} />
            <div style={{ marginTop: 16, border: `2px solid ${VERDE}`, background: '#F1FBF8', borderRadius: 10, padding: '10px 14px', fontSize: 18, fontWeight: 600, display: 'flex', gap: 10, alignItems: 'center', opacity: punto, transform: `translateY(${(1 - punto) * 12}px) scale(${mezcla(0.96, 1, punto)})` }}>
              <span style={{ color: VERDE_OSCURO, fontSize: 24, lineHeight: 1 }}>+</span> Dudas con la muestra
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 10, top: 460, width: 520, height: 22, borderRadius: '4px 4px 16px 16px', background: '#AEBFC8' }} />
      </Panel>
      <Panel i={1} x={690} titulo="En la tutoría">
        <div style={{ position: 'absolute', left: 170, top: 30, transform: `rotate(${Math.sin(t * 1.7) * 2.5}deg)` }}><DesdeArriba quien="tutor" size={200} giro={180} /></div>
        <div style={{ position: 'absolute', left: 80, top: 170, width: 380, height: 260, borderRadius: 36, background: '#fff', border: `1px solid ${BORDE}`, boxShadow: '0 20px 40px -20px rgba(10,74,108,0.3)' }}>
          <div style={{ position: 'absolute', left: 40, top: 40, width: 130, height: 170, borderRadius: 8, background: FONDO, border: `1px solid ${BORDE}`, transform: 'rotate(-6deg)', padding: 14, boxSizing: 'border-box' }}>
            {[0, 1, 2].map((i) => <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}><span style={{ width: 16, height: 16, borderRadius: 16, background: t > 5.4 + i * 0.5 ? VERDE : '#C9D6DC' }} /><span style={{ flex: 1, height: 8, borderRadius: 8, background: '#C9D6DC' }} /></div>)}
          </div>
          <div style={{ position: 'absolute', right: 40, top: 70, width: 150, height: 104, borderRadius: 10, background: '#C9D6DC', transform: 'rotate(5deg)' }} />
        </div>
        <div style={{ position: 'absolute', left: 170, top: 380, transform: `rotate(${Math.sin(t * 1.3 + 1) * 2.5}deg)` }}><DesdeArriba quien="lucia" size={200} /></div>
      </Panel>
      <Panel i={2} x={1290} titulo="Al salir">
        <div style={{ position: 'absolute', left: 120, top: 36 }}><Movil w={300}><PantallaDespues si={toque(t, 9.4)} cuatro={toque(t, 10.8)} /></Movil></div>
      </Panel>
      <Caja x={90} y={790} w={540} style={{ textAlign: 'center' }}><Entra en={3.6}><Frase size={38}>Llega con lo que necesita decir.</Frase></Entra></Caja>
      <Caja x={1290} y={790} w={540} style={{ textAlign: 'center' }}><Entra en={9.0}><Frase size={38}>Dos toques al salir.</Frase></Entra></Caja>
    </Escena>
  )
}

// 8. Acompañar sin vigilar: quién ve cada cosa (según la aplicación real).
type Celda = 'si' | 'no' | 'grupo'
const FILAS: { dato: string; celdas: [Celda, Celda, Celda]; de: number; a: number }[] = [
  { dato: 'Lo que Lucía responde sobre su trabajo', celdas: ['si', 'no', 'no'], de: 5.3, a: 7.6 },
  { dato: 'Cómo se siente', celdas: ['si', 'no', 'no'], de: 15.5, a: 99 },
  { dato: 'Las tres preguntas para la tutoría', celdas: ['si', 'si', 'no'], de: 7.6, a: 10.0 },
  { dato: 'Cómo va el grupo', celdas: ['no', 'no', 'grupo'], de: 10.2, a: 15.2 },
]
const CeldaVista: React.FC<{ c: Celda; fuerte: number; crece: number }> = ({ c, fuerte, crece }) => (
  <div style={{ display: 'flex', justifyContent: 'center' }}>
    {c === 'si' ? <span style={{ width: 62, height: 62, borderRadius: 62, background: '#E0F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ojo size={34} /></span> : null}
    {c === 'no' ? <span style={{ width: 62, height: 62, borderRadius: 62, background: fuerte > 0.5 ? AZUL : '#EEF2F3', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + 0.18 * Math.sin(fuerte * Math.PI)})` }}><Candado size={32} color={fuerte > 0.5 ? '#fff' : GRIS_CLARO} /></span> : null}
    {c === 'grupo' ? (
      <svg width={96} height={62} viewBox="0 0 96 62">{[30, 46, 22, 54, 38].map((h, i) => <rect key={i} x={4 + i * 19} y={60 - h * crece} width="13" height={h * crece} rx="5" fill={i === 3 ? VERDE : PIZARRA} />)}</svg>
    ) : null}
  </div>
)
export const E08: React.FC = () => {
  const t = useT()
  const cols = '1fr 170px 170px 210px'
  return (
    <Escena fondo={FONDO}>
      <Caja x={90} y={140} w={1130}>
        <Entra en={0.3}><Tarjeta style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', background: '#fff', padding: '22px 30px', fontSize: 27, fontWeight: 700, textAlign: 'center', borderBottom: `1px solid ${BORDE}` }}>
            <span style={{ textAlign: 'left', color: GRIS, fontWeight: 600 }}>¿Quién lo ve?</span><span>Lucía</span><span>Su tutor</span><span>La dirección<br />del máster</span>
          </div>
          {FILAS.map((f, i) => {
            const activa = rampa(t, f.de, f.de + 0.35) * (1 - rampa(t, f.a, f.a + 0.35))
            const privada = i === 1
            return (
              <div key={f.dato} style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', padding: '24px 30px', borderBottom: `1px solid ${BORDE}`, background: `rgba(52,198,163,${0.13 * activa})`, boxShadow: `inset ${8 * activa}px 0 0 ${VERDE}`, opacity: rampa(t, 0.7 + i * 0.12, 1.2 + i * 0.12) }}>
                <span style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.2 }}>{f.dato}</span>
                {f.celdas.map((c, j) => <CeldaVista key={j} c={c} fuerte={privada ? rampa(t, 15.7 + j * 0.15, 16.2 + j * 0.15) : 0} crece={rampa(t, 10.6, 11.6)} />)}
              </div>
            )
          })}
        </Tarjeta></Entra>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}><Entra en={12.4}><Etiqueta style={{ fontSize: 26 }}><Punto color={VERDE} /> Grupos de 5 personas o más</Etiqueta></Entra></div>
      </Caja>
      <Caja x={1300} y={200} style={{ display: 'grid', gap: 44 }}>
        <Entra en={1.0} x={40} y={0}><Linea size={54}>Sin notas.</Linea></Entra>
        <Entra en={2.2} x={40} y={0}><Linea size={54}>Sin rankings.</Linea></Entra>
        <Entra en={3.4} x={40} y={0}><Linea size={54}>Sin subir tu trabajo.</Linea></Entra>
        <Entra en={15.5} x={40} y={0}><Linea size={54}>Tu bienestar,<br />solo para ti.</Linea></Entra>
        <Entra en={17.0} style={{ marginLeft: 38 }}><Etiqueta style={{ fontSize: 30, background: VERDE_OSCURO, color: '#fff', border: 'none', padding: '14px 28px' }}>Necesito apoyo</Etiqueta></Entra>
      </Caja>
    </Escena>
  )
}

// 9. Y además.
const HITOS = ['Propuesta', 'Marco teórico', 'Método', 'Resultados', 'Entrega']
const TARJETAS = [0.6, 3.0, 6.4]
const Extra: React.FC<{ i: number; x: number; pie: React.ReactNode; children: React.ReactNode; style?: React.CSSProperties }> = ({ i, x, pie, children, style }) => {
  const t = useT()
  const p = rampa(t, TARJETAS[i], TARJETAS[i] + 0.7)
  return (
    <Caja x={x} y={210} w={540}>
      <div style={{ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 120}px) rotate(${(1 - p) * (i - 1 || 1) * 5}deg)` }}>
        <Tarjeta style={{ padding: 36, height: 430, boxSizing: 'border-box', ...style }}>{children}</Tarjeta>
      </div>
      <Entra en={TARJETAS[i] + 0.5}><Frase size={36} style={{ marginTop: 34, textAlign: 'center' }}>{pie}</Frase></Entra>
    </Caja>
  )
}
export const E09: React.FC = () => {
  const t = useT()
  const hecho = rampa(t, 1.8, 2.2)
  const acuerdo = rampa(t, 4.6, 5.2)
  return (
    <Escena>
      <Caja x={0} y={90} w={1920} style={{ textAlign: 'center' }}><Entra en={0.2} style={{ display: 'inline-block' }}><Etiqueta style={{ fontSize: 32 }}>Y además</Etiqueta></Entra></Caja>
      <Extra i={0} x={90} pie="Hitos del TFM.">
        {HITOS.map((h, i) => {
          const ok = i === 0 || (i === 1 && hecho > 0)
          return (
            <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 20, height: 72, position: 'relative' }}>
              {i < 4 ? <span style={{ position: 'absolute', left: 19, top: 50, width: 6, height: 44, background: i < 1 && hecho > 0 ? VERDE : BORDE }} /> : null}
              <span style={{ width: 44, height: 44, borderRadius: 44, boxSizing: 'border-box', background: ok ? VERDE : '#fff', border: `5px solid ${ok ? VERDE : '#D5DEE2'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, transform: `scale(${i === 1 ? 1 + 0.2 * Math.sin(hecho * Math.PI) : 1})` }}>{ok ? <Visto size={24} color={AZUL} /> : null}</span>
              <span style={{ fontSize: 30, fontWeight: i === 1 ? 700 : 500, color: i < 2 ? AZUL : GRIS }}>{h}</span>
              {i === 1 ? <span style={{ fontSize: 20, fontWeight: 600, background: '#E0F5F0', padding: '4px 12px', borderRadius: 8, opacity: hecho }}>hecho</span> : null}
            </div>
          )
        })}
      </Extra>
      <Extra i={1} x={690} pie={<>Expectativas claras<br />desde el primer día.</>}>
        <div style={{ fontSize: 26, fontWeight: 600, color: GRIS }}>Comentarios a un borrador</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 24 }}>
          <div style={{ background: FONDO, borderRadius: 16, padding: 20 }}><div style={{ fontSize: 22, fontWeight: 600, display: 'flex', gap: 10, alignItems: 'center' }}><Punto color={COLOR_LUCIA} size={14} /> Lucía espera</div><div style={{ fontSize: 36, fontWeight: 700, marginTop: 10 }}>3 días</div></div>
          <div style={{ background: FONDO, borderRadius: 16, padding: 20 }}><div style={{ fontSize: 22, fontWeight: 600, display: 'flex', gap: 10, alignItems: 'center' }}><Punto color={COLOR_TUTOR} size={14} /> Su tutor</div><div style={{ fontSize: 36, fontWeight: 700, marginTop: 10 }}>2 semanas</div></div>
        </div>
        <div style={{ marginTop: 24, border: `3px solid ${VERDE}`, background: '#F1FBF8', borderRadius: 16, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: acuerdo, transform: `translateY(${(1 - acuerdo) * 14}px) scale(${mezcla(0.96, 1, acuerdo)})` }}>
          <span style={{ fontSize: 26, fontWeight: 600 }}>Acuerdo</span><span style={{ fontSize: 40, fontWeight: 700 }}>1 semana</span>
        </div>
      </Extra>
      <Extra i={2} x={1290} pie="Avisos de ayudas para seguir investigando, si te interesa." style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28 }}>
        <div style={{ width: 120, height: 120, borderRadius: 24, border: `1px solid ${BORDE}`, overflow: 'hidden', boxShadow: '0 12px 24px -12px rgba(10,74,108,0.3)', transformOrigin: '50% 0', transform: `rotate(${Math.sin((t - 7.2) * 9) * 7 * (1 - rampa(t, 7.2, 8.6))}deg)` }}>
          <div style={{ background: AZUL, height: 34 }} /><div style={{ fontSize: 54, fontWeight: 700, textAlign: 'center', lineHeight: '84px' }}>30</div>
        </div>
        <div style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.25 }}>Se acerca el plazo de las ayudas para el doctorado.</div>
      </Extra>
    </Escena>
  )
}

// 10. Cierre: las dos líneas avanzan juntas y forman el símbolo.
export const E10: React.FC = () => {
  const t = useT()
  const vertical = useVertical()
  const cabeza = rampa(t, 0.1, 1.2, VAIVEN)
  const calma = 1 - rampa(t, 0.5, 1.3, VAIVEN)
  const lineas = 1 - rampa(t, 1.3, 1.6)
  return (
    <Escena>
      <svg width={1920} height={1080} style={{ position: 'absolute' }} fill="none" strokeLinecap="round">
        <path d={onda(0, mezcla(0, 950, cabeza), 168, 26 * calma, 240, -t * 5)} stroke={COLOR_TUTOR} strokeWidth={12} opacity={lineas} />
        <path d={onda(0, mezcla(0, 830, cabeza), 372, 26 * calma, 240, -t * 5)} stroke={COLOR_LUCIA} strokeWidth={12} opacity={lineas} />
        <SimboloAnimado x={800} y={110} size={320} arriba={rampa(t, 1.3, 1.9)} abajo={rampa(t, 1.3, 1.9)} centro={rampa(t, 1.8, 2.3)} desdeArriba={-260} desdeAbajo={-260} />
      </svg>
      <Caja x={0} y={478} w={1920} style={{ textAlign: 'center' }}><Entra en={2.1} dur={0.8}><Nombre size={120} /></Entra></Caja>
      <Caja x={0} y={640} w={1920} style={{ textAlign: 'center' }}>
        <div style={{ width: 90 * rampa(t, 7.6, 8.2), height: 8, borderRadius: 8, background: VERDE, margin: '0 auto 30px' }} />
        <Entra en={7.8} dur={0.8}><Frase size={60} style={{ fontWeight: 500 }}>Acompañar sin vigilar.</Frase></Entra>
      </Caja>
      <Caja x={vertical ? 510 : 0} y={vertical ? 830 : 860} w={vertical ? 900 : 1920} style={{ textAlign: 'center', fontSize: vertical ? 36 : 26, lineHeight: 1.4, color: GRIS }}><Entra en={9.4}>Prototipo del Trabajo Fin de Máster de Fernando Martín Vaquero{vertical ? <br /> : ' · '}Universidad de Salamanca</Entra></Caja>
    </Escena>
  )
}
