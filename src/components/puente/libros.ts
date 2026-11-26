// Encuadernación de los volúmenes de la estantería de Puente al doctorado.
import type { SeccionPuente } from '@/contenido/puente'

export interface EstiloLibro {
  /** Tela del lomo y de la portada. */
  tela: string
  /** Texto sobre la tela (contraste AA comprobado con axe). */
  tinta: string
  /** Filetes del lomo y marco de la portada. */
  filete: string
  /** Grosor (ancho del lomo) y alto, en px. */
  grosor: number
  alto: number
}

export const VOLUMENES = ['I', 'II', 'III', 'IV', 'V', 'VI']

/** Tinta, lumbre, piedra y papel: la paleta de la marca hecha tela. */
export const ESTILOS: Record<SeccionPuente, EstiloLibro> = {
  becas: { tela: '#1b1b1b', tinta: '#f2f2ef', filete: '#f25a1f', grosor: 58, alto: 232 },
  plazos: { tela: '#f25a1f', tinta: '#1b1b1b', filete: '#1b1b1b', grosor: 46, alto: 206 },
  necesito: { tela: '#ebe7dc', tinta: '#1b1b1b', filete: '#b83a0e', grosor: 64, alto: 244 },
  tipos: { tela: '#55554f', tinta: '#f2f2ef', filete: '#ff9670', grosor: 50, alto: 218 },
  eventos: { tela: '#9a300c', tinta: '#fff3ee', filete: '#ffe1d4', grosor: 54, alto: 196 },
  normativa: { tela: '#2e2e2b', tinta: '#ebe7dc', filete: '#c9a46a', grosor: 60, alto: 238 },
}
