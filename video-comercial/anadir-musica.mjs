#!/usr/bin/env node
/*
  Añade música del catálogo de HeyGen al spot de SINTONÍA.

  Uso (desde esta carpeta, con sesión iniciada: npx hyperframes auth login):
    node anadir-musica.mjs
    node anadir-musica.mjs "otra descripción de la música"     ← para probar otra pista

  Qué hace:
    1. Busca una pista en el catálogo con `hyperframes media-use resolve --type bgm`.
    2. La copia a assets/music/ (el render nunca descarga nada).
    3. La coloca en index.html como <audio id="music">: 60 s, fundido de salida de 2 s.
       Si ya había una pista, la sustituye.
    4. Calcula su rejilla de golpes con `hyperframes beats` para que la veas en el Studio.
*/
import { execSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";

const DUR = 60; // duración del spot en segundos
const intent =
  process.argv[2] ||
  "premium tech commercial, confident minimal electronic, steady 120 BPM pulse, clean modern, builds gently, no vocals";

function run(cmd) {
  console.log("› " + cmd);
  return execSync(cmd, { encoding: "utf8", stdio: ["inherit", "pipe", "inherit"] });
}

// 1 · buscar la pista
const out = run(`npx hyperframes media-use resolve --type bgm --intent "${intent.replace(/"/g, "'")}" --project .`);
console.log(out.trim());
const m = out.match(/resolved\s+\S+\s+→\s+(.+?)\s+\(/);
if (!m) {
  console.error("\nNo se encontró la ruta de la pista en la salida de arriba. ¿Has iniciado sesión con `npx hyperframes auth login`?");
  process.exit(1);
}
const src = m[1].trim();
if (!existsSync(src)) {
  console.error(`\nLa pista no está en ${src}.`);
  process.exit(1);
}

// 2 · copiarla al proyecto
mkdirSync("assets/music", { recursive: true });
const dest = join("assets", "music", "sintonia-bgm" + (extname(src) || ".mp3"));
copyFileSync(src, dest);
console.log(`\nPista copiada a ${dest}`);

// 3 · colocarla en index.html
const tag =
  `<audio id="music" class="clip" src="${dest.replace(/\\/g, "/")}" data-start="0" data-duration="${DUR}" ` +
  `data-track-index="9" data-timeline-role="music" data-volume="0.85" data-fade-out="2"></audio>`;
let html = readFileSync("index.html", "utf8");
html = html.replace(/\s*<audio id="music"[^>]*><\/audio>/, "");
const anchor = '<div id="cierre" ';
const at = html.indexOf(anchor);
const lineEnd = html.indexOf("\n", at);
html = html.slice(0, lineEnd + 1) + "      " + tag + "\n" + html.slice(lineEnd + 1);
writeFileSync("index.html", html);
console.log("Pista colocada en index.html (60 s, fundido de salida de 2 s).");

// 4 · rejilla de golpes (informativo)
try {
  const b = run("npx hyperframes beats --json");
  const bpm = (b.match(/"bpm"\s*:\s*([\d.]+)/) || [])[1];
  if (bpm) {
    console.log(`\nTempo detectado: ${Number(bpm).toFixed(1)} BPM (el montaje está a 120 BPM).`);
    if (Math.abs(bpm - 120) > 3 && Math.abs(bpm - 60) > 2 && Math.abs(bpm - 240) > 5)
      console.log('Esta pista no va a 120 BPM: los cortes no coincidirán con sus golpes. Prueba otra: node anadir-musica.mjs "otra descripción, 120 BPM"');
  }
} catch {
  console.log("\n(No se pudo calcular la rejilla de golpes; no afecta al render.)");
}

console.log("\nListo. Revisa con `npx hyperframes preview` y renderiza con:\n  npx hyperframes render --output sintonia-spot.mp4 --fps 60");
