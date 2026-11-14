#!/usr/bin/env python3
"""
SINTONÍA · banda sonora del spot (60 s, 120 BPM, La menor → Do mayor).

Síntesis 100 % propia (numpy): sin samples ni licencias de terceros.
Cada golpe, whoosh y riser está colocado sobre los tiempos del montaje
(ver la tabla "Rejilla de música" del README).

Uso:  python3 musica/componer.py            → assets/music/sintonia-bgm.wav
"""
import os, wave
import numpy as np

SR = 48000
DUR = 60.0
BEAT = 0.5
N = int(SR * DUR)
rng = np.random.default_rng(7)  # determinista

L = np.zeros(N); R = np.zeros(N)

def t_(d): return np.arange(int(SR * d)) / SR
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)

def put(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N: return
    s = sig[: N - i] * gain
    L[i:i + len(s)] += s * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(s)] += s * np.sqrt(0.5 * (1 + pan))

def smooth(x, n):  # moving-average low-pass
    if n <= 1: return x
    k = np.ones(n) / n
    return np.convolve(x, k, mode="same")

def hp(x, n): return x - smooth(x, n)

# ---------------------------------------------------------------- instruments
def kick(gain=1.0):
    t = t_(0.45)
    f = 45 + 95 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 7.5)
    s[:240] += rng.standard_normal(240) * np.linspace(0.5, 0, 240)  # click
    return np.tanh(s * 1.6) * gain

def clap():
    t = t_(0.3)
    n = hp(rng.standard_normal(len(t)), 12)
    env = np.exp(-t * 22)
    for d in (0.0, 0.011, 0.022):  # three quick transients
        j = int(d * SR); env[j:j + 200] += np.linspace(0.6, 0, 200)
    return smooth(n, 3) * env * 0.5

def hat(open_=False):
    t = t_(0.25 if open_ else 0.06)
    n = hp(rng.standard_normal(len(t)), 4)
    return n * np.exp(-t * (14 if open_ else 70)) * 0.22

def tone(m, d, harm=6, decay=3.0, bright=1.6, detune=0.0, attack=0.004):
    t = t_(d); f = hz(m); s = np.zeros_like(t)
    for k in range(1, harm + 1):
        s += np.sin(2 * np.pi * f * k * (1 + detune * (k % 2 - 0.5)) * t) * np.exp(-t * decay * (k ** (bright - 1))) / k
    a = np.minimum(1, t / attack)
    return s * a

def pluck(m, d=0.6): return tone(m, d, harm=7, decay=5.5, bright=1.5) * 0.32

def piano(m, d=2.5):
    s = tone(m, d, harm=9, decay=1.6, bright=1.45) + 0.4 * tone(m + 12, d, harm=4, decay=2.4)
    return s * 0.22

def bass(m, d):
    t = t_(d); f = hz(m); s = np.zeros_like(t)
    for k in range(1, 6): s += np.sin(2 * np.pi * f * k * t) / k ** 1.3
    env = np.minimum(1, t / 0.008) * np.exp(-t * 3.0)
    return np.tanh(s * env * 1.4) * 0.34

def pad(notes, d, harm=7, gain=0.11, fade=0.6):
    t = t_(d); s = np.zeros_like(t)
    for m in notes:
        for det in (-0.004, 0.0, 0.0045):
            f = hz(m) * (1 + det)
            for k in range(1, harm + 1):
                s += np.sin(2 * np.pi * f * k * t + k * det * 900) / k ** 1.35
    env = np.minimum(1, t / fade) * np.minimum(1, (d - t) / fade)
    return s * env * gain / len(notes)

def sub(m, d, gain=0.35):
    t = t_(d)
    return np.sin(2 * np.pi * hz(m) * t) * np.minimum(1, t / 0.01) * np.exp(-t * 2.2) * gain

def whoosh(d=0.45, peak=0.6):
    t = t_(d); n = rng.standard_normal(len(t))
    env = np.exp(-((t / d - peak) ** 2) / 0.03)
    lo = smooth(n, 28); hi = hp(n, 6)
    mix = lo * (1 - t / d) + hi * 0.35 * (t / d)
    return mix * env * 0.9

