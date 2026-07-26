import { keptSegments } from "./edit";

/**
 * Remapeia um tempo do SOURCE (ms) para a timeline EDITADA (ms).
 * Como a Clean Video pulou trechos, o tempo da fala precisa "encolher" junto.
 */
export const sourceToEditMs = (ms: number): number => {
  const t = ms / 1000;
  let acc = 0;
  for (const [a, b] of keptSegments()) {
    if (t < a) return acc * 1000;
    if (t <= b) return (acc + (t - a)) * 1000;
    acc += b - a;
  }
  return acc * 1000;
};

export type Token = { text: string; startMs: number; endMs: number };
export type Phrase = { text: string; startMs: number; endMs: number };

/**
 * Remonta os sub-tokens do Whisper em PALAVRAS inteiras.
 * Convenção: token que começa com espaço inicia palavra nova; o resto (inclusive
 * pontuação como "," "!") gruda na palavra atual. Evita partir palavra no meio.
 */
const mergeWords = (tokens: Token[]): Token[] => {
  const words: Token[] = [];
  for (const t of tokens) {
    if (!t.text) continue;
    const startsNew = /^\s/.test(t.text) || words.length === 0;
    if (startsNew) {
      words.push({ text: t.text, startMs: t.startMs, endMs: t.endMs });
    } else {
      const w = words[words.length - 1];
      w.text += t.text;
      w.endMs = t.endMs;
    }
  }
  return words.map((w) => ({ ...w, text: w.text.trim() })).filter((w) => w.text);
};

/**
 * Agrupa palavras em frases QUEBRANDO NA PONTUAÇÃO.
 * Toda palavra que termina com . , ! ? ; : … encerra a legenda e pula pra próxima.
 * maxChars é só trava pra trechos longos sem pontuação (quebra em palavra inteira).
 */
export const buildPunctuationPhrases = (tokens: Token[], maxChars = 42): Phrase[] => {
  const words = mergeWords(tokens);
  const out: Phrase[] = [];
  let cur: Token[] = [];
  const flush = () => {
    if (!cur.length) return;
    const text = cur
      .map((w) => w.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/[;:,]+$/, ""); // tira vírgula/; : do fim (visual mais limpo)
    if (text) out.push({ text, startMs: cur[0].startMs, endMs: cur[cur.length - 1].endMs });
    cur = [];
  };
  for (const w of words) {
    cur.push(w);
    if (/[.,!?;:…]$/.test(w.text)) {
      flush();
      continue;
    }
    const len = cur.reduce((n, x) => n + x.text.length + 1, 0);
    if (len > maxChars) flush();
  }
  flush();
  return out;
};
