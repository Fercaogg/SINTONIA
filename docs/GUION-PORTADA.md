# Guion de la portada en movimiento

Encargo de Fernando (14/11/2026): la portada como una experiencia que se mueve con el scroll, sin cambiar textos, datos ni lógica. Segunda versión, tras su respuesta a las escenas 1 y 2: "tiene que ser según se deslice el ratón, no algo que te bloquee la pantalla, y más dinámico".

## Reglas de rodaje

- **Nada se fija.** La página siempre avanza con la rueda, el dedo, las flechas o la barra. Nunca se intercepta ni se suaviza el scroll.
- **Cada pieza tiene su paso por la pantalla:** 0 cuando asoma por abajo, 0,5 en el centro, 1 cuando sale por arriba. En 0,5 todo está en su sitio (reposo), así lo que se lee y lo que se enfoca está quieto.
- **Inercia:** cada pieza persigue su posición con un muelle; al bajar rápido todo se estira y al parar se asienta.
- **Velocidad:** la tipografía grande se inclina según lo rápido que se baje.
- **Solo transform y opacity,** escritos directamente en cada fotograma (skill de Emil, *animation-performance*). El bucle se para cuando todo está quieto.
- **Color continuo:** tres fondos fijos (claro, verde suave y azul marino de la marca) que se funden por opacidad según la zona que ocupa la pantalla.
- **Hilo conductor:** las dos ondas, estudiante y tutor/a, muy desfasadas al principio y cada vez más cerca, hasta coincidir en el cierre.
- **Teclado:** si el foco entra en una sección, vuelve a su sitio. Botones y enlaces nunca se apagan.
- **Reducir movimiento:** la portada estática, con el mismo contenido y sin las bandas decorativas.
- **Móvil:** los mismos efectos con la mitad de recorrido; no añade altura a la página.

## Secciones

| Sección | Qué pasa al bajar |
|---|---|
| Inicio | El titular se abre: la primera línea se va a la izquierda, "sin vigilar" crece hacia la derecha y se desdobla en dos copias (las dos miradas). El texto sube más deprisa que el scroll y la demostración se queda atrás girando (parallax). El campo de ondas se desvanece. |
| Banda "Acompañar sin vigilar" | Tipografía gigante en dos filas que cruzan en sentidos contrarios, sobre azul marino. |
| Cifras | Cada dato sube desde abajo, grande y girado, a su propia velocidad, y se posa en la fila; al salir se separa en capas. Las ondas, al pie, empiezan a acercarse. |
| El problema | El título entra desde la izquierda. El primer párrafo se ilumina palabra a palabra. |
| Cómo funciona | Un móvil se monta pieza a pieza (marco, isla, pantalla, ondas, estado). Los tres pasos llegan desde la derecha, cada uno a su velocidad. Las ondas se alinean al leer. |
| Para cada perfil | La cabecera entra desde la izquierda; la tarjeta de pestañas sube girando y se endereza. |
| Puente al doctorado | El fondo se tiñe de verde. Una línea se dibuja y cada tramo aparece cuando la línea llega a él. |
| Privacidad y ética | "Tu bienestar solo lo ves tú." llega desde muy cerca y se posa; la lista entra desde la derecha en capas. Al pasar al azul, se apaga. |
| Para quién es | Sobre azul marino. El título cruza en grande; los cuatro destinatarios llegan desde la derecha, escalonados. |
| Dirección, preguntas y contacto | Quietos: la pausa antes del final. |
| Banda "En sintonía." | Dos copias, verde y azul, separadas, que se juntan en una sola línea. |
| Cierre | Las dos ondas coinciden por fin con el scroll. |

## Código

- Motor: `src/lib/cine.ts` (piezas, fondos, velocidad). Ayudas de Vue: `src/lib/usar-cine.ts`.
- Componentes: `src/components/cine/` (FondoCine, EscenaInicio, SeccionCifras, BandaGigante) y `ComoFuncionaOndas.vue`.
