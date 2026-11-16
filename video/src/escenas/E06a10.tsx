import React from 'react'
import { Escena, Caja, Tarjeta, Frase, Etiqueta, Punto, Linea, Candado, Visto, Ojo, onda, COLOR_LUCIA, COLOR_TUTOR } from '../componentes/Base'
import { Simbolo, Nombre } from '../componentes/Logo'
import { DesdeArriba } from '../componentes/Figuras'
import { Movil, PantallaAgenda, PantallaDespues, TRES_PREGUNTAS, ListaPreguntas } from '../componentes/Movil'
import { AZUL, VERDE, VERDE_OSCURO, FONDO, BORDE, GRIS, GRIS_CLARO, PIZARRA, TINTA } from '../marca'

// 6. Cuando las miradas no coinciden.
export const E06: React.FC<{ subtitulo?: string }> = ({ subtitulo }) => {
  const yDe = (v: number) => 400 - (v - 1) * 72 // altura de cada valor de la escala
  return (
    <Escena subtitulo={subtitulo}>
      <Caja x={70} y={96} w={350} style={{ textAlign: 'center' }}><Etiqueta><Punto color={COLOR_LUCIA} /> Lucía</Etiqueta></Caja>
      <Caja x={70} y={176}><Movil w={350}><PantallaAgenda /></Movil></Caja>
      <Caja x={1500} y={96} w={350} style={{ textAlign: 'center' }}><Etiqueta><Punto color={COLOR_TUTOR} /> Dr. Ruiz</Etiqueta></Caja>
      <Caja x={1500} y={176}><Movil w={350}><PantallaAgenda quien="tutor" /></Movil></Caja>
      {/* las dos líneas y el hueco entre ellas */}
      <svg width={920} height={380} viewBox="0 60 920 380" style={{ position: 'absolute', left: 500, top: 60 }}>
        {[1, 2, 3, 4, 5].map((v) => (
          <g key={v}><line x1="70" x2="900" y1={yDe(v)} y2={yDe(v)} stroke={BORDE} strokeWidth="3" strokeDasharray="4 10" />
            <text x="30" y={yDe(v) + 10} fontFamily="Fira Sans" fontSize="28" fontWeight="600" fill={GRIS_CLARO} textAnchor="middle">{v}</text></g>
        ))}
        <rect x="70" y={yDe(4)} width="830" height={yDe(2) - yDe(4)} fill={VERDE} opacity="0.2" rx="10" />
        <line x1="70" x2="900" y1={yDe(4)} y2={yDe(4)} stroke={COLOR_LUCIA} strokeWidth="14" strokeLinecap="round" />
        <line x1="70" x2="900" y1={yDe(2)} y2={yDe(2)} stroke={COLOR_TUTOR} strokeWidth="14" strokeLinecap="round" />
      </svg>
      <Caja x={620} y={105}><Etiqueta style={{ fontSize: 26 }}><Punto color={COLOR_LUCIA} /> Lucía ve su avance en un 4</Etiqueta></Caja>
      <Caja x={960} y={361}><Etiqueta style={{ fontSize: 26 }}><Punto color={COLOR_TUTOR} /> Su tutor lo ve en un 2</Etiqueta></Caja>
      {/* las tres preguntas */}
      {TRES_PREGUNTAS.map((q, i) => (
        <Caja key={q} x={520 + i * 18} y={[446, 572, 674][i]} w={850}>
          <Tarjeta style={{ padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 22, borderLeft: `10px solid ${VERDE}` }}>
            <span style={{ width: 48, height: 48, borderRadius: 48, background: '#E0F5F0', fontWeight: 700, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
            <span style={{ fontSize: 29, fontWeight: 600, lineHeight: 1.25 }}>{q}</span>
          </Tarjeta>
        </Caja>
      ))}
      <Caja x={420} y={796} w={1080} style={{ textAlign: 'center' }}><Frase size={44}>Las mismas tres preguntas.<br />Para los dos. Sin culpables.</Frase></Caja>
    </Escena>
  )
}

// 7. Antes y después de la tutoría.
const Panel: React.FC<{ x: number; titulo: string; children: React.ReactNode }> = ({ x, titulo, children }) => (
  <>
    <Caja x={x} y={70} w={540} style={{ textAlign: 'center' }}><Etiqueta>{titulo}</Etiqueta></Caja>
    <Caja x={x} y={150} w={540} h={600} style={{ borderRadius: 36, background: FONDO, overflow: 'hidden' }}>{children}</Caja>
  </>
)
export const E07: React.FC<{ subtitulo?: string }> = ({ subtitulo }) => (
  <Escena subtitulo={subtitulo}>
    <Panel x={90} titulo="La víspera">
      {/* portátil con las preguntas y el punto que añade Lucía */}
      <div style={{ position: 'absolute', left: 40, top: 60, width: 460, height: 400, borderRadius: 22, background: '#0B2A3A', padding: 14, boxSizing: 'border-box' }}>
        <div style={{ background: '#fff', borderRadius: 10, height: '100%', padding: '20px 22px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Para la próxima tutoría</div>
          <ListaPreguntas size={15.5} />
          <div style={{ marginTop: 16, border: `2px solid ${VERDE}`, background: '#F1FBF8', borderRadius: 10, padding: '10px 14px', fontSize: 18, fontWeight: 600, display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ color: VERDE_OSCURO, fontSize: 24, lineHeight: 1 }}>+</span> Dudas con la muestra
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 10, top: 460, width: 520, height: 22, borderRadius: '4px 4px 16px 16px', background: '#AEBFC8' }} />
    </Panel>
    <Panel x={690} titulo="En la tutoría">
      <div style={{ position: 'absolute', left: 170, top: 30 }}><DesdeArriba quien="tutor" size={200} giro={180} /></div>
      <div style={{ position: 'absolute', left: 80, top: 170, width: 380, height: 260, borderRadius: 36, background: '#fff', border: `1px solid ${BORDE}`, boxShadow: '0 20px 40px -20px rgba(10,74,108,0.3)' }}>
        <div style={{ position: 'absolute', left: 40, top: 40, width: 130, height: 170, borderRadius: 8, background: FONDO, border: `1px solid ${BORDE}`, transform: 'rotate(-6deg)', padding: 14, boxSizing: 'border-box' }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}><span style={{ width: 16, height: 16, borderRadius: 16, background: VERDE }} /><span style={{ flex: 1, height: 8, borderRadius: 8, background: '#C9D6DC' }} /></div>)}
        </div>
        <div style={{ position: 'absolute', right: 40, top: 70, width: 150, height: 104, borderRadius: 10, background: '#C9D6DC', transform: 'rotate(5deg)' }} />
      </div>
      <div style={{ position: 'absolute', left: 170, top: 380 }}><DesdeArriba quien="lucia" size={200} /></div>
    </Panel>
    <Panel x={1290} titulo="Al salir">
      <div style={{ position: 'absolute', left: 120, top: 36 }}><Movil w={300}><PantallaDespues /></Movil></div>
    </Panel>
    <Caja x={90} y={790} w={540} style={{ textAlign: 'center' }}><Frase size={38}>Llega con lo que necesita decir.</Frase></Caja>
    <Caja x={1290} y={790} w={540} style={{ textAlign: 'center' }}><Frase size={38}>Dos toques al salir.</Frase></Caja>
  </Escena>
)

