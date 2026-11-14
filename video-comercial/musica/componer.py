#!/usr/bin/env python3
"""
SINTONÍA · banda sonora del spot — rage / UK underground, 140 BPM en half-time, Fa menor.

Composición y síntesis originales (numpy, sin samples ni melodías de terceros).
Cada aparición del vídeo cae en un tiempo de la rejilla de 140 BPM (ver musica/tiempos.py,
réplica de SX.QM en assets/js/sx.js) y recibe un golpe de 808 + campana o click metálico.

Uso:
  python3 musica/componer.py
  ffmpeg -y -i assets/music/sintonia-bgm.wav -af loudnorm=I=-14.5:TP=-1:LRA=7 -ar 48000 -b:a 256k assets/music/sintonia-bgm.mp3
"""
import os, sys, wave
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tiempos import QM  # noqa: E402

SR = 48000
DUR = 60.0
N = int(SR * DUR)
BPM = 140
B = 60 / BPM          # negra
BAR = 4 * B           # compás
S16 = B / 4           # semicorchea
rng = np.random.default_rng(140)

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def t_(d): return np.arange(int(SR * d)) / SR
def idx(t): return int(round(t * SR))

def bus(st=True): return np.zeros((N, 2)) if st else np.zeros(N)
LEAD, BELL, DRUM, SEND = bus(), bus(), bus(), bus()
BASS = bus(False)

def put(dst, sig, at, gain=1.0, pan=0.0):
    i = idx(at)
    if i >= N or i < 0: return
    s = sig[: N - i] * gain
    if dst.ndim == 1: dst[i:i + len(s)] += s if s.ndim == 1 else s.mean(axis=1); return
    if s.ndim == 1:
        dst[i:i + len(s), 0] += s * np.sqrt(0.5 * (1 - pan)); dst[i:i + len(s), 1] += s * np.sqrt(0.5 * (1 + pan))
    else:
        dst[i:i + len(s)] += s

def smooth(x, n):
    if n <= 1: return x
    k = np.ones(n) / n
    if x.ndim == 1: return np.convolve(x, k, mode="same")
    return np.stack([np.convolve(x[:, c], k, mode="same") for c in range(x.shape[1])], axis=1)

def lp2(x, fc):
    """Two cascaded one-pole low-passes; fc may be a per-sample array."""
    fc = np.broadcast_to(np.asarray(fc, dtype=float), (len(x),))
    a = 1 - np.exp(-2 * np.pi * fc / SR)
    y = np.array(x, dtype=float)
    for _ in range(2):
        out = np.empty_like(y); z = np.zeros(y.shape[1:]) if y.ndim > 1 else 0.0
        for i in range(len(y)):
            z = z + a[i] * (y[i] - z); out[i] = z
        y = out
    return y

# ---------------------------------------------------------------- timeline (vídeo)
# Apariciones en tiempo del corte original de 45 s → tiempo final en la rejilla de 140 BPM.
APPEAR = [0, 1, 2, 3.5,                                   # gancho
          4, 4.5, 6, 7, 7.5, 8, 9.5, 9.75, 10, 11.5, 12,  # datos
          13, 14, 14.5, 15, 15.5,                         # reveal
          17, 17.5, 19, 20, 20.5, 20.75, 21, 22, 23, 23.5, 25, 25.5, 26, 26.5,  # cómo funciona
          28, 28.5, 29, 29.5, 30, 31, 31.5, 32, 33, 33.5,  # confianza
          35, 35.5, 37, 37.5, 38, 38.5,                   # perfiles
          40, 42, 43.5]                                   # cierre
TAPS = [17.75, 18.0, 18.25, 18.5]                         # pulsaciones del móvil → solo click
BIG = {3.5, 14.5, 23, 31, 31.5, 32, 42}                   # golpes principales → campana larga
SECTIONS = [QM(t) for t in (4.0, 13.0, 17.0, 28.0, 35.0, 40.0)]  # entradas de sección
DROP_IN = SECTIONS[0]                                     # entra la batería
END_CUT = DUR - 2 * B                                     # último medio compás: solo cola

events = sorted({round(QM(t), 4) for t in APPEAR})
taps = [QM(t) for t in TAPS]

def snap(t):  # nearest 140 BPM sixteenth
    return round(t / S16) * S16

