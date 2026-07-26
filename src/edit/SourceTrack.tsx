import { OffthreadVideo, Series, staticFile, useVideoConfig } from "remotion";
import { SOURCE, keptSegments } from "./edit";

/**
 * O source com a Clean aplicada (trechos de silêncio pulados), corte seco.
 * Reutilizado pela timeline horizontal e pelo reframe vertical.
 * `muted` = cópia visual (bg blur, painel de split); o áudio vem de UMA instância só.
 */
export const CleanVideoSeries: React.FC<{
  muted?: boolean;
  style?: React.CSSProperties;
}> = ({ muted, style }) => {
  const { fps } = useVideoConfig();
  const keep = keptSegments();
  return (
    <Series>
      {keep.map(([a, b], i) => {
        const start = Math.round(a * fps);
        const len = Math.round((b - a) * fps);
        return (
          <Series.Sequence key={i} durationInFrames={len} premountFor={15}>
            <OffthreadVideo
              src={staticFile(SOURCE)}
              trimBefore={start}
              pauseWhenBuffering
              muted={muted}
              style={style}
            />
          </Series.Sequence>
        );
      })}
    </Series>
  );
};
