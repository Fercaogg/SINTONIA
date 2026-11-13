import { describe, expect, it } from 'vitest'
import { cuando, delDia, entradas, hoy, nombreDia, nombreMes, proximas, semanasDelMes, sumarDias, sumarMeses } from './calendario'

describe('fechas del calendario', () => {
  it('suma días y meses sin problemas de horario de verano', () => {
    expect(sumarDias('2027-03-27', 2)).toBe('2027-03-29')
    expect(sumarDias('2027-03-01', -1)).toBe('2027-02-28')
    expect(sumarMeses('2027-01-31', 1)).toBe('2027-02-01')
    expect(sumarMeses('2027-01-15', -1)).toBe('2026-12-01')
  })

  it('hoy es el día de Madrid', () => {
    expect(hoy(new Date('2027-02-09T23:30:00Z'))).toBe('2027-02-10')
    expect(hoy(new Date('2027-07-09T22:30:00Z'))).toBe('2027-07-10')
  })

  it('nombra meses y días en español', () => {
    expect(nombreMes('2027-02-10')).toBe('febrero de 2027')
    expect(nombreDia('2027-02-10')).toBe('miércoles 10 de febrero')
  })

  it('las semanas del mes empiezan en lunes y cubren todo el mes', () => {
    const febrero = semanasDelMes('2027-02-10')
    expect(febrero).toHaveLength(4) // febrero de 2027 empieza en lunes
    expect(febrero[0][0]).toEqual({ fecha: '2027-02-01', delMes: true })
    const marzo = semanasDelMes('2027-03-01')
    expect(marzo[0][0].fecha).toBe('2027-03-01')
    expect(marzo.at(-1)!.at(-1)).toEqual({ fecha: '2027-04-04', delMes: false })
    const agosto = semanasDelMes('2027-08-01')
    expect(agosto[0][0]).toEqual({ fecha: '2027-07-26', delMes: false })
    expect(agosto).toHaveLength(6)
  })
})

describe('entradas', () => {
  const base = { descripcion: null, lugar: null, ambito: 'privado' as const, pareja_id: null, master_id: null, mio: true, con: null, autor: null, editable: true }
  const lista = entradas({
    eventos: [
      { ...base, id: 'b', tipo: 'tutoria', titulo: 'Tutoría', fecha: '2027-02-10', fecha_fin: null, hora_inicio: '10:00', hora_fin: '11:00' },
      { ...base, id: 'a', tipo: 'congreso', titulo: 'Congreso', fecha: '2027-02-09', fecha_fin: '2027-02-11', hora_inicio: null, hora_fin: null },
    ],
    convocatorias: [{ id: 'conv-c-1', fecha: '2027-02-10', titulo: 'Cierra: FPU', enlace: '', organismo: '' }],
  })

  it('se ordenan por fecha y hora; lo de todo el día va primero', () => {
    expect(lista.map((e) => e.id)).toEqual(['a', 'conv-c-1', 'b'])
  })

  it('un congreso de varios días sale en cada día', () => {
    expect(delDia(lista, '2027-02-11').map((e) => e.id)).toEqual(['a'])
    expect(delDia(lista, '2027-02-12')).toEqual([])
  })

  it('próximas incluye lo que sigue en curso', () => {
    expect(proximas(lista, '2027-02-11').map((e) => e.id)).toEqual(['a'])
    expect(proximas(lista, '2027-02-10', 2).map((e) => e.id)).toEqual(['a', 'conv-c-1'])
  })

  it('describe cuándo es cada cosa', () => {
    expect(cuando(lista[2])).toBe('10:00 a 11:00')
    expect(cuando(lista[0])).toBe('Del 9 feb. al 11 feb.')
    expect(cuando(lista[1])).toBe('Todo el día')
  })
})
