# SINTONÍA · Design reference

## Color
- `--bg` #F5F7F6 — fondo
- `--ink` #0A4A6C — titulares, wordmark, marco del móvil
- `--accent` #34C6A3 — acento, "Í" del wordmark, patrón de ondas (32 % opacidad)
- `--action` #1D7060 — botones, selección, chips "Lo ve"
- `--muted` #5A6B75 — texto secundario
- `--card` #FFFFFF · `--border` #E3EAEA · radio 16px · sombra azulada suave

## Tipografía
Fira Sans 400 / 600 / 700. Titulares 66–156px, cuerpo 32–44px, etiquetas 22–28px.

## Movimiento
- Eases: power2.out / power3.out (entradas), sine.inOut (flotaciones), back.out(1.3–1.4) solo en chips y etiqueta.
- Transición entre escenas: crossfade 0.5 s + 20px vertical (salida −20, entrada +20). Ventanas de escena solapadas 0.5 s en pistas alternas.
- Fondo: 13 líneas onduladas que derivan 480px de izquierda a derecha en 40 s.
- Ondas protagonistas: dos líneas desacompasadas (0–5 s) que se funden en una (5–7.3 s) y vuelven en el cierre (36–40 s).

## Escenas
1. 0–5 El problema · 2. 5–10 Presentación · 3. 10–20 Cómo funciona · 4. 20–26 Agenda · 5. 26–32 Privacidad · 6. 32–36 Puente al doctorado · 7. 36–40 Cierre
