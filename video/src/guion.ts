// EL GUION. Aquí están todos los textos y tiempos del vídeo.
// Para cambiar una frase o la duración de una escena, se cambia aquí.
export interface EscenaGuion {
  n: number
  titulo: string
  inicio: number // segundo en el que empieza (se calcula solo)
  fin: number // segundo en el que termina (se calcula solo)
  dur: number // CUÁNTO DURA la escena, en segundos
  voz: number[] // en qué segundo de la escena empieza cada frase de la locución
  textos: string[] // lo que se lee en pantalla
  locucion: string // lo que dice la voz
  movimiento: string // cómo se mueve (nota para el storyboard)
}

const ESCENAS: Omit<EscenaGuion, 'inicio' | 'fin'>[] = [
  { n: 1, titulo: 'La construcción del logo', dur: 8, voz: [], textos: ['SINTONÍA'],
    locucion: '(Sin voz, solo música.)',
    movimiento: 'Pantalla blanca. Entra una línea por la izquierda y otra por la derecha, cada una a su ritmo. Se acercan, se acompasan y se convierten en las dos piezas azules del símbolo. Entre ellas aparece la pieza verde: la sintonía. Debajo aparece el nombre.' },
  { n: 2, titulo: 'El problema', dur: 20, voz: [0.6, 3.6, 5.4, 8.0, 13.6], textos: ['Ella cree que va bien.', 'Él cree que va retrasada.', 'Y nadie lo dice a tiempo.'],
    locucion: 'Lucía está haciendo su Trabajo Fin de Máster. Cree que va bien. Su tutor cree que va retrasada. Ninguno de los dos lo dice, y cuando por fin lo descubren, quedan pocas semanas para la entrega. Le pasa a muchos estudiantes: la tutoría funciona mejor cuando los dos ven lo mismo.',
    movimiento: 'El símbolo se abre en dos mitades. Cada barra se llena hasta donde cree cada uno. El calendario pasa semanas deprisa hasta la fecha de entrega y las dos barras chocan con ella.' },
  { n: 3, titulo: 'La idea', dur: 11.5, voz: [0.5, 7.2, 9.0], textos: ['Un minuto a la semana.'],
    locucion: 'SINTONÍA es muy sencilla: una vez a la semana, Lucía y su tutor cuentan, por separado, cómo ven el trabajo. Un minuto ella. Treinta segundos él.',
    movimiento: 'Las dos barras se estiran y se convierten en las dos líneas. El reloj da una vuelta completa: un minuto.' },
  { n: 4, titulo: 'Lunes, 8:15, en el autobús', dur: 24, voz: [0.5, 5.6, 11.3, 14.7, 17.5, 19.8], textos: ['Una pregunta por pantalla.', 'Con una mano.', 'Aunque no haya cobertura.'],
    locucion: 'El lunes, en el autobús, Lucía recibe un aviso. Cuatro preguntas, una por pantalla, con botones grandes para el pulgar. La última es solo para ella: cómo se siente. Esa respuesta no la ve nadie más. En menos de un minuto, listo. Y si se queda sin cobertura, se envía sola después.',
    movimiento: 'La ciudad pasa por la ventanilla. Llega el aviso al móvil; Lucía lo toca y el móvil crece hasta el primer plano. Cada toque pasa solo a la pregunta siguiente. El contador sube hasta 0:52.' },
  { n: 5, titulo: 'El tutor, entre dos clases', dur: 12, voz: [0.5, 3.8, 8.9], textos: ['Todos sus estudiantes. Una pantalla. 30 segundos.'],
    locucion: 'Su tutor hace lo mismo, entre dos clases. Ve a todos sus estudiantes en una sola pantalla y marca cómo los ve avanzar. Treinta segundos.',
    movimiento: 'El Dr. Ruiz camina por el pasillo. En su móvil se marca un número en cada fila, de arriba abajo, y pulsa "Enviar". El contador se para en 0:28.' },
  { n: 6, titulo: 'Cuando las miradas no coinciden', dur: 14.5, voz: [0.5, 9.2], textos: ['Las mismas tres preguntas. Para los dos. Sin culpables.'],
    locucion: 'Si las dos miradas no coinciden, SINTONÍA lo detecta con reglas sencillas y les propone a los dos las mismas tres preguntas para su próxima tutoría. Preguntas neutras, sin culpables, para hablar de lo que importa.',
    movimiento: 'Vuelven las dos líneas: la de Lucía en el 4 y la del tutor en el 2. Se ilumina el hueco entre ellas. De ese hueco salen tres tarjetas que viajan, una a una, a los dos móviles.' },
  { n: 7, titulo: 'Antes y después de la tutoría', dur: 13.5, voz: [0.5, 7.2], textos: ['Llega con lo que necesita decir.', 'Dos toques al salir.'],
    locucion: 'La víspera, Lucía repasa las preguntas y añade lo que ella quiere tratar. Al salir de la reunión, dos toques: si hablaron de las preguntas y si le sirvieron.',
    movimiento: 'La cámara recorre tres momentos de izquierda a derecha: la víspera (Lucía añade su punto), la tutoría vista desde arriba y la salida (dos toques en el móvil).' },
  { n: 8, titulo: 'Acompañar sin vigilar', dur: 20, voz: [0.5, 5.3, 10.2, 15.5], textos: ['Sin notas.', 'Sin rankings.', 'Sin subir tu trabajo.', 'Tu bienestar, solo para ti.'],
    locucion: 'SINTONÍA no pone notas, no compara a nadie y no te pide subir tu trabajo. Tu tutor no ve tus respuestas: solo las tres preguntas que compartís. Y la dirección del máster solo ve cómo va el grupo, nunca a una persona concreta. Si algún día necesitas ayuda, un botón te lleva a ella.',
    movimiento: 'La tabla se ilumina fila a fila. Sobre "Cómo se siente" se cierran dos candados. En la columna de la dirección aparece un gráfico de grupo.' },
  { n: 9, titulo: 'Y además', dur: 11.5, voz: [0.5], textos: ['Hitos del TFM.', 'Expectativas claras desde el primer día.', 'Avisos de ayudas para seguir investigando, si te interesa.'],
    locucion: 'Además, Lucía ve sus hitos del TFM, acuerda con su tutor desde el primer día qué espera cada uno y, si quiere seguir investigando, recibe avisos de las ayudas para el doctorado.',
    movimiento: 'Tres tarjetas entran rápido, una tras otra, y se colocan en fila.' },
  { n: 10, titulo: 'Cierre', dur: 11.5, voz: [2.3, 3.9, 8.0], textos: ['SINTONÍA', 'Acompañar sin vigilar.', 'Prototipo del Trabajo Fin de Máster de Fernando Martín Vaquero · Universidad de Salamanca'],
    locucion: 'SINTONÍA. Para que estudiante y tutor vayan, por fin, en la misma dirección. Acompañar sin vigilar.',
    movimiento: 'Las dos líneas avanzan juntas, acompasadas, y se funden en el símbolo, como al principio pero al revés. Aparecen el nombre y el lema.' },
]

// Los tiempos de inicio y fin salen de sumar las duraciones.
let reloj = 0
export const GUION: EscenaGuion[] = ESCENAS.map((e) => {
  const inicio = reloj
  reloj += e.dur
  return { ...e, inicio, fin: reloj }
})

export const FPS = 30
export const DURACION_TOTAL = reloj // unos 2 minutos y 26 segundos
