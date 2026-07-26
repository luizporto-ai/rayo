import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { brollOps, sideBySideOps } from "./edit";
import { sourceToEditMs } from "./captions-util";
import { zoomForFrame } from "./layout-util";
import { CleanVideoSeries } from "./SourceTrack";
import { SideBySide } from "./SideBySide";
import { Captions } from "./Captions";

/**
 * Timeline de trabalho — o MESMO source com as operações empilhadas aplicadas.
 * Camadas (de baixo pra cima):
 *   1) Vídeo + áudio original (Clean) com ZOOM/pattern interrupt aplicado
 *   2) B-roll: troca o VÍDEO por um clipe mudo numa janela (áudio original segue)
 *   3) Side-by-side: divide a tela (fala | b-roll) numa janela; áudio original segue
 *   4) Legenda: sempre por cima
 */
export const Edit: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const z = zoomForFrame(frame, fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* 1) vídeo + áudio original, com punch-in de zoom */}
      <AbsoluteFill
        style={{ transform: `scale(${z.scale})`, transformOrigin: `${z.ox}% ${z.oy}%` }}
      >
        <CleanVideoSeries style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>

      {/* 2) b-roll (mudo) cobrindo o vídeo na janela da fala — áudio original continua */}
      {brollOps().map((b, i) => {
        const from = Math.round((sourceToEditMs(b.startMs) / 1000) * fps);
        const len = Math.round(((sourceToEditMs(b.endMs) - sourceToEditMs(b.startMs)) / 1000) * fps);
        return (
          <Sequence key={i} from={from} durationInFrames={len} premountFor={15}>
            <AbsoluteFill style={{ backgroundColor: "#000" }}>
              <OffthreadVideo
                src={staticFile(b.src)}
                muted
                pauseWhenBuffering
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* 3) side-by-side (esquerda fala / direita b-roll) numa janela */}
      {sideBySideOps().map((s, i) => (
        <SideBySide key={i} op={s} orientation="lr" />
      ))}

      {/* 4) legenda sempre por cima */}
      <Captions />
    </AbsoluteFill>
  );
};