def riser(d):
    t = t_(d); n = rng.standard_normal(len(t))
    f = 200 * 2 ** (t / d * 3.2)
    sw = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
    noise = hp(n, 3) * 0.35
    env = (t / d) ** 2.2
    return (sw + noise) * env * 0.7

def impact(big=True):
    d = 2.6 if big else 1.0; t = t_(d)
    boom = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t * 9)) / SR) * np.exp(-t * (1.6 if big else 4))
    n = smooth(rng.standard_normal(len(t)), 6) * np.exp(-t * 9) * 0.5
    return np.tanh((boom + n) * 1.5) * (0.9 if big else 0.5)

def tick(): return hp(rng.standard_normal(int(0.02 * SR)), 2) * np.exp(-t_(0.02) * 200) * 0.35

# ---------------------------------------------------------------- harmony
# (start, end, chord) — La menor · Fa · Do · Sol, cambio cada 4 s (2 compases)
A, F, C, G = [57, 60, 64], [53, 57, 60], [48, 52, 55, 59], [55, 59, 62]
prog = []
seq = [A, F, C, G]
for i, s in enumerate(np.arange(4.0, 52.0, 4.0)):
    prog.append((s, s + 4.0, seq[i % 4]))
prog += [(52.0, 55.5, F), (55.5, 60.0, [48, 52, 55, 62])]  # cierre: Fa → Do(add9)
root = {tuple(A): 45, tuple(F): 41, tuple(C): 48, tuple(G): 43, (48, 52, 55, 62): 48}

def chord_at(t):
    for s, e, c in prog:
        if s <= t < e: return c
    return A

def beats(a, b, step=BEAT):
    return [round(a + i * step, 4) for i in range(int(round((b - a) / step)))]

# ---------------------------------------------------------------- arrangement
# 0–4 · gancho: pulso grave y tic-tac, tensión
for b in beats(0, 3.5): put(sub(33, 0.45, 0.42), b)
for b in beats(0, 3.5, 0.25): put(hat(), b, 0.55 if (b * 4) % 2 else 0.9, pan=0.3)
put(pad([57, 64], 3.6, harm=5, gain=0.07, fade=0.3), 0.0)
put(riser(1.0), 2.5, 0.8)

# 4–18 · datos: arpegio pulsado, medio tiempo
def arp(a, b, gain=1.0, step=0.25, octave=12):
    for i, x in enumerate(beats(a, b, step)):
        c = chord_at(x); m = c[i % len(c)] + octave
        put(pluck(m), x, gain, pan=0.35 * np.sin(i * 1.3))

arp(4.0, 18.0, 0.9)
for s, e, c in prog:
    if e <= 4 or s >= 60: continue
    put(pad(c, e - s + 0.4, gain=0.10), s)
for b in beats(4.0, 18.0, 2.0): put(kick(0.85), b)
for b in beats(4.0, 18.0, 0.5): put(hat(), b + 0.25, 0.7, pan=-0.25)
for s, e, c in prog:
    if 4 <= s < 18: put(bass(root[tuple(c)] - 12, e - s), s, 0.8)

# 18–19.5 · reveal: las ondas, subida y flash
put(riser(1.5), 18.0, 1.0)
for b in beats(18.0, 19.5, 0.5): put(sub(45, 0.4, 0.3), b)

# 19.5–23 · wordmark: piano + pad, entra el pulso
for i, x in enumerate([19.5, 20.0, 20.5, 21.0, 21.5, 22.0, 22.5]):
    put(piano([69, 72, 76, 72, 74, 72, 71][i] - 12), x, 0.9, pan=0.15 * (i % 2 * 2 - 1))
for b in beats(21.0, 23.0, 1.0): put(kick(0.6), b)
arp(21.0, 23.0, 0.55)

# 23–37 · cómo funciona: groove completo
for b in beats(23.0, 36.5, 0.5): put(kick(1.0), b)
for b in beats(23.5, 36.5, 1.0): put(clap(), b, 0.9)
for b in beats(23.0, 36.5, 0.25): put(hat(), b, 0.8 if (b * 4) % 2 else 0.45, pan=0.3)
for b in beats(23.0, 36.5, 0.25):
    if (b * 4) % 2 == 1: continue
    c = chord_at(b); put(bass(root[tuple(c)] - 12, 0.24), b, 0.75)
