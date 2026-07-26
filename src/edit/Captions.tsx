import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { Caption } from "@remotion/captions";
import { ROBOTO } from "../fonts";
import { buildPunctuationPhrases, sourceToEditMs, type Token } from "./captions-util";
import captionsRaw from "./captions.json";

// tokens do Whisper (source-time) → remapeados pra timeline editada
const tokens: Token[] = (captionsRaw as Caption[]).map((c) => ({
  text: c.text,
  startMs: sourceToEditMs(c.startMs),
  endMs: sourceToEditMs(c.endMs),
}));

// frases quebradas na pontuação
const phrases = buildPunctuationPhrases(tokens);

// cada frase fica na tela até a próxima começar (sem piscar em branco no meio da fala)
const timeline = phrases.map((p, i) => ({
  text: p.text,
  startMs: p.startMs,
  showUntil: i < phrases.length - 1 ? Math.max(p.endMs, phrases[i + 1].startMs) : p.endMs + 500,
}));

/**
 * Legenda simples/branca (Roboto). Quebra na pontuação, centralizada, com sombra.
 * Props escalam pro formato: horizontal (default) ou vertical (fonte maior, mais acima).
 */
export const Captions: React.FC<{
  fontSize?: number;
  bottomPct?: number;
  maxWidth?: string;
}> = ({ fontSize = 27, bottomPct = 7, maxWidth = "88%" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tMs = (frame / fps) * 1000;
  const active = timeline.find((p) => tMs >= p.startMs && tMs < p.showUntil);
  if (!active) return null;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: `${bottomPct}%`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth,
          textAlign: "center",
          fontFamily: ROBOTO,
          fontWeight: 700,
          fontSize,
          lineHeight: 1.25,
          color: "#ffffff",
          letterSpacing: "0.005em",
          textShadow: "0 2px 6px rgba(0,0,0,0.85), 0 0 3px rgba(0,0,0,0.9)",
        }}
      >
        {active.text}
      </div>
    </AbsoluteFill>
  );
};
