import "./index.css";
import { Composition } from "remotion";
import { RawClip } from "./RawClip";
import { Edit } from "./edit/Edit";
import { EditVertical } from "./edit/EditVertical";
import { SIZE, FPS, editDurationInFrames } from "./edit/edit";

/**
 * Três composições sobre o MESMO source:
 *   RawClip      — o vídeo cru (referência, sem edição)
 *   Edit         — a timeline de trabalho horizontal (Clean → Legenda → B-roll → Side-by-side → Zoom)
 *   EditVertical — a MESMA timeline reenquadrada pro 9:16 (Reels/TikTok/Shorts)
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RawClip"
        component={RawClip}
        durationInFrames={editDurationInFrames()}
        fps={FPS}
        width={SIZE.width}
        height={SIZE.height}
      />
      <Composition
        id="Edit"
        component={Edit}
        durationInFrames={editDurationInFrames()}
        fps={FPS}
        width={SIZE.width}
        height={SIZE.height}
      />
      <Composition
        id="EditVertical"
        component={EditVertical}
        durationInFrames={editDurationInFrames()}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
