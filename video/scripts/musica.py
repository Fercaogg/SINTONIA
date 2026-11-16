# Música de fondo de SINTONÍA, creada por ordenador desde cero para este vídeo.
# No usa grabaciones ni muestras de nadie: no tiene licencia de terceros.
# Uso: python3 scripts/musica.py   (crea public/musica.mp3)
import subprocess, sys, wave
import numpy as np

FS = 44100
TEMPO = 96.0
NEGRA = 60.0 / TEMPO
COMPAS = NEGRA * 4
COMPASES = 62  # 155 segundos; el vídeo usa los que necesite
N = int(FS * COMPAS * COMPASES) + FS * 4

NOTAS = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
def hz(nombre):
    return 440.0 * 2 ** ((NOTAS[nombre[:-1]] + 12 * (int(nombre[-1]) + 1) - 69) / 12)

# Cuatro acordes en re mayor, dos compases cada uno: sereno y luminoso.
ACORDES = [
    (['D3', 'A3', 'F#4', 'A4', 'E5'], 'D2', ['D4', 'A4', 'E5', 'F#5', 'A4', 'E5', 'D5', 'A4']),
    (['B2', 'F#3', 'D4', 'F#4', 'A4'], 'B1', ['B3', 'F#4', 'D5', 'F#5', 'A4', 'D5', 'B4', 'F#4']),
    (['G3', 'D4', 'F#4', 'B4', 'D5'], 'G2', ['G4', 'B4', 'D5', 'F#5', 'B4', 'D5', 'A4', 'B4']),
    (['A3', 'E4', 'F#4', 'A4', 'C#5'], 'A1', ['A3', 'E4', 'C#5', 'E5', 'A4', 'C#5', 'F#4', 'E4']),
]

izq = np.zeros(N)
der = np.zeros(N)

def poner(senal, inicio, pan=0.5, vol=1.0):
    i = int(inicio * FS)
    j = min(N, i + len(senal))
    izq[i:j] += senal[: j - i] * vol * np.cos(pan * np.pi / 2)
    der[i:j] += senal[: j - i] * vol * np.sin(pan * np.pi / 2)

def colchon(f, dur):
    t = np.arange(int(dur * FS)) / FS
    s = sum(np.sin(2 * np.pi * f * d * t + k) for k, d in enumerate((0.997, 1.0, 1.003)))
    s = s + 0.25 * np.sin(2 * np.pi * 2 * f * t) + 0.08 * np.sin(2 * np.pi * 3 * f * t)
    env = np.minimum(1, t / 1.6) * np.minimum(1, (dur - t) / 2.2)
    return s * env * (1 + 0.08 * np.sin(2 * np.pi * 0.2 * t))

def punteo(f, dur=1.4):
    t = np.arange(int(dur * FS)) / FS
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 9) + 0.12 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 14)
    return s * np.exp(-t * 4.2) * np.minimum(1, t / 0.006)

def bajo(f, dur):
    t = np.arange(int(dur * FS)) / FS
    return (np.sin(2 * np.pi * f * t) + 0.2 * np.sin(2 * np.pi * 2 * f * t)) * np.minimum(1, t / 0.05) * np.exp(-t * 0.9)

rng = np.random.default_rng(7)
for c in range(COMPASES):
    notas, raiz, arpegio = ACORDES[(c // 2) % 4]
    t0 = c * COMPAS
    if c % 2 == 0:
        for k, n in enumerate(notas):
            poner(colchon(hz(n), COMPAS * 2 + 2.0), t0, pan=0.2 + 0.6 * k / (len(notas) - 1), vol=0.05)
    if c >= 3:
        poner(bajo(hz(raiz), COMPAS), t0, vol=0.16)
    # el arpegio entra poco a poco tras el logo y se retira al final
    fuerza = min(1.0, max(0.0, (c - 2) / 4)) * min(1.0, max(0.25, (COMPASES - 3 - c) / 3))
    for k, n in enumerate(arpegio):
        if c < 3 and k % 4:
            continue
        acento = 1.0 if k % 4 == 0 else 0.6
        poner(punteo(hz(n)), t0 + k * NEGRA / 2, pan=0.3 + 0.4 * rng.random(), vol=0.085 * acento * max(fuerza, 0.35 if c < 3 else 0))
        # eco suave
        poner(punteo(hz(n)), t0 + k * NEGRA / 2 + NEGRA * 0.75, pan=0.85 if k % 2 else 0.15, vol=0.03 * acento * max(fuerza, 0.3 if c < 3 else 0))

mezcla = np.stack([izq, der], axis=1)
# filtro suave para quitar brillo y dejar sitio a la voz
nucleo = 0.22 * (1 - 0.22) ** np.arange(64)
for ch in range(2):
    mezcla[:, ch] = np.convolve(mezcla[:, ch], nucleo)[:N]
t = np.arange(N) / FS
mezcla *= np.minimum(1, t / 1.5)[:, None]
mezcla /= np.max(np.abs(mezcla)) * 1.15
with wave.open('/tmp/musica.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(FS)
    w.writeframes((mezcla * 32767).astype('<i2').tobytes())
destino = sys.argv[1] if len(sys.argv) > 1 else 'public/musica.mp3'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/musica.wav', '-b:a', '160k', destino], check=True)
print('Hecho:', destino)
