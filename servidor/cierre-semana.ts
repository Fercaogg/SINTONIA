/**
 * CIERRE DE SEMANA
 *
 * Se ejecuta en el servidor (una vez al día, ver vercel.json). Para cada
 * semana ya cerrada que aún no se haya procesado:
 *
 *   1. Lee los check-ins de cada pareja (solo códigos y números).
 *   2. Calcula los desajustes (logica/desajuste.ts).
 *   3. Hace el sorteo de cada pareja elegible y GUARDA desajustes y sorteos.
 *      Si la semana ya tenía sorteos, se respetan: un sorteo nunca se repite.
 *   4. Decide la línea de Puente al doctorado de cada pareja y la guarda
 *      (también si esa semana no hay agenda).
 *   5. Solo después, genera y guarda la agenda de las parejas que la reciben.
 *   6. Marca la semana como procesada.
 *
 * Si algo falla en el paso 4, los sorteos ya están guardados y la siguiente
 * ejecución completará las agendas que falten sin volver a sortear.
 */

import { calcularDesajustes, ITEMS, type Desajuste, type Regla, type RespuestaEstudiante, type SemanaPareja } from './logica/desajuste.js'
import { ALGORITMO_SORTEO, motivoNoElegible, nuevaSemilla, sortear, type MotivoNoElegible } from './logica/sorteo.js'
import { entradaParaModelo, seleccionarDelBanco, validarSalidaModelo, type PreguntaBanco } from './logica/agenda.js'
import { VERSION_PROMPT, type Redactor } from './logica/modelo.js'
import { decidirPuente, type Convocatoria, type DecisionPuente } from './logica/puente.js'

export interface SemanaPendiente {
  estudio_id: string
  semana: number
  semanas: number
  probabilidad: number
}

/** Respuesta de un tutor (principal o cotutor) en una semana. */
export interface RespuestaDeTutor {
  tutor_id: string
  principal: boolean
  avance: number
  siguiente_paso: number | null
}

export interface SemanaDatos {
  semana: number
  estudiante: RespuestaEstudiante | null
  tutores: RespuestaDeTutor[]
}

export interface DatosPareja {
  pareja_id: string
  sin_tutor: boolean
  retirado: boolean
  tiene_agenda: boolean
  semanas: SemanaDatos[]
  preguntas_previas: string[]
}

/** Las semanas de la pareja vistas desde un tutor concreto (para el módulo del desajuste). */
export function semanasConTutor(semanas: SemanaDatos[], tutorId: string): SemanaPareja[] {
  return semanas.map((s) => {
    const t = s.tutores.find((x) => x.tutor_id === tutorId)
    return { semana: s.semana, estudiante: s.estudiante, tutor: t ? { avance: t.avance, siguiente_paso: t.siguiente_paso } : null }
  })
}

/**
 * Con cotutoría, el desajuste se calcula con cada tutor. Para la agenda se
 * combina por ítem: cuenta el desajuste de mayor magnitud (y es relevante si
 * lo es con algún tutor). Así la agenda no depende de quién es cada tutor.
 */
export function combinarPorItem(porTutor: Desajuste[][]): Desajuste[] {
  const resultado: Desajuste[] = []
  for (const item of ITEMS) {
    const delItem = porTutor.flat().filter((d) => d.item === item)
    if (!delItem.length) continue
    const relevantes = delItem.filter((d) => d.relevante)
    const candidatos = relevantes.length ? relevantes : delItem
    resultado.push(candidatos.reduce((a, b) => (b.magnitud > a.magnitud ? b : a)))
  }
  return resultado
}

export interface DatosSemana {
  regla: Regla
  parejas: DatosPareja[]
  banco: PreguntaBanco[]
}

export interface FilaSorteo {
  pareja_id: string
  elegible: boolean
  motivo_no_elegible: MotivoNoElegible | null
  probabilidad: number | null
  semilla: string | null
  valor_aleatorio: number | null
  resultado: boolean | null
  algoritmo_version: string
  desajuste_relevante: boolean | null
}

export interface Agenda {
  preguntas: [string, string, string]
  origen: 'modelo' | 'banco'
  motivo_banco: 'sin_modelo' | 'error_modelo' | 'validacion' | null
  version_prompt: string | null
  modelo: string | null
  entrada_modelo: unknown
  linea_puente: string | null
}

/** Acceso a la base de datos que necesita el cierre (ver almacen-supabase.ts). */
export interface Almacen {
  semanasPorCerrar(): Promise<SemanaPendiente[]>
  datosSemana(estudioId: string, semana: number): Promise<DatosSemana>
  registrarSorteos(estudioId: string, semana: number, desajustes: unknown[], sorteos: FilaSorteo[]): Promise<{ pareja_id: string; resultado: boolean | null }[]>
  datosPuente(estudioId: string, semana: number): Promise<{ referencia: string; convocatorias: Convocatoria[]; parejas: { pareja_id: string; activado: boolean }[] }>
  registrarPuente(semana: number, filas: DecisionPuente[]): Promise<void>
  guardarAgenda(parejaId: string, semana: number, agenda: Agenda): Promise<void>
  completarCierre(estudioId: string, semana: number): Promise<void>
}

