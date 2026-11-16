// EL GUION. Aquí están todos los textos y tiempos del vídeo.
// Para cambiar una frase o la duración de una escena, se cambia aquí.
export interface EscenaGuion {
  n: number
  titulo: string
  inicio: number // segundo en el que empieza
  fin: number // segundo en el que termina
  textos: string[] // lo que se lee en pantalla
  locucion: string // lo que dice la voz
  movimiento: string // cómo se mueve (nota para el storyboard)
}

export const GUION: EscenaGuion[] = [
  { n: 1, titulo: 'La construcción del logo', inicio: 0, fin: 8, textos: ['SINTONÍA'],
    locucion: '(Sin voz, solo música.)',
    movimiento: 'Pantalla blanca. Entra una línea por la izquierda y otra por la derecha, cada una a su ritmo. Se acercan, se acompasan y se convierten en las dos piezas azules del símbolo. Entre ellas aparece la pieza verde: la sintonía. Debajo aparece el nombre.' },
  { n: 2, titulo: 'El problema', inicio: 8, fin: 28, textos: ['Ella cree que va bien.', 'Él cree que va retrasada.', 'Y nadie lo dice a tiempo.'],
    locucion: 'Lucía está haciendo su Trabajo Fin de Máster. Cree que va bien. Su tutor cree que va retrasada. Ninguno de los dos lo dice, y cuando por fin lo descubren, quedan pocas semanas para la entrega. Le pasa a muchos estudiantes: la tutoría funciona mejor cuando los dos ven lo mismo.',
    movimiento: 'El símbolo se abre en dos mitades. Cada barra se llena hasta donde cree cada uno. El calendario pasa semanas deprisa hasta la fecha de entrega y las dos barras chocan con ella.' },
  { n: 3, titulo: 'La idea', inicio: 28, fin: 40, textos: ['Un minuto a la semana.'],
    locucion: 'SINTONÍA es muy sencilla: una vez a la semana, Lucía y su tutor cuentan, por separado, cómo ven el trabajo. Un minuto ella. Treinta segundos él.',
    movimiento: 'Las dos barras se estiran y se convierten en las dos líneas. El reloj da una vuelta completa: un minuto.' },
  { n: 4, titulo: 'Lunes, 8:15, en el autobús', inicio: 40, fin: 65, textos: ['Una pregunta por pantalla.', 'Con una mano.', 'Aunque no haya cobertura.'],
    locucion: 'El lunes, en el autobús, Lucía recibe un aviso. Cuatro preguntas, una por pantalla, con botones grandes para el pulgar. La última es solo para ella: cómo se siente. Esa respuesta no la ve nadie más. En menos de un minuto, listo. Y si se queda sin cobertura, se envía sola después.',
    movimiento: 'La ciudad pasa por la ventanilla. Llega el aviso al móvil; Lucía lo toca y el móvil crece hasta el primer plano. Cada toque pasa solo a la pregunta siguiente. El contador sube hasta 0:52.' },
  { n: 5, titulo: 'El tutor, entre dos clases', inicio: 65, fin: 78, textos: ['Todos sus estudiantes. Una pantalla. 30 segundos.'],
    locucion: 'Su tutor hace lo mismo, entre dos clases. Ve a todos sus estudiantes en una sola pantalla y marca cómo los ve avanzar. Treinta segundos.',
    movimiento: 'El Dr. Ruiz camina por el pasillo. En su móvil se marca un número en cada fila, de arriba abajo, y pulsa "Enviar". El contador se para en 0:28.' },
  { n: 6, titulo: 'Cuando las miradas no coinciden', inicio: 78, fin: 98, textos: ['Las mismas tres preguntas. Para los dos. Sin culpables.'],
    locucion: 'Si las dos miradas no coinciden, SINTONÍA lo detecta con reglas sencillas y les propone a los dos las mismas tres preguntas para su próxima tutoría. Preguntas neutras, sin culpables, para hablar de lo que importa.',
    movimiento: 'Vuelven las dos líneas: la de Lucía en el 4 y la del tutor en el 2. Se ilumina el hueco entre ellas. De ese hueco salen tres tarjetas que viajan, una a una, a los dos móviles.' },
  { n: 7, titulo: 'Antes y después de la tutoría', inicio: 98, fin: 115, textos: ['Llega con lo que necesita decir.', 'Dos toques al salir.'],
    locucion: 'La víspera, Lucía repasa las preguntas y añade lo que ella quiere tratar. Al salir de la reunión, dos toques: si hablaron de las preguntas y si le sirvieron.',
    movimiento: 'La cámara recorre tres momentos de izquierda a derecha: la víspera (Lucía añade su punto), la tutoría vista desde arriba y la salida (dos toques en el móvil).' },
  { n: 8, titulo: 'Acompañar sin vigilar', inicio: 115, fin: 132, textos: ['Sin notas.', 'Sin rankings.', 'Sin subir tu trabajo.', 'Tu bienestar, solo para ti.'],
    locucion: 'SINTONÍA no pone notas, no compara a nadie y no te pide subir tu trabajo. Tu tutor ve cómo avanza tu TFM, no cómo te sientes. Y la dirección del máster solo ve cómo va el grupo, nunca a una persona concreta. Si algún día necesitas ayuda, un botón te lleva a ella.',
    movimiento: 'La tabla se ilumina fila a fila. Sobre "Cómo se siente" se cierran dos candados. En la columna de la dirección aparece un gráfico de grupo.' },
  { n: 9, titulo: 'Y además', inicio: 132, fin: 144, textos: ['Hitos del TFM.', 'Expectativas claras desde el primer día.', 'Avisos de ayudas para seguir investigando, si te interesa.'],
    locucion: 'Además, Lucía ve sus hitos del TFM, acuerda con su tutor desde el primer día qué espera cada uno y, si quiere seguir investigando, recibe avisos de las ayudas para el doctorado.',
    movimiento: 'Tres tarjetas entran rápido, una tras otra, y se colocan en fila.' },
  { n: 10, titulo: 'Cierre', inicio: 144, fin: 155, textos: ['SINTONÍA', 'Acompañar sin vigilar.', 'Prototipo del Trabajo Fin de Máster de Fernando Martín Vaquero · Universidad de Salamanca'],
    locucion: 'SINTONÍA. Para que estudiante y tutor vayan, por fin, en la misma dirección. Acompañar sin vigilar.',
    movimiento: 'Las dos líneas avanzan juntas, acompasadas, y se funden en el símbolo, como al principio pero al revés. Aparecen el nombre y el lema.' },
]

export const FPS = 30
export const DURACION_TOTAL = GUION[GUION.length - 1].fin // 155 s = 2 min 35 s
