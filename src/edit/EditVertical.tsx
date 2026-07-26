import { AbsoluteFill } from "remotion";
import { sideBySideOps } from "./edit";
import { CleanVideoSeries } from "./SourceTrack";
import { SideBySide } from "./SideBySide";
import { Captions } from "./Captions";

/**
 * Reframe VERTICAL (1080×1920) do MESMO source horizontal — "outro projeto" (composição).
 * Não é vídeo novo: é a mesma timeline (Clean + legenda) reenquadrada pro 9:16.
 *
 * Camadas:
 *   1) Fundo: cópia do vídeo borrada preenchendo o 9:16 (mata as barras)
 *   2) Fala reenquadrada: faixa 16:9 centralizada (esta camada carrega o ÁUDIO)
 *   3) Side-by-side vertical: topo (fala) / base (b-roll) numa janela
 *   4) Legenda: fonte maior, acima da safe zone de baixo
 */
export const EditVertical: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* 1) fundo borrado (mudo) */}
      <AbsoluteFill>
        <CleanVideoSeries
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(28px) brightness(0.55)",
            transform: "scale(1.2)",
          }}
        />
      </AbsoluteFill>

      {/* 2) fala reenquadrada, centralizada (carrega o áudio original) */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <CleanVideoSeries style={{ width: "100%", height: "auto", objectFit: "contain" }} />
      </AbsoluteFill>

      {/* 3) side-by-side vertical (topo fala / base b-roll) numa janela */}
      {sideBySideOps().map((s, i) => (
        <SideBySide key={i} op={s} orientation="tb" />
      ))}

      {/* 4) legenda vertical */}
      <Captions fontSize={52} bottomPct={20} maxWidth="90%" />
    </AbsoluteFill>
  );
};
