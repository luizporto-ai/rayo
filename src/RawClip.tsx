import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { SOURCE } from "./edit/edit";

/**
 * Vídeo cru dentro do Remotion — a "mesa" onde você trabalha, sem nenhuma edição.
 * Sirva de referência: o Edit é o MESMO vídeo com as operações empilhadas.
 * Fonte: public/input.mp4
 */
export const RawClip: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo src={staticFile(SOURCE)} />
    </AbsoluteFill>
  );
};
