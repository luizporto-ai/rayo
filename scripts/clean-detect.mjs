// Detecção de silêncio (free, via ffmpeg) → imprime os trechos a MANTER, prontos
// pra colar no src/edit/edit.ts como uma operação { type: "clean", keep: [...] }.
// Não altera nada sozinho: só sugere. Você (ou seu Claude) cola no EDL.
//
// Uso: node scripts/clean-detect.mjs [minSilenceSeg] [dB]   (default 1.0s, -30dB)
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "public", "input.mp4");
const MIN_SIL = parseFloat(process.argv[2] || "1.0"); // pausa mínima pra cortar (s)
const DB = process.argv[3] || "-30"; // limiar de silêncio

if (!existsSync(SRC)) {
  console.error(`✗ não achei ${SRC}. Coloque seu vídeo em public/input.mp4`);
  process.exit(1);
}

// duração total
const dur = parseFloat(
  execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${SRC}"`).toString().trim()
);

// ffmpeg silencedetect → stderr
let log = "";
try {
  execSync(`ffmpeg -i "${SRC}" -af silencedetect=n=${DB}dB:d=${MIN_SIL} -f null - 2>&1`, {
    stdio: "pipe",
  });
} catch (e) {
  log = (e.stdout?.toString() || "") + (e.stderr?.toString() || "");
}

const starts = [...log.matchAll(/silence_start:\s*([\d.]+)/g)].map((m) => parseFloat(m[1]));
const ends = [...log.matchAll(/silence_end:\s*([\d.]+)/g)].map((m) => parseFloat(m[1]));

// silêncios [start, end] → inverte pra achar os trechos de FALA (keep)
const silences = starts.map((s, i) => [s, ends[i] ?? dur]);
const keep = [];
let cursor = 0;
for (const [s, e] of silences) {
  if (s > cursor) keep.push([+cursor.toFixed(3), +s.toFixed(3)]);
  cursor = e;
}
if (cursor < dur) keep.push([+cursor.toFixed(3), +dur.toFixed(3)]);

const removed = silences.reduce((a, [s, e]) => a + (e - s), 0);
console.log(`\nvídeo: ${dur.toFixed(1)}s · silêncio removido: ${removed.toFixed(1)}s · ${keep.length} trechos\n`);
console.log("Cole no src/edit/edit.ts, dentro de OPERATIONS:\n");
console.log(`  { type: "clean", keep: ${JSON.stringify(keep)} },\n`);