# gate: corte total de medio compás antes de cada sección (y al final), dejando solo la reverb
gate = np.ones(N)
cuts = [(s - 2 * B, s) for s in SECTIONS[1:]] + [(END_CUT, DUR)]
for a, b in cuts:
    i, j = idx(a), idx(b); gate[i:j] = 0
    k = 120; gate[max(0, i - k):i] *= np.linspace(1, 0, min(k, i))  # micro-fundido sin click
def in_cut(t): return any(a - 0.01 <= t < b for a, b in cuts)

# ---------------------------------------------------------------- composición
# Bucle de 2 compases (32 semicorcheas). Melodía original con notas repetidas.
F5, G5, Ab5, Bb5, C6, Eb5, Db6 = 77, 79, 80, 82, 84, 75, 85
LOOP = [(0, F5), (2, F5), (3, F5), (6, Ab5), (8, G5), (10, F5), (11, F5), (14, Eb5),
        (16, F5), (18, F5), (19, F5), (22, Ab5), (24, C6), (26, Bb5), (27, Ab5), (30, G5)]
LOOP_LEN = 32 * S16
# 808 (MIDI), posición en negras dentro del bucle, glide hacia la nota
F1, Ab1, Db1, C1, Eb1 = 29, 32, 25, 24, 27
BASSLINE = [(0, F1, False), (1.5, F1, False), (3.0, Ab1, True), (4.0, Db1, False),
            (5.5, Db1, False), (6.5, C1, True), (7.25, Eb1, True)]

def loop_starts(a, b):
    k0 = int(np.ceil(a / LOOP_LEN - 1e-9)); out = []
    k = k0
    while k * LOOP_LEN < b - 1e-9: out.append(k * LOOP_LEN); k += 1
    return out

# ---------------------------------------------------------------- instrumentos
def polyblep_saw(f, d, phase0=0.0):
    n = int(SR * d); dt = f / SR
    ph = (phase0 + dt * np.arange(n)) % 1.0
    s = 2 * ph - 1
    m = ph < dt; x = ph[m] / dt; s[m] -= x + x - x * x - 1
    m = ph > 1 - dt; x = (ph[m] - 1) / dt; s[m] -= x * x + x + x + 1
    return s

DETUNE = [-23, -14, -6, 0, 6, 14, 23]      # cents, 7 voces
PANS = [-1, -0.66, -0.33, 0, 0.33, 0.66, 1]

def supersaw(m, d):
    out = np.zeros((int(SR * d), 2))
    for c, p in zip(DETUNE, PANS):
        s = polyblep_saw(hz(m) * 2 ** (c / 1200), d, rng.random())
        out[:, 0] += s * np.sqrt(0.5 * (1 - p)); out[:, 1] += s * np.sqrt(0.5 * (1 + p))
    t = t_(d)
    env = np.minimum(1, t / 0.004) * np.clip((d - t) / 0.02, 0, 1) * (0.75 + 0.25 * np.exp(-t * 9))
    return out * env[:, None] / 3.2

def bell(m, d=1.2, gain=1.0):  # FM bell
    t = t_(d); f = hz(m)
    s = np.sin(2 * np.pi * f * t + 2.2 * np.exp(-t * 6) * np.sin(2 * np.pi * f * 3.5 * t))
    return s * np.exp(-t * 3.5) * np.minimum(1, t / 0.002) * gain

def metal_click():
    t = t_(0.08); s = np.zeros_like(t)
    for f in (3150, 4870, 6420, 8960): s += np.sin(2 * np.pi * f * t)
    n = rng.standard_normal(len(t)); n = n - smooth(n, 3)
    return (s * 0.25 + n * 0.4) * np.exp(-t * 60)

def kick():
    t = t_(0.28)
    f = 48 + 140 * np.exp(-t * 40)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14)
    s[:150] += rng.standard_normal(150) * np.linspace(0.6, 0, 150)
    return np.tanh(s * 2.2) * 0.9

def clap():  # seca
    t = t_(0.16); n = rng.standard_normal(len(t)); n = smooth(n - smooth(n, 10), 2)
    env = np.exp(-t * 34)
    for d in (0.0, 0.009, 0.018):
        j = idx(d); env[j:j + 160] += np.linspace(0.7, 0, 160)
    return n * env * 0.75

