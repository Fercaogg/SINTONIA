// Panel de la dirección (supresión de grupos de menos de 5) y exportaciones.

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { escenarioBasico, nuevaBd, registrar, type Bd, type Escenario } from './ayudantes'

let bd: Bd
let e: Escenario
const nuevos: { uid: string; pareja: string }[] = []

beforeAll(async () => {
  bd = await nuevaBd('fase6')
  e = await escenarioBasico(bd)
  await bd.rpc(e.investigador, 'configurar_estudio', { p_fecha_inicio: '2027-02-01', p_semanas: 10, p_dia_apertura: 1, p_dia_cierre: 7 })
  await bd.admin(`update public.parejas set created_at = '2027-01-15'`)
  // Seis estudiantes más con la misma tutora: 8 en el máster A, con 1 tutora.
  const codigos = await bd.rpc(e.investigador, 'crear_codigos', { p_master_id: e.master, p_rol: 'estudiante', p_cantidad: 6, p_tutor_id: e.tutor })
  for (const [i, codigo] of codigos.entries()) {
    const uid = await registrar(bd, `extra${i}@usal.es`, { codigo, nombre: `Extra ${i}` })
    const [{ id }] = await bd.admin(`select id from public.parejas where estudiante_id = $1`, [uid])
    await bd.admin(`update public.parejas set created_at = '2027-01-15' where id = $1`, [id])
    nuevos.push({ uid, pareja: id })
    // Semana 1: responden los seis (y la tutora sobre ellos).
    await bd.admin(`insert into public.respuestas_estudiante (pareja_id, semana, avance, siguiente_paso, apoyo) values ($1, 1, 3, 3, 4)`, [id])
    await bd.admin(`insert into public.bienestar (estudiante_id, semana, valor_cifrado) values ($1, 1, private.cifrar_bienestar(3))`, [uid])
    await bd.admin(`insert into public.respuestas_tutor (pareja_id, semana, avance, siguiente_paso) values ($1, 1, 2, 3)`, [id])
    // Semana 2: solo responden tres.
    if (i < 3) await bd.admin(`insert into public.respuestas_estudiante (pareja_id, semana, avance, siguiente_paso, apoyo) values ($1, 2, 4, 3, 4)`, [id])
  }
  bd.ahora = '2027-02-17T10:00:00Z' // semana 3 abierta: las semanas 1 y 2 están cerradas
})

afterAll(async () => {
  await bd?.cerrar()
})

describe('Panel de la dirección', () => {
  it('solo la dirección puede verlo', async () => {
    for (const u of [e.tutor, e.estudianteA, e.investigador]) {
      await expect(bd.rpc(u, 'resumen_direccion')).rejects.toThrow(/No tienes permiso/)
    }
  })

  it('muestra las cifras calculadas sobre 5 personas o más', async () => {
    const r = await bd.rpc(e.direccion, 'resumen_direccion')
    expect(r.minimo).toBe(5)
    const s1 = r.semanas[0]
    expect(s1.semana).toBe(1)
    expect(s1.estudiantes).toEqual({ valor: 8, suprimida: false })
    expect(s1.tasa_estudiantes).toEqual({ valor: 1, suprimida: false })
    expect(s1.avance_estudiantes.suprimida).toBe(false)
    expect(s1.desajuste_medio.suprimida).toBe(false)
  })

  it('no muestra ninguna cifra calculada sobre menos de 5 personas', async () => {
    const r = await bd.rpc(e.direccion, 'resumen_direccion')
    const [s1, s2] = r.semanas
    // Una sola tutora: nada calculado sobre tutores.
    expect(s1.tasa_tutores).toEqual({ valor: null, suprimida: true })
    expect(s1.avance_tutores).toEqual({ valor: null, suprimida: true })
    // Semana 2: solo respondieron 3 estudiantes (la tasa sí, porque se calcula sobre 8).
    expect(s2.tasa_estudiantes).toEqual({ valor: 0.38, suprimida: false })
    expect(s2.avance_estudiantes).toEqual({ valor: null, suprimida: true })
    expect(s2.desajuste_medio).toEqual({ valor: null, suprimida: true })
  })

  it('una cifra suprimida no revela cuántas personas había', async () => {
    const r = await bd.rpc(e.direccion, 'resumen_direccion')
    expect(Object.keys(r.semanas[1].avance_estudiantes).sort()).toEqual(['suprimida', 'valor'])
  })

  it('no contiene seudónimos, nombres ni bienestar', async () => {
    const texto = JSON.stringify(await bd.rpc(e.direccion, 'resumen_direccion'))
    expect(texto).not.toMatch(/[EPT]-[A-Z2-9]{6}|bienestar|Ana|Bruno|Extra|@/)
  })

  it('las semanas que no han terminado no aparecen', async () => {
    const r = await bd.rpc(e.direccion, 'resumen_direccion')
    expect(r.semanas.map((s: any) => s.semana)).toEqual([1, 2])
  })

  it('el mínimo se puede subir: con 10, nada sobre 8 estudiantes se muestra', async () => {
    await bd.admin(`update public.configuracion set valor = '10' where clave = 'minimo_anonimato'`)
    const r = await bd.rpc(e.direccion, 'resumen_direccion')
    expect(r.semanas[0].estudiantes.suprimida).toBe(true)
    expect(r.semanas[0].tasa_estudiantes.suprimida).toBe(true)
    await bd.admin(`update public.configuracion set valor = '5' where clave = 'minimo_anonimato'`)
  })

  it('quien se retira deja de contar desde ese momento', async () => {
    await bd.admin(`update public.perfiles set retirado_at = '2027-02-10' where user_id = $1`, [nuevos[5].uid])
    const r = await bd.rpc(e.direccion, 'resumen_direccion')
    expect(r.semanas[0].estudiantes.valor).toBe(8)
    expect(r.semanas[1].estudiantes.valor).toBe(7)
    await bd.admin(`update public.perfiles set retirado_at = null where user_id = $1`, [nuevos[5].uid])
  })
})

