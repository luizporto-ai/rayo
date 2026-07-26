---
name: rayo
description: Use when the user wants to edit a talking-head / spoken video into a sharp short — cut silences, add word-synced captions, drop b-roll cutaways, split-screen (side-by-side), punch-in zoom, or reframe horizontal to vertical (9:16 for Reels/TikTok/Shorts). Trigger on "edit my video", "cut the dead air / silences", "add captions", "put b-roll when I say X", "make it vertical", "split screen", "punch in / zoom". Works in a rayo project (created by `npx @luizporto/rayo init`). Editing is non-destructive: you stack operations in one EDL over the SAME source, never a new file.
---

# rayo — driving the video editor

rayo is a Remotion project where **every edit is one operation stacked in a single EDL**
(`src/edit/edit.ts`), applied over the SAME source video. You never create a new project
or a new video file — you add operations and the timeline re-renders.

Your job as the agent: **understand what the person wants, edit `src/edit/edit.ts`, and
open the Studio so they can see it.** Everything runs local and free (ffmpeg + whisper.cpp);
the only paid thing is this Claude session.

## Setup (once)

- Source video goes in `public/input.mp4`. Confirm it exists before anything else.
- `ffmpeg` must be installed (`ffmpeg -version`). If missing, tell the user how to install it.
- `npm install` if `node_modules` is absent.
- Set `SIZE` and `FPS` in `src/edit/edit.ts` to match the source
  (`ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of csv=p=0 public/input.mp4`).

## The EDL — `src/edit/edit.ts`

One array, `OPERATIONS`, applied in order. The functions you can add:

| Function | Operation | What it does |
|---|---|---|
| **Clean** | `{ type: "clean", keep: [[a,b],...] }` | keeps only these second-ranges; removes silences |
| **B-roll** | `{ type: "broll", src, startMs, endMs }` | covers the video with a muted clip; original audio + captions continue |
| **Side-by-side** | `{ type: "sidebyside", src, startMs, endMs }` | splits the screen (speech + b-roll). Horizontal → left/right; vertical → top/bottom |
| **Zoom** | `{ type: "zoom", startMs, endMs, scale, origin? }` | punch-in (1.1–1.3x) on emphasis; `origin` = focus in % [x,y] |

Captions (Clean-aware, punctuation-broken) are always on. Times are **SOURCE-time in ms**
and get remapped to the cleaned timeline automatically. Zoom windows are in source-time too.

## The workflow

1. **Transcribe** (needed for captions and for finding words to sync to):
   `npm run transcribe` (add a language: `npm run transcribe -- en`). Writes `src/edit/captions.json`.
2. **Clean the silences**: `npm run clean` prints a ready `{ type: "clean", keep: [...] }` —
   paste it into `OPERATIONS`. Tune with `npm run clean 1.0 -30` (min-silence sec, dB).
3. **Add visual edits** by editing `OPERATIONS`:
   - *"b-roll when I say São Paulo"* → find the phrase in `captions.json` (reconstruct
     words from tokens), get its `startMs`/`endMs`, add a `broll` op with the clip in `public/`.
   - *"split screen there"* → `sidebyside` op. **The window must fit inside one `keep` range**
     (else the speech pane desyncs at a silence cut).
   - *"punch in on that line"* → `zoom` op, `scale` 1.15–1.26, `origin` toward the face.
4. **Show it**: `npm run dev` opens the Studio. Compositions: `RawClip` (untouched), `Edit`
   (horizontal), `EditVertical` (9:16 — the same timeline reframed).
5. **Render** when approved: `npm run render` or `npm run render:vertical`.

## Vertical (9:16)

`EditVertical` is the SAME EDL reframed to 1080×1920 (blurred fill + centered speech +
bigger captions). `sidebyside` ops there become top/bottom. No separate edit needed — it
reads the same `OPERATIONS`.

## Rules (do not break)

- **Non-destructive.** Never re-encode the source into a new file to "apply" an edit. Only
  add operations to the EDL. The one and only source is `public/input.mp4`.
- **B-roll / side-by-side panels are always muted** — the audio that matters is the original speech.
- **Keep captions last** (rendered on top) so they survive b-roll and split-screen.
- **Never add a paid API.** Transcription is whisper.cpp local. If tempted to call a hosted
  STT/render service, stop — it breaks the cost promise (only the user's Claude is paid).
- Verify by looking at the Studio / the rendered file, not by asserting it worked.

## Gotchas

- **Black frame at a cut** → segments already use `premountFor`; if you add layers, keep it.
- **Caption grammar wrong** (e.g. Portuguese) → the `base` whisper model errs; switch to
  `small`/`medium` in `scripts/transcribe.mjs`. Sync stays the same, only spelling improves.
- **Side-by-side desync** → the window crossed a silence cut. Move it inside one `keep` range.
- **Wrong duration / clipped video** → `SIZE`/`FPS` don't match the source, or there's no
  `clean` op yet (it falls back to `DEFAULT_DURATION_S`). Run Clean or set the fallback.
