import { describe, expect, it } from 'vitest'
import { acceso, contacto, ipDe, MENSAJES, registro, type Dependencias } from './acceso-publico'
import type { Correo } from './correo'

function falsas(opciones: { autorizar?: boolean; errorEnlace?: string } = {}) {
  const intentos = new Map<string, number>()
  const enlaces: { email: string; crearCuenta: boolean; datos?: Record<string, string> }[] = []
  const correos: Correo[] = []
  const d: Dependencias = {
    async limitar(tipo, claves, limite) {
      let pasa = true
      for (const c of claves) {
        const n = (intentos.get(`${tipo}|${c}`) ?? 0) + 1
        intentos.set(`${tipo}|${c}`, n)
        if (n > limite) pasa = false
      }
      return pasa
    },
    async autorizarRegistro() {
      return { ok: opciones.autorizar ?? true }
    },
    async enviarEnlace(email, o) {
      if (opciones.errorEnlace) throw new Error(opciones.errorEnlace)
      enlaces.push({ email, ...o })
    },
    enviador: { nombre: 'prueba', enviar: async (c) => void correos.push(c) },
    correoContacto: 'contacto@usal.es',
  }
  return { d, enlaces, correos }
}

const REGISTRO = { codigo: 'abcd-efgh-jkmn', nombre: ' Ana ', email: 'Ana@USAL.es' }

describe('registro', () => {
  it('valida, normaliza y pide el enlace creando la cuenta', async () => {
    const { d, enlaces } = falsas()
    expect(await registro(REGISTRO, '1.1.1.1', d)).toEqual({ status: 200, cuerpo: { ok: true } })
    expect(enlaces).toEqual([{ email: 'ana@usal.es', crearCuenta: true, datos: { codigo: 'ABCDEFGHJKMN', nombre: 'Ana' } }])
  })

  it('un código o correo no válidos dan el mismo mensaje, sin pistas', async () => {
    const { d, enlaces } = falsas({ autorizar: false })
    const r = await registro(REGISTRO, '1.1.1.1', d)
    expect(r).toEqual({ status: 400, cuerpo: { ok: false, error: MENSAJES.registro } })
    expect((await registro({ ...REGISTRO, codigo: '¿?' }, '1.1.1.1', d)).cuerpo.error).toBe(MENSAJES.registro)
    expect(enlaces).toEqual([])
  })

  it('corta tras 5 intentos con el mismo correo o 10 desde la misma IP', async () => {
    const { d } = falsas({ autorizar: false })
    for (let i = 0; i < 5; i++) expect((await registro(REGISTRO, `2.2.2.${i}`, d)).status).toBe(400)
    expect(await registro(REGISTRO, '2.2.2.9', d)).toEqual({ status: 429, cuerpo: { ok: false, error: MENSAJES.demasiados } })
    for (let i = 0; i < 10; i++) await registro({ ...REGISTRO, email: `p${i}@usal.es` }, '3.3.3.3', d)
    expect((await registro({ ...REGISTRO, email: 'nuevo@usal.es' }, '3.3.3.3', d)).status).toBe(429)
  })

  it('si el campo trampa viene relleno, responde bien pero no hace nada', async () => {
    const { d, enlaces } = falsas()
    expect((await registro({ ...REGISTRO, sitio: 'https://spam' }, '1.1.1.1', d)).status).toBe(200)
    expect(enlaces).toEqual([])
  })

  it('rechaza datos con forma incorrecta', async () => {
    const { d } = falsas()
    expect((await registro({ ...REGISTRO, email: 'no-es-correo' }, '1.1.1.1', d)).cuerpo.error).toBe(MENSAJES.datos)
    expect((await registro({ ...REGISTRO, nombre: 'x'.repeat(200) }, '1.1.1.1', d)).status).toBe(400)
    expect((await registro(null, '1.1.1.1', d)).status).toBe(400)
  })
})

describe('acceso', () => {
  it('responde igual exista o no la cuenta', async () => {
    const existe = falsas()
    const noExiste = falsas({ errorEnlace: 'Signups not allowed for otp' })
    const a = await acceso({ email: 'ana@usal.es' }, '1.1.1.1', existe.d)
    const b = await acceso({ email: 'nadie@usal.es' }, '1.1.1.1', noExiste.d)
    expect(a).toEqual(b)
    expect(a).toEqual({ status: 200, cuerpo: { ok: true } })
    expect(existe.enlaces).toEqual([{ email: 'ana@usal.es', crearCuenta: false }])
  })

  it('si Supabase falla de verdad, lo dice sin detalles', async () => {
    const { d } = falsas({ errorEnlace: 'Email rate limit exceeded' })
    expect(await acceso({ email: 'ana@usal.es' }, '1.1.1.1', d)).toEqual({ status: 503, cuerpo: { ok: false, error: MENSAJES.servicio } })
  })

  it('corta tras 5 intentos con el mismo correo', async () => {
    const { d } = falsas()
    for (let i = 0; i < 5; i++) await acceso({ email: 'ana@usal.es' }, `9.9.9.${i}`, d)
    expect((await acceso({ email: 'ana@usal.es' }, '9.9.9.9', d)).status).toBe(429)
  })
})

describe('contacto', () => {
  const MENSAJE = { nombre: 'Lucía', email: 'lucia@ejemplo.es', mensaje: 'Me interesa el piloto para mi máster.' }

  it('envía el mensaje a la dirección de contacto', async () => {
    const { d, correos } = falsas()
    expect((await contacto(MENSAJE, '1.1.1.1', d)).status).toBe(200)
    expect(correos).toHaveLength(1)
    expect(correos[0].para).toBe('contacto@usal.es')
    expect(correos[0].texto).toContain('lucia@ejemplo.es')
  })

  it('ignora en silencio a los programas que rellenan el campo trampa', async () => {
    const { d, correos } = falsas()
    expect((await contacto({ ...MENSAJE, sitio: 'x' }, '1.1.1.1', d)).status).toBe(200)
    expect(correos).toEqual([])
  })

  it('como mucho 3 mensajes por correo en una hora', async () => {
    const { d, correos } = falsas()
    for (let i = 0; i < 3; i++) await contacto(MENSAJE, `4.4.4.${i}`, d)
    expect((await contacto(MENSAJE, '4.4.4.9', d)).status).toBe(429)
    expect(correos).toHaveLength(3)
  })

  it('exige un mensaje de al menos 10 caracteres', async () => {
    const { d } = falsas()
    expect((await contacto({ ...MENSAJE, mensaje: 'Hola' }, '1.1.1.1', d)).status).toBe(400)
  })
})

describe('ipDe', () => {
  it('toma la primera IP de x-forwarded-for', () => {
    expect(ipDe(new Request('https://x', { headers: { 'x-forwarded-for': '5.5.5.5, 10.0.0.1' } }))).toBe('5.5.5.5')
    expect(ipDe(new Request('https://x'))).toBe('desconocida')
  })
})
