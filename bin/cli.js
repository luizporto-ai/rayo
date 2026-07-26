#!/usr/bin/env node
/**
 * rayo CLI — cria um projeto de edição de vídeo dirigível pelo seu Claude.
 *   rayo init [pasta]
 */
import { scaffold } from "../lib/scaffold.js";

const HELP = `
rayo — editor de vídeo open source (Remotion + Claude), palavra → visual

Uso:
  npx @luizporto/rayo init [pasta]      cria um projeto novo (default: rayo-video)

Depois:
  cd <pasta> && npm install
  # ponha seu vídeo em public/input.mp4
  npm run transcribe                    legenda (whisper local, free)
  npm run dev                           abre o Remotion Studio
  # edite src/edit/edit.ts (ou peça pro seu Claude) e:
  npm run render                        exporta out/edit.mp4

O único componente pago é o SEU Claude. Transcrição, corte e render rodam local/free.
`;

async function main() {
  const [cmd, arg] = process.argv.slice(2);

  if (!cmd || cmd === "-h" || cmd === "--help" || cmd === "help") {
    process.stdout.write(HELP);
    process.exit(cmd ? 0 : 1);
  }

  if (cmd === "init") {
    const dest = arg || "rayo-video";
    try {
      const { dir } = scaffold(dest);
      process.stdout.write(
        `\n✓ projeto criado em ${dir}\n\n` +
          `próximos passos:\n` +
          `  cd ${dest}\n` +
          `  npm install\n` +
          `  # coloque seu vídeo cru em public/input.mp4\n` +
          `  npm run transcribe && npm run dev\n\n` +
          `abra o Claude Code nesta pasta e peça pra ele editar — a skill já está instalada.\n\n`
      );
      process.exit(0);
    } catch (err) {
      process.stderr.write(`\nerro: ${err.message}\n\n`);
      process.exit(1);
    }
  }

  process.stderr.write(`comando desconhecido: ${cmd}\n${HELP}`);
  process.exit(1);
}

main();
