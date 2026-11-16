import React from 'react'
import { AZUL, VERDE, VERDE_OSCURO, FONDO, BORDE, GRIS, GRIS_CLARO, FUENTE } from '../marca'
import { Nombre, Simbolo } from './Logo'
import { Candado, Visto } from './Base'

// Móvil con las pantallas de SINTONÍA, recreadas a partir de la aplicación real
// (mismos colores, tarjetas, botones del 1 al 5 y etiqueta "Solo lo ves tú").
const AN = 390
const AL = 800

export const Movil: React.FC<{ w: number; children: React.ReactNode; cabecera?: boolean; fondo?: string }> = ({ w, children, cabecera = true, fondo = FONDO }) => {
  const k = w / (AN + 28)
  return (
    <div style={{ width: w, height: (AL + 28) * k }}>
      <div style={{ width: AN + 28, height: AL + 28, transform: `scale(${k})`, transformOrigin: '0 0', background: '#0B2A3A', borderRadius: 58, padding: 14, boxSizing: 'border-box', boxShadow: '0 40px 80px -30px rgba(10,74,108,0.45)' }}>
        <div style={{ width: AN, height: AL, borderRadius: 46, overflow: 'hidden', background: fondo, position: 'relative', fontFamily: FUENTE }}>
          {cabecera ? (
            <div style={{ height: 76, background: '#fff', borderBottom: `1px solid ${BORDE}`, display: 'flex', alignItems: 'flex-end', padding: '0 22px 16px', gap: 18, boxSizing: 'border-box' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" stroke={AZUL} strokeWidth="2.2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
              <Nombre size={21} />
            </div>
          ) : null}
          {children}
          <div style={{ position: 'absolute', top: 10, left: AN / 2 - 46, width: 92, height: 24, borderRadius: 14, background: '#0B2A3A' }} />
        </div>
      </div>
    </div>
  )
}

export const Escala: React.FC<{ valor?: number; p?: number; anillo?: number; compacta?: boolean }> = ({ valor, p = 1, anillo = 0, compacta }) => {
  const t = compacta ? 42 : 58
  const alto = compacta ? 42 : 74
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const es = n === valor
        const sel = es && p > 0
        return (
          <div key={n} style={{ position: 'relative', width: t, height: alto, borderRadius: compacta ? 13 : 18, boxSizing: 'border-box', border: `2px solid ${sel ? VERDE_OSCURO : GRIS_CLARO}`, background: sel ? '#E6F7F2' : '#fff', color: AZUL, fontWeight: 600, fontSize: compacta ? 17 : 24, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${es ? 1 + 0.1 * p - 0.06 * anillo * (1 - p) : 1})`, boxShadow: sel ? `0 8px 18px rgba(52,198,163,${0.3 * p})` : undefined }}>
            {n}
            {es && anillo > 0 ? <span style={{ position: 'absolute', left: '50%', top: '50%', width: 62, height: 62, marginLeft: -31, marginTop: -31, borderRadius: 62, background: 'rgba(10,74,108,0.18)', border: '2px solid rgba(10,74,108,0.3)', opacity: anillo, transform: `scale(${1.35 - 0.35 * anillo})` }} /> : null}
          </div>
        )
      })}
    </div>
  )
}

const tarjeta: React.CSSProperties = { background: '#fff', border: `1px solid ${BORDE}`, borderRadius: 12, padding: 22, boxShadow: '0 10px 24px -14px rgba(10,74,108,0.25)' }
const titulo: React.CSSProperties = { fontSize: 30, fontWeight: 700, color: AZUL, letterSpacing: '-0.02em' }

export const PREGUNTAS = [
  { texto: '¿Cuánto has avanzado esta semana?', min: 'Nada', max: 'Mucho', valor: 4 },
  { texto: '¿Tienes claro tu siguiente paso?', min: 'Nada claro', max: 'Muy claro', valor: 4 },
  { texto: '¿Te sientes apoyada?', min: 'Nada', max: 'Mucho', valor: 3 },
  { texto: '¿Cómo estás tú esta semana?', min: 'Mal', max: 'Muy bien', valor: 2, privada: true },
]

export const PantallaPregunta: React.FC<{ n: number; sel?: number; anillo?: number }> = ({ n, sel = 1, anillo = 0 }) => {
  const p = PREGUNTAS[n - 1]
  const hechas = n - 1 + sel
  return (
    <div style={{ padding: '26px 20px' }}>
      <div style={titulo}>Semana 7</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, marginTop: 22, color: GRIS }}>
        <span style={{ fontWeight: 600, color: '#3A4A54' }}>Tu semana</span><span>{n} de 4</span>
      </div>
      <div style={{ height: 8, borderRadius: 8, background: '#E6EDEC', marginTop: 10, overflow: 'hidden' }}>
        <div style={{ width: `${(hechas / 4) * 100}%`, height: '100%', background: VERDE, borderRadius: 8 }} />
      </div>
      <div style={{ ...tarjeta, marginTop: 70, padding: '34px 18px 30px' }}>
        <div style={{ fontSize: 28, fontWeight: 600, color: AZUL, lineHeight: 1.25 }}>{p.texto}</div>
        {p.privada ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E0F5F0', color: AZUL, fontWeight: 600, fontSize: 15, padding: '7px 12px', borderRadius: 8, marginTop: 16 }}>
            <Candado size={17} /> Solo lo ves tú
          </div>
        ) : null}
        <div style={{ marginTop: 30 }}><Escala valor={p.valor} p={sel} anillo={anillo} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: GRIS, marginTop: 16 }}><span>{p.min}</span><span>{p.max}</span></div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 44, display: 'flex', justifyContent: 'center', gap: 10 }}>
        {[1, 2, 3, 4].map((i) => <span key={i} style={{ width: i === n ? 26 : 10, height: 10, borderRadius: 10, background: i === n ? AZUL : '#C9D6DC' }} />)}
      </div>
    </div>
  )
}

export const PantallaFinal: React.FC = () => (
  <div style={{ padding: '70px 30px', textAlign: 'center' }}>
    <div style={{ width: 96, height: 96, borderRadius: 96, background: '#DDF0EB', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Visto size={48} color={AZUL} /></div>
    <div style={{ ...titulo, fontSize: 40, marginTop: 30 }}>Listo.</div>
    <div style={{ fontSize: 21, color: GRIS, lineHeight: 1.45, marginTop: 18 }}>Tu tutor no ve tus respuestas.</div>
  </div>
)

export const PantallaAviso: React.FC<{ p?: number; pulsa?: number }> = ({ p = 1, pulsa = 0 }) => (
  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#0A4A6C 0%,#0D5E86 100%)', color: '#fff', padding: '90px 18px 0', textAlign: 'center' }}>
    <div style={{ fontSize: 19, opacity: 0.85 }}>lunes, 16 de noviembre</div>
    <div style={{ fontSize: 96, fontWeight: 300, lineHeight: 1.05, letterSpacing: '-0.02em' }}>8:15</div>
    <div style={{ background: '#fff', borderRadius: 22, padding: 16, marginTop: 60, display: 'flex', gap: 14, textAlign: 'left', boxShadow: '0 20px 40px -16px rgba(0,0,0,0.4)', opacity: p, transform: `translateY(${(1 - p) * -30}px) scale(${0.94 + 0.06 * p - 0.03 * pulsa})`, position: 'relative' }}>
      {pulsa > 0 ? <span style={{ position: 'absolute', left: '50%', top: '50%', width: 70, height: 70, margin: '-35px 0 0 -35px', borderRadius: 70, background: 'rgba(10,74,108,0.18)', border: '2px solid rgba(10,74,108,0.3)', opacity: pulsa }} /> : null}
      <div style={{ width: 50, height: 50, borderRadius: 13, background: FONDO, border: `1px solid ${BORDE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Simbolo size={36} /></div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><Nombre size={15} /><span style={{ fontSize: 13, color: GRIS_CLARO }}>ahora</span></div>
        <div style={{ fontSize: 18, color: AZUL, fontWeight: 600, lineHeight: 1.3, marginTop: 5 }}>¿Cómo va tu TFM esta semana? Un minuto.</div>
      </div>
    </div>
  </div>
)

export const ESTUDIANTES = [
  { nombre: 'Lucía Vega', valor: 2 },
  { nombre: 'Pablo Ibarra', valor: 4 },
  { nombre: 'Sara Llorente', valor: 3 },
  { nombre: 'Irene Montes', valor: 4 },
  { nombre: 'Hugo Marín', valor: 5 },
]

export const PantallaTutor: React.FC<{ toques?: { p: number; anillo: number }[]; enviar?: number }> = ({ toques, enviar = 0 }) => (
  <div style={{ padding: '20px 18px' }}>
    <div style={{ ...titulo, fontSize: 26 }}>Semana 7</div>
    <div style={{ fontSize: 14.5, color: GRIS, marginTop: 4 }}>¿Cuánto ha avanzado cada estudiante?</div>
    <div style={{ display: 'grid', gap: 9, marginTop: 14 }}>
      {ESTUDIANTES.map((e, i) => (
        <div key={e.nombre} style={{ ...tarjeta, padding: '11px 16px 13px' }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: AZUL, marginBottom: 9 }}>{e.nombre}</div>
          <Escala compacta valor={e.valor} p={toques ? toques[i].p : 1} anillo={toques ? toques[i].anillo : 0} />
        </div>
      ))}
    </div>
    <div style={{ marginTop: 14, background: enviar > 0.5 ? AZUL : VERDE_OSCURO, color: '#fff', fontWeight: 600, fontSize: 18, textAlign: 'center', padding: '14px 0', borderRadius: 8, transform: `scale(${1 - 0.03 * Math.sin(Math.min(enviar, 1) * Math.PI)})` }}>{enviar > 0.5 ? 'Enviado' : 'Enviar'}</div>
  </div>
)

export const TRES_PREGUNTAS = [
  '¿Qué parte del trabajo consideráis cerrada y cuál sigue abierta?',
  '¿Cuál es el próximo entregable y para cuándo?',
  '¿Hay algo que esté frenando el avance?',
]

export const ListaPreguntas: React.FC<{ size?: number; ver?: number[] }> = ({ size = 16.5, ver }) => (
  <div style={{ display: 'grid', gap: 14 }}>
    {TRES_PREGUNTAS.map((q, i) => (
      <div key={q} style={{ display: 'flex', gap: 12, opacity: ver ? ver[i] : 1, transform: `translateY(${ver ? (1 - ver[i]) * 10 : 0}px)` }}>
        <span style={{ width: 28, height: 28, borderRadius: 28, background: '#E0F5F0', color: AZUL, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
        <span style={{ fontSize: size, color: AZUL, lineHeight: 1.35 }}>{q}</span>
      </div>
    ))}
  </div>
)

export const PantallaAgenda: React.FC<{ punto?: boolean; quien?: 'estudiante' | 'tutor'; ver?: number[] }> = ({ punto, quien = 'estudiante', ver }) => (
  <div style={{ padding: '22px 18px' }}>
    <div style={{ ...tarjeta, padding: 20 }}>
      <div style={{ fontSize: 19, fontWeight: 700, color: AZUL }}>Para la próxima tutoría</div>
      <div style={{ fontSize: 14.5, color: GRIS, margin: '6px 0 18px', lineHeight: 1.4 }}>Tres preguntas para hablar juntos. {quien === 'estudiante' ? 'Tu tutor ve las mismas.' : 'Lucía ve las mismas.'}</div>
      <ListaPreguntas ver={ver} />
    </div>
    {punto ? (
      <div style={{ ...tarjeta, padding: 18, marginTop: 14, borderColor: VERDE }}>
        <div style={{ fontSize: 14.5, color: GRIS, fontWeight: 600 }}>Lo que yo quiero tratar</div>
        <div style={{ fontSize: 18, color: AZUL, fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}><Visto size={20} /> Dudas con la muestra</div>
      </div>
    ) : null}
  </div>
)

export const PantallaDespues: React.FC<{ si?: { p: number; anillo: number }; cuatro?: { p: number; anillo: number } }> = ({ si = { p: 1, anillo: 0 }, cuatro = { p: 1, anillo: 0 } }) => (
  <div style={{ padding: '26px 18px' }}>
    <div style={{ ...titulo, fontSize: 27 }}>Después de la tutoría</div>
    <div style={{ ...tarjeta, marginTop: 22 }}>
      <div style={{ fontSize: 21, fontWeight: 600, color: AZUL, lineHeight: 1.25 }}>¿Habéis hablado de las preguntas?</div>
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '13px 0', borderRadius: 14, border: `2px solid ${si.p > 0 ? VERDE_OSCURO : GRIS_CLARO}`, background: si.p > 0 ? '#E6F7F2' : '#fff', fontWeight: 600, fontSize: 19, color: AZUL, boxShadow: si.p > 0 ? '0 8px 18px rgba(52,198,163,0.3)' : undefined, transform: `scale(${1 - 0.05 * si.anillo * (1 - si.p)})` }}>Sí</div>
        <div style={{ flex: 1, textAlign: 'center', padding: '13px 0', borderRadius: 14, border: `2px solid ${GRIS_CLARO}`, background: '#fff', fontWeight: 600, fontSize: 19, color: AZUL }}>No</div>
      </div>
    </div>
    <div style={{ ...tarjeta, marginTop: 16 }}>
      <div style={{ fontSize: 21, fontWeight: 600, color: AZUL }}>¿Te ha servido?</div>
      <div style={{ marginTop: 22 }}><Escala valor={4} p={cuatro.p} anillo={cuatro.anillo} /></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: GRIS, marginTop: 14 }}><span>Nada</span><span>Mucho</span></div>
    </div>
  </div>
)
