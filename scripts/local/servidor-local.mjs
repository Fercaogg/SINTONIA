// Servidor local que imita la parte de Supabase que usa SINTONÍA.
//
// SOLO PARA DESARROLLO Y TESTS. En producción la aplicación habla con
// Supabase de verdad. Este servidor reproduce:
//   * /rest/v1/rpc/<funcion>  : llamadas a funciones de la base de datos,
//                               con el mismo mecanismo de permisos (RLS).
//   * /auth/v1/...            : acceso por enlace al correo y por contraseña.
// Los "correos" no se envían: el enlace se muestra en la consola.

import http from 'node:http'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import pg from 'pg'
import { urlDe } from './bd.mjs'

export const SECRETO_LOCAL = 'secreto-local-de-desarrollo-sintonia-no-usar-en-produccion'
export const CLAVE_ANON_LOCAL = jwt.sign({ role: 'anon', iss: 'sintonia-local' }, SECRETO_LOCAL)
// Clave de servidor local (equivale a la service_role de Supabase). Solo para desarrollo.
export const CLAVE_SERVIDOR_LOCAL = jwt.sign({ role: 'service_role', iss: 'sintonia-local' }, SECRETO_LOCAL)
export const PUERTO_LOCAL = Number(process.env.LOCAL_API_PORT || 54321)

const DURACION = 3600