def hat(dec=80, g=0.22):
    t = t_(0.05); n = rng.standard_normal(len(t)); n = n - smooth(n, 3)
    return n * np.exp(-t * dec) * g

# ---------------------------------------------------------------- 808 (mono, glide, saturado)
notes = []  # (time, midi, glide)
def root_at(t):
    if t < DROP_IN: return F1
    lt = (t % LOOP_LEN) / B; cur = F1
    for pos, m, _ in BASSLINE:
        if pos <= lt + 1e-9: cur = m
    return cur
for L0 in loop_starts(DROP_IN, END_CUT):
    for pos, m, gl in BASSLINE:
        notes.append((L0 + pos * B, m, gl))
for e in events:
    if e >= DROP_IN - 1e-6: notes.append((e, root_at(e), False))
notes = sorted({(round(t, 4), m, g) for t, m, g in notes if not in_cut(t) and t < END_CUT})

freq = np.full(N, hz(F1)); amp = np.zeros(N); punch = np.zeros(N)
for k, (t0, m, gl) in enumerate(notes):
    i0 = idx(t0); i1 = idx(notes[k + 1][0]) if k + 1 < len(notes) else N
    seg = np.arange(i1 - i0) / SR
    f1 = hz(m)
    if gl and k > 0:
        f0 = hz(notes[k - 1][1]); g = np.clip(seg / 0.075, 0, 1)
        freq[i0:i1] = f0 * (f1 / f0) ** g
    else:
        freq[i0:i1] = f1
    amp[i0:i1] = np.minimum(1, seg / 0.003) * (0.35 + 0.65 * np.exp(-seg * 1.1))
    punch[i0:i1] = np.exp(-seg * 70)
ph = 2 * np.pi * np.cumsum(freq * (1 + 1.0 * punch)) / SR
b808 = np.sin(ph) * amp
b808 = np.tanh(b808 * 4.0 + 0.25 * b808 ** 2) * 0.95      # saturación fuerte
b808 = b808 - smooth(b808, 900) * 0.15                       # quita DC de la asimetría
BASS += b808

# ---------------------------------------------------------------- batería
for t0, _, _ in notes: put(DRUM, kick(), t0, 0.85)           # bombo con el 808
for L0 in loop_starts(DROP_IN, END_CUT):
    for bar in (0, 1):
        tc = L0 + bar * BAR + 2 * B                              # caja en el 3 (half-time)
        if not in_cut(tc): put(DRUM, clap(), tc, 0.9); put(SEND, clap(), tc, 0.25)
    for e8 in range(16):                                         # corcheas
        th = L0 + e8 * B / 2
        if th < END_CUT and not in_cut(th): put(DRUM, hat(g=0.24 if e8 % 2 else 0.17), th, 1.0, pan=0.25)
    k = int(round(L0 / LOOP_LEN))
    if k % 2 == 0:                                               # redoble de tresillos (último tiempo)
        for j in range(6):
            th = L0 + 7 * B + j * B / 6
            if not in_cut(th): put(DRUM, hat(110, 0.16 + 0.02 * j), th, 1.0, pan=0.25)
    else:                                                        # redoble de fusas (último medio tiempo)
        for j in range(8):
            th = L0 + 7.5 * B + j * B / 16 * 2
            if not in_cut(th): put(DRUM, hat(140, 0.12 + 0.02 * j), th, 1.0, pan=-0.2)

# ---------------------------------------------------------------- lead + capa frágil
def lead_loop(L0, gain=1.0):
    for step, m in LOOP:
        t0 = L0 + step * S16
        if t0 >= DUR: continue
        put(LEAD, supersaw(m, S16 * 1.7), t0, gain)
        put(LEAD, supersaw(m - 12, S16 * 1.7), t0, gain * 0.35)

for L0 in loop_starts(0, END_CUT): lead_loop(L0)
for L0 in loop_starts(DROP_IN, END_CUT):                        # campana: dobla el 2.º compás, 8.ª alta
    if int(round(L0 / LOOP_LEN)) % 2 == 1:
        for step, m in LOOP[8:]:
            put(BELL, bell(m + 12, 0.9, 0.16), L0 + step * S16, pan=0.45)

