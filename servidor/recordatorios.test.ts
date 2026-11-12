import { describe, expect, it } from 'vitest'
import { enviadorDesdeEntorno, enviadorResend, type Correo } from './correo'
import {
  enviarRecordatorios, notificarAvisosApoyo, textoAvisoApoyo, textoCierre, textoRecordatorio,
  type AlmacenCorreos, type AvisoPorNotificar, type Recordatorio,
} from './recordatorios'

const URL_APP = 'https://sintonia.example'

const rec = (extra: Partial<Recordatorio> = {}): Recordatorio => ({
  user_id: 'u1', email: 'ana@usal.es', nombre: 'Ana López', rol: 'estudiante', tipo: 'apertura', semana: 3,
  cierra: '2027-02-21T23:00:00Z', ...extra,
})

describe('Textos de los correos', () => {
  it('la hora de cierre se escribe en hora de Madrid', () => {
    expect(textoCierre('2027-02-21T23:00:00Z')).toBe('domingo 21 de febrero a las 23:59')
  })

  it('recordatorio de apertura: breve, con enlace y forma de desactivarlo', () => {
    const { asunto, texto } = textoRecordatorio(rec(), URL_APP)
    expect(asunto).toBe('Ya puedes hacer el check-in de la semana 3')
    expect(texto).toContain('Hola, Ana:')
    expect(texto).toContain(`${URL_APP}/estudiante/checkin`)
    expect(texto).toContain('domingo 21 de febrero a las 23:59')
    expect(texto).toContain('puedes desactivarlos')
  })

  it('recordatorio de cierre: sin culpa ni presión', () => {
    const { texto } = textoRecordatorio(rec({ tipo: 'cierre_48h' }), URL_APP)
    expect(texto).toContain('Si esta semana no puedes, no pasa nada.')
    expect(texto.toLowerCase()).not.toMatch(/olvid|urgente|obligatori|debes|último aviso|recuerda que tienes que/)
  })

  it('el del tutor enlaza a su check-in', () => {
    expect(textoRecordatorio(rec({ rol: 'tutor' }), URL_APP).texto).toContain(`${URL_APP}/tutor/checkin`)
  })

  it('el aviso de apoyo solo incluye el nombre si se autorizó, y nunca datos', () => {
    const a: AvisoPorNotificar = { aviso_id: 'x', master: 'Máster A', nombre_autorizado: null, destinatarios: [] }
    expect(textoAvisoApoyo(a, URL_APP).texto).toContain('No ha querido compartir su nombre.')
    const b = textoAvisoApoyo({ ...a, nombre_autorizado: 'Bruno' }, URL_APP).texto
    expect(b).toContain('Ha decidido compartir su nombre: Bruno.')
    expect(b).toContain('no incluye ninguna respuesta')
  })

  it('ningún texto contiene rayas largas', () => {
    const todos = [textoRecordatorio(rec(), URL_APP), textoRecordatorio(rec({ tipo: 'cierre_48h' }), URL_APP)]
    for (const t of todos) expect(t.asunto + t.texto).not.toContain('—')
  })
})

function almacenFalso(recordatorios: Recordatorio[], avisos: AvisoPorNotificar[] = []) {
  const registrados: string[] = []
  const notificados: string[] = []
  const almacen: AlmacenCorreos = {
    recordatoriosPendientes: async () => recordatorios,
    avisosPorNotificar: async () => avisos,
    registrarCorreo: async (u, t, s, r) => { registrados.push(`${u}:${t}:${s}:${r}`) },
    avisoNotificado: async (id) => { notificados.push(id) },
  }
  return { almacen, registrados, notificados }
}

function enviadorFalso(fallaPara: string[] = []) {
  const enviados: Correo[] = []
  return {
    enviados,
    enviador: {
      nombre: 'falso',
      enviar: async (c: Correo) => {
        if (fallaPara.includes(c.para)) throw new Error('fallo')
        enviados.push(c)
      },
    },
  }
}