export function crearServidor({ baseDeDatos = 'sintonia_local', urlApp = 'http://localhost:5173', silencioso = false } = {}) {
  const pool = new pg.Pool({ connectionString: urlDe(baseDeDatos), max: 8 })
  const enlaces = new Map() // token_hash -> { userId, email }
  const ultimos = new Map() // email -> url del último enlace
  const refrescos = new Map() // refresh_token -> userId
  const log = (...a) => { if (!silencioso) console.log(...a) }

  async function usuarioPorEmail(email) {
    const { rows } = await pool.query('select * from auth.users where lower(email) = lower($1)', [email])
    return rows[0]
  }

  async function usuarioPorId(id) {
    const { rows } = await pool.query('select * from auth.users where id = $1', [id])
    return rows[0]
  }

  function formatoUsuario(u) {
    return {
      id: u.id,
      aud: 'authenticated',
      role: 'authenticated',
      email: u.email,
      email_confirmed_at: u.email_confirmed_at,
      user_metadata: u.raw_user_meta_data || {},
      app_metadata: { provider: 'email' },
      created_at: u.created_at,
    }
  }

  async function sesion(u) {
    await pool.query('update auth.users set last_sign_in_at = now(), email_confirmed_at = coalesce(email_confirmed_at, now()) where id = $1', [u.id])
    const ahora = Math.floor(Date.now() / 1000)
    const access_token = jwt.sign(
      { sub: u.id, role: 'authenticated', aud: 'authenticated', email: u.email, iat: ahora, exp: ahora + DURACION },
      SECRETO_LOCAL,
    )
    const refresh_token = crypto.randomBytes(24).toString('hex')
    refrescos.set(refresh_token, u.id)
    return {
      access_token,
      token_type: 'bearer',
      expires_in: DURACION,
      expires_at: ahora + DURACION,
      refresh_token,
      user: formatoUsuario(await usuarioPorId(u.id)),
    }
  }

  function leerToken(req) {
    const h = req.headers.authorization || ''
    const token = h.startsWith('Bearer ') ? h.slice(7) : req.headers.apikey
    if (!token) return null
    try {
      return jwt.verify(token, SECRETO_LOCAL)
    } catch {
      return null
    }
  }

  async function leerCuerpo(req) {
    const trozos = []
    for await (const t of req) trozos.push(t)
    const texto = Buffer.concat(trozos).toString('utf8')
    return texto ? JSON.parse(texto) : {}
  }

  function responder(res, estado, cuerpo) {
    res.writeHead(estado, { 'Content-Type': 'application/json' })
    res.end(cuerpo === undefined ? '' : JSON.stringify(cuerpo))
  }

  function errorAuth(res, estado, mensaje, codigo) {
    responder(res, estado, { code: estado, error_code: codigo, msg: mensaje, message: mensaje })
  }

  async function rpc(req, res, funcion) {
    if (!/^[a-z_][a-z0-9_]*$/.test(funcion)) return responder(res, 404, { message: 'Función no encontrada' })
    const claims = leerToken(req)
    if (!claims) return responder(res, 401, { message: 'Falta la clave de acceso' })
    const args = await leerCuerpo(req)
    const claves = Object.keys(args)
    for (const k of claves) if (!/^[a-z_][a-z0-9_]*$/.test(k)) return responder(res, 400, { message: 'Parámetro no válido' })
    const lista = claves.map((k, i) => `${k} => $${i + 1}`).join(', ')
    const cliente = await pool.connect()
    try {
      await cliente.query('begin')
      const rol = ['authenticated', 'service_role'].includes(claims.role) ? claims.role : 'anon'
      await cliente.query(`set local role ${rol}`)
      await cliente.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify(claims)])
      const valores = claves.map((k) => (args[k] !== null && typeof args[k] === 'object' ? JSON.stringify(args[k]) : args[k]))
      const { rows } = await cliente.query(`select public.${funcion}(${lista}) as r`, valores)
      await cliente.query('commit')
      responder(res, 200, rows[0].r)
    } catch (e) {
      await cliente.query('rollback').catch(() => {})
      const estado = e.code === '42501' ? 403 : e.code === '42883' ? 404 : 400
      responder(res, estado, { code: e.code, message: e.message, hint: e.hint ?? null, details: e.detail ?? null })
    } finally {
      cliente.release()
    }
  }

  async function auth(req, res, ruta, url) {
    if (ruta === '/auth/v1/otp' && req.method === 'POST') {
      const { email, data, create_user } = await leerCuerpo(req)
      let u = await usuarioPorEmail(email)
      if (!u) {
        if (!create_user) return errorAuth(res, 422, 'Signups not allowed for otp', 'otp_disabled')
        try {
          const { rows } = await pool.query('insert into auth.users (email, raw_user_meta_data) values ($1, $2) returning *', [email, JSON.stringify(data || {})])
          u = rows[0]
        } catch (e) {
          return errorAuth(res, 500, 'Database error saving new user', 'unexpected_failure')
        }
      }
      const token_hash = crypto.randomBytes(20).toString('hex')
      enlaces.set(token_hash, { userId: u.id })
      const enlace = `${urlApp}/acceso/confirmar?token_hash=${token_hash}&type=email`
      ultimos.set(email.toLowerCase(), enlace)
      log(`\n[correo simulado] Para ${email}:\n  ${enlace}\n`)
      return responder(res, 200, {})
    }

    if (ruta === '/auth/v1/verify' && req.method === 'POST') {
      const { token_hash } = await leerCuerpo(req)
      const e = enlaces.get(token_hash)
      if (!e) return errorAuth(res, 403, 'Email link is invalid or has expired', 'otp_expired')
      enlaces.delete(token_hash)
      return responder(res, 200, await sesion(await usuarioPorId(e.userId)))
    }

    if (ruta === '/auth/v1/token' && req.method === 'POST') {
      const tipo = url.searchParams.get('grant_type')
      const cuerpo = await leerCuerpo(req)
      if (tipo === 'password') {
        const { rows } = await pool.query(
          `select * from auth.users where lower(email) = lower($1) and encrypted_password is not null
             and encrypted_password = extensions.crypt($2, encrypted_password)`,
          [cuerpo.email, cuerpo.password],
        )
        if (!rows[0]) return errorAuth(res, 400, 'Invalid login credentials', 'invalid_credentials')
        return responder(res, 200, await sesion(rows[0]))
      }
      if (tipo === 'refresh_token') {
        const userId = refrescos.get(cuerpo.refresh_token)
        if (!userId) return errorAuth(res, 400, 'Invalid Refresh Token', 'refresh_token_not_found')
        refrescos.delete(cuerpo.refresh_token)
        return responder(res, 200, await sesion(await usuarioPorId(userId)))
      }
      return errorAuth(res, 400, 'Grant no soportado', 'validation_failed')
    }

    if (ruta === '/auth/v1/user' && req.method === 'GET') {
      const claims = leerToken(req)
      if (!claims?.sub) return errorAuth(res, 401, 'Invalid JWT', 'bad_jwt')
      const u = await usuarioPorId(claims.sub)
      if (!u) return errorAuth(res, 404, 'User not found', 'user_not_found')
      return responder(res, 200, formatoUsuario(u))
    }

    if (ruta === '/auth/v1/logout' && req.method === 'POST') {
      res.writeHead(204)
      return res.end()
    }

    return errorAuth(res, 404, 'No disponible en el servidor local', 'not_found')
  }

  const servidor = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
    res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      return res.end()
    }
    const url = new URL(req.url, 'http://localhost')
    const ruta = url.pathname
    try {
      if (ruta.startsWith('/rest/v1/rpc/') && req.method === 'POST') return await rpc(req, res, ruta.slice('/rest/v1/rpc/'.length))
      if (ruta.startsWith('/auth/v1/')) return await auth(req, res, ruta, url)
      if (ruta === '/__local/ultimo-enlace') return responder(res, 200, { enlace: ultimos.get((url.searchParams.get('email') || '').toLowerCase()) ?? null })
      responder(res, 404, { message: 'El servidor local solo admite llamadas a funciones (rpc) y acceso.' })
    } catch (e) {
      responder(res, 500, { message: e.message })
    }
  })

  servidor.on('close', () => pool.end())
  return servidor
}

// Arranque desde la línea de órdenes: npm run local:servidor
if (import.meta.url === `file://${process.argv[1]}`) {
  const servidor = crearServidor({ baseDeDatos: process.env.LOCAL_BD || 'sintonia_local', urlApp: process.env.LOCAL_URL_APP || 'http://localhost:5173' })
  servidor.listen(PUERTO_LOCAL, () => {
    console.log(`Servidor local de SINTONÍA en http://localhost:${PUERTO_LOCAL}`)
    console.log('Los enlaces de acceso aparecerán aquí, en lugar de enviarse por correo.')
  })
}