export async function generarAgenda(opciones: {
  desajustes: Desajuste[]
  semana: number
  semanas: number
  banco: PreguntaBanco[]
  previas: string[]
  semilla: string
  redactor: Redactor | null
}): Promise<Agenda> {
  const delBanco = (motivo: Agenda['motivo_banco'], entrada: unknown = null, modelo: string | null = null): Agenda => ({
    preguntas: seleccionarDelBanco(opciones),
    origen: 'banco',
    motivo_banco: motivo,
    version_prompt: entrada ? VERSION_PROMPT : null,
    modelo,
    entrada_modelo: entrada,
    linea_puente: null,
  })

  if (!opciones.redactor) return delBanco('sin_modelo')
  const entrada = entradaParaModelo(opciones.desajustes, opciones.semana, opciones.semanas)
  let salida: unknown
  try {
    salida = await opciones.redactor(entrada)
  } catch {
    return delBanco('error_modelo', entrada, opciones.redactor.modelo)
  }
  const v = validarSalidaModelo(salida)
  if (!v.ok) return delBanco('validacion', entrada, opciones.redactor.modelo)
  return {
    preguntas: v.preguntas,
    origen: 'modelo',
    motivo_banco: null,
    version_prompt: VERSION_PROMPT,
    modelo: opciones.redactor.modelo,
    entrada_modelo: entrada,
    linea_puente: null,
  }
}

export interface ResumenCierre {
  estudio_id: string
  semana: number
  parejas: number
  elegibles: number
  con_agenda: number
  agendas_generadas: number
}

export async function cerrarSemanas(opciones: {
  almacen: Almacen
  redactor: Redactor | null
  /** Solo para pruebas: fija la semilla en lugar de generarla al azar. */
  semilla?: () => string
}): Promise<ResumenCierre[]> {
  const { almacen, redactor } = opciones
  const resumen: ResumenCierre[] = []

  for (const pendiente of await almacen.semanasPorCerrar()) {
    const { estudio_id, semana, semanas, probabilidad } = pendiente
    const datos = await almacen.datosSemana(estudio_id, semana)
    const semilla = (opciones.semilla ?? nuevaSemilla)()

    // 1-3. Desajustes y sorteo, que se guardan antes de nada más.
    const desajustesPorPareja = new Map<string, Desajuste[]>()
    const filasDesajuste: unknown[] = []
    const sorteos: FilaSorteo[] = []
    for (const p of datos.parejas) {
      const actual = p.semanas.find((s) => s.semana === semana)
      // Elegible si respondieron el estudiante y al menos uno de sus tutores.
      const motivo = motivoNoElegible(
        actual ? { semana, estudiante: actual.estudiante, tutor: actual.tutores[0] ?? null } : undefined,
        { sinTutor: p.sin_tutor, retirado: p.retirado },
      )
      if (motivo) {
        sorteos.push({
          pareja_id: p.pareja_id, elegible: false, motivo_no_elegible: motivo, probabilidad: null, semilla: null,
          valor_aleatorio: null, resultado: null, algoritmo_version: ALGORITMO_SORTEO, desajuste_relevante: null,
        })
        continue
      }
      // El desajuste se calcula con cada tutor que respondió esa semana.
      const porTutor = actual!.tutores.map((t) => {
        const desajustes = calcularDesajustes(semanasConTutor(p.semanas, t.tutor_id), semana, datos.regla)
        for (const d of desajustes) {
          filasDesajuste.push({
            pareja_id: p.pareja_id, tutor_id: t.tutor_id, item: d.item, valor_estudiante: d.valorEstudiante, valor_tutor: d.valorTutor,
            diferencia: d.diferencia, relevante: d.relevante, motivo: d.motivo, regla_version: d.reglaVersion,
          })
        }
        return desajustes
      })
      const combinados = combinarPorItem(porTutor)
      desajustesPorPareja.set(p.pareja_id, combinados)
      const { valor, resultado } = sortear(semilla, p.pareja_id, semana, probabilidad)
      sorteos.push({
        pareja_id: p.pareja_id, elegible: true, motivo_no_elegible: null, probabilidad, semilla,
        valor_aleatorio: valor, resultado, algoritmo_version: ALGORITMO_SORTEO,
        desajuste_relevante: combinados.some((d) => d.relevante),
      })
    }
    // Lo que manda es lo guardado (si la semana ya se había sorteado, se respeta).
    const guardados = await almacen.registrarSorteos(estudio_id, semana, filasDesajuste, sorteos)

    // 4. Puente al doctorado (se registra para todas las parejas).
    const puente = await almacen.datosPuente(estudio_id, semana)
    const decisiones = decidirPuente(puente.parejas, puente.convocatorias, puente.referencia)
    await almacen.registrarPuente(semana, decisiones)
    const lineaDe = new Map(decisiones.map((d) => [d.pareja_id, d.linea]))

    // 5. Agendas, solo para las parejas con sorteo favorable guardado.
    let generadas = 0
    for (const g of guardados.filter((x) => x.resultado)) {
      const p = datos.parejas.find((x) => x.pareja_id === g.pareja_id)
      if (!p || p.tiene_agenda) continue
      const agenda = await generarAgenda({
        desajustes:
          desajustesPorPareja.get(p.pareja_id) ??
          combinarPorItem((p.semanas.find((x) => x.semana === semana)?.tutores ?? []).map((t) =>
            calcularDesajustes(semanasConTutor(p.semanas, t.tutor_id), semana, datos.regla))),
        semana, semanas, banco: datos.banco, previas: p.preguntas_previas, semilla: `${semilla}:${p.pareja_id}`, redactor,
      })
      agenda.linea_puente = lineaDe.get(p.pareja_id) ?? null
      await almacen.guardarAgenda(p.pareja_id, semana, agenda)
      generadas++
    }

    // 6. Semana procesada.
    await almacen.completarCierre(estudio_id, semana)
    resumen.push({
      estudio_id, semana,
      parejas: guardados.length,
      elegibles: sorteos.filter((s) => s.elegible).length,
      con_agenda: guardados.filter((g) => g.resultado).length,
      agendas_generadas: generadas,
    })
  }
  return resumen
}
