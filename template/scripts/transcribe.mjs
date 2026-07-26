// Transcrição LOCAL (free) com whisper.cpp → legenda word-level.
// Gera src/edit/captions.json a partir de public/input.mp4. Nada de API paga.
//
// Uso: node scripts/transcribe.mjs [idioma]   (ex.: pt, en, es — default pt)
import { installWhisperCpp, downloadWhisperModel, transcribe, toCaptions } from "@remotion/install-whisper-cpp";
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const WHISPER_DIR = path.join(ROOT, ".whisper");
const VERSION = "1.5.5"; // compila via Makefile (não precisa de cmake)
const MODEL = "base"; // rápido; suba p/ "small"/"medium" se quiser mais precisão
const LANG = process.argv[2] || "pt";
const SRC = path.join(ROOT, "public", "input.mp4");
const WAV = path.join(ROOT, ".whisper", "audio-16k.wav");

if (!existsSync(SRC)) {
  console.error(`✗ não achei ${SRC}. Coloque seu vídeo em public/input.mp4`);
  process.exit(1);
}
mkdirSync(WHISPER_DIR, { recursive: true });

console.log("1) extraindo áudio wav 16kHz mono...");
execSync(`ffmpeg -y -loglevel error -i "${SRC}" -ar 16000 -ac 1 -c:a pcm_s16le "${WAV}"`, { stdio: "inherit" });

console.log("2) instalando whisper.cpp", VERSION, "(compila local, só na 1ª vez)...");
await installWhisperCpp({ to: WHISPER_DIR, version: VERSION, printOutput: true });

console.log("3) baixando modelo", MODEL, "...");
await downloadWhisperModel({ model: MODEL, folder: WHISPER_DIR, printOutput: true });

console.log(`4) transcrevendo (${LANG})...`);
const out = await transcribe({
  inputPath: WAV,
  whisperPath: WHISPER_DIR,
  whisperCppVersion: VERSION,
  model: MODEL,
  modelFolder: WHISPER_DIR,
  tokenLevelTimestamps: true,
  language: LANG,
  printOutput: false,
});

const { captions } = toCaptions({ whisperCppOutput: out });
mkdirSync(path.join(ROOT, "src", "edit"), { recursive: true });
writeFileSync(path.join(ROOT, "src", "edit", "captions.json"), JSON.stringify(captions, null, 2));
console.log(`✓ src/edit/captions.json — ${captions.length} palavras`);
