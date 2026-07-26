import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";
import type { SideBySideOp } from "./edit";
import { SOURCE } from "./edit";
import { sourceToEditMs } from "./captions-util";

const cover: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };

/**
 * Side-by-side (tela dividida) numa janela de fala.
 *   orientation "lr" → esquerda (fala) / direita (b-roll)  — horizontal
 *   orientation "tb" → topo (fala) / base (b-roll)          — vertical
 *
 * Painel da fala = 1 OffthreadVideo cortado no início da janela (a janela fica DENTRO
 * de um trecho da Clean, então avança 1:1 e continua sincronizado com o áudio de baixo).
 * Os dois painéis são MUDOS: o áudio que vale é o da camada base (a fala original).
 */
export const SideBySide: React.FC<{ op: SideBySideOp; orientation: "lr" | "tb" }> = ({
  op,
  orientation,
}) => {
  const { fps } = useVideoConfig();
  const from = Math.round((sourceToEditMs(op.startMs) / 1000) * fps);
  const len = Math.round(((sourceToEditMs(op.endMs) - sourceToEditMs(op.startMs)) / 1000) * fps);
  const startFrame = Math.round((op.startMs / 1000) * fps); // frame no SOURCE
  return (
    <Sequence from={from} durationInFrames={len} premountFor={15}>
      <AbsoluteFill
        style={{ flexDirection: orientation === "lr" ? "row" : "column", backgroundColor: "#000" }}
      >
        <div style={{ flex: 1, overflow: "hidden" }}>
          <OffthreadVideo
            src={staticFile(SOURCE)}
            trimBefore={startFrame}
            muted
            pauseWhenBuffering
            style={cover}
          />
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <OffthreadVideo src={staticFile(op.src)} muted pauseWhenBuffering style={cover} />
        </div>
      </AbsoluteFill>
    </Sequence>
  );
};