# filtro de la intro: paso bajo cerrado que se abre hasta la entrada de la batería
cut = np.full(N, 14000.0)
i_drop = idx(DROP_IN)
r = np.arange(i_drop) / i_drop
cut[:i_drop] = 180 * (14000 / 180) ** (r ** 1.6)
i_conf, i_conf_end = idx(SECTIONS[3]), idx(SECTIONS[4] - 2 * B)
cut[i_conf:i_conf_end] = 2600                                  # confianza: lead más oscuro
for a_, b_ in ((0, i_drop + idx(0.3)), (i_conf - idx(0.3), i_conf_end)):   # filtra solo donde cambia
    LEAD[a_:b_] = lp2(LEAD[a_:b_], cut[a_:b_])
LEAD[:] = smooth(LEAD, 2)

# ---------------------------------------------------------------- apariciones: 808 (arriba) + campana / click
for e in events:
    if in_cut(e): continue
    if e < DROP_IN:   # intro: solo el lead → aparición marcada con campana
        put(BELL, bell(89 if e > 0 else 84, 1.6, 0.32), e, pan=0.2); continue
    if (round((e - 0) / B) % 2) == 0 or any(abs(QM(b) - e) < 1e-3 for b in BIG):
        put(BELL, bell(96 if any(abs(QM(b) - e) < 1e-3 for b in BIG) else 89, 0.5, 0.22), e, pan=-0.3)
    else:
        put(BELL, metal_click(), e, 0.6, pan=0.35)
for t in taps:
    if not in_cut(t): put(BELL, metal_click(), t, 0.5, pan=-0.4)

# ---------------------------------------------------------------- mezcla
LEAD *= gate[:, None]; BELL *= gate[:, None]; DRUM *= gate[:, None]; BASS *= gate; SEND *= gate[:, None]
SEND += LEAD * 0.55 + BELL * 0.7

def dark_reverb(x, d=4.2):
    t = t_(d)
    ir = np.stack([rng.standard_normal(len(t)), rng.standard_normal(len(t))], axis=1) * np.exp(-t * 1.5)[:, None]
    ir = smooth(ir, 9)                                   # oscura
    ir[: idx(0.02)] = 0                                  # pre-delay
    ir /= np.sqrt((ir ** 2).sum(axis=0))
    n = 1 << int(np.ceil(np.log2(len(x) + len(ir))))
    return np.stack([np.fft.irfft(np.fft.rfft(x[:, c], n) * np.fft.rfft(ir[:, c], n), n)[: len(x)] for c in (0, 1)], axis=1)

wet = dark_reverb(SEND)
# bombeo: el lead y la reverb respiran con el bombo/808
duck = np.ones(N)
for t0, _, _ in notes:
    i = idx(t0); k = min(idx(0.18), N - i); duck[i:i + k] = np.minimum(duck[i:i + k], 0.55 + 0.45 * np.linspace(0, 1, k) ** 0.7)

mix = (LEAD * 0.42 + wet * 0.34) * duck[:, None] + BELL * 0.55 + DRUM * 0.62
mix += (BASS * 0.95)[:, None]                            # el 808 manda
fade = np.ones(N); k = idx(1.2); fade[-k:] = np.linspace(1, 0, k) ** 1.4
mix *= fade[:, None]

# master: saturación + limitador (look-ahead 5 ms)
mix = np.tanh(mix * 1.6) / np.tanh(1.6)
peak = np.abs(mix).max(axis=1)
la = idx(0.005)
need = np.maximum(1, peak / 0.89)
need = np.maximum.reduce([np.roll(need, -j) for j in range(0, la, 24)])
g = 1 / need
rel = 1 - np.exp(-1 / (0.08 * SR))
gs = np.empty_like(g); z = 1.0
for i in range(N):
    z = g[i] if g[i] < z else z + rel * (g[i] - z); gs[i] = z
mix *= gs[:, None]

here = os.path.dirname(os.path.abspath(__file__))
out = os.path.join(here, "..", "assets", "music", "sintonia-bgm.wav")
os.makedirs(os.path.dirname(out), exist_ok=True)
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("escrito", os.path.normpath(out), f"{DUR:.1f} s · {len(events)} apariciones · {len(notes)} notas de 808")
print("secciones:", ", ".join(f"{s:.3f}" for s in SECTIONS))
