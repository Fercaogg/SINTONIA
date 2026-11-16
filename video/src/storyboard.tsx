import React from 'react'
import { E01, E02, E03 } from './escenas/E01a03'
import { E04A, E04B, E04C, E05 } from './escenas/E04a05'
import { E06, E07, E08, E09, E10 } from './escenas/E06a10'

// Imágenes fijas del storyboard: una o varias por escena.
export interface Fotograma { id: string; escena: number; pie?: string; componente: React.FC }

export const FOTOGRAMAS: Fotograma[] = [
  { id: '01', escena: 1, componente: () => <E01 /> },
  { id: '02', escena: 2, componente: () => <E02 subtitulo="Cree que va bien. Su tutor cree que va retrasada." /> },
  { id: '03', escena: 3, componente: () => <E03 subtitulo="Un minuto ella. Treinta segundos él." /> },
  { id: '04', escena: 4, pie: 'Llega el aviso', componente: () => <E04A subtitulo="El lunes, en el autobús, Lucía recibe un aviso." /> },
  { id: '05', escena: 4, pie: 'Primer plano del móvil', componente: () => <E04B subtitulo="La última es solo para ella: cómo se siente." /> },
  { id: '06', escena: 4, pie: 'Las cinco pantallas, una tras otra', componente: () => <E04C /> },
  { id: '07', escena: 5, componente: () => <E05 subtitulo="Ve a todos sus estudiantes en una sola pantalla." /> },
  { id: '08', escena: 6, componente: () => <E06 subtitulo="Les propone a los dos las mismas tres preguntas." /> },
  { id: '09', escena: 7, componente: () => <E07 subtitulo="Al salir de la reunión, dos toques." /> },
  { id: '10', escena: 8, componente: () => <E08 subtitulo="Esa respuesta no la ve nadie más." /> },
  { id: '11', escena: 9, componente: () => <E09 subtitulo="Además, Lucía ve sus hitos del TFM." /> },
  { id: '12', escena: 10, componente: () => <E10 /> },
]
