import { describe, expect, it } from 'vitest'
import { OPOSICIONES, RAMAS, TITULACIONES } from '@/contenido/oposiciones'
import { abiertasConMaster, buscarOposiciones, formatoPlazas, ramaDe, type Perfil } from './oposiciones'

const PEDAGOGIA: Perfil = { nivel: 5, rama: 'Ciencias Sociales y Jurídicas', titulacion: 'Pedagogía', master: 'si', ambito: 'Todos' }

describe('buscador de oposiciones', () => {
  it('reproduce la lista de la hoja de cálculo (Pedagogía, con el Máster del Profesorado)', () => {
    const r = buscarOposiciones(PEDAGOGIA)
    // Mismo orden que la hoja «Buscador» de la base de datos de la fase 1.
    expect(r.map((x) => x.oposicion.nombre)).toEqual([
      'Secundaria, especialidad Orientación Educativa',
      'Subinspectores Laborales, Escala de Empleo y Seguridad Social',
      'Profesor/a de Enseñanza Secundaria',
      'Cuerpo Superior de Sistemas y Tecnologías de la Información',
      'Cuerpo Superior de Inspectores de Hacienda del Estado',
      'Cuerpo Superior de Estadísticos del Estado',
      'Cuerpo Superior de la Administración de Castilla y León',
      'Cuerpo Superior de Inspectores de Trabajo y Seguridad Social',
      'Cuerpo Superior de Técnicos de la Administración de la Seguridad Social',
      'Cuerpo Superior de Administradores Civiles del Estado (TAC)',
      'Cuerpo Facultativo de Archiveros, Bibliotecarios y Arqueólogos',
      'Carrera Diplomática',
      'Cuerpo Superior de Técnicos Comerciales y Economistas del Estado',
      'Cuerpo Superior de Interventores y Auditores del Estado',
      'Cuerpo de Gestión de la Administración Civil del Estado (GACE)',
      'Gestión Procesal y Administrativa',
      'Cuerpo Técnico de Hacienda',
      'Cuerpo de Gestión de Sistemas e Informática',
      'Cuerpo de Gestión de la Administración de la Seguridad Social',
      'Cuerpo de Ayudantes de Archivos, Bibliotecas y Museos',
      'Cuerpo Técnico de Auditoría y Contabilidad',
      'Cuerpo de Gestión de la Administración de Castilla y León',
      'Cuerpo de Diplomados en Estadística del Estado',
      'Cuerpo General Administrativo del Estado',
      'Policía Nacional, Escala Básica',
      'Agentes de la Hacienda Pública',
      'Tramitación Procesal y Administrativa',
      'Ayudantes de Instituciones Penitenciarias',
      'Técnicos Auxiliares de Informática del Estado (TAI)',
      'Cuerpo Administrativo de Castilla y León',
      'Guardia Civil, Escala de Cabos y Guardias',
      'Cuerpo General Auxiliar del Estado',
      'Auxilio Judicial',
      'Cuerpo Auxiliar de Castilla y León',
    ])
    expect(r.slice(0, 2).every((x) => x.encaje === 'afin')).toBe(true)
    expect(r.slice(2).every((x) => x.encaje === 'general')).toBe(true)
  })

  it('sin el Máster del Profesorado no salen las de Secundaria, y se dice cuántas se abrirían', () => {
    const p: Perfil = { ...PEDAGOGIA, master: 'no' }
    const r = buscarOposiciones(p)
    expect(r.some((x) => x.oposicion.masterProfesorado)).toBe(false)
    expect(abiertasConMaster(p)).toBe(2)
    expect(abiertasConMaster(PEDAGOGIA)).toBe(0)
  })

  it('si está cursando el Máster, salen marcadas como «al terminarlo»', () => {
    const r = buscarOposiciones({ ...PEDAGOGIA, master: 'cursando' })
    const secundaria = r.filter((x) => x.oposicion.masterProfesorado)
    expect(secundaria).toHaveLength(2)
    expect(secundaria.every((x) => x.alTerminarMaster)).toBe(true)
  })

  it('una diplomatura no da acceso al grupo A1, y el Bachillerato solo a C1 y C2', () => {
    const dipl = buscarOposiciones({ ...PEDAGOGIA, nivel: 4 })
    expect(dipl.some((x) => x.oposicion.grupo === 'A1')).toBe(false)
    expect(dipl.some((x) => x.oposicion.grupo === 'A2')).toBe(true)
    const bach = buscarOposiciones({ ...PEDAGOGIA, nivel: 2, rama: null, titulacion: null })
    expect(bach.every((x) => x.oposicion.nivelMinimo <= 2)).toBe(true)
    expect(bach.map((x) => x.oposicion.id)).toContain('policia-nacional')
  })

  it('filtra por ámbito', () => {
    const r = buscarOposiciones({ ...PEDAGOGIA, ambito: 'Castilla y León' })
    expect(r.length).toBeGreaterThan(0)
    expect(r.every((x) => x.oposicion.ambito === 'Castilla y León')).toBe(true)
  })

  it('la afinidad por rama no se extiende a otra titulación de la misma rama', () => {
    const derecho = buscarOposiciones({ ...PEDAGOGIA, titulacion: 'Derecho' })
    const afines = derecho.filter((x) => x.encaje === 'afin').map((x) => x.oposicion.id)
    expect(afines).toEqual(['subinspectores-empleo'])
  })

  it('las oposiciones que exigen una titulación solo salen a quien la tiene', () => {
    const lista = [{ id: 'x', nombre: 'Prueba', ambito: 'Estado' as const, grupo: 'A1' as const, nivelMinimo: 5 as const, plazas: 1, exige: ['Medicina'] }]
    expect(buscarOposiciones({ ...PEDAGOGIA, titulacion: 'Medicina' }, lista)[0]?.encaje).toBe('exige')
    expect(buscarOposiciones(PEDAGOGIA, lista)).toEqual([])
  })

  it('datos coherentes: identificadores únicos y titulaciones afines que existen en la lista', () => {
    const ids = OPOSICIONES.map((o) => o.id)
    expect(new Set(ids).size).toBe(ids.length)
    const todas = RAMAS.flatMap((r) => TITULACIONES[r])
    for (const o of OPOSICIONES) {
      for (const t of [...(o.exige ?? []), ...(o.afinidad?.titulaciones ?? [])]) expect(todas).toContain(t)
    }
    expect(ramaDe('Pedagogía')).toBe('Ciencias Sociales y Jurídicas')
  })

  it('las plazas llevan separador de miles', () => {
    expect(formatoPlazas(1255)).toBe('1.255')
    expect(formatoPlazas(75)).toBe('75')
  })
})
