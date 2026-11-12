// Conversión de los datos exportados a CSV, listo para R, SPSS o una hoja de
// cálculo: separado por comas, con comillas cuando hace falta, UTF-8, punto
// decimal y "NA" para los valores que faltan.

export type Fila = Record<string, unknown>

function celda(valor: unknown): string {
  if (valor === null || valor === undefined || valor === '') return 'NA'
  if (typeof valor === 'boolean') return valor ? '1' : '0'
  if (typeof valor === 'number') return Number.isFinite(valor) ? String(valor) : 'NA'
  const texto = typeof valor === 'object' ? JSON.stringify(valor) : String(valor)
  return /[",\n\r]/.test(texto) || texto === 'NA' ? `"${texto.replace(/"/g, '""')}"` : texto
}

export function aCsv(filas: Fila[], columnas?: string[]): string {
  const cols = columnas ?? [...new Set(filas.flatMap((f) => Object.keys(f)))]
  const lineas = [cols.join(','), ...filas.map((f) => cols.map((c) => celda(f[c])).join(','))]
  return lineas.join('\n') + '\n'
}

export interface RespuestaCuestionario {
  id_estudiante: string
  id_pareja: string | null
  master: string | null
  cuestionario: string
  variable: string
  valor: unknown
  respondido_at: string
}

/**
 * Pasa las respuestas de un cuestionario de formato largo (una fila por ítem)
 * a formato ancho (una fila por estudiante, una columna por variable).
 */
export function pivotarCuestionario(respuestas: RespuestaCuestionario[], cuestionario: string, variables: string[]): Fila[] {
  const porPersona = new Map<string, Fila>()
  for (const r of respuestas.filter((x) => x.cuestionario === cuestionario)) {
    let fila = porPersona.get(r.id_estudiante)
    if (!fila) {
      fila = { id_estudiante: r.id_estudiante, id_pareja: r.id_pareja, master: r.master, cuestionario, respondido_at: r.respondido_at }
      porPersona.set(r.id_estudiante, fila)
    }
    fila[r.variable] = r.valor
    if (r.respondido_at > String(fila.respondido_at)) fila.respondido_at = r.respondido_at
  }
  return [...porPersona.values()].map((f) => {
    const completa: Fila = { id_estudiante: f.id_estudiante, id_pareja: f.id_pareja, master: f.master, cuestionario, respondido_at: f.respondido_at }
    for (const v of variables) completa[v] = f[v] ?? null
    return completa
  })
}

/** Descarga un texto como archivo desde el navegador. */
export function descargar(nombre: string, contenido: string, tipo = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([contenido], { type: tipo }))
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  URL.revokeObjectURL(url)
}
