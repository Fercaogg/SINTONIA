#!/usr/bin/env python3
"""
SINTONÍA · locución del spot (voces neuronales de Microsoft Edge, gratuitas: castellano, es-ES-AlvaroNeural).

1. Genera una frase por plano con `edge-tts` (pip install edge-tts).
2. Recorta silencios y normaliza cada frase (−16 LUFS) → assets/voice/vo-NN.wav
3. Coloca las frases en index.html (<audio id="vo-NN">) en la entrada de su plano
   y escribe en la música (#music) una automatización de volumen que la baja mientras habla la voz.

Uso:  python3 musica/voz.py
"""
import json, os, re, subprocess, sys, wave

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
sys.path.insert(0, HERE)
from tiempos import QM  # noqa: E402

VOICE, LEAD_IN = "es-ES-AlvaroNeural", 0.12   # alternativas: es-ES-ElviraNeural, es-ES-XimenaNeural
DUCK, RAMP = 0.32, 0.18          # nivel de la música bajo la voz, rampa en segundos

# (tiempo del corte original de 45 s, texto, velocidad)
LINES = [
    (4.0,  "Profesorado y alumnado valoran distinto la misma tutoría.", 1.05),
    (7.0,  "Uno de cada tres doctorandos, en riesgo para su salud mental.", 1.05),
    (9.5,  "La mitad, menos de una hora semanal con su director.", 1.05),
    (11.5, "Y eso se nota en los resultados.", 1.0),
    (14.5, "Sintonía. Acompañar, sin vigilar.", 0.95),
    (17.0, "Cada semana, un registro de un minuto.", 1.0),
    (20.0, "El tutor, treinta segundos para todos.", 1.0),
    (22.0, "Si las miradas no coinciden, Sintonía lo detecta.", 1.05),
    (25.0, "Y la tutoría empieza con tres preguntas neutras.", 1.05),
    (28.0, "Tu bienestar solo lo ves tú.", 1.0),
    (31.0, "Sin notas, sin rankings, sin vigilar.", 1.1),
    (33.0, "Y no deduce emociones.", 1.0),
    (35.0, "Para estudiantes, tutores, dirección e investigación.", 1.05),
    (37.0, "Y un puente al doctorado que activas tú.", 1.0),
    (40.0, "Para másteres, programas y escuelas de doctorado.", 1.05),
    (42.0, "En sintonía.", 0.95),
]

def sh(cmd, **kw): return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)

def wav_dur(p):
    with wave.open(p) as w: return w.getnframes() / w.getframerate()

os.makedirs(os.path.join(ROOT, "assets", "voice"), exist_ok=True)
clips = []
for n, (anchor, text, speed) in enumerate(LINES, 1):
    raw = os.path.join(ROOT, "assets", "voice", f"vo-{n:02d}.raw.mp3")
    out = os.path.join(ROOT, "assets", "voice", f"vo-{n:02d}.wav")
    rate = f"{round((speed - 1) * 100):+d}%"
    cmd = ["edge-tts", "--voice", VOICE, f"--rate={rate}", "--text", text, "--write-media", raw]
    if os.environ.get("HTTPS_PROXY"): cmd += ["--proxy", os.environ["HTTPS_PROXY"]]  # entornos con proxy
    sh(cmd, cwd=ROOT)
    af = ("silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,"
          "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,"
          "highpass=f=90,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,"
          "loudnorm=I=-16:TP=-1.5:LRA=7,apad=pad_dur=0.08")
    sh(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af", af, "-ar", "48000", "-ac", "1", out])
    os.remove(raw)
    start = QM(anchor) + LEAD_IN
    if clips: start = max(start, clips[-1]["start"] + clips[-1]["dur"] + 0.25)  # nunca se pisan
    start = round(start, 3)
    clips.append({"id": f"vo-{n:02d}", "src": f"assets/voice/vo-{n:02d}.wav", "start": start,
                  "dur": round(wav_dur(out), 3), "text": text})

# solapes: cada frase debe acabar antes de que empiece la siguiente
for a, b in zip(clips, clips[1:]):
    gap = b["start"] - (a["start"] + a["dur"])
    flag = "  ← SOLAPA" if gap < 0.05 else ""
    late = a["start"] - (QM(LINES[clips.index(a)][0]) + LEAD_IN)
    flag += f"  (+{late:.2f} s tras su plano)" if late > 0.01 else ""
    print(f'{a["id"]} {a["start"]:6.2f}–{a["start"] + a["dur"]:6.2f}  hueco {gap:+.2f}{flag}  {a["text"]}')
last = clips[-1]; print(f'{last["id"]} {last["start"]:6.2f}–{last["start"] + last["dur"]:6.2f}  {last["text"]}')

# automatización de la música: baja con cada frase, sube en los huecos largos
pts = [{"t": 0, "v": 1}]
for c in clips:
    a, b = c["start"] - RAMP, c["start"] + c["dur"] + 0.05
    if pts[-1]["v"] == DUCK and a - pts[-1]["t"] < 0.9:  # hueco corto: se queda abajo
        pts[-1]["t"] = round(b, 3); continue
    pts += [{"t": round(max(a, pts[-1]["t"] + 0.01), 3), "v": 1}, {"t": round(a + RAMP, 3), "v": DUCK}, {"t": round(b, 3), "v": DUCK}]
pts.append({"t": round(pts[-1]["t"] + RAMP + 0.1, 3), "v": 1})
auto = json.dumps({"version": 1, "lanes": [{"target": "volume", "points": pts}]}, separators=(",", ":")).replace('"', "&quot;")

idx = os.path.join(ROOT, "index.html")
html = open(idx, encoding="utf8").read()
html = re.sub(r"\n\s*<!-- voz -->.*?<!-- /voz -->", "", html, flags=re.S)
html = re.sub(r'(<audio id="music"[^>]*?)\s+data-automation="[^"]*"', r"\1", html)
html = html.replace('<audio id="music" ', f'<audio id="music" data-automation="{auto}" ', 1)
tags = "\n".join(
    f'      <audio id="{c["id"]}" class="clip" src="{c["src"]}" data-start="{c["start"]}" data-duration="{c["dur"]}" '
    f'data-track-index="8" data-timeline-role="voiceover" data-volume="1"></audio>' for c in clips)
anchor_tag = re.search(r'\n(\s*)<audio id="music"[^\n]*\n', html)
html = html[: anchor_tag.end()] + "      <!-- voz -->\n" + tags + "\n      <!-- /voz -->\n" + html[anchor_tag.end():]
open(idx, "w", encoding="utf8").write(html)
print(f"{len(clips)} frases colocadas; música con {len(pts)} puntos de automatización.")