describe('Exportación para la investigación', () => {
  it('solo el investigador puede exportar', async () => {
    for (const u of [e.direccion, e.tutor, e.estudianteA]) {
      await expect(bd.rpc(u, 'exportar_investigacion')).rejects.toThrow(/No tienes permiso/)
      await expect(bd.rpc(u, 'exportar_cuestionarios')).rejects.toThrow(/No tienes permiso/)
    }
  })

  it('una fila por pareja y semana iniciada, con códigos seudónimos', async () => {
    const filas = await bd.rpc(e.investigador, 'exportar_investigacion')
    const parejas = (await bd.admin(`select count(*)::int as n from public.parejas`))[0].n
    expect(filas).toHaveLength(parejas * 3)
    expect(filas[0].id_pareja).toMatch(/^P-/)
    expect(filas[0].id_estudiante).toMatch(/^E-/)
    expect(new Set(filas.map((f: any) => `${f.id_pareja}:${f.semana}`)).size).toBe(filas.length)
  })

  it('incluye el bienestar (solo aquí) y ningún nombre ni correo', async () => {
    const filas = await bd.rpc(e.investigador, 'exportar_investigacion')
    const deA = filas.find((f: any) => f.semana === 1 && f.est_avance === 4 && f.est_bienestar === 2)
    expect(deA).toBeTruthy()
    expect(JSON.stringify(filas)).not.toMatch(/Ana|Bruno|Extra|Tutora|@usal/)
  })

  it('sin datos, las columnas quedan vacías (y se exportan igualmente)', async () => {
    const filas = await bd.rpc(e.investigador, 'exportar_investigacion')
    const s3 = filas.find((f: any) => f.semana === 3)
    expect(s3.est_avance).toBeNull()
    expect(s3.sorteo_resultado).toBeNull()
    expect(s3.agenda).toBeNull()
  })

  it('cada descarga queda registrada en la auditoría', async () => {
    const a = await bd.rpc(e.investigador, 'auditoria_reciente', { p_limite: 10 })
    expect(a.map((x: any) => x.accion)).toContain('exportacion_investigacion')
    expect(a[0].quien).toMatch(/^I-/)
    expect(JSON.stringify(a)).not.toContain('Investigador')
  })

  it('las respuestas a los cuestionarios se exportan por separado', async () => {
    const vars = await bd.rpc(e.investigador, 'variables_cuestionarios')
    expect(vars.pretest).toEqual(['escala_item_1', 'h3_orientacion_doctorado', 'conocimiento_1'])
    const filas = await bd.rpc(e.investigador, 'exportar_cuestionarios')
    expect(filas).toEqual([])
  })
})
