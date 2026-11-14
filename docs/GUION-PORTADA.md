# Guion de la portada cinematográfica

Encargo de Fernando (14/11/2026): la portada como una experiencia controlada por el scroll, sin cambiar textos, datos ni lógica. Este guion es el storyboard: qué pasa en cada tramo del scroll.

## Reglas de rodaje

- **El scroll es la línea de tiempo.** Cada escena es un bloque alto con un escenario fijado (`position: sticky`) dentro. Al bajar, el avance de la escena va de 0 a 1 y mueve lo que hay dentro. Al subir, todo retrocede. Nunca se secuestra el scroll: la rueda, el dedo, las flechas y la barra funcionan como siempre (skill de Taste).
- **Solo transform y opacity** en lo que se mueve. Los estilos se escriben directamente en cada fotograma, sin pasar por Vue (skill de Emil, *animation-performance*).
- **Un protagonista por escena; el resto acompaña o se queda quieto** (skill de Emil, *choreograph*).
- **El color de fondo cambia sin cortes:** una pila de fondos fijos (claro, azul marino, azul profundo, verde suave), todos derivados de `#0A4A6C` y del verde `#34C6A3`, que se funden por opacidad según el avance.
- **Hilo conductor:** las dos ondas, estudiante (verde) y tutor/a (azul o blanco), muy desfasadas al principio y cada vez más cerca, hasta coincidir en la escena final.
- **Teclado:** si el foco entra en una escena, su contenido vuelve a su sitio (estado de reposo). Los enlaces y botones siempre están en el orden normal del documento.
- **Reducir movimiento:** sin escenas fijadas ni movimiento; la portada estática, limpia y con el mismo contenido.
- **Móvil:** escenas más cortas (entre el 60 % y el 70 % de la longitud de escritorio) y composiciones en vertical, pensadas para el pulgar.

## Escenas

Las duraciones son la altura de scroll que ocupa cada escena (escritorio / móvil), en pantallas.

### Escena 1. Dos miradas (Inicio) · 2,6 / 1,7 pantallas
- **Reposo (avance 0):** el inicio actual: titular gigante, entradilla, botones y la demostración, con el campo de ondas detrás. Se puede usar sin hacer scroll.
- **0 a 0,35:** el titular se separa en sus dos partes. "Acompañar el trabajo académico," sube y se aleja (profundidad); "sin vigilar" crece hasta llenar la pantalla. La entradilla, los botones y la demostración se retiran hacia atrás (escala 0,9 y transparencia) en una sola ola, no en cola.
- **0,35 a 0,8:** el fondo pasa del claro al azul marino; "sin vigilar" cambia a verde claro sobre el azul y se divide en dos copias desplazadas (las dos miradas).
- **0,8 a 1:** las dos copias se reducen y se convierten en la primera cifra de la escena 2. Encadenado sin corte.

### Escena 2. Las cifras · 3 / 2 pantallas, sobre azul marino
- Cada dato del producto (60 s, 30 s, 3 preguntas, 5 personas) entra **gigante desde el fondo** (escala 1,6 a 1), ocupa la pantalla con su frase y después se encoge hasta su hueco en una fila de cuatro.
- **Al final:** las cuatro cifras en fila, como la banda actual. Las ondas, muy desfasadas, al pie.

### Escena 3. El problema · 2 / 1,4 pantallas
- El fondo vuelve del azul al claro. El primer párrafo, en tamaño de titular, **se ilumina palabra a palabra** con el scroll. Los otros dos párrafos y el enlace aparecen al final, juntos.
- Las ondas, a la derecha, empiezan a acercarse.

### Escena 4. Cómo funciona · 4 / 2,6 pantallas (scroll horizontal)
- La escena se fija y **el recorrido gira a horizontal**: los tres pasos pasan de derecha a izquierda.
- Cada paso lleva un **móvil que se monta pieza a pieza**: 1) la pantalla del check-in con sus cuatro preguntas que llegan una a una; 2) dos móviles, estudiante y tutor/a, con sus respuestas separándose; 3) la agenda con las tres preguntas apilándose.
- Las ondas recorren todo el carril y se van alineando paso a paso.

### Escena 5. Para cada perfil · 2,5 / 1,6 pantallas
- Tres móviles en profundidad (parallax): estudiante, tutor/a y dirección. El scroll trae al frente uno tras otro. Debajo, las pestañas actuales, sin cambios.

### Escena 6. Puente al doctorado · 1,8 / 1,2 pantallas
- El fondo se tiñe de verde suave. Una línea se dibuja (escala horizontal) por los tres tramos, y cada tramo aparece cuando la línea llega a él.

### Escena 7. Privacidad y ética · 2 / 1,3 pantallas
- "Tu bienestar solo lo ves tú." llega **desde muy cerca** (escala 3 a 1) y se posa. El candado se cierra. La lista y las referencias entran en capas a distinta velocidad (profundidad).

### Escena 8. Para quién es · 1,6 / 1,1 pantallas, sobre azul marino
- Los cuatro destinatarios pasan como **tipografía gigante en horizontal** y se quedan en su retícula al final.

### Escena 9. Dirección
- **Sin escena:** el apartado tal cual, quieto. Es la pausa antes del final (Taste: el último tercio, en calma).

### Escena 10. Preguntas frecuentes y contacto
- Sin escena: quietos, como ahora.

### Escena 11. En sintonía · 1,6 / 1,2 pantallas
- Las dos ondas, que han acompañado todo el recorrido, **coinciden por fin** a todo lo ancho; el titular "En sintonía." une sus dos copias; aparecen los botones.

## Entregas

1. Este guion.
2. Escenas 1 y 2, con grabación del scroll en escritorio y en móvil.
3. Si Fernando da el visto bueno, el resto de escenas y la grabación completa.
