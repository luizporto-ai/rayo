/**
 * A "timeline que acumula" — o EDL (Edit Decision List) do vídeo de trabalho.
 * UM source (intocado) + uma lista ORDENADA de operações empilhadas.
 * Cada ferramenta (Crop, Clean, Legenda, B-roll, Side-by-side, Zoom) adiciona uma
 * operação aqui — NUNCA cria projeto novo nem arquivo de vídeo novo.
 *
 * É este o arquivo que você (ou o seu Claude) edita para editar o vídeo.
 */

export const SOURCE = "input.mp4"; // seu vídeo cru em public/input.mp4
export const FPS = 30;
export const SIZE = { width: 1920, height: 1080 } as const; // ajuste ao seu vídeo (16:9)

/** Fallback de duração quando ainda não há Clean (segundos). Ajuste ou rode a Clean. */
export const DEFAULT_DURATION_S = 30;

// --- Tipos de operação ---------------------------------------------------
// Clean: mantém só estes trechos (segundos), removendo as pausas de silêncio.
export type CleanOp = { type: "clean"; keep: [number, number][] };
// B-roll: troca o VÍDEO por um clipe (mudo) numa janela; o áudio original segue.
// startMs/endMs em SOURCE-time (remapeados pra timeline editada ao renderizar).
export type BrollOp = { type: "broll"; src: string; startMs: number; endMs: number };
// Side-by-side: divide a tela em 2 painéis (fala + b-roll). A janela deve caber
// DENTRO de um trecho da Clean. Horizontal = esquerda/direita; vertical = topo/base.
export type SideBySideOp = { type: "sidebyside"; src: string; startMs: number; endMs: number };
// Zoom / pattern interrupt: punch-in na fala (escala 1.1–1.3x). origin = foco em % [x,y].
export type ZoomOp = { type: "zoom"; startMs: number; endMs: number; scale: number; origin?: [number, number] };
export type Operation = CleanOp | BrollOp | SideBySideOp | ZoomOp;

// --- A pilha de edições --------------------------------------------------
// Comece vazia. Adicione operações conforme edita. Exemplos:
//
//   { type: "clean", keep: [[0, 6.6], [12.2, 38.7], [39.6, 72.5]] },
//   { type: "broll", src: "broll.mp4", startMs: 36600, endMs: 38700 },
//   { type: "sidebyside", src: "broll.mp4", startMs: 45000, endMs: 49000 },
//   { type: "zoom", startMs: 13000, endMs: 15400, scale: 1.2, origin: [50, 42] },
export const OPERATIONS: Operation[] = [];

// --- Acessores (não precisa mexer) ---------------------------------------
/** Segmentos que a timeline realmente toca (aplica a Clean, se houver). */
export const keptSegments = (): [number, number][] => {
  const clean = OPERATIONS.find((o) => o.type === "clean") as CleanOp | undefined;
  return clean ? clean.keep : [[0, DEFAULT_DURATION_S]];
};

export const brollOps = (): BrollOp[] => OPERATIONS.filter((o): o is BrollOp => o.type === "broll");

export const sideBySideOps = (): SideBySideOp[] =>
  OPERATIONS.filter((o): o is SideBySideOp => o.type === "sidebyside");

export const zoomOps = (): ZoomOp[] => OPERATIONS.filter((o): o is ZoomOp => o.type === "zoom");

/** Duração final da timeline em frames (soma dos trechos mantidos). */
export const editDurationInFrames = (fps = FPS): number =>
  keptSegments().reduce((acc, [a, b]) => acc + Math.round((b - a) * fps), 0);
