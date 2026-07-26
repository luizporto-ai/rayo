import { interpolate } from "remotion";
import { zoomOps } from "./edit";
import { sourceToEditMs } from "./captions-util";

export type ZoomState = { scale: number; ox: number; oy: number };

/**
 * Zoom / pattern interrupt: dado o frame atual (edit-time), acha o punch-in ativo.
 * Faz ease-in rápido (~180ms) até a escala alvo, segura, e volta no fim.
 * As janelas de zoom vêm em SOURCE-time e são remapeadas pra timeline limpa.
 */
export const zoomForFrame = (frame: number, fps: number): ZoomState => {
  const tMs = (frame / fps) * 1000;
  for (const z of zoomOps()) {
    const a = sourceToEditMs(z.startMs);
    const b = sourceToEditMs(z.endMs);
    if (tMs >= a && tMs <= b) {
      const ramp = 180; // punch-in/out ~5 frames
      const scale = interpolate(
        tMs,
        [a, a + ramp, b - ramp, b],
        [1, z.scale, z.scale, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
      const [ox, oy] = z.origin ?? [50, 50];
      return { scale, ox, oy };
    }
  }
  return { scale: 1, ox: 50, oy: 50 };
};
