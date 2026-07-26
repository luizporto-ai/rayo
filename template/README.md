# rayo-video

Seu projeto de edição de vídeo, criado com [rayo](https://github.com/luizporto-ai/rayo).
Você edita **dirigindo o seu Claude** — ou na mão, mexendo no EDL (`src/edit/edit.ts`).

## Começar

```bash
npm install                 # instala o Remotion
# coloque seu vídeo cru em:  public/input.mp4
npm run transcribe          # gera as legendas (whisper local, free)
npm run dev                 # abre o Remotion Studio pra ver a edição
```

Precisa de **ffmpeg** instalado (macOS: `brew install ffmpeg` · Ubuntu: `apt install ffmpeg` · Windows: `winget install ffmpeg`).

## Editar

Toda edição é uma operação empilhada em **`src/edit/edit.ts`**, sobre o MESMO vídeo:

```ts
export const OPERATIONS: Operation[] = [
  { type: "clean", keep: [[0, 6.6], [12.2, 38.7]] },              // tira os silêncios
  { type: "broll", src: "broll.mp4", startMs: 36600, endMs: 38700 }, // cobre com b-roll
  { type: "sidebyside", src: "broll.mp4", startMs: 45000, endMs: 49000 }, // tela dividida
  { type: "zoom", startMs: 13000, endMs: 15400, scale: 1.2 },     // punch-in
];
```

`npm run clean` sugere os trechos de fala pra você colar na operação `clean`.

## Renderizar

```bash
npm run render            # Edit → out/edit.mp4  (horizontal)
npm run render:vertical   # EditVertical → out/vertical.mp4  (9:16 Reels/TikTok)
```

## Dirigir com o Claude

Este projeto traz uma skill em `.claude/skills/`. Abra o Claude Code nesta pasta e peça:
"transcreva e limpe os silêncios", "põe um b-roll quando eu falo X", "deixa vertical".
Ele opera o EDL por você. Detalhes das funções: veja a skill.
