<h1 align="center">rayo</h1>

<p align="center"><b>Feed one raw clip of you talking. Get a sharp edit back.</b></p>

<p align="center">
An open-source video editor you drive with your Claude. It cuts the dead air, writes
word-synced captions, drops b-roll exactly when you say the thing, splits the screen,
punches in on the emphasis, and reframes the whole thing to 9:16 — all as stacked,
non-destructive edits over the <i>same</i> source.<br/>
<b>The only paid part is your own Claude. Everything else runs local and free.</b>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@luizporto/rayo"><img alt="npm" src="https://img.shields.io/npm/v/@luizporto/rayo?color=black"></a>
  <a href="https://github.com/luizporto-ai/rayo/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/luizporto-ai/rayo/actions/workflows/ci.yml/badge.svg"></a>
  <a href="#license"><img alt="license MIT" src="https://img.shields.io/badge/license-MIT-black"></a>
  <img alt="tested on Windows, macOS, Linux" src="https://img.shields.io/badge/tested-Windows_·_macOS_·_Linux-black">
  <img alt="node 18.17+" src="https://img.shields.io/badge/node-18.17%2B-black">
  <img alt="Claude Skill" src="https://img.shields.io/badge/Claude-Skill-black">
</p>

---

## Start in 30 seconds

```bash
npx @luizporto/rayo init my-video
cd my-video && npm install
# drop your raw clip at public/input.mp4
npm run transcribe && npm run dev
```

That opens the Remotion Studio with your video already loaded. From here you edit by
**telling your Claude** what you want — or by hand, in one file.

## The magic: you talk, the visual follows

rayo transcribes your speech locally, so it knows *which word lands at which frame*. That
one fact powers everything: captions that break on punctuation, and b-roll that appears the
instant you say the thing.

Every edit is one line in a single list (`src/edit/edit.ts`), stacked over the same source:

```ts
export const OPERATIONS: Operation[] = [
  { type: "clean", keep: [[0, 6.6], [12.2, 38.7], [39.6, 72.5]] },       // remove the silences
  { type: "broll", src: "gameplay.mp4", startMs: 36600, endMs: 38700 },  // cover with b-roll on a line
  { type: "sidebyside", src: "gameplay.mp4", startMs: 45000, endMs: 49000 }, // split the screen
  { type: "zoom", startMs: 13000, endMs: 15400, scale: 1.2 },            // punch in on the emphasis
];
```

## What it does

```
Clean          cut every silence over N seconds — the fast-pacing that keeps people watching
Captions       word-level, local transcription, broken on punctuation (not on a fixed timer)
B-roll         cover the video with a muted clip on a specific line; your audio keeps going
Side-by-side   split the screen — speech + b-roll (left/right, or top/bottom when vertical)
Zoom           punch-in on emphasis (pattern-interrupt rhythm)
Reframe 9:16   the same edit re-composed for Reels / TikTok / Shorts, no redo
```

## What it is, and what it isn't

- It's a **real editor**, not a black box. Every edit is a line you (or your Claude) can read
  and change. The source video is **never** re-encoded into a new file — edits are stacked layers.
- It's **local and free by design**. Transcription is whisper.cpp on your machine. There is no
  hosted API in the pipeline, paid or otherwise. The only thing you pay for is the Claude you
  already have. If a fork adds a paid STT/render service, it broke the one rule that matters.
- It's **not auto-magic virality**. It gives you the moves that convert — pacing, captions,
  b-roll, split, punch-in, vertical — and puts you in the director's seat. Taste is still yours.
- It runs on **Remotion**, which is free for individuals and companies of ≤3 people. Bigger
  teams need a Remotion license — that's their terms, not ours. The editing logic is MIT.

## Drive it with your Claude

`rayo init` installs a **skill** into your project (`.claude/skills/rayo/`). Open Claude Code
in the folder and just say it:

> "transcribe it, cut the silences, and put b-roll of the city when I say São Paulo"
> "split the screen there and make a vertical version"

Your Claude reads the transcript, edits the EDL, and opens the Studio. The skill ships in this
repo as `SKILL.md`, so Codex / Cursor / any agent that reads it works too.

## Render

```bash
npm run render            # Edit → out/edit.mp4          (horizontal)
npm run render:vertical   # EditVertical → out/vertical.mp4  (9:16)
```

## How it works

`ffmpeg` extracts 16 kHz audio and detects silence. `whisper.cpp` (compiled locally, no cmake)
transcribes to word-level timestamps. The EDL is a plain array; a small set of Remotion
components read it — `Clean` skips segments over the same source with `premountFor` (no black
frames), captions remap onto the cleaned timeline, b-roll / split / zoom stack on top. Render
is Remotion. No telemetry, no network except downloading the whisper model once.

## Contributing

A new function is a new operation type in `src/edit/edit.ts` plus a small layer in the
composition — that's the whole extension model. The `template/` folder is what `init` copies;
`SKILL.md` is what teaches an agent to drive it. PRs welcome.

## License

MIT. See [LICENSE](LICENSE). (Remotion, used for rendering, has its own license — see above.)
