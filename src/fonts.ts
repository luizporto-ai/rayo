// Fonte da legenda. Roboto branco, carregado via @remotion/google-fonts (free).
import { loadFont as loadRoboto } from "@remotion/google-fonts/Roboto";

const roboto = loadRoboto("normal", {
  weights: ["500", "700"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});

export const ROBOTO = `${roboto.fontFamily}, system-ui, sans-serif`;