arp(23.0, 36.5, 0.75)
for x in (23.75, 24.0, 24.25, 24.5): put(tick(), x, 1.0, pan=-0.4)  # pulsaciones del móvil
for x in (26.5, 26.75, 27.0): put(tick(), x, 0.8, pan=0.4)          # valoraciones del tutor/a
for x in (33.0, 33.5, 34.0): put(kick(0.7), x); put(pluck(76), x, 0.6)  # tarjetas de agenda
put(riser(1.0), 36.0, 0.8)

# 37–47 · confianza: oscuro, medio tiempo, latido
for s, e, c in prog:
    if 36 <= s < 48: put(pad([m - 12 for m in c], e - s + 0.4, harm=4, gain=0.12), s)
for b in beats(37.0, 47.0, 2.0): put(kick(0.7), b); put(kick(0.4), b + 0.35)  # latido
for b in beats(37.0, 47.0, 0.5): put(sub(33 if chord_at(b) is A else root[tuple(chord_at(b))] - 24, 0.45, 0.22), b)
for x in (41.0, 41.5, 42.0): put(impact(False), x, 1.0); put(clap(), x, 0.7)  # Sin notas · Sin rankings · Sin vigilar
for i, x in enumerate(beats(43.0, 46.5, 0.5)): put(pluck([64, 67, 69, 72][i % 4]), x, 0.45, pan=0.4)

# 47–53 · perfiles: vuelve el pulso, más ligero
for b in beats(47.0, 52.5, 1.0): put(kick(0.85), b)
for b in beats(47.0, 52.5, 0.5): put(hat(), b + 0.25, 0.7, pan=-0.3)
arp(47.0, 52.5, 0.7)
for x, m in ((50.0, 76), (50.5, 81), (51.0, 84)): put(piano(m - 12, 2.0), x, 1.0)  # pasos del puente

# 53–60 · cierre: piano y resolución en Do
for i, x in enumerate(beats(53.0, 55.0, 0.5)): put(piano([64, 65, 69, 72][i] - 12), x, 0.9)
put(riser(1.5), 54.0, 0.9)
for m in (48, 55, 64, 67, 74): put(piano(m, 4.5), 55.5, 0.75)
put(pad([60, 64, 67, 74], 4.5, gain=0.12, fade=0.4), 55.5)
put(sub(36, 3.0, 0.4), 55.5)

# ---------------------------------------------------------------- impacts and transitions
for x in (0.0, 3.5, 19.5, 29.5, 56.5): put(impact(True), x, 1.0)
for x in (1.0, 4.0, 23.0, 37.0, 47.0, 53.0): put(impact(False), x, 0.7)
for x in (8.0, 11.5, 26.0, 47.0, 49.5): put(whoosh(), x - 0.3, 0.8, pan=(-0.5 if x in (8.0, 26.0) else 0.0))
put(whoosh(0.5, 0.75), 22.6, 0.9)  # zoom a través del wordmark

# ---------------------------------------------------------------- reverb + master
def reverb(x, d=1.6, mix=0.22):
    ir_t = t_(d)
    ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3.2)
    ir = smooth(ir, 3); ir /= np.sqrt(np.sum(ir ** 2))
    n = 1 << int(np.ceil(np.log2(len(x) + len(ir))))
    y = np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(ir, n), n)[: len(x)]
    return x + y * mix

L = reverb(L); R = reverb(R)
fade = np.ones(N); k = int(2.5 * SR); fade[-k:] = np.linspace(1, 0, k) ** 1.5
L *= fade; R *= fade
peak = max(np.abs(L).max(), np.abs(R).max())
L = np.tanh(L / peak * 1.3) / np.tanh(1.3) * 0.89
R = np.tanh(R / peak * 1.3) / np.tanh(1.3) * 0.89

here = os.path.dirname(os.path.abspath(__file__))
out = os.path.join(here, "..", "assets", "music", "sintonia-bgm.wav")  # después: ffmpeg -i …wav -af loudnorm=I=-16:TP=-1.5 -b:a 256k sintonia-bgm.mp3
os.makedirs(os.path.dirname(out), exist_ok=True)
pcm = (np.stack([L, R], axis=1) * 32767).astype(np.int16)
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("escrito", os.path.normpath(out), f"{DUR:.1f} s")