// 8. Acompañar sin vigilar: quién ve cada cosa (según la aplicación real).
type Celda = 'si' | 'no' | 'grupo'
const FILAS: { dato: string; celdas: [Celda, Celda, Celda]; privada?: boolean }[] = [
  { dato: 'Lo que Lucía responde sobre su trabajo', celdas: ['si', 'no', 'no'] },
  { dato: 'Cómo se siente', celdas: ['si', 'no', 'no'], privada: true },
  { dato: 'Las tres preguntas para la tutoría', celdas: ['si', 'si', 'no'] },
  { dato: 'Cómo va el grupo', celdas: ['no', 'no', 'grupo'] },
]
const CeldaVista: React.FC<{ c: Celda; fuerte?: boolean }> = ({ c, fuerte }) => (
  <div style={{ display: 'flex', justifyContent: 'center' }}>
    {c === 'si' ? <span style={{ width: 62, height: 62, borderRadius: 62, background: '#E0F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ojo size={34} /></span> : null}
    {c === 'no' ? <span style={{ width: 62, height: 62, borderRadius: 62, background: fuerte ? AZUL : '#EEF2F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Candado size={32} color={fuerte ? '#fff' : GRIS_CLARO} /></span> : null}
    {c === 'grupo' ? (
      <svg width={96} height={62} viewBox="0 0 96 62">{[30, 46, 22, 54, 38].map((h, i) => <rect key={i} x={4 + i * 19} y={60 - h} width="13" height={h} rx="5" fill={i === 3 ? VERDE : PIZARRA} />)}</svg>
    ) : null}
  </div>
)
export const E08: React.FC<{ subtitulo?: string }> = ({ subtitulo }) => {
  const cols = '1fr 170px 170px 210px'
  return (
    <Escena subtitulo={subtitulo} fondo={FONDO}>
      <Caja x={90} y={140} w={1130}>
        <Tarjeta style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', background: '#fff', padding: '22px 30px', fontSize: 27, fontWeight: 700, textAlign: 'center', borderBottom: `1px solid ${BORDE}` }}>
            <span style={{ textAlign: 'left', color: GRIS, fontWeight: 600 }}>¿Quién lo ve?</span><span>Lucía</span><span>Su tutor</span><span>La dirección<br />del máster</span>
          </div>
          {FILAS.map((f) => (
            <div key={f.dato} style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', padding: '24px 30px', borderBottom: `1px solid ${BORDE}`, background: f.privada ? '#EAF8F4' : '#fff', boxShadow: f.privada ? `inset 8px 0 0 ${VERDE}` : undefined }}>
              <span style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.2 }}>{f.dato}</span>
              {f.celdas.map((c, i) => <CeldaVista key={i} c={c} fuerte={f.privada} />)}
            </div>
          ))}
        </Tarjeta>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}><Etiqueta style={{ fontSize: 26 }}><Punto color={VERDE} /> Grupos de 5 personas o más</Etiqueta></div>
      </Caja>
      <Caja x={1300} y={200} style={{ display: 'grid', gap: 44 }}>
        <Linea size={54}>Sin notas.</Linea>
        <Linea size={54}>Sin rankings.</Linea>
        <Linea size={54}>Sin subir tu trabajo.</Linea>
        <Linea size={54}>Tu bienestar,<br />solo para ti.</Linea>
      </Caja>
    </Escena>
  )
}

// 9. Y además.
const HITOS = ['Propuesta', 'Marco teórico', 'Método', 'Resultados', 'Entrega']
export const E09: React.FC<{ subtitulo?: string }> = ({ subtitulo }) => (
  <Escena subtitulo={subtitulo}>
    <Caja x={0} y={90} w={1920} style={{ textAlign: 'center' }}><Etiqueta style={{ fontSize: 32 }}>Y además</Etiqueta></Caja>
    <Caja x={90} y={210} w={540}>
      <Tarjeta style={{ padding: 36, height: 430, boxSizing: 'border-box' }}>
        {HITOS.map((h, i) => (
          <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 20, height: 72, position: 'relative' }}>
            {i < 4 ? <span style={{ position: 'absolute', left: 19, top: 50, width: 6, height: 44, background: i < 1 ? VERDE : BORDE }} /> : null}
            <span style={{ width: 44, height: 44, borderRadius: 44, boxSizing: 'border-box', background: i < 2 ? VERDE : '#fff', border: `5px solid ${i < 2 ? VERDE : '#D5DEE2'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>{i < 2 ? <Visto size={24} color={AZUL} /> : null}</span>
            <span style={{ fontSize: 30, fontWeight: i === 1 ? 700 : 500, color: i < 2 ? AZUL : GRIS }}>{h}</span>
            {i === 1 ? <span style={{ fontSize: 20, fontWeight: 600, background: '#E0F5F0', padding: '4px 12px', borderRadius: 8 }}>hecho</span> : null}
          </div>
        ))}
      </Tarjeta>
      <Frase size={36} style={{ marginTop: 34, textAlign: 'center' }}>Hitos del TFM.</Frase>
    </Caja>
    <Caja x={690} y={210} w={540}>
      <Tarjeta style={{ padding: 36, height: 430, boxSizing: 'border-box' }}>
        <div style={{ fontSize: 26, fontWeight: 600, color: GRIS }}>Comentarios a un borrador</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 24 }}>
          <div style={{ background: FONDO, borderRadius: 16, padding: 20 }}><div style={{ fontSize: 22, fontWeight: 600, display: 'flex', gap: 10, alignItems: 'center' }}><Punto color={COLOR_LUCIA} size={14} /> Lucía espera</div><div style={{ fontSize: 36, fontWeight: 700, marginTop: 10 }}>3 días</div></div>
          <div style={{ background: FONDO, borderRadius: 16, padding: 20 }}><div style={{ fontSize: 22, fontWeight: 600, display: 'flex', gap: 10, alignItems: 'center' }}><Punto color={COLOR_TUTOR} size={14} /> Su tutor</div><div style={{ fontSize: 36, fontWeight: 700, marginTop: 10 }}>2 semanas</div></div>
        </div>
        <div style={{ marginTop: 24, border: `3px solid ${VERDE}`, background: '#F1FBF8', borderRadius: 16, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 26, fontWeight: 600 }}>Acuerdo</span><span style={{ fontSize: 40, fontWeight: 700 }}>1 semana</span>
        </div>
      </Tarjeta>
      <Frase size={36} style={{ marginTop: 34, textAlign: 'center' }}>Expectativas claras<br />desde el primer día.</Frase>
    </Caja>
    <Caja x={1290} y={210} w={540}>
      <Tarjeta style={{ padding: 36, height: 430, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28 }}>
        <div style={{ width: 120, height: 120, borderRadius: 24, border: `1px solid ${BORDE}`, overflow: 'hidden', boxShadow: '0 12px 24px -12px rgba(10,74,108,0.3)' }}>
          <div style={{ background: AZUL, height: 34 }} /><div style={{ fontSize: 54, fontWeight: 700, textAlign: 'center', lineHeight: '84px' }}>30</div>
        </div>
        <div style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.25 }}>Se acerca el plazo de las ayudas para el doctorado.</div>
      </Tarjeta>
      <Frase size={36} style={{ marginTop: 34, textAlign: 'center' }}>Avisos de ayudas para seguir investigando, si te interesa.</Frase>
    </Caja>
  </Escena>
)

// 10. Cierre.
export const E10: React.FC<{ subtitulo?: string }> = ({ subtitulo }) => (
  <Escena subtitulo={subtitulo}>
    <svg width={1920} height={1080} style={{ position: 'absolute' }} fill="none" strokeLinecap="round">
      <path d={onda(0, 740, 300, 0, 300, 0)} stroke={COLOR_LUCIA} strokeWidth={12} opacity={0.22} />
      <path d={onda(0, 740, 340, 0, 300, 0)} stroke={COLOR_TUTOR} strokeWidth={12} opacity={0.3} />
    </svg>
    <Caja x={800} y={110}><Simbolo size={320} /></Caja>
    <Caja x={0} y={478} w={1920} style={{ textAlign: 'center' }}><Nombre size={120} /></Caja>
    <Caja x={0} y={640} w={1920} style={{ textAlign: 'center' }}>
      <div style={{ width: 90, height: 8, borderRadius: 8, background: VERDE, margin: '0 auto 30px' }} />
      <Frase size={60} style={{ fontWeight: 500 }}>Acompañar sin vigilar.</Frase>
    </Caja>
    <Caja x={0} y={860} w={1920} style={{ textAlign: 'center', fontSize: 26, color: GRIS }}>Prototipo del Trabajo Fin de Máster de Fernando Martín Vaquero · Universidad de Salamanca</Caja>
  </Escena>
)