describe('Envío de recordatorios', () => {
  it('envía y registra cada recordatorio', async () => {
    const f = almacenFalso([rec(), rec({ user_id: 'u2', email: 'b@usal.es' })])
    const e = enviadorFalso()
    expect(await enviarRecordatorios(f.almacen, e.enviador, URL_APP)).toEqual({ enviados: 2, fallidos: 0 })
    expect(f.registrados).toEqual(['u1:apertura:3:null', 'u2:apertura:3:null'])
  })

  it('si un envío falla, no se registra (se reintentará) y sigue con los demás', async () => {
    const f = almacenFalso([rec(), rec({ user_id: 'u2', email: 'b@usal.es' })])
    const e = enviadorFalso(['ana@usal.es'])
    expect(await enviarRecordatorios(f.almacen, e.enviador, URL_APP)).toEqual({ enviados: 1, fallidos: 1 })
    expect(f.registrados).toEqual(['u2:apertura:3:null'])
  })

  it('sin proveedor de correo no hace nada', async () => {
    const f = almacenFalso([rec()])
    expect(await enviarRecordatorios(f.almacen, null, URL_APP)).toEqual({ enviados: 0, fallidos: 0 })
  })
})

describe('Avisos de apoyo a la dirección', () => {
  const aviso: AvisoPorNotificar = {
    aviso_id: 'av1', master: 'Máster A', nombre_autorizado: null,
    destinatarios: [{ user_id: 'd1', email: 'dir1@usal.es' }, { user_id: 'd2', email: 'dir2@usal.es' }],
  }

  it('avisa a todas las personas de dirección y marca el aviso como notificado', async () => {
    const f = almacenFalso([], [aviso])
    const e = enviadorFalso()
    await notificarAvisosApoyo(f.almacen, e.enviador, URL_APP)
    expect(e.enviados.map((c) => c.para)).toEqual(['dir1@usal.es', 'dir2@usal.es'])
    expect(f.notificados).toEqual(['av1'])
  })

  it('si falla algún envío, el aviso no se marca y se reintentará', async () => {
    const f = almacenFalso([], [aviso])
    await notificarAvisosApoyo(f.almacen, enviadorFalso(['dir2@usal.es']).enviador, URL_APP)
    expect(f.notificados).toEqual([])
  })

  it('si el máster no tiene dirección dada de alta, el aviso queda pendiente', async () => {
    const f = almacenFalso([], [{ ...aviso, destinatarios: [] }])
    await notificarAvisosApoyo(f.almacen, enviadorFalso().enviador, URL_APP)
    expect(f.notificados).toEqual([])
  })
})

describe('Proveedor de correo', () => {
  it('por defecto escribe en la consola (no envía)', () => {
    expect(enviadorDesdeEntorno({})?.nombre).toBe('consola')
  })

  it('"ninguno" desactiva los correos', () => {
    expect(enviadorDesdeEntorno({ CORREO_PROVEEDOR: 'ninguno' })).toBeNull()
  })

  it('Resend exige clave y remitente', () => {
    expect(() => enviadorDesdeEntorno({ CORREO_PROVEEDOR: 'resend' })).toThrow()
  })

  it('Resend envía la petición correcta', async () => {
    const peticiones: { url: string; init: RequestInit }[] = []
    const fetchFalso = (async (url: string, init: RequestInit) => {
      peticiones.push({ url, init })
      return new Response('{}', { status: 200 })
    }) as unknown as typeof fetch
    await enviadorResend('clave', 'SINTONÍA <s@x.es>', fetchFalso).enviar({ para: 'a@usal.es', asunto: 'A', texto: 'B' })
    expect(peticiones[0].url).toBe('https://api.resend.com/emails')
    expect(JSON.parse(String(peticiones[0].init.body))).toEqual({ from: 'SINTONÍA <s@x.es>', to: ['a@usal.es'], subject: 'A', text: 'B' })
  })
})
